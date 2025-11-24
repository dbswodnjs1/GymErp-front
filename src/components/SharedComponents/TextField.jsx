import React from 'react';

/**
 * TextField
 * - 라벨과 인풋을 세트로 렌더링합니다.
 * - className, readOnly, helpText 등으로 상황에 맞게 조정하세요.
 * - 필요 없는 속성은 제거하거나 다른 값으로 덮어쓰면 됩니다.
 *
 * 주요 활용 방식
 * 1. CRUD 폼에서 제품명, 가격 등 단일 값을 입력받고 싶을 때 가져와서 사용합니다.
 * 2. 필수 값 여부, placeholder, readOnly 여부 등을 props로 바로 제어할 수 있습니다.
 * 3. bootstrap 스타일을 기본값으로 넣어두었으므로 className을 원하는 값으로 덮어쓰면 됩니다.
 *
 * props 안내
 * - label: 인풋 위에 보여줄 라벨 텍스트. falsey하면 라벨이 렌더되지 않습니다.
 * - name/id: form 제출 시 사용할 필드 이름. id가 없으면 name을 그대로 씁니다.
 * - value/onChange: 부모(useApiFormHandler 등)에서 내려주는 상태와 변경 함수.
 * - inputProps: size, min, max 등 input 태그에 그대로 전달할 추가 속성.
 *
 * 복사해서 쓰는 경우
 * - helpText나 readOnly가 필요 없으면 해당 props 자체를 제거하세요.
 * - textarea처럼 다른 태그가 필요하면 이 컴포넌트를 참고해 별도 컴포넌트를 만들거나 inputProps로 제어합니다.
 */
function TextField({
  label,
  name,
  id = name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  readOnly = false,
  className = 'form-control',
  containerClassName = 'mb-3',
  labelClassName = 'form-label fw-semibold',
  helpText,
  autoFocus = false,
  inputProps = {},
}) {
  // label이 없으면 div 안에 input만 나타나도록 구성합니다.
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        autoFocus={autoFocus}
        className={className}
        {...inputProps} // 필요 시 size, min, max 등 추가
      />
      {helpText && <small className="form-text text-muted">{helpText}</small>}
    </div>
  );
}

export default TextField;
