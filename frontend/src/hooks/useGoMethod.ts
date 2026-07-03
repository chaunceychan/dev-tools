import { useToolStore } from '@/store/toolStore';
import type { GoMethodFn } from '@/types/wails';

/**
 * useGoMethod — generic hook that wraps a Wails Go method call
 * with automatic loading/error/output state management via toolStore.
 *
 * Usage:
 *   const { call } = useGoMethod('JsonFormat', JsonFormat);
 *   const result = await call(input, 2);
 *   // toolStore.output and toolStore.error are automatically updated
 */
function useGoMethod<T>(methodName: string, goMethod: GoMethodFn<T>) {
  const call = async (...args: any[]): Promise<T> => {
    useToolStore.setState({ loading: true, error: '' });

    try {
      const result = await goMethod(...args);
      useToolStore.setState({
        output: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        loading: false,
        error: '',
      });
      return result;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      useToolStore.setState({
        error: errorMsg,
        loading: false,
      });
      throw err;
    }
  };

  return { call };
}

export default useGoMethod;
