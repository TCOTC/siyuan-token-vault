"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenVault = exports.seedFromSiyuanSystem = exports.encryptToken = exports.deriveTokenVaultFileName = exports.decryptToken = exports.KDF_ITERATIONS = exports.CURRENT_VERSION = void 0;
/**
 * siyuan-token-vault
 *
 * 思源插件共用的加密 Token 存储库：
 * - crypto：设备种子 + PBKDF2(SHA-256, 500000) + AES-GCM-256，版本化密文载荷（兼容 install-package 存量数据）
 * - seed：设备/工作空间特征种子派生
 * - vault：加密落盘 + 明文会话缓存的统一封装（宿主存储经 TokenVaultStorage 注入）
 */
var crypto_1 = require("./crypto");
Object.defineProperty(exports, "CURRENT_VERSION", { enumerable: true, get: function () { return crypto_1.CURRENT_VERSION; } });
Object.defineProperty(exports, "KDF_ITERATIONS", { enumerable: true, get: function () { return crypto_1.KDF_ITERATIONS; } });
Object.defineProperty(exports, "decryptToken", { enumerable: true, get: function () { return crypto_1.decryptToken; } });
Object.defineProperty(exports, "deriveTokenVaultFileName", { enumerable: true, get: function () { return crypto_1.deriveTokenVaultFileName; } });
Object.defineProperty(exports, "encryptToken", { enumerable: true, get: function () { return crypto_1.encryptToken; } });
var seed_1 = require("./seed");
Object.defineProperty(exports, "seedFromSiyuanSystem", { enumerable: true, get: function () { return seed_1.seedFromSiyuanSystem; } });
var vault_1 = require("./vault");
Object.defineProperty(exports, "createTokenVault", { enumerable: true, get: function () { return vault_1.createTokenVault; } });
//# sourceMappingURL=index.js.map