// src/pages/Product/ProductCreate.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TextField from '../../components/SharedComponents/TextField';
import TabSwitcher from '../../components/SharedComponents/TabSwitcher';
import BinaryRadioGroup from '../../components/SharedComponents/BinaryRadioGroup';
import AsyncSelect from '../../components/SharedComponents/AsyncSelect';
import axios from 'axios';
import { FaUserCircle, FaEdit, FaCalendarAlt, FaTrashAlt, FaSave, FaTimes, FaFolderOpen } from "react-icons/fa";

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
    const isMembershipService = isService && values.categoryCode === 'VOUCHER';

    const location = useLocation();
    DEFAULT_VALUES.productType = location.state?.defaultTab || 'PRODUCT';

    //이미지 데이터를 상태값으로 관리한다.
    const [imageUrl, setImageUrl] = useState({
        original:"",
        current:""
    });
    const [imageFile, setImageFile] = useState(null);
    const imageRef = useRef();
    const imageStyle = {
        width:"100px",
        height:"100px",
        display:"none"
    }; 

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
        setImageUrl({
            ...imageUrl,
            current:imageUrl.original  //최초의 이미지를 출력할수 있도록
        });
        setImageFile(null);
    };

    const handleCancel = (event) => {
        event.preventDefault();
        navigate('/product');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // 제출시 빈칸 방지 
        if (submitting) return;

        if (!values.categoryCode) {
            alert('분류를 선택해 주세요.');
            return;
        }

        if (isProduct && !values.productName.trim()) {
            alert('상품명을 입력해 주세요.');
            return;
        }

        if (isService && !values.serviceName.trim()) {
            alert('서비스명을 입력해 주세요.');
            return;
        }

        const numericPrice = Number(values.salePrice);
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            alert('판매가는 0 이상 숫자로 입력해 주세요.');
            return;
        }

        // 메모 검증 
        const sanitizedMemo =
            values.memo?.trim() === '' ? '특이사항 없음' : values.memo;

        let endpoint = '/v1/product';
        let payload;

        // 제품인 경우의 payload 구성
        if (isProduct) {
            const formData = new FormData();
            formData.append('codeBId', values.categoryCode);
            formData.append('name', values.productName);
            formData.append('price', numericPrice);
            formData.append('isActive', values.saleStatus === 'ACTIVE' ? 1 : 0);
            formData.append('note', sanitizedMemo);
            if (imageFile) {
                formData.append('profileFile', imageFile);
            }
            payload = formData;
        } else { 
            // 서비스인 경우에 구성되는 payload
            const rawServiceValue =
                values.serviceSessionCount || values.serviceDurationDays || '';
            const serviceAmount = rawServiceValue !== ''
                ? Number(rawServiceValue)
                : null;

            if (
                (isPtService || isMembershipService) &&
                (serviceAmount === null || Number.isNaN(serviceAmount))
            ) {
                alert('서비스 이용 정보를 올바르게 입력해 주세요.');
                return;
            }

            endpoint = '/v1/service';
            payload = {
                codeBId: values.categoryCode,
                name: values.serviceName,
                price: numericPrice,
                isActive: values.saleStatus === 'ACTIVE' ? 1 : 0,
                note: sanitizedMemo,
                serviceValue: serviceAmount,
            };
        }

        setSubmitting(true);
        try {
            await axios.post(endpoint, payload);
            alert(isProduct ? '상품이 등록되었습니다.' : '서비스가 등록되었습니다.');
            navigate('/product');
        } catch (error) {
            console.error(error);
            alert('등록 중 문제가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    // input type="file" 요소의 참조값을 얻어내기 위해
    const inputRef = useRef();
    // 이미지 링크를 클릭했을때 실행할 함수
    const handleClick = ()=>{
        // input type="file" 을 강제 클릭한다 
        inputRef.current.click();
    };

    //파일을 변경했을때
    const handleImageChange = (e)=>{
        //선택한 파일 객체
        const file=e.target.files[0];
        if (file) {
            setImageFile(file); // Store the file object
            //FileReader 객체로 읽어들이기
            const reader=new FileReader();
            reader.readAsDataURL(file);
            reader.onload=(event)=>{
                //선택한 이미지 파일을 data url 로 읽은 데이터
                const data=event.target.result;
                setImageUrl({
                    ...imageUrl,
                    current:data
                });
            };
        }
    };

    useEffect(()=>{
        // svg 이미지를 2진 데이터 문자열로 읽어들여서 
        const svgString = new XMLSerializer().serializeToString(imageRef.current);
        // 2진데이터 문자열을 btoa (binary to ascii) 함수를 이용해서 ascii 코드로 변경
        const encodedData = btoa(svgString);
        // 변경된 ascii 코드를 이용해서 dataUrl 을 구성한다 
        const url = "data:image/svg+xml;base64," + encodedData;
        
        // 4. 이 'url'을 기본 이미지(original)와 현재 이미지(current)로 설정
        setImageUrl({ original: url, current: url });
    },[]);

    return (
        <><div className='pt-5 pb-5' style={{backgroundColor: "#f8f9fa"}}>
            {/*  display=none 으로 안보이게한 다음에, 디코딩해서 dataurl 로 src 에 표시*/}
            <svg ref={imageRef} style={imageStyle} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-folder-plus" viewBox="0 0 16 16">
                <path d="m.5 3 .04.87a2 2 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2m5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19q-.362.002-.683.12L1.5 2.98a1 1 0 0 1 1-.98z"/>
                <path d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5"/>
            </svg>
            <div className="row justify-content-center">
                <div className="card col-md-8 col-lg-6">
                    <div className="card-body">
                        <h4 className="fw-bold mb-4">{isProduct ? '신규 상품 등록' : '신규 서비스 등록'}</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <TabSwitcher
                                    tabs={PRODUCT_OR_SERVICE}
                                    name="productType"
                                    activeValue={values.productType}
                                    value={values.productType}
                                    onChange={handleTabChange}
                                    buttonClassName="btn btn-outline-secondary"
                                    activeButtonClassName="btn btn-outline-secondary active"
                                    className="btn-group w-50"
                                />                            
                            </div>
                            {isProduct &&<>
                                <div className="mb-3">
                                    <label className="form-label d-block">프로필 이미지</label>
                                    <div className="d-flex align-items-center gap-3">
                                        { imageUrl.current && <img src={imageUrl.current}
                                            className="rounded border"
                                            style={{width:"100px",height:"100px",objectFit:"cover"}} /> }
                                        <input onChange={handleImageChange}
                                            type="file" name="profileFile" accept="image/*" />                                    
                                    </div>
                                </div>
                            </>}
                            <div className="mb-3">
                                <AsyncSelect
                                    label={isProduct ? '상품 분류 *' : '서비스 분류 *'}
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
                            </div>

                            <div className="mb-3">
                                <TextField
                                    label={isProduct ? '상품명 *' : '서비스명 *'}
                                    name={isProduct ? 'productName' : 'serviceName'} // 서비스명을 별도 필드로 저장
                                    value={isProduct ? values.productName : values.serviceName}
                                    onChange={handleChange}
                                    placeholder={isProduct ? '상품명을 입력하세요' : '서비스명을 입력하세요'}
                                />
                            </div>

                            <div className="mb-3">
                                <TextField
                                    label="판매가 *"
                                    name="salePrice"
                                    type="number"
                                    value={values.salePrice}
                                    onChange={handleChange}
                                    placeholder='원 단위 숫자만 입력하세요'
                                    inputProps={{ min: 0 }}
                                />
                            </div>

                            <div className="mb-3">
                                <BinaryRadioGroup
                                    label="판매 상태 *"
                                    name="saleStatus"
                                    value={values.saleStatus}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'ACTIVE', label: '판매중' },
                                        { value: 'INACTIVE', label: '판매중지' },
                                    ]}
                                />
                            </div>

                            {isPtService && (
                                <div className="mb-3">
                                    <TextField
                                        label="서비스 이용 횟수 *"
                                        name="serviceSessionCount"
                                        type="number"
                                        value={values.serviceSessionCount}
                                        onChange={handleChange}
                                        placeholder="예: 10 (PT 회차)"
                                        inputProps={{ min: 0 }}
                                        helpText="PT 상품일 때만 입력합니다."
                                    />
                                </div>
                            )}

                            {isMembershipService && (
                                <div className="mb-3">
                                    <TextField
                                        label="서비스 이용 기간(일) *"
                                        name="serviceDurationDays"
                                        type="number"
                                        value={values.serviceDurationDays}
                                        onChange={handleChange}
                                        placeholder="예: 30 (이용권 일수)"
                                        inputProps={{ min: 0 }}
                                        helpText="이용권 상품일 때만 입력합니다."
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <TextField
                                    label={isProduct ? '상품 설명' : '서비스 설명'}
                                    name="memo"
                                    value={values.memo}
                                    onChange={handleChange}
                                    placeholder={isProduct ? '상품에 대한 설명을 입력하세요' : '서비스에 대한 설명을 입력하세요'}
                                />
                            </div>


                            <div className="mb-4">
                                <TextField
                                    label="등록일 *"
                                    name="createdAt"
                                    type="date"
                                    value={values.createdAt}
                                    onChange={handleChange}
                                    readOnly
                                    helpText="오늘 날짜가 자동 입력됩니다. 필요 시 API에서 덮어쓸 수 있습니다."
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleReset}
                                    >
                                        초기화
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
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
                        </form>
                    </div>
                </div>
            </div>
            
        </div></>
    );
}

export default ProductCreate;
