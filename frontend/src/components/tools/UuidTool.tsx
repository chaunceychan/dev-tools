import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { UuidGenerate, UuidValidate } from '@/utils/wailsApi';

const UuidTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphen, setNoHyphen] = useState(false);

  const { call: generateCall } = useGoMethod('UuidGenerate', UuidGenerate);
  const { call: validateCall } = useGoMethod('UuidValidate', UuidValidate);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text">UUID 工具</h2>

      <div className="bg-surface rounded-lg border border-border p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-text">生成数量</label>
            <span className="text-sm font-mono text-primary">{count}</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={() => setUppercase((value) => !value)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm text-text">大写</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={noHyphen}
              onChange={() => setNoHyphen((value) => !value)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm text-text">去掉横线</span>
          </label>
        </div>
      </div>

      <InputArea placeholder="请输入 UUID 进行验证..." />

      <ActionBar
        actions={[
          { label: '生成 UUID', onClick: () => generateCall(count, uppercase, noHyphen), loading },
          { label: '验证 UUID', onClick: () => validateCall(input), variant: 'secondary', disabled: !input.trim(), loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />
    </div>
  );
};

export default UuidTool;
