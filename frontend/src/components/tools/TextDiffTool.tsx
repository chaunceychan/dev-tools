import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import CopyButton from '@/components/common/CopyButton';
import useGoMethod from '@/hooks/useGoMethod';
import {
  SelectInputFile,
  TextDiffCompareFiles,
  TextDiffCompareText,
} from '@/utils/wailsApi';

type DiffMode = 'text' | 'file';
type DiffView = 'unified' | 'split';

interface SideBySideRow {
  kind: 'hunk' | 'content';
  text?: string;
  leftNumber?: number;
  rightNumber?: number;
  leftText?: string;
  rightText?: string;
  leftType?: 'context' | 'delete' | 'empty';
  rightType?: 'context' | 'insert' | 'empty';
}

/**
 * TextDiffTool — compares two text sources and renders a readable line diff.
 * Supports direct text comparison and file-to-file comparison.
 */
const TextDiffTool: React.FC = () => {
  const output = useToolStore((state) => state.output);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);
  const clear = useToolStore((state) => state.clear);

  const [mode, setMode] = useState<DiffMode>('text');
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [leftFilePath, setLeftFilePath] = useState('');
  const [rightFilePath, setRightFilePath] = useState('');

  const { call: compareTextCall } = useGoMethod(
    { methodName: 'TextDiffCompareText', toolId: 'text-diff', action: 'compareText' },
    TextDiffCompareText,
  );
  const { call: compareFilesCall } = useGoMethod(
    { methodName: 'TextDiffCompareFiles', toolId: 'text-diff', action: 'compareFiles' },
    TextDiffCompareFiles,
  );
  const { call: selectInputFileCall } = useGoMethod('SelectInputFile', SelectInputFile);

  const handleModeChange = (nextMode: DiffMode) => {
    setMode(nextMode);
    clear();
  };

  const handleCompareText = async () => {
    await compareTextCall(leftText, rightText);
  };

  const handleCompareFiles = async () => {
    if (!leftFilePath || !rightFilePath) return;
    await compareFilesCall(leftFilePath, rightFilePath);
  };

  const handleBrowseFile = async (side: 'left' | 'right') => {
    const selectedPath = await selectInputFileCall();
    if (!selectedPath) return;

    if (side === 'left') {
      setLeftFilePath(selectedPath);
      return;
    }

    setRightFilePath(selectedPath);
  };

  const canCompareText = leftText.trim().length > 0 || rightText.trim().length > 0;
  const canCompareFiles = Boolean(leftFilePath && rightFilePath);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text">文本 Diff</h2>
          <p className="text-sm text-muted">比较两段文本，或者比较两个文本文件。</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('text')}
            className={`px-3 py-1 rounded text-sm ${
              mode === 'text' ? 'bg-primary text-white' : 'bg-surface text-text border border-border'
            }`}
          >
            文本模式
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('file')}
            className={`px-3 py-1 rounded text-sm ${
              mode === 'file' ? 'bg-primary text-white' : 'bg-surface text-text border border-border'
            }`}
          >
            文件模式
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            <DiffTextArea
              label="左侧文本"
              placeholder="请输入第一段文本..."
              value={leftText}
              onChange={setLeftText}
            />
            <DiffTextArea
              label="右侧文本"
              placeholder="请输入第二段文本..."
              value={rightText}
              onChange={setRightText}
            />
          </div>
          <ActionBar
            actions={[
              {
                label: '比较文本',
                onClick: handleCompareText,
                disabled: !canCompareText,
                loading,
              },
            ]}
          />
        </>
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            <DiffFilePicker
              label="左侧文件"
              path={leftFilePath}
              onBrowse={() => handleBrowseFile('left')}
            />
            <DiffFilePicker
              label="右侧文件"
              path={rightFilePath}
              onBrowse={() => handleBrowseFile('right')}
            />
          </div>
          <ActionBar
            actions={[
              {
                label: '比较文件',
                onClick: handleCompareFiles,
                disabled: !canCompareFiles,
                loading,
              },
            ]}
          />
        </>
      )}

      {error && <ErrorDisplay />}
      <DiffOutputPanel output={output} />
    </div>
  );
};

interface DiffTextAreaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const DiffTextArea: React.FC<DiffTextAreaProps> = ({
  label,
  placeholder,
  value,
  onChange,
}) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[220px] rounded-lg border border-border bg-surface text-text p-3 code-text resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
      spellCheck={false}
    />
  </div>
);

interface DiffFilePickerProps {
  label: string;
  path: string;
  onBrowse: () => void;
}

const DiffFilePicker: React.FC<DiffFilePickerProps> = ({ label, path, onBrowse }) => (
  <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm font-medium text-text">{label}</label>
      <button
        type="button"
        onClick={onBrowse}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text transition-colors hover:border-primary/50 hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        选择文件
      </button>
    </div>
    <div className="rounded-lg border border-border bg-code-bg px-3 py-2 text-sm text-code-text code-text break-all min-h-[88px]">
      {path || <span className="text-muted">尚未选择文件</span>}
    </div>
  </div>
);

interface DiffOutputPanelProps {
  output: string;
}

const DiffOutputPanel: React.FC<DiffOutputPanelProps> = ({ output }) => {
  const [view, setView] = useState<DiffView>('split');
  const lines = output ? output.split('\n') : [];
  const parsed = parseUnifiedDiff(output);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-text">Diff 结果</label>
        <div className="flex items-center gap-2">
          {output && (
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setView('split')}
                className={`px-3 py-1 text-xs ${view === 'split' ? 'bg-primary text-white' : 'bg-surface text-text'}`}
              >
                并排视图
              </button>
              <button
                type="button"
                onClick={() => setView('unified')}
                className={`px-3 py-1 text-xs border-l border-border ${view === 'unified' ? 'bg-primary text-white' : 'bg-surface text-text'}`}
              >
                Unified
              </button>
            </div>
          )}
          {output && <CopyButton text={output} />}
        </div>
      </div>
      <div className="w-full rounded-lg border border-border bg-code-bg overflow-hidden min-h-[180px]">
        {!output ? (
          <div className="p-3 text-muted code-text">等待比较结果...</div>
        ) : parsed.isNoChanges ? (
          <div className="p-3 code-text text-sm text-muted whitespace-pre-wrap">{output}</div>
        ) : view === 'split' ? (
          <SplitDiffView parsed={parsed} />
        ) : (
          <div className="max-h-[360px] overflow-auto code-text text-sm">
            {lines.map((line, index) => (
              <div
                key={`${index}-${line}`}
                className={`px-3 py-1 whitespace-pre-wrap break-all border-b border-border/40 last:border-b-0 ${diffLineClassName(line)}`}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ParsedUnifiedDiff {
  leftLabel: string;
  rightLabel: string;
  bodyLines: string[];
  rows: SideBySideRow[];
  isNoChanges: boolean;
}

const SplitDiffView: React.FC<{ parsed: ParsedUnifiedDiff }> = ({ parsed }) => (
  <div className="max-h-[420px] overflow-auto">
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-border bg-surface text-xs font-medium text-muted">
      <div className="px-3 py-2 border-r border-border">{parsed.leftLabel || '左侧'}</div>
      <div className="px-3 py-2">{parsed.rightLabel || '右侧'}</div>
    </div>
    <div className="text-sm code-text">
      {parsed.rows.map((row, index) => (
        row.kind === 'hunk' ? (
          <div
            key={`hunk-${index}-${row.text}`}
            className="px-3 py-1 bg-primary-subtle text-primary border-b border-border/40"
          >
            {row.text}
          </div>
        ) : (
          <div
            key={`row-${index}-${row.leftNumber ?? 'x'}-${row.rightNumber ?? 'y'}`}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-border/40"
          >
            <DiffSideCell
              lineNumber={row.leftNumber}
              text={row.leftText ?? ''}
              tone={row.leftType ?? 'empty'}
              bordered
            />
            <DiffSideCell
              lineNumber={row.rightNumber}
              text={row.rightText ?? ''}
              tone={row.rightType ?? 'empty'}
            />
          </div>
        )
      ))}
    </div>
  </div>
);

interface DiffSideCellProps {
  lineNumber?: number;
  text: string;
  tone: 'context' | 'delete' | 'insert' | 'empty';
  bordered?: boolean;
}

const DiffSideCell: React.FC<DiffSideCellProps> = ({ lineNumber, text, tone, bordered = false }) => (
  <div className={`grid grid-cols-[48px_minmax(0,1fr)] ${bordered ? 'border-r border-border' : ''} ${diffCellClassName(tone)}`}>
    <div className="px-2 py-1 text-right text-xs text-muted border-r border-border/40 select-none">
      {lineNumber ?? ''}
    </div>
    <div className="px-3 py-1 whitespace-pre-wrap break-all">{text}</div>
  </div>
);

function diffLineClassName(line: string): string {
  if (line.startsWith('+++ ') || line.startsWith('--- ')) {
    return 'bg-surface text-primary font-medium';
  }

  if (line.startsWith('@@')) {
    return 'bg-primary-subtle text-primary';
  }

  if (line.startsWith('+')) {
    return 'bg-success-subtle text-success';
  }

  if (line.startsWith('-')) {
    return 'bg-error-subtle text-error';
  }

  if (line.startsWith('两段内容一致')) {
    return 'text-muted';
  }

  return 'text-code-text';
}

function diffCellClassName(tone: DiffSideCellProps['tone']): string {
  switch (tone) {
    case 'delete':
      return 'bg-error-subtle text-error';
    case 'insert':
      return 'bg-success-subtle text-success';
    case 'empty':
      return 'bg-surface/40 text-muted';
    default:
      return 'text-code-text';
  }
}

function parseUnifiedDiff(output: string): ParsedUnifiedDiff {
  const lines = output ? output.split('\n') : [];
  const leftLabel = lines.find((line) => line.startsWith('--- '))?.slice(4) ?? '左侧';
  const rightLabel = lines.find((line) => line.startsWith('+++ '))?.slice(4) ?? '右侧';
  const bodyLines = lines.filter((line) => !line.startsWith('--- ') && !line.startsWith('+++ '));
  const isNoChanges = bodyLines.some((line) => line.startsWith('两段内容一致'));

  return {
    leftLabel,
    rightLabel,
    bodyLines,
    rows: isNoChanges ? [] : buildSideBySideRows(bodyLines),
    isNoChanges,
  };
}

function buildSideBySideRows(lines: string[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let leftLine = 1;
  let rightLine = 1;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (line.startsWith('@@')) {
      rows.push({ kind: 'hunk', text: line });
      const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        leftLine = Number(match[1]);
        rightLine = Number(match[2]);
      }
      continue;
    }

    if (line.startsWith(' ')) {
      rows.push({
        kind: 'content',
        leftNumber: leftLine,
        rightNumber: rightLine,
        leftText: line.slice(1),
        rightText: line.slice(1),
        leftType: 'context',
        rightType: 'context',
      });
      leftLine++;
      rightLine++;
      continue;
    }

    if (line.startsWith('-')) {
      const deleted: string[] = [];
      while (index < lines.length && lines[index].startsWith('-')) {
        deleted.push(lines[index].slice(1));
        index++;
      }

      const inserted: string[] = [];
      while (index < lines.length && lines[index].startsWith('+')) {
        inserted.push(lines[index].slice(1));
        index++;
      }
      index--;

      const pairCount = Math.max(deleted.length, inserted.length);
      for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
        const leftText = deleted[pairIndex] ?? '';
        const rightText = inserted[pairIndex] ?? '';
        const hasLeft = pairIndex < deleted.length;
        const hasRight = pairIndex < inserted.length;

        rows.push({
          kind: 'content',
          leftNumber: hasLeft ? leftLine : undefined,
          rightNumber: hasRight ? rightLine : undefined,
          leftText,
          rightText,
          leftType: hasLeft ? 'delete' : 'empty',
          rightType: hasRight ? 'insert' : 'empty',
        });

        if (hasLeft) leftLine++;
        if (hasRight) rightLine++;
      }
      continue;
    }

    if (line.startsWith('+')) {
      rows.push({
        kind: 'content',
        rightNumber: rightLine,
        leftText: '',
        rightText: line.slice(1),
        leftType: 'empty',
        rightType: 'insert',
      });
      rightLine++;
    }
  }

  return rows;
}

export default TextDiffTool;
