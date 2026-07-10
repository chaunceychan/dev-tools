import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { YamlFormat, YamlValidate, YamlToJSON } from '@/utils/wailsApi';

/**
 * YamlTool — YAML formatting tool with 3 actions:
 * - 格式化 (Format): beautify with indentation
 * - 验证 (Validate): check syntax
 * - 转JSON (ToJSON): convert YAML to JSON
 */
const YamlTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const output = useToolStore((state) => state.output);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const setInput = useToolStore((state) => state.setInput);
  const setCurrentTool = useToolStore((state) => state.setCurrentTool);
  const [indent, setIndent] = useState(2);
  const [lastAction, setLastAction] = useState<'format' | 'validate' | 'toJSON' | null>(null);

  const { call: formatCall } = useGoMethod({ methodName: 'YamlFormat', toolId: 'yaml', action: 'format' }, YamlFormat);
  const { call: validateCall } = useGoMethod({ methodName: 'YamlValidate', toolId: 'yaml', action: 'validate' }, YamlValidate);
  const { call: toJSONCall } = useGoMethod({ methodName: 'YamlToJSON', toolId: 'yaml', action: 'toJSON' }, YamlToJSON);

  const handleFormat = async () => {
    if (!input.trim()) return;
    await formatCall(input, indent);
    setLastAction('format');
  };

  const handleValidate = async () => {
    if (!input.trim()) return;
    await validateCall(input);
    setLastAction('validate');
  };

  const handleToJSON = async () => {
    if (!input.trim()) return;
    await toJSONCall(input);
    setLastAction('toJSON');
  };

  const handleUseOutput = () => {
    if (!output) return;
    setInput(output);
  };

  const handleContinueInJson = () => {
    if (!output) return;
    setCurrentTool('json');
    setInput(output);
  };

  const followUpActions = [];
  if (output && lastAction === 'format') {
    followUpActions.push({
      label: '使用当前输出',
      onClick: handleUseOutput,
      variant: 'secondary' as const,
    });
  }
  if (output && lastAction === 'toJSON') {
    followUpActions.push({
      label: '在 JSON 工具继续',
      onClick: handleContinueInJson,
      variant: 'secondary' as const,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">YAML 格式化</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">缩进:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-2 py-1 rounded border border-border bg-surface text-sm text-text"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
          </select>
        </div>
      </div>

      <InputArea placeholder="请输入 YAML 文本..." />

      <ActionBar
        actions={[
          { label: '格式化', onClick: handleFormat, loading },
          { label: '验证', onClick: handleValidate, variant: 'secondary', loading },
          { label: '转JSON', onClick: handleToJSON, variant: 'secondary', loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />
      {followUpActions.length > 0 && <ActionBar actions={followUpActions} />}
    </div>
  );
};

export default YamlTool;
