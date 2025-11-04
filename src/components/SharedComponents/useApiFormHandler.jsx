import { useCallback, useState } from 'react';

/**
 * useApiFormHandler
 * - initialValues: 기본 폼 상태 (복사 후 필요 값만 남기세요)
 * - submitter: async 함수. axios.post/put 등을 호출하도록 구현하면 됩니다.
 * - onSuccess/onError: 필요 시 알림, 페이지 이동 등을 처리.
 *
 * 이 훅이 필요한 이유
 * - 여러 폼에서 비슷한 상태 관리 로직(값 업데이트, 제출, 초기화)을 반복하게 되기 때문입니다.
 * - 이 훅을 쓰면 폼 컴포넌트는 입력 요소를 배치하는 것에 집중하고, 여기서 form state와 제출 과정을 대신 처리합니다.
 *
 * 기본 흐름
 * 1. initialValues를 기반으로 내부 values 상태를 만듭니다.
 * 2. 폼 인풋에서 handleChange를 내려받아 name/value를 업데이트합니다.
 * 3. 폼 onSubmit에 handleSubmit을 연결하면 submitter가 호출되고, 성공/실패 핸들러가 실행됩니다.
 * 4. reset, setFieldValue로 특정 필드를 초기화하거나 직접 수정할 수 있습니다.
 *
 * 사용 예시
 * const form = useApiFormHandler({
 *   initialValues: { productName: '', price: 0 },
 *   submitter: (payload) => axios.post('/api/v1/product', payload),
 * });
 * <form onSubmit={form.handleSubmit}>
 *   <input name="productName" value={form.values.productName} onChange={form.handleChange} />
 * </form>
 */
export function useApiFormHandler({
  initialValues,
  submitter,
  onSuccess,
  onError,
  normalizer,
}) {
  // values에는 폼에서 사용하는 모든 필드가 담긴다.
  const [values, setValues] = useState(initialValues);
  // submitting은 버튼 비활성화나 로딩 스피너를 제어할 때 사용한다.
  const [submitting, setSubmitting] = useState(false);

  /**
   * handleChange
   * - 두 가지 형태를 지원합니다.
   *   1) event 객체를 그대로 넘길 때: `<input onChange={handleChange} />`
   *   2) name/value를 직접 넘길 때: `handleChange('saleStatus', 'ACTIVE')`
   * - checkbox일 경우 checked 값을 사용하도록 처리했습니다.
   */
  const handleChange = useCallback((eventOrName, maybeValue) => {
    if (typeof eventOrName === 'string') {
      setValues((prev) => ({
        ...prev,
        [eventOrName]: maybeValue,
      }));
      return;
    }

    const { name, type, value, checked } = eventOrName.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  }, []);

  /**
   * reset
   * - 폼을 최초 상태로 돌리거나, 새로운 기본값을 받아서 덮어쓰고 싶을 때 사용합니다.
   */
  const reset = useCallback((nextValues = initialValues) => {
    setValues(nextValues);
  }, [initialValues]);

  /**
   * setFieldValue
   * - 특정 필드만 따로 업데이트하고 싶을 때 사용합니다.
   * - 예: setFieldValue('categoryCode', '') 로 초기화 등.
   */
  const setFieldValue = useCallback((fieldName, nextValue) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: nextValue,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();
      if (!submitter) return;

      const payload = typeof normalizer === 'function' ? normalizer(values) : values;

      try {
        setSubmitting(true);
        // 실제 API 요청을 수행한다. submitter는 axios.post 등 비동기 함수를 넘겨준다.
        const response = await submitter(payload);
        // 성공 시 콜백이 있다면 알림, 페이지 이동 등을 수행할 수 있다.
        onSuccess?.(response, payload);
      } catch (err) {
        console.error('useApiFormHandler submit error', err);
        onError?.(err, payload);
      } finally {
        setSubmitting(false);
      }
    },
    [normalizer, onError, onSuccess, submitter, values]
  );

  return {
    values,
    setValues,
    submitting,
    handleChange,
    handleSubmit,
    reset,
    setFieldValue,
  };
}
