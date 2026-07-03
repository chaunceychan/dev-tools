/**
 * wailsApi.ts — Unified import of all Wails Go binding methods.
 * Frontend components should import from this file rather than directly from wailsjs/go/.
 */

// JSON methods
export { JsonFormat, JsonMinify, JsonValidate } from '../../wailsjs/go/main/App';

// Base64 methods
export {
  Base64EncodeText,
  Base64DecodeText,
  Base64EncodeFile,
  Base64DecodeFile,
  SelectInputFile,
  SelectOutputFile,
} from '../../wailsjs/go/main/App';

// Timestamp methods
export { TimestampToDate, DateToTimestamp, MultiTimezone } from '../../wailsjs/go/main/App';

// YAML methods
export { YamlFormat, YamlValidate, YamlToJSON } from '../../wailsjs/go/main/App';

// XML methods
export { XmlFormat, XmlMinify, XmlValidate } from '../../wailsjs/go/main/App';

// Random methods
export { RandomGenerate } from '../../wailsjs/go/main/App';

// Cron methods
export { CronParse, CronValidate, CronNextN } from '../../wailsjs/go/main/App';

// URL methods
export { UrlEncode, UrlDecode, UrlParseQuery } from '../../wailsjs/go/main/App';

// Hash methods
export { HashGenerate, HashGenerateAll } from '../../wailsjs/go/main/App';

// JWT methods
export { JwtDecode } from '../../wailsjs/go/main/App';

// UUID methods
export { UuidGenerate, UuidValidate } from '../../wailsjs/go/main/App';

// Regex methods
export { RegexTest, RegexReplace } from '../../wailsjs/go/main/App';

// General methods
export { ClipboardWrite, GetDataDir, GetToolList, GetAppVersion } from '../../wailsjs/go/main/App';

// Model types
import { main } from '../../wailsjs/go/models';
export const RandomParams = main.RandomParams;
export type RandomParams = main.RandomParams;
export const TimezoneResult = main.TimezoneResult;
export type TimezoneResult = main.TimezoneResult;
export const CronParseResult = main.CronParseResult;
export type CronParseResult = main.CronParseResult;
export const ToolMeta = main.ToolMeta;
export type ToolMeta = main.ToolMeta;
export const ActionDef = main.ActionDef;
export type ActionDef = main.ActionDef;
