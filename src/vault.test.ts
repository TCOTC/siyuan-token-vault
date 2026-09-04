// @vitest-environment node
import {describe, expect, it, vi} from "vitest";
import {createTokenVault} from "./vault";
import type {TokenVaultStorage} from "./vault";

/**
 * 内存存储桩：模拟思源 plugin.saveData/loadData/removeData 语义
 * （loadData 文件不存在时返回空串）。
 */
function createMemoryStorage(initial: Map<string, string> = new Map()): TokenVaultStorage & {store: Map<string, string>} {
    const store = initial;
    return {
        store,
        async save(name: string, content: string) {
            store.set(name, content);
            return {code: 0};
        },
        async load(name: string) {
            const content = store.get(name);
            // 模拟思源 loadData：无文件返回空串
            return typeof content === "string" ? content : "";
        },
        async remove(name: string) {
            store.delete(name);
            return {code: 0};
        },
    };
}

const seed = "s|e|e|d|s|e|e|d|s";

describe("createTokenVault", () => {
    it("saveToken 加密落盘并缓存明文", async () => {
        const storage = createMemoryStorage();
        const vault = createTokenVault({seed, storage});
        const payload = await vault.saveToken("ghp_secret");
        // 落盘的是密文，不含明文
        expect(storage.store.get(await vault.fileName())).toBe(payload);
        expect(payload).not.toContain("ghp_secret");
        expect(vault.cachedToken).toBe("ghp_secret");
    });

    it("saveToken 空明文抛出异常且不落盘", async () => {
        const storage = createMemoryStorage();
        const vault = createTokenVault({seed, storage});
        await expect(vault.saveToken("")).rejects.toThrow();
        expect(storage.store.size).toBe(0);
    });

    it("loadToken 解密成功并缓存明文", async () => {
        const storage = createMemoryStorage();
        const vault = createTokenVault({seed, storage});
        await vault.saveToken("ghp_secret");
        vault.clear();
        expect(vault.cachedToken).toBe("");

        const loaded = await vault.loadToken();
        expect(loaded).toBe("ghp_secret");
        expect(vault.cachedToken).toBe("ghp_secret");
    });

    it("存储不存在或为空时 loadToken 返回 null", async () => {
        const storage = createMemoryStorage();
        const vault = createTokenVault({seed, storage});
        expect(await vault.loadToken()).toBeNull();
        expect(vault.cachedToken).toBe("");

        // 模拟思源 loadData 无文件返回空串
        await vault.saveToken("x");
        storage.store.clear();
        expect(await vault.loadToken()).toBeNull();
    });

    it("hasStoredToken 区分从未保存与密文损坏（同文件名场景）", async () => {
        const storage = createMemoryStorage();
        const vault = createTokenVault({seed, storage});
        // 从未保存
        expect(await vault.hasStoredToken()).toBe(false);
        expect(await vault.loadToken()).toBeNull();

        // 已保存（密文存在）
        await vault.saveToken("ghp_secret");
        expect(await vault.hasStoredToken()).toBe(true);

        // 密文文件被损坏/篡改：hasStoredToken 仍为 true（文件有内容），loadToken 为 null
        storage.store.set(await vault.fileName(), "v1.!!!.xx.yy");
        expect(await vault.hasStoredToken()).toBe(true);
        expect(await vault.loadToken()).toBeNull();

        // 换 seed（换设备/工作空间语义）：文件名随之不同 → 找不到文件 → 与从未保存一致
        const vaultB = createTokenVault({seed: "other|seed", storage});
        expect(await vaultB.hasStoredToken()).toBe(false);
        expect(await vaultB.loadToken()).toBeNull();
    });

    it("种子不匹配（换设备语义）时 loadToken 返回 null", async () => {
        const storage = createMemoryStorage();
        const vaultA = createTokenVault({seed, storage});
        await vaultA.saveToken("ghp_secret");
        const vaultB = createTokenVault({seed: "other|seed", storage});
        expect(await vaultB.loadToken()).toBeNull();
    });

    it("removeToken 删除密文并清空缓存", async () => {
        const storage = createMemoryStorage();
        const vault = createTokenVault({seed, storage});
        await vault.saveToken("ghp_secret");
        await vault.removeToken();
        expect(storage.store.size).toBe(0);
        expect(vault.cachedToken).toBe("");
        expect(await vault.loadToken()).toBeNull();
    });

    it("dir 缺省为 secret/ 前缀，空串则存于根", async () => {
        const storage = createMemoryStorage();
        const defaultVault = createTokenVault({seed, storage});
        expect(await defaultVault.fileName()).toMatch(/^secret\/token_[0-9a-f]{20}\.dat$/);

        const rootVault = createTokenVault({seed, storage, dir: ""});
        expect(await rootVault.fileName()).toMatch(/^token_[0-9a-f]{20}\.dat$/);

        const customVault = createTokenVault({seed, storage, dir: "vault/"});
        expect(await customVault.fileName()).toMatch(/^vault\/token_[0-9a-f]{20}\.dat$/);
    });

    it("fileName 幂等且两次创建同 seed 同名", async () => {
        const storage = createMemoryStorage();
        const a = createTokenVault({seed, storage});
        const b = createTokenVault({seed, storage});
        expect(await a.fileName()).toBe(await a.fileName());
        expect(await a.fileName()).toBe(await b.fileName());
    });

    it("存储失败时 saveToken 向上抛错（适配层可据此提示）", async () => {
        const save = vi.fn(async () => {
            throw new Error("disk full");
        });
        const storage: TokenVaultStorage = {
            save,
            load: async () => "",
            remove: async () => ({code: 0}),
        };
        const vault = createTokenVault({seed, storage});
        await expect(vault.saveToken("ghp_secret")).rejects.toThrow("disk full");
        // 保存失败不缓存明文
        expect(vault.cachedToken).toBe("");
    });
});
