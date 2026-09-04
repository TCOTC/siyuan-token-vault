// @vitest-environment node
import {describe, expect, it} from "vitest";
import {seedFromSiyuanSystem} from "./seed";

describe("seedFromSiyuanSystem", () => {
    it("按固定顺序拼接全部字段（与 install-package 兼容）", () => {
        const system = {
            workspaceDir: "/data/siyuan",
            id: "device-1",
            name: "My PC",
            osPlatform: "win32",
        };
        const env = {
            platform: "Win32",
            language: "zh-CN",
            timeZone: "Asia/Shanghai",
            deviceMemory: 8,
            hardwareConcurrency: 8,
        };
        expect(seedFromSiyuanSystem(system, env)).toBe("/data/siyuan|Win32|zh-CN|Asia/Shanghai|8|8|device-1|My PC|win32");
    });

    it("缺省字段以空串占位，保持分隔符数量一致", () => {
        // 字段顺序：workspaceDir|platform|language|timeZone|memory|cores|deviceId|deviceName|devicePlatform
        expect(seedFromSiyuanSystem(undefined, {}).split("|")).toEqual(["", "", "", "", "", "", "", "", ""]);
        expect(seedFromSiyuanSystem({workspaceDir: "w"}, {}).split("|")).toEqual(["w", "", "", "", "", "", "", "", ""]);
        expect(seedFromSiyuanSystem({id: "d"}, {timeZone: "UTC"}).split("|")).toEqual(["", "", "", "UTC", "", "", "d", "", ""]);
    });

    it("数值型环境特征缺失时按空串处理", () => {
        const env = {platform: "p", language: "l"};
        expect(seedFromSiyuanSystem({}, env).split("|")).toEqual(["", "p", "l", "", "", "", "", "", ""]);
    });

    it("env 缺省时自动读取当前环境且不抛异常", () => {
        const seed = seedFromSiyuanSystem({workspaceDir: "/w", id: "i"});
        expect(seed.split("|")).toHaveLength(9);
        expect(seed.startsWith("/w|")).toBe(true);
        // deviceId 在第 7 段
        expect(seed.split("|")[6]).toBe("i");
    });
});
