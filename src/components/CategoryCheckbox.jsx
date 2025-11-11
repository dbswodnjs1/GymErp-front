import axios from 'axios';
import React, { useEffect, useState } from 'react';


// 부모로부터 'codeAId' (어떤 2뎁스인지)와
// 'checkedList' (현재 체크된 값), 'onChange' (변경 알림 함수)를 받음
function CategoryCheckbox({ codeAId, checkedList, onChange }) {

// 1. API로 불러올 옵션 목록 (예: [{codeBId: 'DRINK', name: '음료'}])
  const [options, setOptions] = useState([]);

  // 2. 'codeAId' prop이 바뀔 때마다 API를 호출해서 옵션을 새로 가져옴
  useEffect(() => {
    // codeAId가 유효할 때만 API 호출 (e.g., 'PRODUCT' or 'SERVICE')
    if (codeAId) {
      // (예시 API) 부모 ID로 자식 코드 목록(3뎁스)을 가져옴
      axios.get(`/v1/categories/list/${codeAId}`)
        .then(res => {
          setOptions(res.data); // API 응답으로 옵션 state 설정
        })
        .catch(error => console.error("카테고리 로딩 실패:", error));
    } else {
      setOptions([]); // codeAId 없으면 옵션 비우기
    }
  }, [codeAId]); // 'codeAId'가 바뀔 때마다 이 코드가 다시 실행됨

  // 3. 체크박스 클릭 시 실행될 함수
  const handleChange = (e) => {
    const { value, checked } = e.target;
    
    // 4. 부모가 알려준 "현재 체크된 목록"을 기준으로 새 목록을 만듦
    let newCheckedList;
    if (checked) {
      newCheckedList = [...checkedList, value]; // 체크됨: 리스트에 추가
    } else {
      newCheckedList = checkedList.filter(item => item !== value); // 체크 해제: 리스트에서 제거
    }
    
    // 5. 부모가 준 'onChange' 함수를 호출해 새 목록을 "보고"
    onChange(newCheckedList);
  };

    return <>
      <div className="row g-2 border rounded shadow-sm pb-2">
        {options.map(opt => (
          <div className="col-4" key={opt.codeBId}>
            <label>
              <input
                className='form-check-input'
                type="checkbox"
                value={opt.codeBId}
                // "부모가 알려준" checkedList에 내가 포함되어 있는지 확인
                checked={checkedList.includes(opt.codeBId)}
                onChange={handleChange}
              />
              {opt.codeBName}
            </label>
          </div>

        ))}

      </div>
    </>
}

export default CategoryCheckbox;