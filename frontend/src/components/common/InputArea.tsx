import React from 'react';
import { useToolStore } from '@/store/toolStore';

/**
 * InputArea — Generic text input area component.
 * Used by most tools for entering raw input text.
 */
interface InputAreaProps {
  placeholder?: string;
  maxHeight?: string;
}

const InputArea: React.FC<InputAreaProps> = ({
  placeholder = '请输入内容...',
  maxHeight = '200px',
}) => {
  const input = useToolStore((state) => state.input);
  const setInput = useToolStore((state) => state.setInput);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text mb-1">输入</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface text-text p-3 code-text resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
        style={{ maxHeight }}
        spellCheck={false}
      />
    </div>
  );
};

export default InputArea;
