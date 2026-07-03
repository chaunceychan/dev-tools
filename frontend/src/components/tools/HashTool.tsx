import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { HashGenerate, HashGenerateAll } from '@/utils/wailsApi';
import { HASH_ALGORITHM_OPTIONS } from '@/utils/constants';

const HashTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const [algorithm, setAlgorithm] = useState('sha256');

  const { call: generateCall } = useGoMethod('HashGenerate', HashGenerate);
  const { call: generateAllCall } = useGoMethod('HashGenerateAll', HashGenerateAll);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Hash 摘要</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">算法:</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-surface text-sm text-text"
          >
            {HASH_ALGORITHM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <InputArea placeholder="请输入需要计算摘要的文本..." />

      <ActionBar
        actions={[
          { label: '生成摘要', onClick: () => generateCall(input, algorithm), disabled: !input, loading },
          { label: '生成全部', onClick: () => generateAllCall(input), variant: 'secondary', disabled: !input, loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />
    </div>
  );
};

export default HashTool;
