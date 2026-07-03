import React from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { UrlEncode, UrlDecode, UrlParseQuery } from '@/utils/wailsApi';

const UrlTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const { call: encodeCall } = useGoMethod('UrlEncode', UrlEncode);
  const { call: decodeCall } = useGoMethod('UrlDecode', UrlDecode);
  const { call: parseQueryCall } = useGoMethod('UrlParseQuery', UrlParseQuery);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text">URL 编解码</h2>

      <InputArea placeholder="请输入 URL、Query 字符串或需要编码的文本..." />

      <ActionBar
        actions={[
          { label: 'URL 编码', onClick: () => encodeCall(input), disabled: !input.trim(), loading },
          { label: 'URL 解码', onClick: () => decodeCall(input), variant: 'secondary', disabled: !input.trim(), loading },
          { label: '解析 Query 参数', onClick: () => parseQueryCall(input), variant: 'secondary', disabled: !input.trim(), loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />
    </div>
  );
};

export default UrlTool;
