import React, { useState, useCallback } from 'react';
import { MAX_FILE_SIZE_MB } from '@/utils/constants';

/**
 * FileDropArea — File drag-and-drop area for Base64 file operations.
 * Also supports file selection via Wails Dialog or HTML input.
 */
interface FileDropAreaProps {
  onFileSelected: (filePath: string) => void;
  onBrowse?: () => void;
  accept?: string;
}

const FileDropArea: React.FC<FileDropAreaProps> = ({
  onFileSelected,
  onBrowse,
  accept = '*',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // In Wails WebView, we can access the file name but not the full path
      // For desktop apps, the path is available via file.path in some environments
      const filePath = (file as any).path || file.name;
      setFileName(file.name);
      onFileSelected(filePath);
    }
  }, [onFileSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const filePath = (file as any).path || file.name;
      setFileName(file.name);
      onFileSelected(filePath);
    }
  }, [onFileSelected]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text mb-1">文件输入</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full rounded-lg border-2 transition-colors p-6 text-center cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-surface hover:border-primary/50'
          }`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">📁</span>
          <p className="text-sm text-muted">
            {fileName
              ? `已选择: ${fileName}`
              : '拖拽文件到此处，或点击下方按钮选择文件'
            }
          </p>
          <p className="text-xs text-muted">
            最大文件大小: {MAX_FILE_SIZE_MB}MB
          </p>
          <input
            type="file"
            onChange={handleFileInput}
            accept={accept}
            className="hidden"
          />
          {onBrowse && (
            <button
              type="button"
              onClick={onBrowse}
              className="mt-2 rounded border border-border bg-bg px-3 py-1.5 text-sm text-text hover:border-primary/50"
            >
              选择文件
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDropArea;
