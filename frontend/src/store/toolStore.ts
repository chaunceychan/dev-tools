import { create } from 'zustand';
import type { ToolId } from '@/types/tool';

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
  setOutput: (output: string) => void;

  /** Set the error message */
  setError: (error: string) => void;

  /** Set the loading state */
  setLoading: (loading: boolean) => void;

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
  setOutput: (output) => set({ output, error: '' }),
  setError: (error) => set({ error, loading: false }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ input: '', output: '', error: '', loading: false }),
}));
