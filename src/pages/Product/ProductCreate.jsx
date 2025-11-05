// src/pages/Product/ProductCreate.jsx

import { Tab } from 'bootstrap';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '../../components/SharedComponents/TextField';
import TabSwitcher from '../../components/SharedComponents/TabSwitcher';
import BinaryRadioGroup from '../../components/SharedComponents/BinaryRadioGroup';
import AsyncSelect from '../../components/SharedComponents/AsyncSelect';
import axios from 'axios';

const PRODUCT_OR_SERVICE = [
    { value: 'PRODUCT', label: '실물 상품' },
    { value: 'SERVICE', label: '서비스 상품' },
];

// 신규 등록 폼이 사용할 기본 값입니다.
const DEFAULT_VALUES = {
    productType: 'PRODUCT',
    productName: '',
    serviceName: '',
    serviceSessionCount: '',
    serviceDurationDays: '',
    salePrice: '',
    saleStatus: 'ACTIVE',
    categoryCode: '',
    memo: '',
    createdAt: new Date().toISOString().slice(0, 10), // 오늘 날짜를 기본값으로 사용
};



function ProductCreate() {

    const [values, setValues] = useState(DEFAULT_VALUES);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const isProduct = values.productType === 'PRODUCT';
    const isService = !isProduct;
    const codeAId = isProduct ? 'PRODUCT' : 'SERVICE';
    const isPtService = isService && values.categoryCode === 'PT';
    const isMembershipService = isService && values.categoryCode === 'MEMBERSHIP';

    // 상품 / 서비스 탭이 전환될 때 종속 값들을 초기화합니다.
    const handleTabChange = (nextType) => {
        setValues((prev) => ({
            ...prev,
            productType: nextType,
            categoryCode: '',
            serviceSessionCount: '',
            serviceDurationDays: '',
        }));
        // 탭 전환 시 다른 필드를 초기화하고 싶다면 여기에서 함께 처리
    };

    useEffect(() => {

    }, []);

    // TextField는 이벤트 객체를, BinaryRadioGroup은 (name, value) 형태를 전달합니다.
    const handleChange = (input, maybeValue) => {
        if (typeof input === 'string') {
            const name = input;
            const value = maybeValue;
            setValues(prev => ({ ...prev, [name]: value }));
            return;
        }

        const { name, value } = input.target ?? input; // TextField 등 일반 이벤트 객체 대응
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setValues(DEFAULT_VALUES);
    };

    const handleCancel = (event) => {
        event.preventDefault();
        navigate('/product');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            // TODO: 실제 등록 API 규격에 맞게 payload를 보정한 뒤 아래 요청을 유지하세요.
            axios.post('/v1/product', {
                ...values,
            });
            console.log('폼 제출', values);
            alert('등록 로직을 구현하세요.'); // 필요 없으면 제거해도 됩니다.
        } catch (error) {
            console.error(error);
            alert('등록 중 문제가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <h1>{isProduct ? '신규 상품 등록 폼' : '신규 서비스 등록 폼'}</h1>
            <form onSubmit={handleSubmit}>
                <TabSwitcher
                    tabs={PRODUCT_OR_SERVICE}
                    name="productType"
                    activeValue={values.productType}
                    value={values.productType}
                    onChange={handleTabChange}
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
                    name={isProduct ? 'productName' : 'serviceName'} // 서비스명을 별도 필드로 저장
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
                    placeholder='원 단위 숫자만 입력하세요'
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
                    helpText="오늘 날짜가 자동 입력됩니다. 필요 시 API에서 덮어쓸 수 있습니다."
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
                            {submitting ? '등록 중...' : '등록'}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

export default ProductCreate;
