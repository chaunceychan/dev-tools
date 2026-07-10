import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { XmlFormat, XmlMinify, XmlValidate } from '@/utils/wailsApi';

type XmlAction = 'format' | 'minify' | 'validate';

/**
 * XmlTool — XML formatting tool with 3 actions:
 * - 格式化 (Format): beautify with indentation
 * - 压缩 (Minify): remove whitespace
 * - 验证 (Validate): check syntax
 */
const XmlTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const output = useToolStore((state) => state.output);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const setInput = useToolStore((state) => state.setInput);
  const [indent, setIndent] = useState(2);
  const [lastAction, setLastAction] = useState<XmlAction | null>(null);

  const { call: formatCall } = useGoMethod({ methodName: 'XmlFormat', toolId: 'xml', action: 'format' }, XmlFormat);
  const { call: minifyCall } = useGoMethod({ methodName: 'XmlMinify', toolId: 'xml', action: 'minify' }, XmlMinify);
  const { call: validateCall } = useGoMethod({ methodName: 'XmlValidate', toolId: 'xml', action: 'validate' }, XmlValidate);

  const handleFormat = async () => {
    if (!input.trim()) return;
    await formatCall(input, indent);
    setLastAction('format');
  };

  const handleMinify = async () => {
    if (!input.trim()) return;
    await minifyCall(input);
    setLastAction('minify');
  };

  const handleValidate = async () => {
    if (!input.trim()) return;
    await validateCall(input);
    setLastAction('validate');
  };

  const handleUseOutputAsInput = () => {
    if (!output.trim()) return;
    setInput(output);
  };

  const canReuseOutput = Boolean(output.trim()) && lastAction !== 'validate' && output !== input;
  const outputLabel = lastAction === 'validate' ? '验证结果' : '输出';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">XML 格式化</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">缩进:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-2 py-1 rounded border border-border bg-surface text-sm text-text"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={8}>8 空格</option>
          </select>
        </div>
      </div>

      <InputArea placeholder="请输入 XML 文本..." />

      <ActionBar
        actions={[
          { label: '格式化', onClick: handleFormat, loading },
          { label: '压缩', onClick: handleMinify, variant: 'secondary', loading },
          { label: '验证', onClick: handleValidate, variant: 'secondary', loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <div className="space-y-2">
        <OutputArea label={outputLabel} />
        {lastAction !== 'validate' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUseOutputAsInput}
              disabled={!canReuseOutput || loading}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface text-sm text-text transition-colors hover:bg-bg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              将结果用作输入
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default XmlTool;
