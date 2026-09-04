// ESLint 10 扁平化配置（flat config）
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const globals = require("globals");

module.exports = tseslint.config(
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            ".eslintcache",
            "coverage/**",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // src 下的 TypeScript 源码（浏览器全局为主，测试文件所需的 describe/it 等从 vitest 显式导入）
        files: ["src/**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            semi: ["error", "always"],
            quotes: ["error", "double", {"avoidEscape": true}],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "caughtErrors": "none",
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "no-useless-escape": "off",
        },
    },
    {
        // 工程级 CommonJS 配置文件（eslint.config.js 等）
        files: ["*.config.js", "eslint.config.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: globals.node,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    {
        // Vitest 配置（.mts，ESM）
        files: ["vitest.config.mts"],
        languageOptions: {
            sourceType: "module",
            globals: globals.node,
        },
    }
);
