# dev-tools 设计文档

> 本文档定义 dev-tools 桌面应用（Wails + React + Tailwind CSS）的视觉设计系统，覆盖白天、黑夜、系统三种主题风格，并给出落地实现路径。

---

## 1. 设计目标

- **专业可靠**：面向开发者的工具集，界面应传递稳定、精确、可信赖的感知。
- **信息密度优先**：每个工具的核心是输入 → 操作 → 输出，布局应减少干扰，突出内容。
- **跨主题一致**：白天、黑夜、系统三种模式下，组件行为、层级关系、交互反馈保持一致。
- **低认知负荷**：使用统一的色彩语义、间距节奏和字体层级，避免不同工具各自为政。

---

## 2. 设计原则

1. **少即是多**：避免过度装饰，使用清晰的边界和微妙的阴影表达层级。
2. **代码即内容**：等宽字体、语法高亮感知的色彩、充足的行高，让输出结果易于阅读。
3. **状态可见**：hover、focus、active、disabled、loading 必须有明确视觉反馈。
4. **尊重系统**：默认跟随操作系统主题（`prefers-color-scheme`），同时允许用户显式覆盖。

---

## 3. 主题系统

dev-tools 支持三种主题模式：

| 主题 | 行为 | 适用场景 |
|------|------|----------|
| **白天（Light）** | 固定使用浅色配色 | 明亮环境、截图分享、偏好浅色 |
| **黑夜（Dark）** | 固定使用深色配色 | 暗光环境、长时间编码、偏好深色 |
| **系统（System）** | 自动跟随 `prefers-color-scheme` | 与操作系统保持一致，默认推荐 |

主题值保存在本地状态（Zustand），并在应用初始化时写入 `<html>` 的 `class`。当主题为 `system` 时，通过监听 `prefers-color-scheme` 变化动态切换 `dark` 类。

---

## 4. 色彩系统

色彩采用 **CSS 变量 + Tailwind 扩展** 的双层方案。`:root` 定义白天模式变量，`.dark` 覆盖黑夜模式变量，系统模式通过媒体查询或 JS 动态切换 `dark` 类实现。

### 4.1 核心色板

| 语义 | 白天 Light | 黑夜 Dark | 用途 |
|------|------------|-----------|------|
| `--bg` | `#F8FAFC` | `#0F172A` | 应用主背景 |
| `--surface` | `#FFFFFF` | `#1E293B` | 卡片、输入框、面板 |
| `--surface-elevated` | `#FFFFFF` | `#334155` | 悬浮面板、下拉菜单 |
| `--text` | `#0F172A` | `#F8FAFC` | 主文本 |
| `--text-muted` | `#64748B` | `#94A3B8` | 次要文本、占位符 |
| `--border` | `#E2E8F0` | `#334155` | 边框、分割线 |
| `--border-strong` | `#CBD5E1` | `#475569` | 聚焦边框、强分割 |
| `--primary` | `#3B82F6` | `#60A5FA` | 主按钮、链接、激活态 |
| `--primary-hover` | `#2563EB` | `#3B82F6` | 主按钮悬停 |
| `--primary-subtle` | `#DBEAFE` | `#1E3A8A` | 主色弱背景 |
| `--success` | `#22C55E` | `#4ADE80` | 成功、运行、复制成功 |
| `--success-subtle` | `#DCFCE7` | `#064E3B` | 成功弱背景 |
| `--warning` | `#F59E0B` | `#FBBF24` | 警告 |
| `--warning-subtle` | `#FEF3C7` | `#451A03` | 警告弱背景 |
| `--error` | `#EF4444` | `#F87171` | 错误、危险操作 |
| `--error-subtle` | `#FEE2E2` | `#450A0A` | 错误弱背景 |
| `--sidebar-bg` | `#FFFFFF` | `#0F172A` | 侧边栏背景 |
| `--sidebar-text` | `#0F172A` | `#F8FAFC` | 侧边栏文字 |
| `--sidebar-muted` | `#64748B` | `#94A3B8` | 侧边栏分类、版本号 |
| `--sidebar-active` | `#3B82F6` | `#60A5FA` | 侧边栏激活项 |
| `--sidebar-active-bg` | `rgba(59,130,246,0.12)` | `rgba(96,165,250,0.15)` | 侧边栏激活项背景 |
| `--sidebar-hover` | `#F1F5F9` | `#1E293B` | 侧边栏悬停项 |
| `--code-bg` | `#F1F5F9` | `#020617` | 代码块/输出区背景 |
| `--code-text` | `#0F172A` | `#F8FAFC` | 代码区文字 |

### 4.2 色彩规则

- **主色用于行动**：按钮、链接、激活状态统一使用 `primary`。
- **绿色保留给“成功/运行”**：如 Base64 编解码、JSON 格式化等正向操作的成功反馈。
- **错误色仅用于错误**：不用于装饰，确保其语义不被稀释。
- **层级用明度表达**：surface → surface-elevated → bg 形成从近到远的空间层级。
- **边框在两种模式下都可见**：避免使用半透明白色边框（如 `border-white/10`），在浅色模式下会消失。

---

## 5. 字体与排版

### 5.1 字体栈

- **界面字体**：系统字体栈，保证桌面端渲染锐利且无需加载网络字体。
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  ```
- **代码字体**：优先使用等宽字体，保证输出结果对齐。
  ```css
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas',
    'Monaco', monospace;
  ```

### 5.2 字号层级

| 层级 | 大小 | 字重 | 用途 |
|------|------|------|------|
| 工具标题 | `text-xl` / 20px | 600 | 主内容区顶部标题 |
| 分区标题 | `text-base` / 16px | 600 | 输入/输出分组标题 |
| 正文 | `text-sm` / 14px | 400 | 标签、描述、按钮文字 |
| 辅助文字 | `text-xs` / 12px | 400 | 状态栏、版本号、提示 |
| 代码输出 | `text-sm` / 14px | 400 | 输出区域、代码块 |

### 5.3 排版规则

- 行高：正文 `leading-relaxed`（1.625），代码输出 `leading-normal`（1.5）。
- 标题使用 `text` 色，辅助文字使用 `text-muted` 色。
- 代码输出使用 `code-bg` 背景 + `code-text` 文字，形成“终端/编辑器”区域感。

---

## 6. 间距与布局

### 6.1 布局结构

```
┌────────────────────────────────────────────────────────────┐
│  Sidebar  │  MainContent                                    │
│  200px    │  flex-1                                         │
│           │                                                 │
│           │  ┌────────────────────────────────────────────┐ │
│           │  │ Tool Title                                 │ │
│           │  ├────────────────────────────────────────────┤ │
│           │  │ Input Area                                 │ │
│           │  ├────────────────────────────────────────────┤ │
│           │  │ Action Bar                                 │ │
│           │  ├────────────────────────────────────────────┤ │
│           │  │ Output Area                                │ │
│           │  └────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Status Bar                                                │
└────────────────────────────────────────────────────────────┘
```

- **侧边栏**：固定宽度 200px，可折叠至 60px（icon-only）。
- **主内容区**：`flex-1`，`overflow-y-auto`，内边距 `p-4`（16px）。
- **状态栏**：固定高度 28px，紧贴底部，显示当前工具名称与提示。

### 6.2 间距节奏

| Token | 值 | 用途 |
|-------|-----|------|
| `space-1` | 4px | 图标与文字间距、紧凑内边距 |
| `space-2` | 8px | 按钮内边距（py）、组件内小间距 |
| `space-3` | 12px | 卡片内边距、输入框间距 |
| `space-4` | 16px | 主内容区内边距、组件组间距 |
| `space-6` | 24px | 工具标题与内容间距 |
| `rounded-lg` | 8px | 卡片、输入框、按钮圆角 |
| `rounded-md` | 6px | 小按钮、标签圆角 |

---

## 7. 组件规范

### 7.1 按钮（Button）

| 变体 | 白天 | 黑夜 | 用途 |
|------|------|------|------|
| **Primary** | `bg-primary text-white` | `bg-primary text-white` | 主操作（格式化、运行、生成） |
| **Secondary** | `bg-surface text-text border border-border` | 同左 | 次要操作（清空、重置） |
| **Danger** | `bg-error text-white` | `bg-error text-white` | 危险操作（删除、覆盖） |
| **Ghost** | `bg-transparent text-text hover:bg-surface` | 同左 | 工具栏图标按钮 |

公共样式：
- `px-4 py-2 rounded-lg text-sm font-medium`
- `transition-colors duration-200`
- `focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2`
- disabled 状态：`opacity-50 cursor-not-allowed`
- loading 状态：显示 spinner 或 `animate-pulse`，文字变为“处理中...”

### 7.2 输入框 / 文本域（Input / Textarea）

- 背景：`bg-surface`
- 边框：`border border-border`，聚焦时 `border-primary`
- 文字：`text-text`，占位符 `placeholder:text-muted`
- 圆角：`rounded-lg`
- 内边距：`px-3 py-2`
- 代码输入区使用等宽字体，行高 1.5。
- 禁用态：`opacity-60 cursor-not-allowed`

### 7.3 输出区（Output Area）

- 背景：`bg-code-bg`
- 文字：`text-code-text`，等宽字体
- 边框：`border border-border`
- 圆角：`rounded-lg`
- 内部预留滚动条样式（8px 宽，与全局一致）。
- 空态显示 `text-muted` 占位提示。

### 7.4 卡片 / 面板（Card / Surface）

- 背景：`bg-surface`
- 边框：`border border-border`
- 圆角：`rounded-lg`
- 阴影：白天 `shadow-sm`，黑夜无阴影或 `shadow-none`（避免深色阴影发灰）。
- 悬停：可交互卡片使用 `hover:border-border-strong transition-colors`。

### 7.5 侧边栏（Sidebar）

侧边栏随主题切换：白天为浅色（与主内容区协调），黑夜为深色（与深色主背景协调）。所有颜色通过 `--sidebar-*` 变量控制。

- 背景：`bg-sidebar-bg`。
- 文字：`text-sidebar-text`。
- 分类标题：`text-sidebar-muted text-xs uppercase tracking-wider`。
- 导航项：
  - 默认：`text-sidebar-text hover:bg-sidebar-hover`
  - 激活：`bg-sidebar-active-bg text-sidebar-active`（文字使用主色，背景使用主色 12~15% 透明度）
  - 圆角：`rounded-md`
- 折叠状态：仅显示图标，tooltip 或 title 显示完整名称。
- 主题切换器置于侧边栏底部，使用 `text-sidebar-active` 高亮当前模式。

### 7.6 状态栏（StatusBar）

- 背景：与主背景区分，白天 `bg-surface border-t border-border`，黑夜 `bg-surface/50 border-t border-border`。
- 高度：28px。
- 文字：`text-xs text-muted`。
- 左侧：当前工具名称；右侧：操作提示或版本信息。

### 7.7 主题切换器（Theme Toggle）

- 位置：侧边栏底部（设置区）或状态栏右侧。
- 样式：图标按钮，当前激活主题高亮。
- 交互：点击展开菜单，选择 Light / Dark / System。
- 图标：使用 SVG，不使用 emoji。

---

## 8. 主题切换实现

### 8.1 状态管理

使用 Zustand 存储用户选择的 `theme`（`'light' | 'dark' | 'system'`），并在初始化时：

1. 若用户已设置固定值，直接应用对应 class。
2. 若为 `system` 或未设置，通过 `window.matchMedia('(prefers-color-scheme: dark)')` 判断，动态添加/移除 `dark` 类。
3. 监听系统主题变化，在 `system` 模式下自动响应。

### 8.2 CSS 变量组织

```css
:root {
  /* 白天变量 */
  --bg: #F8FAFC;
  --surface: #FFFFFF;
  /* ... */
}

.dark {
  /* 黑夜变量 */
  --bg: #0F172A;
  --surface: #1E293B;
  /* ... */
}
```

### 8.3 Tailwind 扩展

在 `tailwind.config.ts` 中将语义颜色注册为 Tailwind 类：

```ts
colors: {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  'surface-elevated': 'var(--surface-elevated)',
  text: 'var(--text)',
  muted: 'var(--text-muted)',
  border: 'var(--border)',
  'border-strong': 'var(--border-strong)',
  primary: 'var(--primary)',
  'primary-hover': 'var(--primary-hover)',
  'primary-subtle': 'var(--primary-subtle)',
  success: 'var(--success)',
  'success-subtle': 'var(--success-subtle)',
  warning: 'var(--warning)',
  'warning-subtle': 'var(--warning-subtle)',
  error: 'var(--error)',
  'error-subtle': 'var(--error-subtle)',
  'code-bg': 'var(--code-bg)',
  'code-text': 'var(--code-text)',
}
```

---

## 9. 工具页面通用模式

每个工具页面遵循一致的布局模式：

```
[工具标题 + 描述]
[输入区]
[操作栏：Primary | Secondary | ...]
[输出区]
[错误提示（如有）]
```

- 输入与输出区使用 `Card` 样式（`bg-surface border border-border rounded-lg`）。
- 输出区使用 `code-bg` 背景，以区分输入。
- 操作栏按钮按重要性从左到右排列：Primary → Secondary → Ghost（如复制）。
- 错误提示使用 `bg-error-subtle text-error border border-error/20 rounded-lg`。

---

## 10. 可访问性

- **对比度**：所有文字与背景对比度 ≥ 4.5:1。
- **焦点环**：所有可交互元素有可见的 `focus:ring`。
- **键盘导航**：侧边栏、按钮、输入框支持 Tab 顺序。
- **减少动画**：尊重 `prefers-reduced-motion`，过渡时间控制在 150–300ms。
- **图标语义**：所有功能性图标使用 `aria-label` 或 `title` 说明。

---

## 11. 实现清单

- [ ] 更新 `themeStore.ts`：支持 `light | dark | system`，初始化时读取系统偏好并监听变化。
- [ ] 重写 `globals.css`：补全全部语义变量，覆盖白天/黑夜/系统三种场景。
- [ ] 扩展 `tailwind.config.ts`：将语义变量注册为 Tailwind 颜色类。
- [ ] 创建 `ThemeToggle` 组件：图标按钮 + 下拉菜单，支持三态切换。
- [ ] 改造 `Sidebar`：使用设计变量替换硬编码颜色，底部加入主题切换器。
- [ ] 改造通用组件：`ActionBar`、`InputArea`、`OutputArea`、`ErrorDisplay` 等使用新变量。
- [ ] 各工具页面统一使用 `surface / code-bg / muted` 等语义类。
- [ ] 构建验证：在白天/黑夜/系统三种模式下检查对比度与布局。

---

## 12. 参考

- 本设计文档基于 `ui-ux-pro-max` 设计系统生成结果，并针对桌面开发者工具场景进行了调整。
- 色彩灵感：开发者工具 / IDE 暗色主题（Code Dark + Run Green）。
- 字体：系统字体栈 + JetBrains Mono 等宽字体。
