import React from 'react';

/**
 * TabSwitcher
 * - 버튼 그룹을 활용해 탭 전환 UI를 단순하게 구현한 컴포넌트입니다.
 * - "실물 상품 / 서비스 상품"과 같이 콘텐츠 영역을 전환할 때 사용합니다.
 * - tabs 배열에 value와 label을 넣으면 버튼이 자동으로 생성됩니다.
 *
 * 동작 개요
 * 1. 부모 컴포넌트가 activeValue 상태를 관리합니다. (예: useState로 product/service 구분)
 * 2. 사용자가 버튼을 클릭하면 onChange가 호출되고, 부모에서 activeValue를 업데이트합니다.
 * 3. activeValue와 일치하는 버튼은 강조 스타일(activeButtonClassName)을 사용합니다.
 *
 * 커스터마이즈 포인트
 * - buttonClassName / activeButtonClassName에 원하는 부트스트랩 클래스나 커스텀 클래스를 넣어서 스타일을 변경할 수 있습니다.
 * - fullWidth=true로 넘기면 버튼 그룹이 가로 폭을 꽉 채우도록 구성됩니다.
 */
function TabSwitcher({
  tabs,
  activeValue,
  onChange,
  className = 'btn-group mb-3',
  buttonClassName = 'btn btn-outline-primary',
  activeButtonClassName = 'btn btn-primary',
  fullWidth = false,
  name = 'tabSwitcher',
  disabled = false,
}) {
  const wrapperClass = fullWidth ? `${className} w-100` : className;

  return (
    <div className={wrapperClass} role="group" aria-label={name}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue;
        const isButtonDisabled = disabled || tab.disabled;
        const btnClass = isActive ? activeButtonClassName : buttonClassName;
        return (
          <button
            key={tab.value}
            type="button"
            className={`${btnClass}${isButtonDisabled ? ' disabled' : ''}`}
            onClick={isButtonDisabled ? undefined : () => onChange(tab.value)}
            disabled={isButtonDisabled}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default TabSwitcher;
