import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

/**
 * AsyncSelect
 * - 서버에서 받아온 목록을 기반으로 드롭다운을 구성하는 컴포넌트입니다.
 * - endpoint를 넘기면 마운트될 때 자동으로 axios.get을 호출해 데이터를 가져옵니다.
 * - options props를 직접 전달하면 API 호출 없이 고정 목록으로도 사용 가능합니다.
 *
 * 흐름 설명
 * 1. 컴포넌트가 렌더링되면 shouldFetch 조건을 검사합니다.
 * 2. endpoint가 있고 autoLoad=true이며, options props가 따로 없으면 fetchOptions가 실행됩니다.
 * 3. axios로 받은 데이터를 mapOption 함수로 `{ value, label }` 구조로 변환한 뒤 select 옵션으로 렌더링합니다.
 * 4. 사용자가 값을 선택하면 onChange가 호출되고, 부모 컴포넌트에 `{ target: { name, value } }` 형태로 값을 넘겨줍니다.
 *
 * 자주 조정하는 포인트
 * - params: API에 query string을 붙이고 싶을 때 사용합니다.
 * - dependencies: 특정 상태가 바뀔 때마다 다시 데이터를 받아오고 싶다면 배열에 해당 상태를 넣어주세요.
 * - mapOption: 백엔드 응답 구조가 다르면 이 함수를 수정해 value/label을 원하는 값으로 만들어주세요.
 */
function AsyncSelect({
  label,
  name,
  id = name,
  value,
  onChange,
  endpoint,
  params,
  options,
  mapOption = (row) => ({ value: row.id, label: row.name }),
  allowEmptyOption = true,
  placeholderOption = '선택하세요',
  containerClassName = 'mb-3',
  labelClassName = 'form-label fw-semibold',
  className = 'form-select',
  disabled = false,
  autoLoad = true,
  dependencies = [],
  helpText,
  selectProps = {},
}) {
  const [fetchedOptions, setFetchedOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // options props가 없고 endpoint가 있을 때만 실제로 API를 호출합니다.
  const shouldFetch = autoLoad && endpoint && !options;

  useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(endpoint, { params });
        const rows = Array.isArray(response.data) ? response.data : response.data?.list ?? [];
        const normalized = rows.map(mapOption);
        if (isMounted) {
          setFetchedOptions(normalized);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setFetchedOptions([]);
          console.error('AsyncSelect fetch error', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (shouldFetch) {
      fetchOptions();
    }

    return () => {
      isMounted = false;
    };
    // dependencies 배열과 params 객체가 바뀌면 목록을 다시 불러옵니다.
  }, [shouldFetch, endpoint, JSON.stringify(params ?? {}), ...dependencies]);

  const optionList = useMemo(() => {
    if (Array.isArray(options)) {
      return options;
    }
    return fetchedOptions;
  }, [options, fetchedOptions]);

  const handleChangeInternal = (event) => {
    const nextValue = event.target.value;
    if (typeof onChange === 'function') {
      onChange({ target: { name, value: nextValue } });
    }
  };

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChangeInternal}
        className={className}
        disabled={disabled || loading}
        {...selectProps} // size, multiple 등 커스터마이즈
      >
        {allowEmptyOption && <option value="">{placeholderOption}</option>}
        {optionList.map((optionItem) => (
          <option key={optionItem.value} value={optionItem.value}>
            {optionItem.label}
          </option>
        ))}
      </select>
      {loading && <small className="text-muted d-block mt-1">목록을 불러오는 중...</small>}
      {error && (
        <small className="text-danger d-block mt-1">
          목록을 불러오지 못했습니다. endpoint나 params 값을 확인하세요.
        </small>
      )}
      {helpText && <small className="form-text text-muted">{helpText}</small>}
    </div>
  );
}

export default AsyncSelect;
