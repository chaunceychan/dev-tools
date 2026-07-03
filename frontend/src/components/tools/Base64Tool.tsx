import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import FileDropArea from '@/components/common/FileDropArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import {
  Base64EncodeText,
  Base64DecodeText,
  Base64EncodeFile,
  Base64DecodeFile,
  SelectInputFile,
  SelectOutputFile,
} from '@/utils/wailsApi';

type Base64Mode = 'text' | 'file';

/**
 * Base64Tool — Base64 encoding/decoding tool with dual modes:
 * - Text mode: encode/decode text strings
 * - File mode: encode/decode files (with drag-and-drop support)
 */
const Base64Tool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const [mode, setMode] = useState<Base64Mode>('text');
  const [filePath, setFilePath] = useState<string>('');

  const { call: encodeTextCall } = useGoMethod('Base64EncodeText', Base64EncodeText);
  const { call: decodeTextCall } = useGoMethod('Base64DecodeText', Base64DecodeText);
  const { call: encodeFileCall } = useGoMethod('Base64EncodeFile', Base64EncodeFile);
  const { call: decodeFileCall } = useGoMethod('Base64DecodeFile', Base64DecodeFile);
  const { call: selectInputFileCall } = useGoMethod('SelectInputFile', SelectInputFile);
  const { call: selectOutputFileCall } = useGoMethod('SelectOutputFile', SelectOutputFile);

  const handleEncode = async () => {
    if (mode === 'text') {
      if (!input.trim()) return;
      await encodeTextCall(input);
    } else {
      if (!filePath) return;
      await encodeFileCall(filePath);
    }
  };

  const handleDecode = async () => {
    if (mode === 'text') {
      if (!input.trim()) return;
      await decodeTextCall(input);
    } else {
      if (!filePath) return;
      const outputPath = await selectOutputFileCall(defaultDecodedName(filePath));
      if (!outputPath) return;
      await decodeFileCall(filePath, outputPath);
    }
  };

  const handleFileSelected = (path: string) => {
    setFilePath(path);
  };

  const handleBrowseFile = async () => {
    const selectedPath = await selectInputFileCall();
    if (selectedPath) {
      setFilePath(selectedPath);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Base64 编解码</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('text'); setFilePath(''); }}
            className={`px-3 py-1 rounded text-sm ${mode === 'text' ? 'bg-primary text-white' : 'bg-surface text-text border border-border'}`}
          >
            文本模式
          </button>
          <button
            onClick={() => setMode('file')}
            className={`px-3 py-1 rounded text-sm ${mode === 'file' ? 'bg-primary text-white' : 'bg-surface text-text border border-border'}`}
          >
            文件模式
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <>
          <InputArea placeholder="请输入需要编码/解码的文本..." />
          <ActionBar
            actions={[
              { label: '编码', onClick: handleEncode, disabled: !input.trim(), loading },
              { label: '解码', onClick: handleDecode, variant: 'secondary', disabled: !input.trim(), loading },
            ]}
          />
        </>
      ) : (
        <>
          <FileDropArea onFileSelected={handleFileSelected} onBrowse={handleBrowseFile} />
          {filePath && (
            <p className="text-sm text-muted">已选择文件: {filePath}</p>
          )}
          <ActionBar
            actions={[
              { label: '文件编码', onClick: handleEncode, disabled: !filePath, loading },
              { label: '文件解码', onClick: handleDecode, variant: 'secondary', disabled: !filePath, loading },
            ]}
          />
        </>
      )}

      {error && <ErrorDisplay />}
      <OutputArea />
    </div>
  );
};

function defaultDecodedName(filePath: string): string {
  const fileName = filePath.split(/[\\/]/).pop() || 'decoded.bin';
  if (/\.[^.]+$/.test(fileName)) {
    return fileName.replace(/\.[^.]+$/, '.decoded');
  }
  return `${fileName}.decoded`;
}

export default Base64Tool;
