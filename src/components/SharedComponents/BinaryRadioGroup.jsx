import React from 'react';

/**
 * BinaryRadioGroup
 * - 활성/비활성, 사용/중지처럼 두 가지 옵션 중 하나를 고를 때 사용하는 라디오 박스 세트입니다.
 * - options 배열을 수정하면 라벨과 값을 원하는 텍스트로 바꿀 수 있습니다.
 * - onChange는 `onChange(name, value)` 형태로 호출해 부모 폼에서 상태를 쉽게 업데이트하도록 구성했습니다.
 *
 * 사용 시나리오
 * 1. CRUD 폼에서 상태값을 고를 때 `<BinaryRadioGroup name="saleStatus" ... />`처럼 바로 사용합니다.
 * 2. inline=false로 넘기면 세로로 쌓인 라디오 박스 UI가 됩니다.
 * 3. disabled=true를 넘기면 전체 라디오가 비활성화되어 변경할 수 없도록 잠글 수 있습니다.
 *
 * props 요약
 * - name: 부모 폼 상태 객체의 키에 해당합니다. 예: saleStatus.
 * - value: 현재 선택된 값.
 * - onChange: 선택이 바뀌었을 때 호출할 함수. useApiFormHandler에서 내려주는 handleChange를 그대로 전달하면 됩니다.
 * - options: [{ value, label }] 구성. 필요 시 세 번째 요소를 추가해서 백엔드 전송 값 등을 맞춰도 됩니다.
 * - inline: true면 가로로 배치, false면 세로로 배치합니다.
 */
function BinaryRadioGroup({
  name,
  label,
  value,
  onChange,
  options = [
    { value: 'ACTIVE', label: '활성화' },
    { value: 'INACTIVE', label: '비활성화' },
  ],
  containerClassName = 'mb-3',
  labelClassName = 'form-label fw-semibold',
  inline = true,
  disabled = false,
}) {
  // 라디오가 변경되면 부모에서 내려준 onChange에 name과 값을 넘겨줍니다.
  const handleOptionChange = (event) => {
    if (disabled) {
      return;
    }
    const nextValue = event.target.value;
    if (typeof onChange === 'function') {
      onChange(name, nextValue);
    }
  };

  return (
    <div className={containerClassName}>
      {label && <div className={labelClassName}>{label}</div>}
      {/* inline 여부에 따라 가로 배치 혹은 세로 배치를 결정 */}
      <div className={inline ? 'd-flex gap-3' : ''}>
        {options.map((option) => (
          <div className="form-check" key={option.value}>
            <input
              className="form-check-input"
              type="radio"
              name={name}
              id={`${name}-${option.value}`}
              value={option.value}
              checked={value === option.value}
              onChange={handleOptionChange}
              disabled={disabled}
            />
            <label className="form-check-label" htmlFor={`${name}-${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BinaryRadioGroup;
