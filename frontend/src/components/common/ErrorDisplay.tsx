import React from 'react';
import { useToolStore } from '@/store/toolStore';
import { parseErrorLine } from '@/utils/format';

const AlertTriangleIcon = () => (
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
    aria-hidden="true"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

/**
 * ErrorDisplay — Shows error messages with optional line number highlighting.
 * Parses the error string to extract line info and highlights the error location.
 */
const ErrorDisplay: React.FC = () => {
  const error = useToolStore((state) => state.error);
  const input = useToolStore((state) => state.input);

  if (!error) return null;

  const errorLine = parseErrorLine(error);
  const inputLines = input.split('\n');

  return (
    <div className="w-full mb-2">
      <div className="rounded-lg border border-error/30 bg-error-subtle p-3">
        <div className="flex items-start gap-2">
          <span className="text-error flex-shrink-0 mt-0.5">
            <AlertTriangleIcon />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-error">{error}</p>
            {errorLine !== null && errorLine > 0 && inputLines.length >= errorLine && (
              <div className="mt-2 text-xs text-muted">
                <p>错误位置（行 {errorLine}）:</p>
                <div className="mt-1 rounded bg-code-bg border border-error/20 p-2 overflow-x-auto max-h-[80px] code-text">
                  {inputLines.slice(Math.max(0, errorLine - 3), errorLine + 2).map((line, idx) => {
                    const actualLineNum = Math.max(0, errorLine - 3) + idx + 1;
                    const isErrorLine = actualLineNum === errorLine;
                    return (
                      <div
                        key={idx}
                        className={`${isErrorLine ? 'bg-error/10 text-error font-semibold' : 'text-code-text'} px-2 rounded`}
                      >
                        <span className="inline-block w-8 text-right mr-2 opacity-60 select-none">
                          {actualLineNum}
                        </span>
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
