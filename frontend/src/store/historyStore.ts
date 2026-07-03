import { create } from 'zustand';
import type { ToolId, ToolAction } from '@/types/tool';

/** History record for a tool operation */
interface HistoryRecord {
  toolId: ToolId;
  action: ToolAction;
  input: string;
  output: string;
  timestamp: number;
}

/** History state managed by Zustand (P2 placeholder — in-memory only) */
interface HistoryState {
  records: HistoryRecord[];
  addRecord: (record: HistoryRecord) => void;
  clearRecords: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  records: [],

  addRecord: (record) =>
    set((state) => {
      const records = [record, ...state.records].slice(0, 50);
      return { records };
    }),

  clearRecords: () => set({ records: [] }),
}));
