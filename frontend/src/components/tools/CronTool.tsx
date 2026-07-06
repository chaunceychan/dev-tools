import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { CronParse, CronValidate, CronNextN } from '@/utils/wailsApi';
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
 */
const CronTool: React.FC = () => {
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const [expression, setExpression] = useState('');
  const [parseResult, setParseResult] = useState<CronParseResultType | null>(null);
  const [nextTimes, setNextTimes] = useState<string[]>([]);

  const { call: parseCall } = useGoMethod('CronParse', CronParse);
  const { call: validateCall } = useGoMethod('CronValidate', CronValidate);
  const { call: nextNCall } = useGoMethod('CronNextN', CronNextN);

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

      <OutputArea />
    </div>
  );
};

export default CronTool;
