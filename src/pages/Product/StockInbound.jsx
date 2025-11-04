// src/product/StockInbound.jsx

import React, { useEffect } from 'react';
import axios from 'axios';
import TextField from '../../components/SharedComponents/TextField.jsx';
import BinaryRadioGroup from '../../components/SharedComponents/BinaryRadioGroup.jsx';
import AsyncSelect from '../../components/SharedComponents/AsyncSelect.jsx';
import TabSwitcher from '../../components/SharedComponents/TabSwitcher.jsx';
import { useApiFormHandler } from '../../components/SharedComponents/useApiFormHandler.jsx';

/**
 * ProductCrudFormExample
 * - 실제 CRUD 폼을 만들 때 복사용 템플릿입니다.
 * - productId가 있으면 수정 모드로 동작하고, 없으면 신규 생성으로 동작합니다.
 * - submitter에서 API 주소만 바꾸면 다른 폼에도 그대로 사용할 수 있습니다.
 *
 * 큰 흐름
 * 1. useApiFormHandler로 폼 상태(values)와 제출 로직(handleSubmit 등)을 세팅합니다.
 * 2. 화면 상단의 TabSwitcher로 productType을 선택하고, 이에 따라 다른 인풋/드롭다운 값이 바뀝니다.
 * 3. TextField, BinaryRadioGroup, AsyncSelect 등 재사용 컴포넌트를 조합해 폼을 구성합니다.
 * 4. 저장 버튼을 누르면 submitter가 실행되어 API로 값을 전송합니다.
 *
 * 실전에서 복사해 사용할 때
 * - DEFAULT_VALUES와 submitter 내부 API 경로만 다른 도메인(예: 회원, 예약 등)에 맞게 수정하면 빠르게 새로운 폼을 만들 수 있습니다.
 * - 특정 필드가 필요 없으면 해당 컴포넌트 블록(TextField 등)을 지우거나 props를 조정하면 됩니다.
 */
const PRODUCT_TABS = [
  { value: 'PRODUCT', label: '실물 상품' },
  { value: 'SERVICE', label: '서비스 상품' },
];

const DEFAULT_VALUES = {
  productType: 'PRODUCT',
  productName: '',
  salePrice: '',
  saleStatus: 'ACTIVE',
  categoryCode: '',
  memo: '',
};

function ProductCrudFormExample({ productId, onSuccess }) {
  /**
   * useApiFormHandler를 호출해서 폼 상태와 헬퍼 함수를 한 번에 얻습니다.
   * - values: 현재 입력된 값들
   * - handleChange: 각 인풋에 바로 연결 가능한 onChange
   * - handleSubmit: form onSubmit에 연결
   * - reset / setFieldValue: 개별 필드 초기화/수정
   */
  const {
    values,
    setValues,
    submitting,
    handleChange,
    handleSubmit,
    reset,
    setFieldValue,
  } = useApiFormHandler({
    initialValues: DEFAULT_VALUES,
    submitter: async (formValues) => {
      // 필요 시 숫자·날짜 변환 등을 normalizer에서 처리해도 됩니다.
      const payload = {
        ...formValues,
        salePrice: Number(formValues.salePrice || 0),
      };

      // productId가 있으면 수정(put), 없으면 생성(post)
      if (productId) {
        return axios.put(`/api/v1/product/${productId}`, payload);
      }
      return axios.post('/api/v1/product', payload);
    },
    onSuccess: (response) => {
      // onSuccess를 넘겨주면 상위 컴포넌트에서 라우팅/알림 처리 가능
      onSuccess?.(response);
    },
    onError: (_error) => {
      // 필요 시 토스트/alert 처리
      // alert('저장 실패');
    },
  });

  useEffect(() => {
    if (!productId) {
      return;
    }
    let isMounted = true;

    // 수정 모드일 때 기존 값을 채워 넣습니다.
    // 비동기 작업이 끝나기 전에 컴포넌트가 언마운트될 수 있으므로 isMounted 플래그를 사용합니다.
    axios
      .get(`/api/v1/product/${productId}`)
      .then(({ data }) => {
        if (!isMounted) return;
        setValues((prev) => ({
          ...prev,
          productType: data.productType ?? 'PRODUCT',
          productName: data.productName ?? '',
          salePrice: data.salePrice ?? '',
          saleStatus: data.saleStatus ?? 'ACTIVE',
          categoryCode: data.categoryCode ?? '',
          memo: data.memo ?? '',
        }));
      })
      .catch((err) => {
        console.error('상품 단건 조회 실패', err);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, setValues]);

  const handleTabChange = (nextValue) => {
    setFieldValue('productType', nextValue);
    // 탭이 바뀔 때 분류 목록을 다시 불러오고 싶다면 categoryCode 초기화
    setFieldValue('categoryCode', '');
  };

  return (
    <form className='product-crud-form' onSubmit={handleSubmit}>
      <h1 className="mb-5 mt-2">신규 상품 등록 하기</h1>
      {/* 탭 버튼을 클릭하면 productType 값이 바뀌고, 분류 드롭다운이 다시 로드됩니다. */}
      <TabSwitcher
        tabs={PRODUCT_TABS}
        activeValue={values.productType}
        onChange={handleTabChange}
        fullWidth
      />

      {/* 단일 텍스트 입력: 상품 이름 */}
      <TextField
        label='상품명'
        name='productName'
        value={values.productName}
        onChange={handleChange}
        placeholder='예: 초코 프로틴'
        required
        helpText="필수 입력. readOnly가 필요 없으면 props에서 제거하세요."
        inputProps={{ className: 'form-control product-name-input' }}
      />

      <TextField
        label='판매가'
        name='salePrice'
        type='number'
        value={values.salePrice}
        onChange={handleChange}
        placeholder='숫자만 입력'
        helpText='원단위 가격. 필요 시 통화 포맷터로 치환하세요.'
        inputProps={{ min: 0 }}
      />

      {/* 라디오 버튼: 판매 상태 */}
      <BinaryRadioGroup
        label='판매 상태'
        name='saleStatus'
        value={values.saleStatus}
        onChange={handleChange}
        options={[
          { value: 'ACTIVE', label: '판매중' },
          { value: 'INACTIVE', label: '판매중지' },
        ]}
      />

      {/* API 기반 드롭다운: 상품 분류 */}
      <AsyncSelect
        label='상품 분류'
        name='categoryCode'
        value={values.categoryCode}
        onChange={handleChange}
        endpoint={`/api/v1/categories/list/${values.productType}`}
        dependencies={[values.productType]} // 탭 변경 시 다시 로드
        mapOption={(row) => ({
          value: row.code ?? row.categoryCode,
          label: `${row.name ?? row.categoryName} (${row.code ?? row.categoryCode})`,
        })}
        helpText='다른 API를 쓰려면 endpoint와 mapOption을 원하는 형태로 바꾸세요.'
      />

      {/* textarea처럼 활용하고 싶으면 TextField의 inputProps로 제어 */}
      <TextField
        label='설명 / 메모'
        name='memo'
        value={values.memo}
        onChange={handleChange}
        placeholder='폼마다 다른 추가 정보를 기입합니다.'
        inputProps={{
          as: 'textarea', // textarea를 쓰려면 별도 컴포넌트로 교체하거나 inputProps에서 제거하세요.
          rows: 3,
          className: 'form-control',
        }}
      />

      <div className='d-flex gap-2'>
        <button
          type='submit'
          className='btn btn-primary'
          disabled={submitting}
        >
          {submitting ? '저장 중...' : '저장'}
        </button>
        <button
          type='button'
          className='btn btn-outline-secondary'
          onClick={() => reset(DEFAULT_VALUES)}
        >
          초기화
        </button>
      </div>
    </form>
  );
}

export default ProductCrudFormExample;
