/**
 * 设备特征种子派生
 *
 * 种子用于加密 Token 的密钥派生输入：同设备同工作空间可稳定复现，
 * 换设备/换工作空间后无法解密既有密文（需重新配置 Token）。
 *
 * 兼容性承诺：字段拼接顺序与 install-package 插件既有实现逐字节一致
 * （workspaceDir|platform|language|timeZone|memory|cores|deviceId|deviceName|devicePlatform），
 * 保证存量密文在迁移后仍可解密。
 */

/**
 * 思源工作空间系统信息（对应 window.siyuan.config.system 中参与种子派生的字段）。
 */
export interface SiyuanSystemInput {
    /** 工作空间目录 */
    workspaceDir?: string;
    /** 设备 ID */
    id?: string;
    /** 设备名称 */
    name?: string;
    /** 操作系统平台 */
    osPlatform?: string;
}

/**
 * 浏览器/运行环境特征（可显式传入以覆盖自动探测，便于测试与跨端一致性）。
 */
export interface DeviceEnvInput {
    platform?: string;
    language?: string;
    timeZone?: string;
    deviceMemory?: number;
    hardwareConcurrency?: number;
}

/**
 * 读取当前运行环境特征：浏览器 navigator 与本地时区。
 * 在非浏览器环境（如 Node/SSR）中逐项降级为空值，不抛异常。
 */
function readDeviceEnv(): DeviceEnvInput {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const navEx = nav as (Navigator & { deviceMemory?: number }) | undefined;
    const tz = (() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
        } catch {
            return "";
        }
    })();
    return {
        platform: navEx?.platform ?? "",
        language: navEx?.language ?? "",
        timeZone: tz,
        deviceMemory: navEx?.deviceMemory,
        hardwareConcurrency: navEx?.hardwareConcurrency,
    };
}

/**
 * 派生设备特征种子。
 *
 * @param system 思源工作空间系统信息（对应 window.siyuan.config.system）
 * @param env 运行环境特征；缺省时自动读取当前环境
 * @returns 参与密钥派生的稳定种子字符串
 */
export function seedFromSiyuanSystem(system?: Partial<SiyuanSystemInput>, env: DeviceEnvInput = readDeviceEnv()): string {
    const workspaceDir = system?.workspaceDir ?? "";
    const deviceId = system?.id ?? "";
    const deviceName = system?.name ?? "";
    const devicePlatform = system?.osPlatform ?? "";
    const platform = env.platform ?? "";
    const language = env.language ?? "";
    const timeZone = env.timeZone ?? "";
    const memory = String(env.deviceMemory ?? "");
    const cores = String(env.hardwareConcurrency ?? "");
    return [workspaceDir, platform, language, timeZone, memory, cores, deviceId, deviceName, devicePlatform].join("|");
}
