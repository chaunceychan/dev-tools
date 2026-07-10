import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { JsonFormat, JsonMinify, JsonToYAML, JsonValidate } from '@/utils/wailsApi';

/**
 * JsonTool — JSON formatting tool with 4 actions:
 * - 格式化 (Format): beautify with indentation
 * - 压缩 (Minify): remove whitespace
 * - 验证 (Validate): check syntax
 * - 转YAML (ToYAML): convert JSON to YAML
 */
const JsonTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const output = useToolStore((state) => state.output);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const setInput = useToolStore((state) => state.setInput);
  const setCurrentTool = useToolStore((state) => state.setCurrentTool);
  const [indent, setIndent] = useState(2);
  const [lastAction, setLastAction] = useState<'format' | 'minify' | 'validate' | 'toYAML' | null>(null);

  const { call: formatCall } = useGoMethod({ methodName: 'JsonFormat', toolId: 'json', action: 'format' }, JsonFormat);
  const { call: minifyCall } = useGoMethod({ methodName: 'JsonMinify', toolId: 'json', action: 'minify' }, JsonMinify);
  const { call: validateCall } = useGoMethod({ methodName: 'JsonValidate', toolId: 'json', action: 'validate' }, JsonValidate);
  const { call: toYAMLCall } = useGoMethod({ methodName: 'JsonToYAML', toolId: 'json', action: 'toYAML' }, JsonToYAML);

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

  const handleToYAML = async () => {
    if (!input.trim()) return;
    await toYAMLCall(input, indent);
    setLastAction('toYAML');
  };

  const handleUseOutput = () => {
    if (!output) return;
    setInput(output);
  };

  const handleContinueInYaml = () => {
    if (!output) return;
    setCurrentTool('yaml');
    setInput(output);
  };

  const followUpActions = [];
  if (output && (lastAction === 'format' || lastAction === 'minify')) {
    followUpActions.push({
      label: '使用当前输出',
      onClick: handleUseOutput,
      variant: 'secondary' as const,
    });
  }
  if (output && lastAction === 'toYAML') {
    followUpActions.push({
      label: '在 YAML 工具继续',
      onClick: handleContinueInYaml,
      variant: 'secondary' as const,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">JSON 格式化</h2>
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

      <InputArea placeholder="请输入 JSON 文本..." />

      <ActionBar
        actions={[
          { label: '格式化', onClick: handleFormat, loading },
          { label: '压缩', onClick: handleMinify, variant: 'secondary', loading },
          { label: '验证', onClick: handleValidate, variant: 'secondary', loading },
          { label: '转YAML', onClick: handleToYAML, variant: 'secondary', loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />
      {followUpActions.length > 0 && <ActionBar actions={followUpActions} />}
    </div>
  );
};

export default JsonTool;
