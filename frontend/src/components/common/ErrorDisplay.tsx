import React from 'react';
import { useToolStore } from '@/store/toolStore';
import { parseErrorLine } from '@/utils/format';

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
      <div className="rounded-lg border border-error/30 bg-error/5 p-3">
        <div className="flex items-start gap-2">
          <span className="text-error text-lg">⚠</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-error">{error}</p>
            {errorLine !== null && errorLine > 0 && inputLines.length >= errorLine && (
              <div className="mt-2 text-xs text-muted">
                <p>错误位置（行 {errorLine}）:</p>
                <div className="mt-1 rounded bg-error/10 p-2 overflow-x-auto max-h-[80px]">
                  {inputLines.slice(Math.max(0, errorLine - 3), errorLine + 2).map((line, idx) => {
                    const actualLineNum = Math.max(0, errorLine - 3) + idx + 1;
                    const isErrorLine = actualLineNum === errorLine;
                    return (
                      <div
                        key={idx}
                        className={`${isErrorLine ? 'bg-error/20 text-error font-semibold' : ''} px-2`}
                      >
                        <span className="inline-block w-8 text-right mr-2 opacity-60">
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
