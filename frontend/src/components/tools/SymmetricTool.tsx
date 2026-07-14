import React, { useState } from 'react';
import { useToolStore } from '@/store/toolStore';
import InputArea from '@/components/common/InputArea';
import OutputArea from '@/components/common/OutputArea';
import ActionBar from '@/components/common/ActionBar';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import useGoMethod from '@/hooks/useGoMethod';
import { SymmetricEncrypt, SymmetricDecrypt } from '@/utils/wailsApi';
import { SYMMETRIC_ALGORITHM_OPTIONS } from '@/utils/constants';

const SymmetricTool: React.FC = () => {
  const input = useToolStore((state) => state.input);
  const loading = useToolStore((state) => state.loading);
  const error = useToolStore((state) => state.error);

  const [algorithm, setAlgorithm] = useState('aes');
  const [key, setKey] = useState('');

  const { call: encryptCall } = useGoMethod(
    { methodName: 'SymmetricEncrypt', toolId: 'symmetric', action: 'encrypt' },
    SymmetricEncrypt,
  );
  const { call: decryptCall } = useGoMethod(
    { methodName: 'SymmetricDecrypt', toolId: 'symmetric', action: 'decrypt' },
    SymmetricDecrypt,
  );

  const handleEncrypt = async () => {
    await encryptCall(input, key, algorithm);
  };

  const handleDecrypt = async () => {
    await decryptCall(input, key, algorithm);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-text">对称加密</h2>
        <p className="text-sm text-muted">AES、SM4、3DES，Base64 输出含随机 IV 与完整性校验。</p>
      </div>

      <InputArea placeholder="请输入明文或 Base64 密文..." maxHeight="260px" />

      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <div>
          <label className="block text-sm font-medium text-text mb-1">密钥</label>
          <input
            type="text"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="请输入密钥..."
            className="w-full rounded-lg border border-border bg-surface text-text px-3 py-2 code-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            spellCheck={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">算法</label>
          <select
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value)}
            className="w-full rounded-lg border border-border bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
          >
            {SYMMETRIC_ALGORITHM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ActionBar
        actions={[
          {
            label: '加密',
            onClick: handleEncrypt,
            disabled: !key,
            loading,
          },
          {
            label: '解密',
            onClick: handleDecrypt,
            variant: 'secondary',
            disabled: !input.trim() || !key,
            loading,
          },
        ]}
      />

      {error && <ErrorDisplay />}
      <OutputArea label="密文 / 明文" />
    </div>
  );
};

export default SymmetricTool;
