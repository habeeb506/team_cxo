import { useCallback, useState } from 'react';

/**
 * Generic wrapper for imperative write operations (create/update/delete).
 * Every form submit or delete action goes through this instead of
 * hand-rolling its own isLoading/error state.
 *
 * Usage:
 *   const { mutate, isLoading, error } = useMutation((payload) => cxoTeamApiService.create(payload));
 *   await mutate(formValues);
 */
export default function useMutation(mutationFn) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return { mutate, isLoading, error, data, reset };
}
