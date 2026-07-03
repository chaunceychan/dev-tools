# Codebase Index — dev-tools

> 自动生成于 2026-06-30 11:27 CST | 基于完整源码扫描
> 项目: dev-tools (开发常用小工具集)

---

## 项目概要

| 维度 | 详情 |
|------|------|
| 项目名称 | dev-tools — 开发常用小工具集 |
| 技术栈 | Go 1.24 + Wails v2.10.2 + React 18 + TypeScript + Tailwind CSS + Zustand |
| 目标平台 | Windows 便携版，单 exe 解压即用（macOS 开发/测试环境兼容） |
| 功能模块 | JSON / YAML / XML / Base64 / 随机字符串 / 时间戳 / Cron（共 7 个工具） |
| Go 源文件 | 27 个（main 10 + pkg 16 + internal 1） |
| 前端源文件 | 31 个 TypeScript/TSX + 2 个 CSS |
| 测试文件 | 8 个 *_test.go，覆盖全部 8 个包 |
| 代码图谱 | 680 节点 / 1,132 边（Leiden 聚类 10 个） |

---

## 架构分层

```
┌──────────────────────────────────────────────────────────────┐
│                      Entry Layer（入口层）                     │
│  main.go · app.go · models.go · *_service.go (×7)           │
│  职责：Wails 绑定、API 暴露、类型转换                          │
├──────────────────────────────────────────────────────────────┤
│                      Core Layer（核心层）                      │
│  pkg/yamlutil · pkg/base64util · pkg/timeutil               │
│  职责：复杂业务逻辑、多依赖工具                                │
├──────────────────────────────────────────────────────────────┤
│                      Leaf Layer（叶节点层）                    │
│  pkg/jsonutil · pkg/randomutil · pkg/xmlutil                │
│  职责：独立、简单的数据处理                                    │
├──────────────────────────────────────────────────────────────┤
│                      Shared Layer（共享层）                    │
│  pkg/common · internal/config                                │
│  职责：跨模块工具函数、应用配置                                 │
├──────────────────────────────────────────────────────────────┤
│                      Frontend Layer（前端层）                  │
│  React 组件 · Zustand Stores · Hooks · Utils · Styles        │
│  职责：UI 渲染、用户交互、状态管理                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Go 后端模块索引

### 1. 入口与绑定层（`main` 包）

| 文件 | 职责 | 导出 API 方法 | 行数 |
|------|------|--------------|------|
| `main.go` | Wails 应用入口，窗口配置 | — | ~35 |
| `app.go` | App 结构体，启动/关闭生命周期，系统级 API | `ClipboardWrite`, `GetDataDir`, `GetToolList`, `GetAppVersion` | ~85 |
| `models.go` | 共享数据模型定义 | `RandomParams`, `TimezoneResult`, `CronParseResult`, `ToolMeta`, `ActionDef` | ~50 |
| `json_service.go` | JSON 工具 API 委托 | `JsonFormat`, `JsonMinify`, `JsonValidate` | ~25 |
| `yaml_service.go` | YAML 工具 API 委托 | `YamlFormat`, `YamlValidate`, `YamlToJSON` | ~25 |
| `xml_service.go` | XML 工具 API 委托 | `XmlFormat`, `XmlMinify`, `XmlValidate` | ~25 |
| `base64_service.go` | Base64 工具 API 委托 + 文件对话框 | `Base64EncodeText`, `Base64DecodeText`, `Base64EncodeFile`, `Base64DecodeFile`, `SelectInputFile`, `SelectOutputFile` | ~50 |
| `random_service.go` | 随机字符串 API 委托 | `RandomGenerate` | ~20 |
| `timestamp_service.go` | 时间戳 API 委托 + 类型转换 | `TimestampToDate`, `DateToTimestamp`, `MultiTimezone` | ~45 |
| `cron_service.go` | Cron API 委托 + 类型转换 | `CronParse`, `CronValidate`, `CronNextN` | ~40 |

### 2. 业务逻辑层（`pkg/*` 包）

#### `pkg/jsonutil/jsonutil.go`
- **功能**: JSON 格式化、压缩、验证
- **导出函数**: `Format(input, indent)`, `Minify(input)`, `Validate(input)`
- **内部函数**: `findErrorLine`, `extractOffset`（错误行号推断）
- **依赖**: `encoding/json`, `fmt`, `strings`
- **测试**: `jsonutil_test.go` (21 用例)

#### `pkg/yamlutil/yamlutil.go`
- **功能**: YAML 格式化、验证、转 JSON
- **导出函数**: `Format(input, indent)`, `Validate(input)`, `ToJSON(input)`
- **内部函数**: `normalizeYAMLMap`（map[interface{}] → map[string]interface{} 转换）
- **依赖**: `encoding/json`, `fmt`, `strings`, `gopkg.in/yaml.v3`
- **测试**: `yamlutil_test.go` (20 用例)
- **近期修改**: 从 `yaml.Marshal` (4空格硬编码) 改为 `yaml.NewEncoder` + `SetIndent(indent)` 精确控制缩进

#### `pkg/xmlutil/xmlutil.go`
- **功能**: XML 格式化、压缩、验证（自定义节点树解析/序列化）
- **导出函数**: `Format(input, indent)`, `Minify(input)`, `Validate(input)`
- **导出类型**: `XMLNode`（自定义 XML 节点树结构体）
- **内部函数**: `encodeXML`, `parseXMLNode`, `parseXMLElement`, `formatXMLNode`, `minifyXMLNode`
- **依赖**: `bytes`, `encoding/xml`, `fmt`, `io`, `strings`
- **测试**: `xmlutil_test.go` (17 用例)
- **已知修复**: `xml.CopyToken` 防缓冲区复用 + `EndElement.Local` 匹配 + `Comment TrimSpace`

#### `pkg/base64util/base64util.go`
- **功能**: Base64 文本和文件编解码（三层回退策略）
- **导出函数**: `EncodeText`, `DecodeText`, `EncodeFile`, `DecodeFile`
- **依赖**: `encoding/base64`, `fmt`, `io/ioutil`, `os`, `path/filepath`, `strings`
- **测试**: `base64util_test.go` (14 + RoundTrip 用例)
- **已知修复**: `DecodeFile` 变量遮蔽 → `decodedFallback` 新变量 + `URLEncoding.WithPadding(NoPadding)` fallback

#### `pkg/base64util/fileutil.go`
- **功能**: 文件大小校验
- **导出函数**: `CheckFileSize`
- **导出常量**: `MaxFileSize` = 10MB
- **依赖**: `fmt`, `os`

#### `pkg/randomutil/randomutil.go`
- **功能**: 加密级随机字符串生成（`crypto/rand` + `math/big`）
- **导出函数**: `Generate(length, charsetFlags, count)`
- **内部变量**: `charsets` map（uppercase/lowercase/digits/special）
- **依赖**: `crypto/rand`, `fmt`, `math/big`, `strings`
- **测试**: `randomutil_test.go` (12 用例)

#### `pkg/timeutil/timeutil.go`
- **功能**: 时间戳转换、多时区显示、日期格式推断
- **导出函数**: `TimestampToDate`, `TimestampToDateInTimezone`, `DateToTimestamp`, `MultiTimezone`
- **导出类型**: `TimezoneResult`
- **内部函数**: `timestampToTime`, `loadLocationOrUTC`
- **依赖**: `fmt`, `strings`, `time`
- **测试**: `timeutil_test.go` (17 用例)

#### `pkg/cronutil/cronutil.go`
- **功能**: Cron 表达式解析、验证、下次执行计算（5字段/6字段自动检测）
- **导出函数**: `Parse`, `Validate`, `NextN`
- **导出类型**: `CronParseResult`
- **内部函数**: `getParser`, `describeCronExpression`, `describeField`
- **依赖**: `fmt`, `strings`, `time`, `github.com/robfig/cron/v3`
- **测试**: `cronutil_test.go` (19 用例)

#### `pkg/common/common.go`
- **功能**: 共享工具函数（消除 pkg 间代码重复）
- **导出函数**: `Contains(s, substr)`, `CountLeadingSpaces(s)`, `MinInt(a, b)`
- **依赖**: 无（零依赖）
- **近期创建**: 从 yamlutil 提取共享辅助函数，消除技术债 TD-1

### 3. 配置层（`internal/` 包）

#### `internal/config/config.go`
- **功能**: 应用级配置常量
- **导出函数**: `DefaultConfig()`
- **导出变量**: `Global`（全局单例）
- **导出类型**: `AppConfig` { FileSizeLimit, DefaultIndent, DefaultCronCount, AppVersion, HistoryLimit }
- **依赖**: 无（零依赖）

### 4. 外部依赖 (`go.mod`)

| 模块 | 版本 | 用途 |
|------|------|------|
| `github.com/wailsapp/wails/v2` | v2.10.2 | Wails 桌面框架 |
| `gopkg.in/yaml.v3` | v3.0.1 | YAML 解析/编码 |
| `github.com/robfig/cron/v3` | v3.0.1 | Cron 表达式解析 |

### 5. Go 测试覆盖

| 包 | 测试文件 | 用例数 | 状态 |
|----|---------|--------|------|
| `pkg/jsonutil` | jsonutil_test.go | 21 | ✅ 全部通过 |
| `pkg/yamlutil` | yamlutil_test.go | 20 | ✅ 全部通过 |
| `pkg/xmlutil` | xmlutil_test.go | 17 | ✅ 全部通过 |
| `pkg/base64util` | base64util_test.go | 14 + RoundTrip | ✅ 全部通过 |
| `pkg/randomutil` | randomutil_test.go | 12 | ✅ 全部通过 |
| `pkg/timeutil` | timeutil_test.go | 17 | ✅ 全部通过 |
| `pkg/cronutil` | cronutil_test.go | 19 | ✅ 全部通过 |
| **合计** | **8 个包** | **~120** | **100% 通过** |

### 6. 架构热点分析

| 函数 | Fan-In | 层级 | 备注 |
|------|--------|------|------|
| `yamlutil.Format` | 8 | Core | 最高热点，被 service 层和前端间接调用 |
| `useGoMethod` | 7 | Frontend | 所有工具组件共用 hook |
| `jsonutil.Format` | 3 | Leaf | JSON 格式化核心 |
| `toolStore.setOutput` | 7 | Frontend | 所有工具操作的结果出口 |

---

## 前端模块索引

### 1. 入口与配置

| 文件 | 职责 |
|------|------|
| `frontend/src/main.tsx` | React 应用入口，挂载到 DOM |
| `frontend/src/App.tsx` | 根组件，渲染 AppLayout |
| `frontend/wails.json` | Wails 项目配置（名称、构建命令、窗口设置） |
| `frontend/package.json` | 前端依赖管理（React 18, Zustand, Radix UI, Vite, Tailwind） |
| `frontend/vite.config.ts` | Vite 构建配置（React 插件，`@` 别名 → `./src`） |
| `frontend/tailwind.config.ts` | Tailwind CSS 配置（暗色模式 class 策略，CSS 变量颜色） |

### 2. 类型系统

| 文件 | 导出 |
|------|------|
| `types/tool.ts` | `ToolId`（7 工具联合类型）, `ToolAction`（14 操作联合类型）, `ToolCategory`, `ActionDef`, `ToolMeta` |
| `types/wails.ts` | Wails Go 绑定方法重导出（25 方法 + 5 模型类型）, `GoMethodFn<T>`, `WailsError` |

### 3. 状态管理（Zustand Stores）

| 文件 | Store | 状态字段 | 操作 |
|------|-------|---------|------|
| `store/toolStore.ts` | `useToolStore` | `currentTool`, `input`, `output`, `error`, `loading` | `setCurrentTool`, `setInput`, `setOutput`, `setError`, `setLoading`, `clear` |
| `store/themeStore.ts` | `useThemeStore` | `theme` (light/dark) | `setTheme`, `toggleTheme`（操作 DOM classList） |
| `store/historyStore.ts` | `useHistoryStore` | `records[]` (最多 50 条) | `addRecord`, `clearRecords` |

### 4. Hooks

| 文件 | Hook | 返回值 | 职责 |
|------|------|--------|------|
| `hooks/useGoMethod.ts` | `useGoMethod<T>(methodName, goMethod)` | `{ call }` | 封装 Go 方法调用，管理 loading/error/output |
| `hooks/useClipboard.ts` | `useClipboard()` | `{ copied, copy }` | 剪贴板复制（Wails API + 浏览器 fallback）|
| `hooks/useToolHistory.ts` | `useToolHistory()` | `{ addRecord, clearHistory, records }` | 操作历史记录（P2 占位） |

### 5. 工具函数

| 文件 | 导出 | 用途 |
|------|------|------|
| `utils/wailsApi.ts` | 25 Go 方法 + 5 模型类型（按类别分组重导出） | 统一 Wails API 入口 |
| `utils/constants.ts` | 工具列表、分类、预设、时区、字符集常量 | 前端静态配置（镜像 Go `GetToolList()`） |
| `utils/format.ts` | `parseErrorLine`, `formatFileSize`, `truncateString`, `countLines` | 前端格式化辅助函数 |

### 6. 布局组件

| 文件 | 组件 | Props | 职责 |
|------|------|-------|------|
| `layout/AppLayout.tsx` | `AppLayout` | — | 全窗口布局：侧边栏 + 主内容 + 状态栏 |
| `layout/Sidebar.tsx` | `Sidebar` | `{ collapsed, onToggleCollapse }` | 工具导航（分类+工具列表，可折叠） |
| `layout/MainContent.tsx` | `MainContent` | — | 根据 `currentTool` 渲染对应工具组件 |
| `layout/StatusBar.tsx` | `StatusBar` | — | 底部状态栏（当前工具名 + 加载状态） |

### 7. 通用组件

| 文件 | 组件 | Props | 职责 |
|------|------|-------|------|
| `common/InputArea.tsx` | `InputArea` | `{ placeholder?, maxHeight? }` | 文本输入区域（等宽字体） |
| `common/OutputArea.tsx` | `OutputArea` | `{ label? }` | 输出显示 + 复制按钮 |
| `common/ActionBar.tsx` | `ActionBar` | `{ actions[] }` | 操作按钮行（3 种变体：primary/secondary/danger） |
| `common/ErrorDisplay.tsx` | `ErrorDisplay` | — | 错误消息 + 行号高亮上下文 |
| `common/CopyButton.tsx` | `CopyButton` | `{ text, label? }` | 一键复制按钮（2 秒"已复制"反馈） |
| `common/FileDropArea.tsx` | `FileDropArea` | `{ onFileSelected, onBrowse?, accept? }` | 文件拖拽放置 + 浏览按钮 |

### 8. 工具组件（7 个）

| 文件 | 组件 | 支持操作 | 特色功能 |
|------|------|---------|---------|
| `tools/JsonTool.tsx` | `JsonTool` | format, minify, validate | 缩进选择器（2/4/8） |
| `tools/YamlTool.tsx` | `YamlTool` | format, validate, toJSON | 缩进选择器（2/4） |
| `tools/XmlTool.tsx` | `XmlTool` | format, minify, validate | 缩进选择器（2/4） |
| `tools/Base64Tool.tsx` | `Base64Tool` | encodeText, decodeText, encodeFile, decodeFile | 文本/文件双模式，文件拖拽 |
| `tools/TimestampTool.tsx` | `TimestampTool` | toDate, toTimestamp, timezone | 实时时间戳、多时区表格、秒/毫秒/自动 |
| `tools/CronTool.tsx` | `CronTool` | parse, validate, nextN | 8 个快捷预设模板 |
| `tools/RandomTool.tsx` | `RandomTool` | generate | 长度滑块、字符集复选框、每个字符串独立复制 |

### 9. 样式

| 文件 | 内容 |
|------|------|
| `styles/globals.css` | Tailwind 指令 + CSS 自定义属性（浅色/深色主题）+ 重置 + 侧边栏工具类 |
| `styles/sidebar.css` | 侧边栏特有样式（折叠动画、悬停状态、响应式） |

---

## API 接口全景（Go → Frontend）

### 数据格式类 (JSON/YAML/XML)

| Go 方法 | 参数 | 返回值 | 所属文件 |
|---------|------|--------|---------|
| `JsonFormat` | `input string, indent int` | `string, error` | json_service.go |
| `JsonMinify` | `input string` | `string, error` | json_service.go |
| `JsonValidate` | `input string` | `string, error` | json_service.go |
| `YamlFormat` | `input string, indent int` | `string, error` | yaml_service.go |
| `YamlValidate` | `input string` | `string, error` | yaml_service.go |
| `YamlToJSON` | `input string` | `string, error` | yaml_service.go |
| `XmlFormat` | `input string, indent int` | `string, error` | xml_service.go |
| `XmlMinify` | `input string` | `string, error` | xml_service.go |
| `XmlValidate` | `input string` | `string, error` | xml_service.go |

### 编解码类 (Base64)

| Go 方法 | 参数 | 返回值 | 所属文件 |
|---------|------|--------|---------|
| `Base64EncodeText` | `input string` | `string, error` | base64_service.go |
| `Base64DecodeText` | `input string` | `string, error` | base64_service.go |
| `Base64EncodeFile` | `filePath string` | `string, error` | base64_service.go |
| `Base64DecodeFile` | `filePath, outputPath string` | `string, error` | base64_service.go |
| `SelectInputFile` | — | `string, error` | base64_service.go |
| `SelectOutputFile` | `defaultFilename string` | `string, error` | base64_service.go |

### 工具类 (Random/Timestamp/Cron)

| Go 方法 | 参数 | 返回值 | 所属文件 |
|---------|------|--------|---------|
| `RandomGenerate` | `params RandomParams` | `[]string, error` | random_service.go |
| `TimestampToDate` | `timestamp int64, unit, timezone string` | `string, error` | timestamp_service.go |
| `DateToTimestamp` | `dateStr, timezone string` | `int64, error` | timestamp_service.go |
| `MultiTimezone` | `timestamp int64, unit string` | `[]TimezoneResult, error` | timestamp_service.go |
| `CronParse` | `expression string` | `CronParseResult, error` | cron_service.go |
| `CronValidate` | `expression string` | `string, error` | cron_service.go |
| `CronNextN` | `expression string, count int` | `[]string, error` | cron_service.go |

### 系统类

| Go 方法 | 参数 | 返回值 | 所属文件 |
|---------|------|--------|---------|
| `ClipboardWrite` | `text string` | `error` | app.go |
| `GetDataDir` | — | `string` | app.go |
| `GetToolList` | — | `[]ToolMeta` | app.go |
| `GetAppVersion` | — | `string` | app.go |

**总计: 25 个 Go → Frontend 方法**

---

## 数据流图

```
用户操作 (React Component)
    │
    ├─ useGoMethod hook ──→ toolStore.setLoading(true)
    │                            │
    │                    toolStore.setError('')
    │                            │
    │                    Go 方法调用 (Wails IPC)
    │                            │
    │                    ┌───────┴───────┐
    │                    │               │
    │               成功返回          返回 error
    │                    │               │
    │          toolStore.setOutput   toolStore.setError
    │                    │               │
    │          toolStore.setLoading(false)
    │                    │
    └─ OutputArea / ErrorDisplay 渲染
```

---

## 近期变更摘要（2026-06-30）

| 变更 | 影响文件 | 类型 |
|------|---------|------|
| 提取 `pkg/common` 共享工具函数 | `pkg/common/common.go` (新建), `pkg/yamlutil/yamlutil.go`, `pkg/yamlutil/yamlutil_test.go` | 重构 |
| YAML 格式化缩进修复（yaml.Marshal → yaml.NewEncoder） | `pkg/yamlutil/yamlutil.go`, `pkg/yamlutil/yamlutil_test.go` | Bug 修复 |
| main.go 编译错误修复（context import, shutdown 签名, WebviewBackgroundColor） | `main.go` | Bug 修复 |
| 前端 TypeScript 类型导出修复（namespace → 值+类型双导出） | `frontend/src/types/wails.ts`, `frontend/src/utils/wailsApi.ts` | Bug 修复 |
| 侧边栏菜单样式修复（bg-sidebar-bg 工具类补充） | `frontend/src/styles/globals.css` | Bug 修复 |
| macOS wails dev 环境搭建（Clang 17, SDK 15.5, appicon.png） | `build/appicon.png`, wails CLI | 环境搭建 |
| 架构分析 + ADR 沉淀 | `docs/ADR.md` (新建) | 文档 |
| codebase-memory 知识图谱索引 | `.codebase-memory/graph.db.zst` | 索引 |
| 技术债 TD-1（timeutil → yamlutil 反向耦合）标记为已解决 | `docs/ADR.md` | 技术债 |

---

## 已知技术债

| ID | 描述 | 状态 |
|----|------|------|
| TD-1 | timeutil → yamlutil 反向耦合（5 calls），通过提取 pkg/common 消除语义误报 | ✅ 已解决 |
| TBD | 前端工具历史记录持久化（当前仅内存存储，P2） | 🔲 待实现 |
| TBD | 侧边栏搜索功能（UI 占位但 disabled，P2） | 🔲 待实现 |

---

## 项目文件树

```
dev-tools/
├── main.go                    # Wails 应用入口
├── app.go                     # App 结构体 + 系统级 API
├── models.go                  # 共享数据模型
├── json_service.go            # JSON API 委托
├── yaml_service.go            # YAML API 委托
├── xml_service.go             # XML API 委托
├── base64_service.go          # Base64 API 委托 + 文件对话框
├── random_service.go          # 随机字符串 API 委托
├── timestamp_service.go       # 时间戳 API 委托 + 类型转换
├── cron_service.go            # Cron API 委托 + 类型转换
├── go.mod / go.sum
├── wails.json                 # Wails 项目配置
├── internal/
│   └── config/
│       └── config.go          # 应用配置常量
├── pkg/
│   ├── common/
│   │   └── common.go          # 共享工具函数
│   ├── jsonutil/
│   │   ├── jsonutil.go        # JSON 格式化/压缩/验证
│   │   └── jsonutil_test.go
│   ├── yamlutil/
│   │   ├── yamlutil.go        # YAML 格式化/验证/转JSON
│   │   └── yamlutil_test.go
│   ├── xmlutil/
│   │   ├── xmlutil.go         # XML 格式化/压缩/验证
│   │   └── xmlutil_test.go
│   ├── base64util/
│   │   ├── base64util.go      # Base64 编解码
│   │   ├── fileutil.go        # 文件大小校验
│   │   └── base64util_test.go
│   ├── randomutil/
│   │   ├── randomutil.go      # 加密级随机字符串
│   │   └── randomutil_test.go
│   ├── timeutil/
│   │   ├── timeutil.go        # 时间戳转换/多时区
│   │   └── timeutil_test.go
│   └── cronutil/
│       ├── cronutil.go        # Cron 表达式解析
│       └── cronutil_test.go
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── src/
│       ├── main.tsx           # React 入口
│       ├── App.tsx            # 根组件
│       ├── types/
│       │   ├── tool.ts        # 工具类型系统
│       │   └── wails.ts       # Wails API 类型/方法重导出
│       ├── store/
│       │   ├── toolStore.ts   # 工具状态
│       │   ├── themeStore.ts  # 主题状态
│       │   └── historyStore.ts # 历史记录
│       ├── hooks/
│       │   ├── useGoMethod.ts # Go 方法调用封装
│       │   ├── useClipboard.ts # 剪贴板 hook
│       │   └── useToolHistory.ts # 历史记录 hook
│       ├── utils/
│       │   ├── wailsApi.ts    # Wails API 统一入口
│       │   ├── constants.ts   # 静态配置
│       │   └── format.ts      # 格式化工具
│       ├── styles/
│       │   ├── globals.css    # 全局样式 + CSS 变量
│       │   └── sidebar.css    # 侧边栏样式
│       └── components/
│           ├── layout/
│           │   ├── AppLayout.tsx
│           │   ├── Sidebar.tsx
│           │   ├── MainContent.tsx
│           │   └── StatusBar.tsx
│           ├── common/
│           │   ├── InputArea.tsx
│           │   ├── OutputArea.tsx
│           │   ├── ActionBar.tsx
│           │   ├── ErrorDisplay.tsx
│           │   ├── CopyButton.tsx
│           │   └── FileDropArea.tsx
│           └── tools/
│               ├── JsonTool.tsx
│               ├── YamlTool.tsx
│               ├── XmlTool.tsx
│               ├── Base64Tool.tsx
│               ├── TimestampTool.tsx
│               ├── CronTool.tsx
│               └── RandomTool.tsx
├── docs/
│   ├── ADR.md                 # 架构决策记录
│   ├── CODEBASE_INDEX.md      # 本文档
│   ├── class-diagram.mermaid
│   └── sequence-diagram.mermaid
├── build/
│   └── appicon.png            # 应用图标
└── .codebase-memory/
    └── graph.db.zst           # 知识图谱数据库
```
