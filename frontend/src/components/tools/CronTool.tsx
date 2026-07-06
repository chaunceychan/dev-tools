import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { CronParse, CronValidate, CronNextN, CronGenerateInterval, CronGenerateFixedTime } from '@/utils/wailsApi';
import { CRON_PRESETS, DEFAULT_CRON_COUNT } from '@/utils/constants';

interface CronParseResultType {
  description: string;
  isValid: boolean;
}

/**
 * CronTool — Cron expression parsing tool with:
 * - Expression input with preset templates
 * - Parse (human-readable description)
 * - Validate (syntax check)
 * - Next N execution times
 * - Quick generator (interval + fixed-time modes)
 */
const CronTool: React.FC = () => {
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const [expression, setExpression] = useState('');
  const [parseResult, setParseResult] = useState<CronParseResultType | null>(null);
  const [nextTimes, setNextTimes] = useState<string[]>([]);

  // Quick generator state
  const [genMode, setGenMode] = useState<'interval' | 'fixed'>('interval');
  const [genPanelOpen, setGenPanelOpen] = useState(false);
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState('minute');
  const [fixedScenario, setFixedScenario] = useState('daily');
  const [fixedTime, setFixedTime] = useState('00:00');
  const [fixedDay, setFixedDay] = useState(1);

  const { call: parseCall } = useGoMethod('CronParse', CronParse);
  const { call: validateCall } = useGoMethod('CronValidate', CronValidate);
  const { call: nextNCall } = useGoMethod('CronNextN', CronNextN);
  const { call: genIntervalCall } = useGoMethod('CronGenerateInterval', CronGenerateInterval);
  const { call: genFixedCall } = useGoMethod('CronGenerateFixedTime', CronGenerateFixedTime);

  const handleParse = async () => {
    if (!expression.trim()) return;
    const result = await parseCall(expression);
    if (result) {
      setParseResult(result as CronParseResultType);
    }
  };

  const handleValidate = async () => {
    if (!expression.trim()) return;
    await validateCall(expression);
  };

  const handleNextN = async () => {
    if (!expression.trim()) return;
    const results = await nextNCall(expression, DEFAULT_CRON_COUNT);
    if (Array.isArray(results)) {
      setNextTimes(results);
    }
  };

  const handlePreset = (presetExpression: string) => {
    setExpression(presetExpression);
    useToolStore.setState({ input: presetExpression, output: '', error: '' });
    setParseResult(null);
    setNextTimes([]);
  };

  const handleGenInterval = async () => {
    try {
      const expr = await genIntervalCall(intervalValue, intervalUnit);
      setExpression(String(expr));
      useToolStore.setState({ input: String(expr), output: '', error: '' });
      setParseResult(null);
      setNextTimes([]);
    } catch {
      // error handled by useGoMethod
    }
  };

  const handleGenFixed = async () => {
    const [h, m] = fixedTime.split(':').map(Number);
    try {
      const expr = await genFixedCall(fixedScenario, h || 0, m || 0, fixedDay);
      setExpression(String(expr));
      useToolStore.setState({ input: String(expr), output: '', error: '' });
      setParseResult(null);
      setNextTimes([]);
    } catch {
      // error handled by useGoMethod
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text">Cron 表达式解析</h2>

      {/* Expression input */}
      <div>
        <label className="block text-sm font-medium text-text mb-1">Cron 表达式</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => {
            setExpression(e.target.value);
            useToolStore.setState({ input: e.target.value, output: '', error: '' });
            setParseResult(null);
            setNextTimes([]);
          }}
          placeholder="例如: */5 * * * *"
          className="w-full rounded-lg border border-border bg-surface text-text p-3 code-text focus:outline-none focus:ring-2 focus:ring-primary"
          spellCheck={false}
        />
      </div>

      {/* Preset templates */}
      <div>
        <label className="block text-sm font-medium text-text mb-1">常用模板</label>
        <div className="flex flex-wrap gap-2">
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.expression}
              onClick={() => handlePreset(preset.expression)}
              className={`px-3 py-1.5 rounded text-xs border transition-colors
                ${expression === preset.expression
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text border-border hover:border-primary/50'
                }`}
            >
              <span className="font-mono">{preset.expression}</span>
              <span className="text-muted ml-1">({preset.description})</span>
            </button>
          ))}
        </div>
      </div>

      <ActionBar
        actions={[
          { label: '解析', onClick: handleParse, loading },
          { label: '验证', onClick: handleValidate, variant: 'secondary', loading },
          { label: '下次执行时间', onClick: handleNextN, variant: 'secondary', loading },
        ]}
      />

      {error && <ErrorDisplay />}

      {/* Parse result */}
      {parseResult && (
        <div className="bg-surface rounded-lg border border-border p-3">
          <h3 className="text-sm font-medium text-text mb-2">解析结果</h3>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted">含义:</span>
              <span className="ml-2 text-text">{parseResult.description}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted">语法:</span>
              <span className={`ml-2 ${parseResult.isValid ? 'text-success' : 'text-error'}`}>
                {parseResult.isValid ? '✓ 有效' : '✗ 无效'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Next execution times */}
      {nextTimes.length > 0 && (
        <div className="bg-surface rounded-lg border border-border p-3">
          <h3 className="text-sm font-medium text-text mb-2">下次 {nextTimes.length} 次执行时间</h3>
          <ul className="space-y-1">
            {nextTimes.map((time, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-muted font-mono w-6">{idx + 1}.</span>
                <span className="code-text">{time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Generator */}
      <div className="border-t border-border pt-3 mt-2">
        <button
          onClick={() => setGenPanelOpen(!genPanelOpen)}
          className="flex items-center gap-2 text-sm font-medium text-text hover:text-primary transition-colors"
        >
          <span className={`transition-transform text-xs ${genPanelOpen ? 'rotate-90' : ''}`}>▶</span>
          快捷生成
        </button>

        {genPanelOpen && (
          <div className="mt-3 space-y-3 bg-surface rounded-lg border border-border p-3">
            {/* Mode tabs */}
            <div className="flex gap-1 bg-surface/50 rounded-lg p-0.5 border border-border">
              <button
                onClick={() => setGenMode('interval')}
                className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                  genMode === 'interval' ? 'bg-primary text-white' : 'text-text hover:bg-surface'
                }`}
              >
                时间间隔
              </button>
              <button
                onClick={() => setGenMode('fixed')}
                className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                  genMode === 'fixed' ? 'bg-primary text-white' : 'text-text hover:bg-surface'
                }`}
              >
                特定时间点
              </button>
            </div>

            {genMode === 'interval' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text">每</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={intervalValue}
                    onChange={(e) => setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 rounded border border-border bg-surface text-text px-2 py-1 text-sm code-text focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <select
                    value={intervalUnit}
                    onChange={(e) => setIntervalUnit(e.target.value)}
                    className="rounded border border-border bg-surface text-text px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="second">秒</option>
                    <option value="minute">分</option>
                    <option value="hour">小时</option>
                    <option value="day">天</option>
                    <option value="week">周</option>
                    <option value="month">月</option>
                  </select>
                  <button
                    onClick={handleGenInterval}
                    disabled={loading}
                    className="px-3 py-1.5 rounded text-sm bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    生成
                  </button>
                </div>
                {intervalUnit === 'second' && (
                  <div className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-300 text-xs">
                    <span>⚠️</span>
                    <span>注意：秒级 Cron 需要 Cron 调度器支持 6 段格式（秒 分 时 日 月 周）</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Scenario selector */}
                <div className="flex gap-1">
                  {[
                    { key: 'daily', label: '每天' },
                    { key: 'weekday', label: '工作日' },
                    { key: 'weekly', label: '每周' },
                    { key: 'monthly', label: '每月' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setFixedScenario(s.key)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        fixedScenario === s.key
                          ? 'bg-primary/20 text-primary border border-primary/50'
                          : 'text-text border border-border hover:border-primary/30'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {fixedScenario === 'weekly' && (
                    <select
                      value={fixedDay}
                      onChange={(e) => setFixedDay(parseInt(e.target.value))}
                      className="rounded border border-border bg-surface text-text px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value={1}>周一</option>
                      <option value={2}>周二</option>
                      <option value={3}>周三</option>
                      <option value={4}>周四</option>
                      <option value={5}>周五</option>
                      <option value={6}>周六</option>
                      <option value={7}>周日</option>
                    </select>
                  )}
                  {fixedScenario === 'monthly' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={fixedDay}
                        onChange={(e) => setFixedDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                        className="w-16 rounded border border-border bg-surface text-text px-2 py-1 text-sm code-text focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-sm text-text">号</span>
                    </div>
                  )}
                  <input
                    type="time"
                    value={fixedTime}
                    onChange={(e) => setFixedTime(e.target.value)}
                    className="rounded border border-border bg-surface text-text px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleGenFixed}
                    disabled={loading}
                    className="px-3 py-1.5 rounded text-sm bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    生成
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <OutputArea />
    </div>
  );
};

export default CronTool;
