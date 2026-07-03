import { useState } from 'react';
import { ClipboardWrite } from '@/utils/wailsApi';

/**
 * useClipboard — hook for copying text to the system clipboard via Wails Go method.
 * Returns a copy function and a "copied" state that resets after 2 seconds.
 */
function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string): Promise<void> => {
    try {
      await ClipboardWrite(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard write failed:', err);
      // Fallback to browser clipboard API
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback clipboard write also failed:', fallbackErr);
      }
    }
  };

  return { copied, copy };
}

export default useClipboard;
