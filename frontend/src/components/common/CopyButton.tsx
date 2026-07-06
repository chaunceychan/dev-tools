import React from 'react';
import useClipboard from '@/hooks/useClipboard';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

interface CopyButtonProps {
  text: string;
  label?: string;
}

/**
 * CopyButton — One-click copy button that copies text to the system clipboard.
 * Shows a visual "copied" confirmation for 2 seconds after successful copy.
 */
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
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer
        ${copied
          ? 'bg-success text-white'
          : 'bg-surface text-text border border-border hover:bg-bg hover:border-primary/50'
        }
        ${!text ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>已复制</span>
        </>
      ) : (
        <>
          <CopyIcon />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default CopyButton;
