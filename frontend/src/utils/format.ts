/**
 * format.ts — Frontend formatting helpers for display and error parsing.
 */

/**
 * Parse an error message to extract line number information.
 * Used by ErrorDisplay component to highlight error lines.
 */
export function parseErrorLine(errorMsg: string): number | null {
  // Match patterns like "Line 12: ..." or "at line 12"
  const linePattern = /(?:Line|line)\s+(\d+)/;
  const match = errorMsg.match(linePattern);
  if (match) {
    return parseInt(match[1], 10);
  }

  // Match "after offset N" — convert offset to approximate line number
  const offsetPattern = /(?:after|near) offset (\d+)/;
  const offsetMatch = errorMsg.match(offsetPattern);
  if (offsetMatch) {
    // This is a byte offset, not a line number — return null for now
    return null;
  }

  return null;
}

/**
 * Format a number as a file size string (e.g., "10.5 MB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + '...';
}

/**
 * Count the number of lines in a text string.
 */
export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}
