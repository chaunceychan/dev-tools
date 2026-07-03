import React, { useState, useEffect } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { TimestampToDate, DateToTimestamp, MultiTimezone } from '@/utils/wailsApi';
import { TIMESTAMP_UNITS, TIMEZONE_OPTIONS } from '@/utils/constants';

type TimestampDirection = 'toDate' | 'toTimestamp';
interface TimezoneRow {
  zone: string;
  dateStr: string;
  offset: string;
}

/**
 * TimestampTool — Timestamp conversion tool with:
 * - Timestamp → Date conversion
 * - Date → Timestamp conversion
 * - Multi-timezone comparison table
 */
const TimestampTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const [direction, setDirection] = useState<TimestampDirection>('toDate');
  const [unit, setUnit] = useState('auto');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [timezoneResults, setTimezoneResults] = useState<TimezoneRow[]>([]);

  const { call: toDateCall } = useGoMethod('TimestampToDate', TimestampToDate);
  const { call: toTimestampCall } = useGoMethod('DateToTimestamp', DateToTimestamp);
  const { call: multiTimezoneCall } = useGoMethod('MultiTimezone', MultiTimezone);

  // Auto-detect: show current timestamp
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConvert = async () => {
    if (!input.trim()) return;

    if (direction === 'toDate') {
      const ts = parseInt(input, 10);
      if (isNaN(ts)) {
        useToolStore.setState({ error: '请输入有效的数字时间戳' });
        return;
      }
      await toDateCall(ts, unit, timezone);
    } else {
      await toTimestampCall(input, timezone);
    }
  };

  const handleTimezone = async () => {
    const ts = parseInt(input, 10);
    if (isNaN(ts)) {
      useToolStore.setState({ error: '请输入有效的数字时间戳' });
      return;
    }
    const results = await multiTimezoneCall(ts, unit);
    if (results) {
      setTimezoneResults(results as TimezoneRow[]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">时间戳转换</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDirection('toDate')}
            className={`px-3 py-1 rounded text-sm ${direction === 'toDate' ? 'bg-primary text-white' : 'bg-surface text-text border border-border'}`}
          >
            时间戳 → 日期
          </button>
          <button
            onClick={() => setDirection('toTimestamp')}
            className={`px-3 py-1 rounded text-sm ${direction === 'toTimestamp' ? 'bg-primary text-white' : 'bg-surface text-text border border-border'}`}
          >
            日期 → 时间戳
          </button>
        </div>
      </div>

      {/* Current timestamp display */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>当前时间戳:</span>
        <span className="font-mono">{currentTimestamp} (ms)</span>
        <span>/ {Math.floor(currentTimestamp / 1000)} (s)</span>
      </div>

      {/* Conversion options */}
      <div className="flex items-center gap-2">
        {direction === 'toDate' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted">单位:</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="px-2 py-1 rounded border border-border bg-surface text-sm text-text"
            >
              {TIMESTAMP_UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">时区:</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-surface text-sm text-text"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      </div>

      <InputArea
        placeholder={direction === 'toDate' ? '请输入时间戳数字...' : '请输入日期字符串 (如 2025-01-01 12:00:00)...'}
      />

      <ActionBar
        actions={[
          { label: direction === 'toDate' ? '转换为日期' : '转换为时间戳', onClick: handleConvert, loading },
          { label: '多时区对照', onClick: handleTimezone, variant: 'secondary', loading, disabled: direction !== 'toDate' },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />

      {/* Multi-timezone table */}
      {timezoneResults.length > 0 && (
        <div className="mt-3">
          <h3 className="text-sm font-medium text-text mb-2">多时区对照表</h3>
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-bg">
                <th className="px-3 py-2 text-left text-muted font-medium">时区</th>
                <th className="px-3 py-2 text-left text-muted font-medium">日期时间</th>
                <th className="px-3 py-2 text-left text-muted font-medium">UTC偏移</th>
              </tr>
            </thead>
            <tbody>
              {timezoneResults.map((row) => (
                <tr key={row.zone} className="border-t border-border bg-surface">
                  <td className="px-3 py-2 font-medium">{row.zone}</td>
                  <td className="px-3 py-2 code-text">{row.dateStr}</td>
                  <td className="px-3 py-2 text-muted">{row.offset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimestampTool;
