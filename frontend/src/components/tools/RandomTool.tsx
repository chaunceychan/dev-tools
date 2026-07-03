import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import CopyButton from '@/components/common/CopyButton';
import useGoMethod from '@/hooks/useGoMethod';
import { RandomGenerate, RandomParams } from '@/utils/wailsApi';
import { DEFAULT_RANDOM_LENGTH, DEFAULT_RANDOM_COUNT, RANDOM_CHARSET_OPTIONS } from '@/utils/constants';

/**
 * RandomTool — Random string generation tool with:
 * - Length slider (8-64)
 * - Charset checkboxes (uppercase, lowercase, digits, special)
 * - Count selector (1-10)
 * - Generated strings list with individual copy buttons
 */
const RandomTool: React.FC = () => {
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const [length, setLength] = useState(DEFAULT_RANDOM_LENGTH);
  const [count, setCount] = useState(DEFAULT_RANDOM_COUNT);
  const [charsetFlags, setCharsetFlags] = useState<Record<string, boolean>>(
    RANDOM_CHARSET_OPTIONS.reduce((acc, opt) => {
      acc[opt.key] = opt.defaultEnabled;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const { call: generateCall } = useGoMethod('RandomGenerate', RandomGenerate);
  const [generatedStrings, setGeneratedStrings] = useState<string[]>([]);

  const handleGenerate = async () => {
    // At least one charset must be enabled
    const hasEnabled = Object.values(charsetFlags).some((v) => v);
    if (!hasEnabled) {
      useToolStore.setState({ error: '请至少启用一个字符集' });
      return;
    }

    const params = new RandomParams({
      length,
      charsetFlags,
      count,
    });

    const results = await generateCall(params);
    if (Array.isArray(results)) {
      setGeneratedStrings(results);
    }
  };

  const handleCharsetToggle = (key: string) => {
    setCharsetFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text">随机字符串生成</h2>

      {/* Configuration area */}
      <div className="bg-surface rounded-lg border border-border p-4 space-y-4">
        {/* Length slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-text">字符串长度</label>
            <span className="text-sm font-mono text-primary">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Charset checkboxes */}
        <div>
          <label className="text-sm font-medium text-text mb-2 block">字符集</label>
          <div className="flex flex-wrap gap-3">
            {RANDOM_CHARSET_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={charsetFlags[opt.key]}
                  onChange={() => handleCharsetToggle(opt.key)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-text">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Count selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-text">生成数量</label>
            <span className="text-sm font-mono text-primary">{count}</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>1</span>
            <span>20</span>
          </div>
        </div>
      </div>

      <ActionBar
        actions={[
          { label: '生成随机字符串', onClick: handleGenerate, loading },
        ]}
      />

      {error && <ErrorDisplay />}

      {/* Generated strings list */}
      {generatedStrings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-text">生成结果</h3>
          <div className="space-y-1">
            {generatedStrings.map((str, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-surface rounded-lg border border-border px-3 py-2"
              >
                <span className="text-xs text-muted font-mono w-6">{idx + 1}.</span>
                <span className="flex-1 code-text text-sm">{str}</span>
                <CopyButton text={str} label="复制" />
              </div>
            ))}
          </div>
          {/* Copy all */}
          <CopyButton text={generatedStrings.join('\n')} label="复制全部" />
        </div>
      )}
    </div>
  );
};

export default RandomTool;
