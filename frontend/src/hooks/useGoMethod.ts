import { useToolStore } from '@/store/toolStore';
import useToolHistory from '@/hooks/useToolHistory';
import type { GoMethodFn } from '@/types/wails';
import type { ToolAction, ToolExecutionDescriptor, ToolId } from '@/types/tool';

const LEGACY_METHOD_ACTIONS: Partial<Record<ToolId, Partial<Record<string, ToolAction>>>> = {
  json: {
    JsonFormat: 'format',
    JsonMinify: 'minify',
    JsonToYAML: 'toYAML',
    JsonValidate: 'validate',
  },
  base64: {
    Base64EncodeText: 'encodeText',
    Base64DecodeText: 'decodeText',
    Base64EncodeFile: 'encodeFile',
    Base64DecodeFile: 'decodeFile',
  },
  timestamp: {
    TimestampToDate: 'toDate',
    DateToTimestamp: 'toTimestamp',
    MultiTimezone: 'timezone',
  },
  yaml: {
    YamlFormat: 'format',
    YamlValidate: 'validate',
    YamlToJSON: 'toJSON',
  },
  xml: {
    XmlFormat: 'format',
    XmlMinify: 'minify',
    XmlValidate: 'validate',
  },
  random: {
    RandomGenerate: 'generate',
  },
  cron: {
    CronParse: 'parse',
    CronValidate: 'validate',
    CronNextN: 'nextN',
  },
  url: {
    UrlEncode: 'encode',
    UrlDecode: 'decode',
    UrlParseQuery: 'parseQuery',
  },
  hash: {
    HashGenerate: 'generate',
    HashGenerateAll: 'generateAll',
  },
  jwt: {
    JwtDecode: 'decode',
  },
  uuid: {
    UuidGenerate: 'generate',
    UuidValidate: 'validate',
  },
  regex: {
    RegexTest: 'test',
    RegexReplace: 'replace',
  },
  'regex-validator': {
    RegexTest: 'validatePattern',
  },
  'text-diff': {
    TextDiffCompareText: 'compareText',
    TextDiffCompareFiles: 'compareFiles',
  },
};

type GoMethodTarget = string | ToolExecutionDescriptor;

interface ResolvedGoMethodTarget extends ToolExecutionDescriptor {
  toolId?: ToolId;
  action?: ToolAction;
  recordHistory: boolean;
}

function inferToolId(methodName: string, currentTool: ToolId): ToolId | undefined {
  if (LEGACY_METHOD_ACTIONS[currentTool]?.[methodName]) {
    return currentTool;
  }

  const matches = (Object.entries(LEGACY_METHOD_ACTIONS) as [ToolId, Partial<Record<string, ToolAction>>][])
    .filter(([, actions]) => actions[methodName]);

  return matches.length === 1 ? matches[0][0] : undefined;
}

function resolveTarget(target: GoMethodTarget, currentTool: ToolId): ResolvedGoMethodTarget {
  const descriptor = typeof target === 'string' ? { methodName: target } : target;
  const toolId = descriptor.toolId ?? (descriptor.action ? currentTool : inferToolId(descriptor.methodName, currentTool));
  const action = descriptor.action ?? (toolId ? LEGACY_METHOD_ACTIONS[toolId]?.[descriptor.methodName] : undefined);

  return {
    ...descriptor,
    toolId,
    action,
    recordHistory: descriptor.recordHistory ?? Boolean(toolId && action),
  };
}

function normalizeHistoryInput(storeInput: string, args: unknown[]): string {
  if (storeInput.trim()) {
    return storeInput;
  }

  if (args.length === 0) {
    return '';
  }

  const value = args.length === 1 ? args[0] : args;

  if (typeof value === 'string') {
    return value;
  }

  if (value === null || value === undefined) {
    return '';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * useGoMethod — generic hook that wraps a Wails Go method call
 * with automatic loading/error/output state management via toolStore.
 *
 * Usage:
 *   const { call } = useGoMethod({ methodName: 'JsonFormat', toolId: 'json', action: 'format' }, JsonFormat);
 *   const result = await call(input, 2);
 *   // toolStore.output, toolStore.error, and execution history are automatically updated
 */
function useGoMethod<T>(target: GoMethodTarget, goMethod: GoMethodFn<T>) {
  const { addRecord } = useToolHistory({ subscribe: false });

  const call = async (...args: any[]): Promise<T> => {
    const { currentTool, input, startExecution } = useToolStore.getState();
    const resolvedTarget = resolveTarget(target, currentTool);
    const historyInput = normalizeHistoryInput(input, args);

    startExecution();

    try {
      const result = await goMethod(...args);
      const output = useToolStore.getState().finishExecution(result);

      if (resolvedTarget.recordHistory && resolvedTarget.toolId && resolvedTarget.action) {
        addRecord({
          toolId: resolvedTarget.toolId,
          action: resolvedTarget.action,
          methodName: resolvedTarget.methodName,
          input: historyInput,
          output,
          status: 'success',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = useToolStore.getState().failExecution(error);

      if (resolvedTarget.recordHistory && resolvedTarget.toolId && resolvedTarget.action) {
        addRecord({
          toolId: resolvedTarget.toolId,
          action: resolvedTarget.action,
          methodName: resolvedTarget.methodName,
          input: historyInput,
          output: '',
          error: errorMessage,
          status: 'error',
        });
      }

      throw error;
    }
  };

  return { call };
}

export default useGoMethod;
