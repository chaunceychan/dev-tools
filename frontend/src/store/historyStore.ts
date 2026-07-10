import { create } from 'zustand';
import type { ToolId, ToolAction, ToolExecutionStatus } from '@/types/tool';

/** History record for a tool operation */
export interface HistoryRecord {
  toolId: ToolId;
  action: ToolAction;
  methodName?: string;
  input: string;
  output: string;
  error?: string;
  status: ToolExecutionStatus;
  timestamp: number;
}

export interface HistoryRecordInput extends Omit<HistoryRecord, 'timestamp'> {
  timestamp?: number;
}

/** History state managed by Zustand (in-memory, capped to the latest 50 records) */
interface HistoryState {
  records: HistoryRecord[];
  addRecord: (record: HistoryRecordInput) => void;
  clearRecords: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  records: [],

  addRecord: (record) =>
    set((state) => {
      const records = [{ ...record, timestamp: record.timestamp ?? Date.now() }, ...state.records].slice(0, 50);
      return { records };
    }),

  clearRecords: () => set({ records: [] }),
}));
