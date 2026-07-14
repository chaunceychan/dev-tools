# DevTools - 开发常用小工具集

<div align="center">

![DevTools Logo](./dev_tool_logo_48x48.png)

**一款专为开发者打造的高效便携工具箱**

[![Version](https://img.shields.io/badge/Version-1.2.0-blue.svg)](CHANGELOG.md)
[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go)](https://golang.org)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 项目简介

DevTools 是一款专为开发者打造的桌面应用，集合日常高频使用的格式化、编码、转换、Diff、校验与加解密工具。采用 **Go + Wails v2** 技术栈，单进程架构，支持 Windows 便携分发、macOS Universal 应用，以及 Linux 包构建。

当前应用版本：**1.2.0**

### ✨ 核心特性

- **一站式效率工具** - 15 种开发者常用工具集中管理
- **跨平台便携体验** - Windows 解压即用，macOS Universal 双架构，数据目录跟随应用
- **即时响应交互** - Go 方法直接绑定前端，输入即输出
- **统一执行链路** - `useGoMethod` 统一处理加载态、错误归一化与工具历史
- **现代主题界面** - React + Tailwind，支持 Light / Dark / System 三态主题

### 🆕 近期更新

| 版本 | 亮点 |
|------|------|
| **1.2.0** | 新增对称加密（AES / SM4 / 3DES），密钥派生 + 随机 IV + HMAC 完整性校验 |
| **1.1.0** | 新增文本 Diff；JSON 支持转 YAML；统一执行管道与历史记录；Light/Dark/System 主题 |
| **1.0.0** | 首发：JSON / Base64 / 时间戳 / YAML / XML / 随机串 / Cron / URL / Hash / JWT / UUID / 正则 |

完整变更见 [CHANGELOG.md](CHANGELOG.md)。

---

## 🛠️ 支持的工具

应用侧边栏按 **核心工具 / 扩展工具** 分组，当前共 **15** 个工具：

### 核心工具

| 工具 | 功能 | 操作 |
|------|------|------|
| **JSON 格式化** | JSON 美化 / 压缩 / 语法验证 / 转 YAML | 格式化 / 压缩 / 验证 / 转YAML |
| **Base64 编解码** | 文本与文件 Base64 编解码（文件上限 10MB） | 文本编码 / 文本解码 / 文件编码 / 文件解码 |
| **时间戳转换** | Unix 时间戳与日期互转，多时区对照 | 转日期 / 转时间戳 / 多时区 |

### 扩展工具

| 工具 | 功能 | 操作 |
|------|------|------|
| **YAML 格式化** | YAML 美化 / 验证 / 转 JSON | 格式化 / 验证 / 转JSON |
| **XML 格式化** | XML 美化 / 压缩 / 语法验证 | 格式化 / 压缩 / 验证 |
| **随机字符串** | 可配置长度、字符集与数量生成 | 生成 |
| **Cron 解析** | Cron 表达式解析、验证与下次执行时间 | 解析 / 验证 / 下次执行 |
| **URL 编解码** | URL 编解码与查询参数解析 | 编码 / 解码 / 解析参数 |
| **Hash 摘要** | MD5 / SHA1 / SHA256 / SHA512 | 生成 / 全部生成 |
| **JWT 解析** | JWT Token 解析 | 解析 |
| **UUID 工具** | UUID 生成与验证 | 生成 / 验证 |
| **正则测试** | 正则匹配测试与替换 | 测试 / 替换 |
| **常用校验** | 邮箱 / 手机号 / URL / IPv4 / 身份证等预设规则 | 验证 |
| **文本 Diff** | 文本与文件行级比较，支持并排 / Unified 视图 | 文本比较 / 文件比较 |
| **对称加密** | AES-256-CBC / SM4-CBC / 3DES-CBC 文本加解密 | 加密 / 解密 |

### 对称加密说明

- 仅处理文本，支持 AES-256-CBC、SM4-CBC 与 3DES-CBC；加密结果统一为标准 Base64。
- 只需输入密钥。应用会由该文本派生算法密钥，每次加密生成随机 IV，并将 `IV + 密文 + HMAC-SHA256 完整性标签` 一并编码输出；解密时自动校验，密文被篡改、算法或密钥不匹配会被拒绝。
- 密钥和明文会按原样处理（包括首尾空白）；请妥善保存密钥。3DES 仅为兼容旧系统保留，新场景优先使用 AES 或 SM4。

### 文本 Diff 说明

- 支持左右文本直接比较，也支持选择两个文本文件比较。
- 后端输出 unified-style 行级 Diff；前端可切换 **并排视图** 与 **Unified** 视图。
- 两段内容完全一致时，会明确提示“没有差异”。

### 常用校验说明

- 基于预设正则快速校验常见格式，当前内置：邮箱、中国手机号、纯数字、纯字母、字母+数字、URL、IPv4、日期、身份证号。
- 适合日常开发联调时的快速校验，不等于完整业务规则校验。

---

## 🚀 快速开始

### 环境要求

- **Go**: 1.24+
- **Node.js**: 18+（CI 使用 Node 20）
- **Wails CLI**:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 安装依赖

```bash
# 安装 Go 依赖
go mod download

# 安装前端依赖
cd frontend && npm install && cd ..
```

### 开发模式

```bash
# 使用 Wails 开发模式（自动启动前端热更新）
wails dev
```

也可使用：

```bash
./scripts/dev.sh
```

### 构建生产版本

```bash
# 构建 Windows 便携版
./scripts/build-portable.sh

# 构建 macOS Universal 应用（Intel + Apple Silicon）
./scripts/build-macos-universal.sh
```

构建产物说明：

- Windows 便携包：`dist/dev-tools-portable/`（或脚本打包后的 zip）
- macOS 应用：`build/bin/DevTools.app`
- 发布流水线还会构建 Linux `.deb` / `.rpm`（见 `.github/workflows/release.yml`）

打 `v*` 标签后，GitHub Actions 会自动构建并发布多平台产物。

---

## 📁 项目结构

```
dev-tools/
├── frontend/                         # React 前端源码
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # 布局：侧边栏 / 主内容 / 状态栏
│   │   │   ├── common/              # 通用：输入区、输出区、主题切换等
│   │   │   └── tools/               # 各工具组件（15 个）
│   │   ├── store/                   # Zustand：tool / history / theme
│   │   ├── hooks/                   # useGoMethod / useToolHistory / useClipboard
│   │   ├── types/                   # TypeScript 类型
│   │   └── utils/                   # 常量、Wails API 封装
│   ├── package.json
│   └── vite.config.ts
├── pkg/                              # Go 业务逻辑包
│   ├── jsonutil/
│   ├── base64util/
│   ├── timeutil/
│   ├── yamlutil/
│   ├── xmlutil/
│   ├── randomutil/
│   ├── cronutil/
│   ├── urlutil/
│   ├── hashutil/
│   ├── jwtutil/
│   ├── uuidutil/
│   ├── regexutil/
│   ├── diffutil/                    # 文本 / 文件 Diff
│   └── symmetricutil/               # 对称加密
├── *.service.go                      # 服务层：绑定到前端的 Wails 方法
├── main.go                           # 应用入口
├── app.go                            # App 生命周期 + ToolList 元数据
├── models.go                         # 数据模型
├── wails.json                        # Wails 配置
├── scripts/                          # 开发 / 构建脚本
├── .github/workflows/                # CI / Release
├── prd.md                            # 产品需求
├── architecture.md                   # 架构设计
├── CHANGELOG.md                      # 版本变更
└── docs/                             # 设计文档与 ADR 等
```

---

## 🏗️ 技术架构

### 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| **桌面框架** | Wails v2 | Go + Web 混合应用，单进程绑定 |
| **后端逻辑** | Go 1.24+ | 工具逻辑在 `pkg/*`，通过 `*_service.go` 暴露 |
| **前端框架** | React 18 | 组件化工具面板 |
| **构建工具** | Vite 5 | 开发热更新与生产构建 |
| **样式方案** | Tailwind CSS 3 | 原子化 CSS，VS Code 风格 |
| **组件库** | Radix UI | 无样式可访问性原语 |
| **状态管理** | Zustand | toolStore / historyStore / themeStore |
| **语言** | TypeScript 5.5 | 前端类型安全 |

### 架构设计

```
┌─────────────────────────────────────────────────────┐
│              Wails Desktop Application               │
├─────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Vite + Tailwind)    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   Layout   │  │   Store    │  │   Utils      │  │
│  │ Components │  │ (Zustand)  │  │ & Hooks      │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ Wails Binding
┌───────────────────────┴─────────────────────────────┐
│  Backend (Go)                                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   App      │  │  Services  │  │   Packages   │  │
│  │  (Binding) │  │ (*.service)│  │   (pkg/*)    │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 架构要点

1. **Wails v2 单进程架构**
   - 无需 sidecar，部署简单
   - Go 方法直接绑定到前端，调用开销低
   - 原生窗口集成，启动与交互更轻

2. **便携式数据管理**
   - 数据目录：`{exe}/data/`
   - 不写注册表，解压即可运行
   - 支持工具历史与主题等本地状态

3. **前端组件化 + 统一调用链**
   - 通用组件：`InputArea` / `OutputArea` / `ActionBar` / `ThemeToggle`
   - 工具组件独立封装，按 `ToolId` 映射渲染
   - `useGoMethod` 统一加载态、错误处理与历史记录

4. **工具元数据双端对齐**
   - Go 侧：`app.go` 的 `ToolList`
   - 前端侧：`frontend/src/utils/constants.ts` 的 `TOOL_LIST`
   - 新增工具时两端都需要同步更新

---

## 📝 使用示例

### JSON 格式化

```typescript
import { FormatJSON } from '../utils/wailsApi';

const result = await FormatJSON('{"name":"test"}', 2);
// {
//   "name": "test"
// }
```

### JSON 转 YAML

```typescript
import { JSONToYAML } from '../utils/wailsApi';

const yaml = await JSONToYAML('{"name":"test"}');
// name: test
```

### 时间戳转换

```typescript
import { TimestampToDate } from '../utils/wailsApi';

const date = await TimestampToDate(1688323200, 's', 'Asia/Shanghai');
// "2023-07-03 00:00:00"
```

### Cron 表达式解析

```typescript
import { ParseCron } from '../utils/wailsApi';

const result = await ParseCron('0 0 * * *', 5, false);
// {
//   description: "每天 00:00 执行",
//   nextRuns: [...]
// }
```

### 文本 Diff

```typescript
import { CompareText } from '../utils/wailsApi';

const diff = await CompareText('hello\nworld', 'hello\nDevTools', 'left', 'right');
// --- left
// +++ right
// ...
```

### 对称加密

```typescript
import { SymmetricEncrypt, SymmetricDecrypt } from '../utils/wailsApi';

const cipher = await SymmetricEncrypt('hello', 'my-secret', 'aes');
const plain = await SymmetricDecrypt(cipher, 'my-secret', 'aes');
// plain === "hello"
```

---

## 🎯 开发指南

### 添加新工具

1. **创建 Go 包**：在 `pkg/` 下新增 `xxxutil/`，实现核心逻辑并补充测试
2. **创建服务层**：在根目录新增 `xxx_service.go`，把方法挂到 `App`
3. **创建前端组件**：在 `frontend/src/components/tools/` 新增工具组件
4. **注册组件映射**：更新 `frontend/src/components/layout/MainContent.tsx` 的 `TOOL_COMPONENTS`
5. **同步工具元数据**：
   - `app.go` 的 `ToolList`
   - `frontend/src/utils/constants.ts` 的 `TOOL_LIST`
   - 相关类型（如 `frontend/src/types/tool.ts`）
6. **封装 API**：在 `frontend/src/utils/wailsApi.ts` 增加前端调用入口

### 代码规范

- **Go**：遵循 `gofmt`；包内逻辑优先放在 `pkg/*`，绑定层保持薄
- **TypeScript**：组件 PascalCase，函数/变量 camelCase
- **CSS**：优先 Tailwind utility；自定义类以 `dt-` 前缀

---

## 🧪 测试

```bash
# 运行 Go 测试
go test ./pkg/...

# 构建前端（含 TypeScript 检查）
cd frontend && npm run build
```

建议新增工具时至少覆盖：

- 正常输入
- 非法输入 / 边界条件
- 服务层错误信息是否对用户可读

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！更详细的说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 📮 反馈

欢迎通过 Issues 反馈问题或建议。

---

**开发高效，工具在手 - DevTools 让开发更简单！** 🚀
