"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenVault = createTokenVault;
/**
 * Token Vault：加密落盘 + 明文会话缓存的统一封装
 *
 * 职责：以「设备种子 + 版本化密文」为单一事实源，把 Token 保存到宿主存储
 * （经 TokenVaultStorage 抽象，思源插件可映射到 plugin.saveData/loadData/removeData），
 * 并提供与 install-package 插件一致的内存明文缓存语义（保存/加载后可用，插件关闭时 clear）。
 */
const crypto_1 = require("./crypto");
/**
 * 创建 Token Vault。
 */
function createTokenVault(options) {
    const dir = (options.dir ?? "secret").replace(/\/+$/, "");
    let cachedToken = "";
    let cachedFileName;
    const fileName = async () => {
        if (!cachedFileName) {
            const name = await (0, crypto_1.deriveTokenVaultFileName)(options.seed);
            cachedFileName = dir ? `${dir}/${name}` : name;
        }
        return cachedFileName;
    };
    return {
        async fileName() {
            return fileName();
        },
        async saveToken(plain) {
            const payload = await (0, crypto_1.encryptToken)(plain, options.seed);
            await options.storage.save(await fileName(), payload);
            cachedToken = plain;
            return payload;
        },
        async loadToken() {
            const data = await options.storage.load(await fileName());
            // 存储为空（思源 loadData 无文件返回空串或适配层归一的 null）时视为无可用数据。
            if (typeof data !== "string" || !data.trim()) {
                cachedToken = "";
                return null;
            }
            const token = await (0, crypto_1.decryptToken)(data.trim(), options.seed);
            cachedToken = token ?? "";
            return token;
        },
        async removeToken() {
            await options.storage.remove(await fileName());
            cachedToken = "";
        },
        clear() {
            cachedToken = "";
        },
        get cachedToken() {
            return cachedToken;
        },
    };
}
//# sourceMappingURL=vault.js.map