import React from 'react';
import { useToolStore } from '@/store/toolStore';
import CopyButton from './CopyButton';

/**
 * OutputArea — Generic output display area with copy functionality.
 * Shows the result of tool operations.
 */
interface OutputAreaProps {
  label?: string;
}

const OutputArea: React.FC<OutputAreaProps> = ({
  label = '输出',
}) => {
  const output = useToolStore((state) => state.output);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-text">{label}</label>
        {output && <CopyButton text={output} />}
      </div>
      <div className="w-full rounded-lg border border-border bg-code-bg text-code-text p-3 code-text overflow-y-auto min-h-[120px] max-h-[300px]">
        {output || <span className="text-muted">等待操作结果...</span>}
      </div>
    </div>
  );
};

export default OutputArea;
