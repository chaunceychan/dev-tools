import React from 'react';
import { useToolStore } from '@/store/toolStore';
import { TOOL_LIST, TOOL_CATEGORIES, APP_VERSION } from '@/utils/constants';
import ThemeToggle from '@/components/common/ThemeToggle';
import type { ToolId } from '@/types/tool';
import '@/styles/sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * Sidebar — Left navigation panel showing all available tools.
 * Supports collapsing to icon-only mode and category grouping.
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const currentTool = useToolStore((state) => state.currentTool);
  const setCurrentTool = useToolStore((state) => state.setCurrentTool);

  const handleToolClick = (toolId: ToolId) => {
    setCurrentTool(toolId);
  };

  return (
    <div
      className={`h-full bg-sidebar-bg flex flex-col ${collapsed ? 'sidebar-collapsed' : ''}`}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b border-border ${
          collapsed ? 'px-1 py-3 gap-1' : 'px-4 py-3 justify-between'
        }`}
      >
        <div className="flex items-center gap-2">
          <img
            src="/dev_tool_logo_32x32.png"
            alt="DevTools"
            className="w-8 h-8"
          />
          {!collapsed && (
            <h1 className="text-sidebar-text text-base font-bold truncate">
              DevTools
            </h1>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className={`text-sidebar-text hover:text-primary transition-colors rounded cursor-pointer ${
            collapsed ? 'p-0.5 text-xs' : 'p-1'
          }`}
          title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {/* Search placeholder (P2) */}
      {!collapsed && (
        <div className="px-3 py-2">
          <input
            type="text"
            placeholder="搜索工具..."
            disabled
            className="w-full px-3 py-1.5 rounded-lg bg-surface-elevated text-sidebar-text text-sm border border-border placeholder:text-sidebar-muted cursor-not-allowed opacity-60"
          />
        </div>
      )}

      {/* Tool list by category */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {TOOL_CATEGORIES.map((category) => {
          const tools = TOOL_LIST.filter((t) => t.category === category.key);
          return (
            <div key={category.key}>
              <div className="sidebar-category">{category.label}</div>
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`sidebar-nav-item ${currentTool === tool.id ? 'active' : ''}`}
                  onClick={() => handleToolClick(tool.id)}
                  title={collapsed ? tool.name : undefined}
                >
                  <span className="sidebar-icon">{tool.icon}</span>
                  <span className="sidebar-label">{tool.name}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer: theme toggle + version info */}
      {!collapsed && (
        <div className="border-t border-border px-2 py-2">
          <ThemeToggle />
          <div className="px-3 py-1 text-xs text-sidebar-muted">v{APP_VERSION}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
