// src/pages/Product/ProductUpdate.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TextField from '../../components/SharedComponents/TextField';
import TabSwitcher from '../../components/SharedComponents/TabSwitcher';
import BinaryRadioGroup from '../../components/SharedComponents/BinaryRadioGroup';
import AsyncSelect from '../../components/SharedComponents/AsyncSelect';



/*
 * ProductUpdate 흐름 정리
 * 1. 상태 초기화
 *    - useState(createDefaultValues)로 폼 상태(values)와 초기값(initialValues)을 지연 초기화합니다.
 *    - loading/submitting 플래그와 파생 값(isProduct 등)을 계산합니다.
 * 2. 데이터 로드(useEffect)
 *    - productId가 있으면 GET /v1/product/{id} 호출 후 응답을 normalize하여 setValues 합니다.
 *    - 실패 시 알림 후 목록으로 이동(원치 않으면 navigate 줄 제거 가능)하며, mounted 플래그로 언마운트 시 setState를 막습니다.
 * 3. 입력 처리
 *    - 탭 전환 시 서비스 전용 필드를 초기화(handleTabChange)하고, 모든 입력은 handleChange에서 관리합니다.
 *    - 초기화 버튼은 initialValues로 복원하고, 취소 버튼은 /product로 이동합니다.
 * 4. 수정 제출(handleSubmit)
 *    - 화면 상태를 백엔드 DTO(payload)로 변환한 뒤 PUT /v1/product/{id}를 호출합니다.
 *    - 성공하면 목록으로 이동하며, 실패 시 경고를 띄웁니다.
 */

const PRODUCT_OR_SERVICE = [
  { value: 'PRODUCT', label: '실물 상품' },
  { value: 'SERVICE', label: '서비스 상품' },
];

// 기본 폼 값을 만들어 주는 헬퍼입니다. (함수를 바로 넘기면 최초 렌더에서만 계산됩니다.)
const createDefaultValues = () => ({
    productType: 'PRODUCT',
    productName: '',
    serviceName: '',
    serviceSessionCount: '',
    serviceDurationDays: '',
    salePrice: '',
    saleStatus: 'ACTIVE',
    categoryCode: '',
    memo: '특이사항 없음',
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: '',
});

function ProductUpdate() {
  const { itemType, itemId } = useParams();
  const navigate = useNavigate();

  const normalizedType = itemType?.toUpperCase() === 'SERVICE' ? 'SERVICE' : 'PRODUCT';
  const isServiceRoute = normalizedType === 'SERVICE';
  const initialDefaults = useMemo(() => {
    const base = createDefaultValues();
    return isServiceRoute ? { ...base, productType: 'SERVICE' } : base;
  }, [isServiceRoute]);

  const [values, setValues] = useState(initialDefaults);
  const [initialValues, setInitialValues] = useState(initialDefaults);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isProduct = normalizedType === 'PRODUCT';
  const isService = normalizedType === 'SERVICE';
  const codeAId = normalizedType;
  const targetId = itemId;
  const isPtService = isService && values.categoryCode === 'PT';
  const isMembershipService = isService && values.categoryCode === 'MEMBERSHIP';

  const formatNumberField = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString();
  };

    const normalizeDateField = (value) => {
        if (!value) {
            return new Date().toISOString().slice(0, 10);
        }
        try {
            return new Date(value).toISOString().slice(0, 10);
        } catch (error) {
            return new Date().toISOString().slice(0, 10);
        }
    };

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = isServiceRoute
          ? `/v1/service/${targetId}`
          : `/v1/product/${targetId}`;
        const { data } = await axios.get(endpoint);

        if (!mounted) return;

        let nextValues;
        if (isServiceRoute) {
          nextValues = {
            ...createDefaultValues(),
            productType: 'SERVICE',
            productName: '',
            serviceName: data.name ?? '',
            salePrice: formatNumberField(data.price),
            saleStatus: data.isActive ? 'ACTIVE' : 'INACTIVE',
            categoryCode: data.codeBId != null ? String(data.codeBId) : '',
            memo: data.note && data.note.trim() !== '' ? data.note : '특이사항 없음',
            serviceSessionCount:
              data.serviceValue != null ? data.serviceValue.toString() : '',
            serviceDurationDays: '',
            createdAt: normalizeDateField(data.createdAt),
          };
        } else {
          nextValues = {
            ...createDefaultValues(),
            productType: 'PRODUCT',
            productName: data.name ?? '',
            serviceName: data.name ?? '',
            salePrice: formatNumberField(data.price),
            saleStatus: data.isActive ? 'ACTIVE' : 'INACTIVE',
            categoryCode: data.codeBId != null ? String(data.codeBId) : '',
            memo: data.note && data.note.trim() !== '' ? data.note : '특이사항 없음',
            createdAt: normalizeDateField(data.createdAt),
          };
        }

        nextValues.updatedAt = data.updatedAt
          ? normalizeDateField(data.updatedAt)
          : '';

        setValues(nextValues);
        setInitialValues(nextValues);
      } catch (error) {
        console.error('상세 정보를 불러오지 못했습니다.', error);
        alert('정보를 가져오는 데 실패했습니다.');
        navigate('/product');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [targetId, isServiceRoute, navigate, normalizedType]);

    // 탭 전환 시 서비스 전용 필드를 비워줍니다.
  const handleTabChange = () => {
    // 수정 화면에서는 상품/서비스 유형을 변경하지 않습니다.
    return;
  };

    // TODO: 백엔드 DTO 규격에 맞춰 아래 payload 필드들을 조정하세요.
    //  - codeAId/codeBId: 현재는 문자열, 필요 시 숫자나 enum으로 변환.
    //  - note, sessionCount 등 nullable 필드 요구사항을 확인 후 수정.
    //  - createdAt이 서버에서 계산된다면 제거 가능.
    const handleChange = (input, maybeValue) => {
        if (typeof input === 'string') {
            const name = input;
            const value = maybeValue;
            setValues((prev) => ({ ...prev, [name]: value }));
            return;
        }

        const { name, value } = input.target ?? input;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    // 초기화 버튼 → 처음 불러온 값으로 되돌립니다.
    const handleReset = () => {
        setValues(initialValues);
    };

    // 취소 버튼 → 목록 화면으로 이동합니다.
    const handleCancel = (event) => {
        event.preventDefault();
        navigate('/product');
    };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!values.categoryCode) {
      alert('분류를 선택해 주세요.');
      return;
    }

    if (!targetId) {
      alert('수정할 항목을 찾을 수 없습니다.');
      return;
    }

    setSubmitting(true);
    const sanitizedMemo =
       values.memo?.trim() === '' ? '특이사항 없음' : values.memo;
    try {
      if (isProduct) {
        const productPayload = {
          productId: Number(targetId),
          codeBId: values.categoryCode,
          name: values.productName,
          price: Number(values.salePrice || 0),
          isActive: values.saleStatus === 'ACTIVE' ? 1 : 0,
          note: sanitizedMemo
        };

        await axios.put(`/v1/product/${targetId}`, productPayload);
        alert('상품 정보가 수정되었습니다.');
      } else {
        const numericTargetId = Number(targetId);
        const servicePayload = {
          serviceId: numericTargetId,
          codeBId: values.categoryCode,
          name: values.serviceName,
          price: Number(values.salePrice || 0),
          isActive: values.saleStatus === 'ACTIVE' ? 1 : 0,
          note: sanitizedMemo,
          serviceValue: Number(
            values.serviceSessionCount || values.serviceDurationDays || 0
          ),
        };

        await axios.put(`/v1/service/${numericTargetId}`, servicePayload);
        alert('서비스 정보가 수정되었습니다.');
      }
      navigate('/product');
    } catch (error) {
      console.error('정보 수정 실패', error);
      alert('정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

    if (loading) {
        // API 응답을 기다리는 동안 간단한 안내를 보여줍니다. 필요하면 스피너로 교체하세요.
        return <div>상품 정보를 불러오는 중입니다...</div>;
    }

    return (
        <>
            <h1>{isProduct ? '상품 정보 수정' : '서비스 정보 수정'}</h1>
            <form onSubmit={handleSubmit}>
                <TabSwitcher
                    tabs={PRODUCT_OR_SERVICE}
                    name="productType"
                    activeValue={values.productType}
                    value={values.productType}
                    onChange={handleTabChange}
                    disabled
                />

                <AsyncSelect
                    label={isProduct ? '상품 분류' : '서비스 분류'}
                    name="categoryCode"
                    value={values.categoryCode}
                    onChange={handleChange}
                    placeholder={isProduct ? '상품 분류를 선택하세요' : '서비스 분류를 선택하세요'}
                    endpoint={`/v1/categories/list/${codeAId}`}
                    mapOption={(row) => ({
                        value: row.codeBId != null ? String(row.codeBId) : '',
                        label: `${row.codeBName} (${row.codeBId})`,
                    })}
                    allowEmptyOption={!values.categoryCode}
                />

                <TextField
                    label={isProduct ? '상품명' : '서비스명'}
                    name={isProduct ? 'productName' : 'serviceName'}
                    value={isProduct ? values.productName : values.serviceName}
                    onChange={handleChange}
                    placeholder={isProduct ? '상품명을 입력하세요' : '서비스명을 입력하세요'}
                />

                <TextField
                    label="판매가"
                    name="salePrice"
                    type="number"
                    value={values.salePrice}
                    onChange={handleChange}
                    placeholder="원 단위 숫자만 입력하세요"
                    inputProps={{ min: 0 }}
                />

                <BinaryRadioGroup
                    label="판매 상태"
                    name="saleStatus"
                    value={values.saleStatus}
                    onChange={handleChange}
                    options={[
                        { value: 'ACTIVE', label: '판매중' },
                        { value: 'INACTIVE', label: '판매중지' },
                    ]}
                />

                {isPtService && (
                    <TextField
                        label="서비스 이용 횟수"
                        name="serviceSessionCount"
                        type="number"
                        value={values.serviceSessionCount}
                        onChange={handleChange}
                        placeholder="예: 10 (PT 회차)"
                        inputProps={{ min: 0 }}
                        helpText="PT 상품일 때만 입력합니다."
                    />
                )}

                {isMembershipService && (
                    <TextField
                        label="서비스 이용 기간(일)"
                        name="serviceDurationDays"
                        type="number"
                        value={values.serviceDurationDays}
                        onChange={handleChange}
                        placeholder="예: 30 (이용권 일수)"
                        inputProps={{ min: 0 }}
                        helpText="이용권 상품일 때만 입력합니다."
                    />
                )}

                <TextField
                    label={isProduct ? '상품 설명' : '서비스 설명'}
                    name="memo"
                    value={values.memo}
                    onChange={handleChange}
                    placeholder={isProduct ? '상품에 대한 설명을 입력하세요' : '서비스에 대한 설명을 입력하세요'}
                />

                <TextField
                    label="등록일"
                    name="createdAt"
                    type="date"
                    value={values.createdAt}
                    onChange={handleChange}
                    readOnly
                    helpText="등록일은 수정할 수 없습니다."
                />

                <TextField
                    label="최종 수정일"
                    name="updatedAt"
                    value={values.updatedAt || '수정 이력 없음'}
                    onChange={handleChange}
                    readOnly
                    helpText="저장 시 자동으로 업데이트됩니다."
                />

                <div className="d-flex justify-content-between gap-2 mt-4">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleReset}
                    >
                        초기화
                    </button>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={handleCancel}
                        >
                            목록으로
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? '수정 중...' : '수정'}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

export default ProductUpdate;
