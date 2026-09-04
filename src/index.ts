/**
 * siyuan-token-vault
 *
 * 思源插件共用的加密 Token 存储库：
 * - crypto：设备种子 + PBKDF2(SHA-256, 500000) + AES-GCM-256，版本化密文载荷（兼容 install-package 存量数据）
 * - seed：设备/工作空间特征种子派生
 * - vault：加密落盘 + 明文会话缓存的统一封装（宿主存储经 TokenVaultStorage 注入）
 */
export {CURRENT_VERSION, KDF_ITERATIONS, decryptToken, deriveTokenVaultFileName, encryptToken} from "./crypto";
export {seedFromSiyuanSystem} from "./seed";
export type {DeviceEnvInput, SiyuanSystemInput} from "./seed";
export {createTokenVault} from "./vault";
export type {TokenVault, TokenVaultOptions, TokenVaultStorage} from "./vault";
