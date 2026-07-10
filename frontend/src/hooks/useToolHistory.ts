import { useCallback } from 'react';
import { useHistoryStore, type HistoryRecord, type HistoryRecordInput } from '@/store/historyStore';

const EMPTY_HISTORY: HistoryRecord[] = [];

interface UseToolHistoryOptions {
  subscribe?: boolean;
}

/**
 * useToolHistory — hook for subscribing to and recording tool execution history.
 */
function useToolHistory(options: UseToolHistoryOptions = {}) {
  const { subscribe = true } = options;
  const records = useHistoryStore((state) => (subscribe ? state.records : EMPTY_HISTORY));
  const storeAddRecord = useHistoryStore((state) => state.addRecord);
  const clearHistory = useHistoryStore((state) => state.clearRecords);

  const addRecord = useCallback((record: HistoryRecordInput) => {
    storeAddRecord(record);
  }, [storeAddRecord]);

  return { addRecord, clearHistory, records };
}

export default useToolHistory;
