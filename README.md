# siyuan-token-vault

思源（SiYuan）插件共用的加密 Token 存储库。

当插件需要保存 GitHub PAT 等敏感凭据时，**避免明文落盘**：以「设备/工作空间特征种子 + PBKDF2 + AES-GCM」加密后写入插件数据目录，换设备或换工作空间后旧密文无法解密（需重新配置 Token）。

本库提取自 [install-package](https://github.com/TCOTC/install-package) 插件（`src/infra/tokenCrypto.ts` 与 `src/settings/setting.ts` 的存储部分），已由 install-package 使用；**载荷格式与既有实现逐字节兼容**，存量密文可无缝迁移。

## 特性

- 纯前端实现：仅依赖 Web Crypto（`crypto.subtle`），无 Node/宿主运行时依赖
- 载荷版本化（`v1.salt.iv.cipher`），为后续算法升级预留兼容解码
- 加密带完整性校验（AES-GCM），密文被篡改或种子变化时解密返回 `null` 而非抛错
- 每次加密随机生成 salt/iv，同一明文密文不同
- 无运行时第三方依赖，可被思源插件 webpack 直接打入 bundle

## 安装

插件仓库以 GitHub tag 依赖本库（本库发布预编译 `dist/` 产物）：

```json
{
  "devDependencies": {
    "siyuan-token-vault": "github:TCOTC/siyuan-token-vault#v0.1.0"
  }
}
```

> 提示：思源插件的 webpack 通常只编译插件自身 `src/`（`include` 限定），因此本库发布 `dist/` 预编译产物；消费方构建时该依赖会被直接打入插件 bundle，运行时无额外加载，集市包不含 `node_modules`，故放 `devDependencies` 即可。

## 使用

```ts
import {createTokenVault, seedFromSiyuanSystem} from "siyuan-token-vault";
import type {TokenVaultStorage} from "siyuan-token-vault";

// 1. 派生设备特征种子（window.siyuan.config.system 由宿主提供）
const seed = seedFromSiyuanSystem(window.siyuan.config.system);

// 2. 把插件存储 API 适配为 TokenVaultStorage
const storage: TokenVaultStorage = {
    save: (name, content) => plugin.saveData(name, content),
    load: async (name) => {
        const data = await plugin.loadData(name);
        // 思源 loadData 在文件不存在时返回空串，归一为 null
        return typeof data === "string" && data.trim() ? data : null;
    },
    remove: (name) => plugin.removeData(name),
};

// 3. 创建 vault 并保存/加载/删除
const vault = createTokenVault({seed, storage});   // 默认存于 secret/token_<hash>.dat
await vault.saveToken("ghp_...");                  // 加密落盘并缓存明文
const token = await vault.loadToken();             // 解密并缓存明文，失败返回 null
await vault.removeToken();                         // 删除密文并清缓存
vault.clear();                                     // 仅清内存明文缓存
```

### 与插件生命周期的配合

| 时机 | 操作 |
|---|---|
| 插件加载 / 设置数据跨端同步后 | `await vault.loadToken()` 恢复明文缓存 |
| 插件卸载 | `vault.clear()`（仅清内存；是否删除密文由业务决定） |
| 设置面板保存 Token | `await vault.saveToken(token)` |
| 设置面板删除 Token | `await vault.removeToken()` |
| 调用需凭据的 API | 读 `vault.cachedToken`（空串表示未配置） |

## API

- `seedFromSiyuanSystem(system, env?)`：派生设备特征种子
- `encryptToken(plain, seed)` / `decryptToken(payload, seed)`：版本化密文加解密
- `deriveTokenVaultFileName(seed)`：派生稳定密文文件名（`token_<hash>.dat`）
- `createTokenVault(options)`：存储封装（见上文）

类型定义见 `src/index.ts`。

## 安全说明

- 密钥绑定工作空间目录与设备特征：**不同设备 / 不同工作空间需分别配置 Token**
- 种子不含密码学意义上的随机秘密，加密强度取决于 PBKDF2 迭代次数与 AES-GCM；本方案目标是防「配置文件被直接复制阅读」，不替代系统级凭据管理
- 若浏览器界面语言（`navigator.language`）或时区等参与种子的环境特征变化，会导致既有密文无法解密，届时需重新配置 Token

## 使用本库的插件

- [install-package](https://github.com/TCOTC/install-package)（GitHub Release 安装集市包）

## 开发

```bash
pnpm install
pnpm test        # 单元测试
pnpm typecheck   # 类型检查
pnpm lint        # 代码风格
pnpm build       # 产出 dist/（含 .d.ts）
```

发布新版本：改 `package.json` 版本号 → `pnpm build` → 提交并 push → 打对应 tag（如 `v0.1.0`）；消费插件升级依赖版本号即可。

## License

[MIT](./LICENSE)
