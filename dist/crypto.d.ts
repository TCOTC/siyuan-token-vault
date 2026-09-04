/**
 * Token 加解密纯算法层（无任何宿主/插件依赖）
 *
 * 载荷格式为版本化字符串：`v1.<saltB64Url>.<ivB64Url>.<cipherB64Url>`
 * - 密钥：PBKDF2(SHA-256, 500000 次迭代) 以「设备种子 + 随机 salt」派生 AES-GCM-256 密钥
 * - 密文：AES-GCM 认证加密（带完整性校验），每次加密随机生成 salt/iv，同明文密文不同
 *
 * 兼容性承诺：本实现与 install-package 插件既有 tokenCrypto 输出格式逐字节一致，
 * 存量密文可无缝迁移到本库解密。
 */
export declare const CURRENT_VERSION = "v1";
export declare const KDF_ITERATIONS = 500000;
/**
 * 基于设备种子派生稳定文件名，用于本地 Token 密文存储。
 * 增加固定前缀，避免与其它用途的摘要命名冲突。
 */
export declare function deriveTokenVaultFileName(seed: string): Promise<string>;
/**
 * 加密明文 Token，输出可持久化的版本化载荷字符串。
 *
 * @param plain 明文 Token
 * @param seed 设备特征种子（见 seedFromSiyuanSystem）
 * @returns 版本化密文载荷（v1.salt.iv.cipher）
 * @throws 明文为空时抛出异常
 */
export declare function encryptToken(plain: string, seed: string): Promise<string>;
/**
 * 解密版本化载荷
 *
 * @param payload 版本化载荷字符串
 * @param seed 设备特征种子（须与加密时一致，否则解密失败）
 * @returns 明文 Token 或 null（解密失败）
 */
export declare function decryptToken(payload: string, seed: string): Promise<string | null>;
