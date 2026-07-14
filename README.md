# DevTools - 开发常用小工具集

<div align="center">

![DevTools Logo](./dev_tool_logo_48x48.png)

**一款专为开发者打造的高效便携工具箱**

[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go)](https://golang.org)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 项目简介

DevTools 是一款专为开发者打造的桌面应用，集合了日常高频使用的格式化、编码、转换等工具。采用 Go + Wails v2 技术栈，支持 Windows 平台便携分发，解压即用，无需安装配置。

### ✨ 核心特性

- **一站式效率工具** - 15+ 种开发者常用工具集中管理
- **零门槛便携体验** - Windows 解压即用，无需安装，数据跟随应用
- **即时响应交互** - 输入即输出，毫秒级响应，高效流畅
- **简洁现代界面** - 基于 React + Tailwind CSS，VS Code 风格 UI 设计

---

## 🛠️ 支持的工具

### 核心工具 (P0)

| 工具 | 功能 | 操作 |
|------|------|------|
| **JSON 格式化** | JSON 美化/压缩/语法验证 | 格式化 / 压缩 / 验证 |
| **Base64 编解码** | 文本/文件 Base64 编解码 | 文本编码 / 文本解码 / 文件编码 / 文件解码 |
| **时间戳转换** | Unix 时间戳与日期互转，多时区对照 | 转日期 / 转时间戳 / 多时区 |

### 扩展工具 (P1)

| 工具 | 功能 | 操作 |
|------|------|------|
| **YAML 格式化** | YAML 美化/验证/转 JSON | 格式化 / 验证 / 转 JSON |
| **XML 格式化** | XML 美化/压缩/语法验证 | 格式化 / 压缩 / 验证 |
| **随机字符串** | 可配置生成随机字符串 | 生成 |
| **Cron 解析** | Cron 表达式解析与执行时间计算 | 解析 / 验证 / 下次执行 |

### 增强工具 (P2)

| 工具 | 功能 | 操作 |
|------|------|------|
| **URL 编解码** | URL 编解码与参数解析 | 编码 / 解码 / 解析参数 |
| **Hash 摘要** | 多种哈希算法生成 | 生成 / 全部生成 |
| **对称加密** | AES / SM4 / 3DES 文本加解密 | 加密 / 解密 |
| **JWT 解析** | JWT Token 解析与验证 | 解析 |
| **UUID 工具** | UUID 生成与验证 | 生成 / 验证 |
| **正则测试** | 正则表达式测试与替换 | 测试 / 替换 |

---

### 对称加密说明

- 仅处理文本，支持 AES-256-CBC、SM4-CBC 与 3DES-CBC；加密结果统一为标准 Base64。
- 只需输入密钥。应用会由该文本派生算法密钥，每次加密生成随机 IV，并将 `IV + 密文 + HMAC-SHA256 完整性标签` 一并编码输出；解密时自动校验，密文被篡改、算法或密钥不匹配会被拒绝。
- 密钥和明文会按原样处理（包括首尾空白）；请妥善保存密钥。3DES 仅为兼容旧系统保留，新场景优先使用 AES 或 SM4。

---

## 🚀 快速开始

### 环境要求

- **Go**: 1.24+
- **Node.js**: 18+
- **Wails CLI**: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

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

### 构建生产版本

```bash
# 构建 Windows 便携版
./scripts/build-portable.sh

# 构建 macOS Universal 应用
./scripts/build-macos-universal.sh
```

构建产物位于 `dist/` 目录，解压即用。

---

## 📁 项目结构

```
dev-tools/
├── frontend/                    # React 前端源码
│   ├── src/
│   │   ├── components/          # UI 组件
│   │   │   ├── layout/         # 布局组件（侧边栏、主内容区）
│   │   │   ├── common/         # 通用组件（输入区、输出区）
│   │   │   └── tools/          # 各工具组件
│   │   ├── store/              # Zustand 状态管理
│   │   ├── hooks/              # React Hooks
│   │   ├── types/              # TypeScript 类型定义
│   │   └── utils/              # 工具函数
│   ├── package.json
│   └── vite.config.ts
├── pkg/                         # Go 业务逻辑包
│   ├── jsonutil/               # JSON 处理
│   ├── base64util/             # Base64 处理
│   ├── timeutil/               # 时间戳处理
│   ├── yamlutil/               # YAML 处理
│   ├── xmlutil/                # XML 处理
│   ├── randomutil/             # 随机字符串
│   ├── cronutil/               # Cron 解析
│   ├── urlutil/                # URL 编解码
│   ├── hashutil/               # Hash 摘要
│   ├── symmetricutil/          # 对称加密/解密
│   ├── jwtutil/                # JWT 解析
│   ├── uuidutil/               # UUID 工具
│   └── regexutil/              # 正则测试
├── *.service.go                 # 各工具的服务层（绑定到前端）
├── main.go                      # Go 主程序入口
├── app.go                       # Wails 应用结构
├── models.go                    # 数据模型定义
├── wails.json                   # Wails 配置
├── go.mod / go.sum             # Go 依赖管理
├── scripts/                     # 构建脚本
├── prd.md                       # 产品需求文档
└── architecture.md              # 架构设计文档
```

---

## 🏗️ 技术架构

### 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| **桌面框架** | Wails v2 | Go + Web 混合应用框架，轻量高效 |
| **后端逻辑** | Go 1.24+ | 业务逻辑处理，通过 Wails 绑定到前端 |
| **前端框架** | React 18 | 组件化 UI 开发 |
| **构建工具** | Vite 5 | 高速前端构建，支持热更新 |
| **样式方案** | Tailwind CSS 3 | 原子化 CSS，快速构建现代 UI |
| **组件库** | Radix UI | 无样式可访问性原语组件 |
| **状态管理** | Zustand | 轻量级状态管理 |
| **语言** | TypeScript 5.5 | 类型安全的前端开发 |

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

### 核心特性

1. **Wails v2 单进程架构**
   - 无需 sidecar 进程，简化部署
   - 直接绑定 Go 方法到前端，调用开销低
   - 支持原生窗口集成，用户体验流畅

2. **便携式数据管理**
   - 数据目录：`{exe}/data/`
   - 无写注册表，解压即用
   - 支持历史记录与配置持久化

3. **前端组件化设计**
   - 通用组件复用（InputArea、OutputArea、ActionBar）
   - 工具组件独立封装
   - 状态集中管理（toolStore、historyStore、themeStore）

---

## 📝 使用示例

### JSON 格式化

```typescript
// 前端调用
import { FormatJSON } from '../utils/wailsApi';

const result = await FormatJSON('{"name":"test"}', 2);
// Output: {
//   "name": "test"
// }
```

### 时间戳转换

```typescript
// 前端调用
import { TimestampToDate } from '../utils/wailsApi';

const date = await TimestampToDate(1688323200, 's', 'Asia/Shanghai');
// Output: "2023-07-03 00:00:00"
```

### Cron 表达式解析

```typescript
// 前端调用
import { ParseCron } from '../utils/wailsApi';

const result = await ParseCron('0 0 * * *', 5, false);
// Output: {
//   description: "每天 00:00 执行",
//   nextRuns: [...]
// }
```

---

## 🎯 开发指南

### 添加新工具

1. **创建 Go 包**：在 `pkg/` 下创建工具包，实现核心逻辑
2. **创建服务层**：在根目录创建 `*_service.go`，绑定到 Wails
3. **创建前端组件**：在 `frontend/src/components/tools/` 创建组件
4. **更新工具列表**：在 `app.go` 的 `ToolList` 中添加元数据
5. **更新常量定义**：在 `frontend/src/utils/constants.ts` 中添加配置

### 代码规范

- **Go**：遵循 `gofmt` 格式，使用 snake_case 命名
- **TypeScript**：使用 PascalCase 命名组件，camelCase 命名函数/变量
- **CSS**：优先使用 Tailwind utility 类，自定义类以 `dt-` 前缀

---

## 🧪 测试

```bash
# 运行 Go 测试
go test ./pkg/...

# 构建前端
cd frontend && npm run build
```

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📮 反馈

项目发布到 GitHub 后，欢迎通过 Issues 反馈问题或建议。

---

**开发高效，工具在手 - DevTools 让开发更简单！** 🚀
