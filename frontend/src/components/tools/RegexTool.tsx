import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { RegexTest, RegexReplace } from '@/utils/wailsApi';

const RegexTool: React.FC = () => {
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [replacement, setReplacement] = useState('');

  const { call: testCall } = useGoMethod('RegexTest', RegexTest);
  const { call: replaceCall } = useGoMethod('RegexReplace', RegexReplace);

  const inputClass = 'w-full rounded-lg border border-border bg-surface text-text p-3 code-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text">正则测试</h2>

      <div>
        <label className="block text-sm font-medium text-text mb-1">表达式</label>
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="例如: (?P<key>\\w+)=(\\d+)"
          className={inputClass}
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1">测试文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入用于匹配的文本..."
          className={`${inputClass} resize-y min-h-[140px]`}
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1">替换为</label>
        <input
          type="text"
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          placeholder="仅在执行替换时使用"
          className={inputClass}
          spellCheck={false}
        />
      </div>

      <ActionBar
        actions={[
          { label: '测试匹配', onClick: () => testCall(pattern, text), disabled: !pattern.trim() || !text, loading },
          { label: '执行替换', onClick: () => replaceCall(pattern, replacement, text), variant: 'secondary', disabled: !pattern.trim() || !text, loading },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea />
    </div>
  );
};

export default RegexTool;
