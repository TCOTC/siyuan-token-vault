// @vitest-environment node
import {describe, expect, it} from "vitest";
import {decryptToken, deriveTokenVaultFileName, encryptToken} from "./crypto";

const seed = "a|b|c|d|e|f|g|h|i";

describe("encryptToken / decryptToken", () => {
    it("加密解密往返还原明文", async () => {
        const payload = await encryptToken("ghp_0123456789abcdef", seed);
        expect(payload).not.toContain("ghp_");
        expect(await decryptToken(payload, seed)).toBe("ghp_0123456789abcdef");
    });

    it("空明文抛出异常（与 install-package 语义一致：仅拒绝空串）", async () => {
        await expect(encryptToken("", seed)).rejects.toThrow();
    });

    it("同一明文两次加密产生不同密文（salt/iv 随机）", async () => {
        const a = await encryptToken("secret-token", seed);
        const b = await encryptToken("secret-token", seed);
        expect(a).not.toBe(b);
    });

    it("载荷格式为 v1.salt.iv.cipher 且段为 URL 安全 Base64", async () => {
        const payload = await encryptToken("secret-token", seed);
        const parts = payload.split(".");
        expect(parts).toHaveLength(4);
        expect(parts[0]).toBe("v1");
        for (const segment of parts.slice(1)) {
            expect(segment).not.toMatch(/[+/=]/);
        }
    });

    it("换种子后解密失败（设备特征变化语义）", async () => {
        const payload = await encryptToken("secret-token", seed);
        expect(await decryptToken(payload, "other|seed")).toBeNull();
    });

    it("篡改密文后解密失败", async () => {
        const payload = await encryptToken("secret-token", seed);
        const parts = payload.split(".");
        // 篡改 salt 段中段字符（避开末尾 padding 丢弃位，确保字节真实变化）
        const mid = Math.floor(parts[1].length / 2);
        parts[1] = parts[1].slice(0, mid) + (parts[1][mid] === "a" ? "b" : "a") + parts[1].slice(mid + 1);
        expect(await decryptToken(parts.join("."), seed)).toBeNull();
    });

    it("非法载荷返回 null 而非抛异常", async () => {
        expect(await decryptToken("", seed)).toBeNull();
        expect(await decryptToken("not-a-payload", seed)).toBeNull();
        expect(await decryptToken("v2.abc.def.ghi", seed)).toBeNull();
        expect(await decryptToken("v1.!!!.def.ghi", seed)).toBeNull();
        expect(await decryptToken("v1.a.b.c.d.extra", seed)).toBeNull();
    });

    it("明文支持非 ASCII 字符", async () => {
        const payload = await encryptToken("思源笔记-トークン-🚀", seed);
        expect(await decryptToken(payload, seed)).toBe("思源笔记-トークン-🚀");
    });
});

describe("deriveTokenVaultFileName", () => {
    it("同种子派生稳定文件名", async () => {
        const name = await deriveTokenVaultFileName(seed);
        expect(name).toBe(await deriveTokenVaultFileName(seed));
    });

    it("文件名格式为 token_<20位hex>.dat", async () => {
        const name = await deriveTokenVaultFileName(seed);
        expect(name).toMatch(/^token_[0-9a-f]{20}\.dat$/);
    });

    it("不同种子派生不同文件名", async () => {
        expect(await deriveTokenVaultFileName(seed)).not.toBe(await deriveTokenVaultFileName("other-seed"));
    });
});
