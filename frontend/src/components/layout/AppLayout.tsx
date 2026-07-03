import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import StatusBar from './StatusBar';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/utils/constants';

/**
 * AppLayout — Overall layout structure:
 * - Left sidebar (collapsible): tool navigation
 * - Right content area: current tool component
 * - Bottom status bar: tool name + operation hints
 */
const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg">
      {/* Main area: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="sidebar-transition flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MainContent />
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
};

export default AppLayout;
