import React from 'react';
import type { ToolId } from '@/types/tool';

interface IconProps {
  className?: string;
}

/**
 * toolIcons — Unified Lucide-style SVG icon set for the sidebar tool list.
 * Replaces the previous mix of emoji and text-label icons so every tool has
 * a consistent visual weight across platforms.
 */
function makeIcon(paths: React.ReactNode) {
  return function ToolIcon({ className }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {paths}
      </svg>
    );
  };
}

export const TOOL_ICONS: Record<ToolId, React.FC<IconProps>> = {
  json: makeIcon(
    <>
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
    </>,
  ),
  base64: makeIcon(
    <>
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m5 13-2 2 2 2" />
      <path d="m9 13 2 2-2 2" />
    </>,
  ),
  timestamp: makeIcon(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
  ),
  yaml: makeIcon(
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </>,
  ),
  xml: makeIcon(
    <>
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </>,
  ),
  random: makeIcon(
    <>
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <path d="M8.5 8.5h.01" />
      <path d="M15.5 8.5h.01" />
      <path d="M12 12h.01" />
      <path d="M8.5 15.5h.01" />
      <path d="M15.5 15.5h.01" />
    </>,
  ),
  cron: makeIcon(
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3 2 6" />
      <path d="m22 6-3-3" />
    </>,
  ),
  url: makeIcon(
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>,
  ),
  hash: makeIcon(
    <>
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </>,
  ),
  jwt: makeIcon(
    <>
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </>,
  ),
  uuid: makeIcon(
    <>
      <path d="M16 10h2" />
      <path d="M16 14h2" />
      <path d="M6.17 12a3 3 0 0 1 5.66 0" />
      <circle cx="9" cy="7" r="2" />
      <path d="M22 21a10 10 0 0 0-10-5 10 10 0 0 0-10 5" />
      <rect x="4" y="3" width="16" height="18" rx="2" />
    </>,
  ),
  regex: makeIcon(
    <path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6.4a.5.5 0 0 1 0 .6L6.1 18.2a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2" />,
  ),
  'regex-validator': makeIcon(
    <>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </>,
  ),
  'text-diff': makeIcon(
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 16l2-2-2-2" />
      <path d="M12 18v-4" />
      <path d="M16 14l-2 2 2 2" />
    </>,
  ),
  symmetric: makeIcon(
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>,
  ),
};
