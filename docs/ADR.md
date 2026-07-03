# Architecture Decision Record — dev-tools

> 基于 codebase-memory 知识图谱自动分析生成 | 索引时间：2026-06-30
> 索引规模：680 节点 / 1,132 边 | 模式：full（LSP 类型解析 + 语义边 + 相似度边）

---

## 1. 项目概要

**dev-tools** 是面向 Windows 的开发常用小工具集桌面应用，目标为**单 exe 便携版，解压即用**。

## 2. 技术选型

| 层级 | 技术 | 决策理由 |
|------|------|----------|
| 后端 | Go 1.22+ | 编译为单二进制，无运行时依赖 |
| GUI 桥接 | Wails v2.10.0 | Go + Web 技术栈整合，WebView2 嵌入 |
| 前端框架 | React 18 + TypeScript | 类型安全，组件化开发 |
| 样式方案 | Tailwind CSS | 原子化 CSS，快速构建 |
| 状态管理 | Zustand | 轻量，适合中小型应用 |
| 构建工具 | Vite | 快速 HMR，现代打包 |
| 数据目录 | `{exe}/data/` | 便携跟随，无安装残留 |

## 3. 架构分层

### 3.1 四层模型（基于调用图分析）

```
┌─────────────────────────────────────────────┐
│              Entry Layer（入口层）            │
│  app.go / *_service.go（7 services）         │
│  仅出向调用，暴露给 Wails 前端               │
├─────────────────────────────────────────────┤
│              Core Layer（核心层）             │
│  yamlutil（fan-in: 9）                      │
│  base64util（fan-in: 4）                    │
│  timeutil（fan-in: 3, fan-out: 5）          │
│  cronutil（fan-in: 3, fan-out: 1）          │
│  common（共享辅助函数）                       │
├─────────────────────────────────────────────┤
│              Leaf Layer（叶节点层）            │
│  jsonutil / randomutil / xmlutil             │
│  仅入向调用，无出向依赖                       │
├─────────────────────────────────────────────┤
│            Frontend Layer（前端层）           │
│  frontend/src/ → wailsjs/go/main/App         │
│  React 组件 + Zustand Store + Custom Hooks   │
└─────────────────────────────────────────────┘
```

### 3.2 分层判定依据

| 层 | 判定规则 | 成员 |
|----|----------|------|
| Entry | 仅出向调用，无入向 | 7 个 `*_service.go` 文件 |
| Core | 高出度或高入度 | yamlutil, base64util, timeutil, cronutil |
| Leaf | 仅入向调用，无出向 | jsonutil, randomutil, xmlutil |
| Frontend | 通过 Wails IPC 调用后端 | React 组件树 + Store + Hooks |

## 4. 模块聚类（Leiden 社区检测）

索引划分出 10 个功能聚类：

| # | 聚类名称 | 成员数 | 内聚度 | 核心节点 | 所属包 |
|---|---------|--------|--------|---------|--------|
| 0 | Frontend-Common | 19 | 1.00 | ErrorDisplay, OutputArea, ActionBar, useGoMethod | frontend |
| 1 | YAML+Time | 17 | 0.91 | Format, MultiTimezone, TimestampToDate | pkg, timestamp_service, yaml_service |
| 2 | Cron | 12 | 0.93 | Parse, NextN, Validate | cron_service, pkg |
| 3 | JSON | 11 | 1.00 | Format, Minify, Validate | pkg, json_service |
| 4 | XML | 11 | 1.00 | Format, Minify | xml_service, pkg |
| 5 | Base64 | 10 | 1.00 | DecodeText, EncodeText, EncodeFile | base64_service, pkg |
| 6 | YAML-Core | 9 | 0.90 | ToJSON, Format, Validate | pkg, yaml_service |
| 7 | Frontend-App | 8 | 1.00 | AppLayout, Sidebar, StatusBar | frontend |
| 8 | Random | 3 | 1.00 | Generate | pkg, random_service |
| 9 | Base64-File | 3 | 1.00 | DecodeFile | base64_service, pkg |

## 5. 热点分析

| 热点 | Fan-in | 风险 | 影响范围 |
|------|--------|------|---------|
| `yamlutil.Format` | 8 | ⚠️ 高 | 修改影响所有 YAML 格式化调用方 |
| `useGoMethod` | 7 | ⚠️ 高 | 所有工具页面的 IPC 调用统一入口 |
| `ActionBar` | 7 | 中 | 通用操作栏，被 7 个工具页引用 |
| `ErrorDisplay` | 7 | 中 | 通用错误展示，全局引用 |
| `cronutil.Parse` | 5 | 中 | Cron 解析核心逻辑 |
| `xmlutil.Format` / `xmlutil.Minify` | 4 | 低 | XML 工具专用 |

## 6. 跨模块调用边界

```
timeutil ──5 calls──→ yamlutil    ← ⚠️ 时间工具反向依赖 YAML 工具
base64_service ──4──→ base64util
json_service ──3──→ jsonutil
timestamp_service ──3──→ timeutil
cron_service ──3──→ cronutil
yaml_service ──3──→ yamlutil
xml_service ──3──→ xmlutil
random_service ──1──→ randomutil
```

## 7. 工具清单

共 7 个开发工具，每个对应 `*_service.go` + `pkg/*util/` ：

| 工具 | Service 文件 | Util 包 | 功能 |
|------|-------------|---------|------|
| JSON | json_service.go | jsonutil | 格式化 / 压缩 / 验证 |
| YAML | yaml_service.go | yamlutil | 格式化 / 验证 / 转 JSON |
| XML | xml_service.go | xmlutil | 格式化 / 压缩 / 验证 |
| Base64 | base64_service.go | base64util | 文本编解码 / 文件编解码 |
| 时间戳 | timestamp_service.go | timeutil | 时间戳↔日期 / 多时区 |
| Cron | cron_service.go | cronutil | 表达式解析 / 下次执行 |
| 随机字符串 | random_service.go | randomutil | 生成随机字符串 |

## 8. 前端架构

### 8.1 组件树

```
AppLayout
├── Sidebar          // 工具导航
├── ToolPages ×7     // 7 个工具页面
│   ├── InputArea    // 通用输入区
│   ├── ActionBar    // 通用操作栏（fan-in: 7）
│   ├── OutputArea   // 通用输出区（fan-in: 6）
│   └── ErrorDisplay // 通用错误展示（fan-in: 7）
└── StatusBar
```

### 8.2 状态管理（Zustand）

| Store | 文件 | 职责 |
|-------|------|------|
| toolStore | store/toolStore.ts | 当前激活工具状态 |
| themeStore | store/themeStore.ts | 主题切换 |
| historyStore | store/historyStore.ts | 操作历史记录 |

### 8.3 自定义 Hooks

| Hook | 文件 | 职责 |
|------|------|------|
| useGoMethod | hooks/useGoMethod.ts | Wails IPC 调用封装（fan-in: 7） |
| useClipboard | hooks/useClipboard.ts | 剪贴板操作 |
| useToolHistory | hooks/useToolHistory.ts | 历史记录管理 |

### 8.4 前端调用后端方式

前端通过 `wailsjs/go/main/App` 自动生成的类型定义直接调用 Go 方法：

```typescript
import { JsonFormat } from '../wailsjs/go/main/App'
```

Wails v2 **方案A（独立方法绑定）**，共 21 个工具方法 + 4 个通用方法。

## 9. 项目文件树

```
dev-tools/
├── main.go              # Wails 应用入口
├── app.go               # App 结构体 + 通用方法
├── models.go            # 共享数据模型
├── *_service.go         # 7 个工具 service 文件
├── internal/config/     # 内部配置
├── pkg/                 # 7 个工具 util 包 + 1 个共享包
│   ├── common/          # ← 共享辅助函数（2026-06-30 方案A 提取）
│   ├── base64util/
│   ├── cronutil/
│   ├── jsonutil/
│   ├── randomutil/
│   ├── timeutil/
│   ├── xmlutil/
│   └── yamlutil/
├── frontend/
│   ├── src/
│   │   ├── components/   # common / layout / tools
│   │   ├── hooks/        # 3 个自定义 Hook
│   │   ├── store/        # 3 个 Zustand Store
│   │   ├── styles/       # globals.css / sidebar.css
│   │   ├── types/        # tool.ts / wails.ts
│   │   └── utils/        # constants / format / wailsApi
│   └── wailsjs/          # Wails 自动生成的 Go↔JS 绑定
├── docs/                 # 文档
├── scripts/              # 构建脚本
├── build/windows/        # Windows 构建配置
├── go.mod / go.sum
└── wails.json
```

## 10. 代码语言分布

| 语言 | 文件数 | 占比 |
|------|--------|------|
| TypeScript | 36 | 50.7% |
| Go | 26 | 36.6% |
| JavaScript | 3 | 4.2% |
| Bash | 2 | 2.8% |
| CSS | 2 | 2.8% |
| HTML | 1 | 1.4% |
| Mermaid | 1 | 1.4% |

## 11. 已有 Bug 修复记录

| Bug | 修复文件 | 修复方式 |
|-----|---------|---------|
| Base64 DecodeFile 变量遮蔽 | base64util/fileutil.go | decodedFallback 新变量 + URLEncoding fallback |
| XML Format/Minify 缓冲区复用 | xmlutil/xmlutil.go | xml.CopyToken + EndElement.Local 匹配 + Comment TrimSpace |

## 12. 已知技术债

| 编号 | 问题 | 严重度 | 建议 |
|------|------|--------|------|
| TD-1 | `timeutil` → `yamlutil` 耦合（5 calls） | ✅ 已解决 | 根因为跨包 helper 函数重复导致知识图谱语义误报。方案A：提取 `pkg/common`（Contains/CountLeadingSpaces/MinInt），消除代码碎片化 |
| TD-2 | `yamlutil.Format` fan-in: 8 过高 | 中 | 评估是否需要接口抽象 |
| TD-3 | 无 CI/CD 流水线 | 低 | 后续考虑添加 GitHub Actions |

## 13. 构建与部署

```bash
# 构建（Windows 目标，WebView2 嵌入）
wails build -webview2 embed -ldflags "-s -w -H windowsgui"

# 开发模式
wails dev
```

- 输出产物：单 exe + `data/` 目录
- macOS 开发限制：需 Go 1.22+（当前 macOS Go 1.21.6 需隔离测试）
- `frontend/wailsjs/` 由 `wails dev` 自动生成，手动占位符会被覆盖
