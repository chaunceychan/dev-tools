import { useHistoryStore } from '@/store/historyStore';
import type { ToolId, ToolAction } from '@/types/tool';

/**
 * useToolHistory — hook for recording tool operations in the history store (P2 placeholder).
 * Currently only adds records to the in-memory store.
 */
function useToolHistory() {
  const addRecord = (toolId: ToolId, action: ToolAction, input: string, output: string) => {
    useHistoryStore.getState().addRecord({
      toolId,
      action,
      input,
      output,
      timestamp: Date.now(),
    });
  };

  const clearHistory = () => {
    useHistoryStore.getState().clearRecords();
  };

  const records = useHistoryStore.getState().records;

  return { addRecord, clearHistory, records };
}

export default useToolHistory;
