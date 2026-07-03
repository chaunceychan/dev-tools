import React from 'react';
import { useToolStore } from '@/store/toolStore';
import JsonTool from '@/components/tools/JsonTool';
import Base64Tool from '@/components/tools/Base64Tool';
import TimestampTool from '@/components/tools/TimestampTool';
import YamlTool from '@/components/tools/YamlTool';
import XmlTool from '@/components/tools/XmlTool';
import RandomTool from '@/components/tools/RandomTool';
import CronTool from '@/components/tools/CronTool';
import UrlTool from '@/components/tools/UrlTool';
import HashTool from '@/components/tools/HashTool';
import JwtTool from '@/components/tools/JwtTool';
import UuidTool from '@/components/tools/UuidTool';
import RegexTool from '@/components/tools/RegexTool';
import type { ToolId } from '@/types/tool';

/** Tool component mapping — each ToolId maps to its React component */
const TOOL_COMPONENTS: Record<ToolId, React.FC> = {
  json: JsonTool,
  base64: Base64Tool,
  timestamp: TimestampTool,
  yaml: YamlTool,
  xml: XmlTool,
  random: RandomTool,
  cron: CronTool,
  url: UrlTool,
  hash: HashTool,
  jwt: JwtTool,
  uuid: UuidTool,
  regex: RegexTool,
};

/**
 * MainContent — Right content area that renders the current tool component.
 */
const MainContent: React.FC = () => {
  const currentTool = useToolStore((state) => state.currentTool);

  const ToolComponent = TOOL_COMPONENTS[currentTool];

  if (!ToolComponent) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        <p>请从左侧选择一个工具</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <ToolComponent />
    </div>
  );
};

export default MainContent;
