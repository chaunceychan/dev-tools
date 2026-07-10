import { create } from 'zustand';
import type { ToolId } from '@/types/tool';

export function normalizeToolOutput(output: unknown): string {
  if (typeof output === 'string') {
    return output;
  }

  if (output === null || output === undefined) {
    return '';
  }

  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}

export function normalizeToolError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error === null || error === undefined) {
    return 'Unknown error';
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

/** Tool state managed by Zustand */
interface ToolState {
  currentTool: ToolId;
  input: string;
  output: string;
  error: string;
  loading: boolean;

  /** Switch to a different tool — clears input/output/error */
  setCurrentTool: (tool: ToolId) => void;

  /** Set the input text */
  setInput: (input: string) => void;

  /** Set the output text */
  setOutput: (output: unknown) => void;

  /** Set the error message */
  setError: (error: unknown) => void;

  /** Set the loading state */
  setLoading: (loading: boolean) => void;

  /** Begin a tool execution cycle */
  startExecution: () => void;

  /** Complete a tool execution with normalized output */
  finishExecution: (output: unknown) => string;

  /** Fail a tool execution with a normalized error */
  failExecution: (error: unknown) => string;

  /** Clear all state (input, output, error, loading) */
  clear: () => void;
}

export const useToolStore = create<ToolState>((set) => ({
  currentTool: 'json',
  input: '',
  output: '',
  error: '',
  loading: false,

  setCurrentTool: (tool) =>
    set({
      currentTool: tool,
      input: '',
      output: '',
      error: '',
      loading: false,
    }),

  setInput: (input) => set({ input }),
  setOutput: (output) => set({ output: normalizeToolOutput(output), error: '' }),
  setError: (error) => set({ output: '', error: normalizeToolError(error), loading: false }),
  setLoading: (loading) => set({ loading }),
  startExecution: () => set({ loading: true, error: '' }),
  finishExecution: (result) => {
    const output = normalizeToolOutput(result);
    set({ output, error: '', loading: false });
    return output;
  },
  failExecution: (error) => {
    const normalizedError = normalizeToolError(error);
    set({ output: '', error: normalizedError, loading: false });
    return normalizedError;
  },
  clear: () => set({ input: '', output: '', error: '', loading: false }),
}));
