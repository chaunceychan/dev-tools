import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import OutputArea from '@/components/common/OutputArea';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { RegexTest } from '@/utils/wailsApi';
import { REGEX_VALIDATOR_PRESETS } from '@/utils/constants';

const RegexValidatorTool: React.FC = () => {
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [validateResult, setValidateResult] = useState<{ valid: boolean; detail: string } | null>(null);

  const { call: testCall } = useGoMethod('RegexTest', RegexTest);

  const currentPreset = REGEX_VALIDATOR_PRESETS.find((p) => p.name === selectedPreset);

  const handlePresetClick = (name: string) => {
    setSelectedPreset(name);
    setValidateResult(null);
    setText('');
  };

  const handleValidate = async () => {
    if (!currentPreset || !text.trim()) return;
    useToolStore.setState({ output: '', error: '' });
    try {
      const result = await testCall(currentPreset.pattern, text.trim());
      const resultStr = String(result ?? '');
      const hasMatch = resultStr.length > 0 && !resultStr.startsWith('No matches');
      setValidateResult({
        valid: hasMatch,
        detail: resultStr,
      });
    } catch {
      // error handled by useGoMethod
    }
  };

  const inputClass = 'w-full rounded-lg border border-border bg-surface text-text p-3 code-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text">常用校验</h2>

      <div className="flex gap-4">
        {/* Left: Preset list */}
        <div className="w-40 shrink-0 space-y-0.5">
          <label className="block text-sm font-medium text-text mb-1">预设规则</label>
          {REGEX_VALIDATOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset.name)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors
                ${selectedPreset === preset.name
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text border border-border hover:border-primary/50'
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Right: Validation area */}
        <div className="flex-1 space-y-3">
          {!currentPreset ? (
            <div className="flex items-center justify-center h-32 text-muted text-sm">
              ← 请从左侧选择一个预设规则
            </div>
          ) : (
            <>
              {/* Pattern display */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">正则表达式</label>
                <div className="w-full rounded-lg border border-border bg-surface/50 text-muted p-3 code-text text-sm">
                  {currentPreset.pattern}
                </div>
              </div>

              {/* Text input */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">待验证文本</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="请输入需要验证的文本..."
                  className={`${inputClass} resize-y min-h-[100px]`}
                  spellCheck={false}
                />
              </div>

              {/* Validate button */}
              <button
                onClick={handleValidate}
                disabled={!text.trim() || loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${loading
                    ? 'bg-primary/50 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                  }`}
              >
                {loading ? '验证中...' : '验证'}
              </button>

              {/* Validation result */}
              {validateResult && (
                <div className={`rounded-lg border p-3 ${
                  validateResult.valid
                    ? 'border-success/30 bg-success/5'
                    : 'border-error/30 bg-error/5'
                }`}>
                  <p className={`text-sm font-semibold ${validateResult.valid ? 'text-success' : 'text-error'}`}>
                    {validateResult.valid
                      ? `✅ 是${currentPreset.label.replace('校验', '')}`
                      : `❌ 不是${currentPreset.label.replace('校验', '')}`}
                  </p>
                  {validateResult.detail && (
                    <pre className="mt-2 text-xs text-muted whitespace-pre-wrap">{validateResult.detail}</pre>
                  )}
                </div>
              )}
            </>
          )}

          {error && <ErrorDisplay />}
          <OutputArea />
        </div>
      </div>
    </div>
  );
};

export default RegexValidatorTool;
