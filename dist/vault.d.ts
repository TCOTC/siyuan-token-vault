/**
 * 宿主存储抽象：思源插件以 plugin.saveData/loadData/removeData 实现。
 * load 在文件不存在或内容非字符串时应返回 null（思源 loadData 无文件时返回空串，由适配层归一）。
 */
export interface TokenVaultStorage {
    save(name: string, content: string): Promise<unknown>;
    load(name: string): Promise<string | null>;
    remove(name: string): Promise<unknown>;
}
/**
 * TokenVault 构造参数。
 */
export interface TokenVaultOptions {
    /** 设备特征种子（见 seedFromSiyuanSystem） */
    seed: string;
    /** 宿主存储实现 */
    storage: TokenVaultStorage;
    /** 密文存储目录，默认 "secret"（为空串则直接存于存储根） */
    dir?: string;
}
/**
 * 已加密 Token 的存储句柄。
 */
export interface TokenVault {
    /**
     * 获取密文存储名（默认 secret/token_<hash>.dat），首次调用后缓存。
     * 缓存名与 install-package 的 token_<hash>.dat 算法一致。
     */
    fileName(): Promise<string>;
    /**
     * 加密并保存 Token，成功后写入会话缓存。
     * @param plain 明文 Token
     * @returns 版本化密文载荷
     * @throws Token 为空、加密或保存失败时抛出异常（由调用方决定提示）
     */
    saveToken(plain: string): Promise<string>;
    /**
     * 从存储加载并解密 Token；成功后写入会话缓存。
     * @returns 明文 Token；存储为空或解密失败时返回 null（需区分两者时先调 hasStoredToken）
     */
    loadToken(): Promise<string | null>;
    /**
     * 探测存储中是否已存在非空密文（不触发解密，也不修改会话缓存）。
     * 用于区分 loadToken 返回 null 的两种情形：从未保存（hasStoredToken false）与解密失败（hasStoredToken true）。
     */
    hasStoredToken(): Promise<boolean>;
    /**
     * 删除存储中的密文并清空会话缓存。
     */
    removeToken(): Promise<void>;
    /**
     * 仅清空内存中的明文缓存（不删除存储）。
     */
    clear(): void;
    /** 会话缓存中的明文 Token（未保存/加载过则为空串） */
    readonly cachedToken: string;
}
/**
 * 创建 Token Vault。
 */
export declare function createTokenVault(options: TokenVaultOptions): TokenVault;
