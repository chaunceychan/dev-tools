/** Tool identifier type — matches Go ToolMeta.ID values */
export type ToolId = 'json' | 'base64' | 'timestamp' | 'yaml' | 'xml' | 'random' | 'cron' |
  'url' | 'hash' | 'jwt' | 'uuid' | 'regex' | 'regex-validator';

/** Tool action identifier */
export type ToolAction = 'format' | 'minify' | 'validate' | 'encodeText' | 'decodeText' |
  'encodeFile' | 'decodeFile' | 'toDate' | 'toTimestamp' | 'timezone' |
  'toJSON' | 'generate' | 'parse' | 'nextN' | 'encode' | 'decode' |
  'parseQuery' | 'generateAll' | 'test' | 'replace' | 'validatePattern';

/** Action definition within a tool */
export interface ActionDef {
  action: ToolAction;
  label: string;
}

/** Tool metadata — mirrors Go ToolMeta struct */
export interface ToolMeta {
  id: ToolId;
  name: string;
  icon: string;
  category: 'core' | 'extended';
  actions: ActionDef[];
}

/** Tool category for grouping in sidebar */
export type ToolCategory = 'core' | 'extended';
