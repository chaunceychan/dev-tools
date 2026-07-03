import React from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { JwtDecode } from '@/utils/wailsApi';

const JwtTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const { call: decodeCall } = useGoMethod('JwtDecode', JwtDecode);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text">JWT 解析</h2>

      <InputArea placeholder="请输入 JWT token..." maxHeight="260px" />

      <ActionBar
        actions={[
          { label: '解析 JWT', onClick: () => decodeCall(input), disabled: !input.trim(), loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />
    </div>
  );
};

export default JwtTool;
