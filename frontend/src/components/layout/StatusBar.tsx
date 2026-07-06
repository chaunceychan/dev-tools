import React from 'react';
import { useToolStore } from '@/store/toolStore';
import { getToolById } from '@/utils/constants';

const LoaderIcon = () => (
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
    className="animate-spin"
    aria-hidden="true"
  >
    <path d="M12 2v4" />
    <path d="m16.2 7.8 2.9-2.9" />
    <path d="M18 12h4" />
    <path d="m16.2 16.2 2.9 2.9" />
    <path d="M12 18v4" />
    <path d="m4.9 19.1 2.9-2.9" />
    <path d="M2 12h4" />
    <path d="m4.9 4.9 2.9 2.9" />
  </svg>
);

/**
 * StatusBar — Bottom status bar showing current tool name and operation hints.
 */
const StatusBar: React.FC = () => {
  const currentTool = useToolStore((state) => state.currentTool);
  const loading = useToolStore((state) => state.loading);
  const toolMeta = getToolById(currentTool);

  return (
    <div className="h-7 flex items-center justify-between px-4 border-t border-border bg-surface text-xs text-muted">
      <span className="font-medium">
        {toolMeta ? `当前工具: ${toolMeta.name}` : 'DevTools'}
      </span>
      <span className="flex items-center gap-1.5">
        {loading && <LoaderIcon />}
        {loading ? '处理中...' : '就绪'}
      </span>
    </div>
  );
};

export default StatusBar;
