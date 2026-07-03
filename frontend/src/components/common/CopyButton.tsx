import React from 'react';
import useClipboard from '@/hooks/useClipboard';

/**
 * CopyButton — One-click copy button that copies text to the system clipboard.
 * Shows a visual "copied" confirmation for 2 seconds after successful copy.
 */
interface CopyButtonProps {
  text: string;
  label?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = '复制',
}) => {
  const { copied, copy } = useClipboard();

  const handleClick = () => {
    if (text) {
      copy(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!text}
      className={`px-3 py-1 rounded text-xs font-medium transition-all focus:outline-none
        ${copied
          ? 'bg-success text-white'
          : 'bg-surface text-text border border-border hover:bg-bg hover:border-primary/50'
        }
        ${!text ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {copied ? '已复制 ✓' : label}
    </button>
  );
};

export default CopyButton;
