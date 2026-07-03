import React from 'react';
import { useToolStore } from '@/store/toolStore';
import { getToolById } from '@/utils/constants';

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
      <span>
        {loading ? '⏳ 处理中...' : '就绪'}
      </span>
    </div>
  );
};

export default StatusBar;
