// Vitest 配置：单测统一 Node 环境（WebCrypto/btoa/atob/TextEncoder 均为 Node 全局，无需 jsdom）
import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        restoreMocks: true,
    },
});
