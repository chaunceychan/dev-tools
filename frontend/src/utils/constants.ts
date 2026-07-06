/**
 * constants.ts — Application constants: tool list, file size limits, etc.
 * These mirror the Go GetToolList() return values for frontend static rendering.
 */

import type { ToolId, ToolMeta, ToolCategory } from '@/types/tool';

/** Maximum file size for Base64 file operations (10MB) */
export const MAX_FILE_SIZE_MB = 10;

/** Maximum file size in bytes */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Default indentation for format operations */
export const DEFAULT_INDENT = 2;

/** Default count for Cron next execution times */
export const DEFAULT_CRON_COUNT = 5;

/** Default length for random string generation */
export const DEFAULT_RANDOM_LENGTH = 16;

/** Default count for random string generation */
export const DEFAULT_RANDOM_COUNT = 1;

/** Application version */
export const APP_VERSION = '1.0.0';

/** Sidebar width in pixels */
export const SIDEBAR_WIDTH = 200;

/** Sidebar collapsed width in pixels */
export const SIDEBAR_COLLAPSED_WIDTH = 60;

/** Tool categories for sidebar grouping */
export const TOOL_CATEGORIES: { key: ToolCategory; label: string }[] = [
  { key: 'core', label: '核心工具' },
  { key: 'extended', label: '扩展工具' },
];

/** Static tool list — mirrors Go ToolList variable */
export const TOOL_LIST: ToolMeta[] = [
  {
    id: 'json',
    name: 'JSON 格式化',
    icon: '{ }',
    category: 'core',
    actions: [
      { action: 'format', label: '格式化' },
      { action: 'minify', label: '压缩' },
      { action: 'validate', label: '验证' },
    ],
  },
  {
    id: 'base64',
    name: 'Base64 编解码',
    icon: 'B64',
    category: 'core',
    actions: [
      { action: 'encodeText', label: '文本编码' },
      { action: 'decodeText', label: '文本解码' },
      { action: 'encodeFile', label: '文件编码' },
      { action: 'decodeFile', label: '文件解码' },
    ],
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    icon: '⏱',
    category: 'core',
    actions: [
      { action: 'toDate', label: '转日期' },
      { action: 'toTimestamp', label: '转时间戳' },
      { action: 'timezone', label: '多时区' },
    ],
  },
  {
    id: 'yaml',
    name: 'YAML 格式化',
    icon: 'Y',
    category: 'extended',
    actions: [
      { action: 'format', label: '格式化' },
      { action: 'validate', label: '验证' },
      { action: 'toJSON', label: '转JSON' },
    ],
  },
  {
    id: 'xml',
    name: 'XML 格式化',
    icon: '< >',
    category: 'extended',
    actions: [
      { action: 'format', label: '格式化' },
      { action: 'minify', label: '压缩' },
      { action: 'validate', label: '验证' },
    ],
  },
  {
    id: 'random',
    name: '随机字符串',
    icon: '🎲',
    category: 'extended',
    actions: [
      { action: 'generate', label: '生成' },
    ],
  },
  {
    id: 'cron',
    name: 'Cron 解析',
    icon: '⏰',
    category: 'extended',
    actions: [
      { action: 'parse', label: '解析' },
      { action: 'validate', label: '验证' },
      { action: 'nextN', label: '下次执行' },
    ],
  },
  {
    id: 'url',
    name: 'URL 编解码',
    icon: 'URL',
    category: 'extended',
    actions: [
      { action: 'encode', label: '编码' },
      { action: 'decode', label: '解码' },
      { action: 'parseQuery', label: '解析参数' },
    ],
  },
  {
    id: 'hash',
    name: 'Hash 摘要',
    icon: '#',
    category: 'extended',
    actions: [
      { action: 'generate', label: '生成' },
      { action: 'generateAll', label: '全部生成' },
    ],
  },
  {
    id: 'jwt',
    name: 'JWT 解析',
    icon: 'JWT',
    category: 'extended',
    actions: [
      { action: 'decode', label: '解析' },
    ],
  },
  {
    id: 'uuid',
    name: 'UUID 工具',
    icon: 'ID',
    category: 'extended',
    actions: [
      { action: 'generate', label: '生成' },
      { action: 'validate', label: '验证' },
    ],
  },
  {
    id: 'regex',
    name: '正则测试',
    icon: '.*',
    category: 'extended',
    actions: [
      { action: 'test', label: '测试' },
      { action: 'replace', label: '替换' },
    ],
  },
  {
    id: 'regex-validator',
    name: '常用校验',
    icon: '✓',
    category: 'extended',
    actions: [
      { action: 'validatePattern', label: '验证' },
    ],
  },
];

/** Get tool metadata by ID */
export function getToolById(id: ToolId): ToolMeta | undefined {
  return TOOL_LIST.find((tool) => tool.id === id);
}

/** Timestamp unit options */
export const TIMESTAMP_UNITS = [
  { value: 's', label: '秒 (s)' },
  { value: 'ms', label: '毫秒 (ms)' },
  { value: 'auto', label: '自动检测' },
];

/** Common timezone options */
export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
  { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
  { value: 'America/New_York', label: '美国东部 (UTC-5)' },
  { value: 'America/Los_Angeles', label: '美国西部 (UTC-8)' },
  { value: 'Europe/London', label: '伦敦 (UTC+0)' },
];

/** Common cron expression presets */
export const CRON_PRESETS = [
  { expression: '* * * * *', description: '每分钟执行' },
  { expression: '0 * * * *', description: '每小时执行' },
  { expression: '0 0 * * *', description: '每天零点执行' },
  { expression: '0 0 * * 1', description: '每周一零点执行' },
  { expression: '0 0 1 * *', description: '每月1号零点执行' },
  { expression: '*/5 * * * *', description: '每5分钟执行' },
  { expression: '0 */2 * * *', description: '每2小时执行' },
  { expression: '0 9 * * 1-5', description: '工作日9点执行' },
];

/** Random string charset options */
export const RANDOM_CHARSET_OPTIONS = [
  { key: 'uppercase', label: '大写字母 (A-Z)', defaultEnabled: true },
  { key: 'lowercase', label: '小写字母 (a-z)', defaultEnabled: true },
  { key: 'digits', label: '数字 (0-9)', defaultEnabled: true },
  { key: 'special', label: '特殊字符', defaultEnabled: false },
];

/** Hash algorithm options */
export const HASH_ALGORITHM_OPTIONS = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA1' },
  { value: 'sha256', label: 'SHA256' },
  { value: 'sha512', label: 'SHA512' },
];

/** Regex validator preset patterns */
export const REGEX_VALIDATOR_PRESETS: { name: string; pattern: string; label: string }[] = [
  { name: 'email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', label: '邮箱校验' },
  { name: 'phone', pattern: '^1[3-9]\\d{9}$', label: '中国手机号' },
  { name: 'number', pattern: '^\\d+$', label: '纯数字' },
  { name: 'letter', pattern: '^[a-zA-Z]+$', label: '纯字母' },
  { name: 'alphanum', pattern: '^[a-zA-Z0-9]+$', label: '字母+数字' },
  { name: 'url', pattern: '^https?://[^\\s/$.?#].[^\\s]*$', label: 'URL 校验' },
  { name: 'ipv4', pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$', label: 'IPv4 地址' },
  { name: 'date', pattern: '^\\d{4}-\\d{2}-\\d{2}$', label: '日期格式' },
  { name: 'idcard', pattern: '^\\d{17}[\\dXx]$', label: '身份证号' },
];
