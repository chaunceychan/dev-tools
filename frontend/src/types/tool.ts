/** Tool identifier type — matches Go ToolMeta.ID values */
export type ToolId = 'json' | 'base64' | 'timestamp' | 'yaml' | 'xml' | 'random' | 'cron' |
  'url' | 'hash' | 'jwt' | 'uuid' | 'regex' | 'regex-validator' | 'text-diff';

/** Tool action identifier */
export type ToolAction = 'format' | 'minify' | 'validate' | 'encodeText' | 'decodeText' |
  'encodeFile' | 'decodeFile' | 'toDate' | 'toTimestamp' | 'timezone' |
  'toJSON' | 'toYAML' | 'generate' | 'parse' | 'nextN' | 'encode' | 'decode' |
  'parseQuery' | 'generateAll' | 'test' | 'replace' | 'validatePattern' |
  'compareText' | 'compareFiles';

/** Execution status for a tool action */
export type ToolExecutionStatus = 'success' | 'error';

/** Structured metadata for a shared tool execution */
export interface ToolExecutionDescriptor {
  methodName: string;
  toolId?: ToolId;
  action?: ToolAction;
  recordHistory?: boolean;
}

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
