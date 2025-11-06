// src/pages/Product/ProductDetail.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import TabSwitcher from "../../components/SharedComponents/TabSwitcher.jsx";
import BinaryRadioGroup from "../../components/SharedComponents/BinaryRadioGroup.jsx";
import TextField from "../../components/SharedComponents/TextField.jsx";


// 상품 / 서비스 탭 옵션 
const PRODUCT_OR_SERVICE = [
    { value: "PRODUCT", label: "실물 상품" },
    { value: "SERVICE", label: "서비스 상품" },
];

// 상세 조회 폼이 사용할 기본 값입니다.
const defaultValues = {
    productType: "PRODUCT",
    categoryLabel: "",
    productName: "",
    salePrice: "",
    quantityInfo: "",
    saleStatus: "ACTIVE",
    memo: "특이사항 없음",
    createdAt: "",
    updatedAt: "",
};


function ProductDetail(props) {

    // 파라미터, 로케이션, 네비게이트 훅 
    const { itemType, itemId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // 라우트 파라미터 기준으로 타입/ID 결정
    const normalizedType = itemType?.toUpperCase() === "SERVICE" ? "SERVICE" : "PRODUCT";
    const isServiceRoute = normalizedType === "SERVICE";
    const targetId = itemId;

    // 상태값
    const [values, setValues] = useState(defaultValues);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // 목록 화면으로 돌아갈 때 사용할 경로 (없으면 기본 /product 로)
    const backToList = useMemo(() => {
        return location.state?.from || "/product";
    }, [location.state]);

    useEffect(() => {
        // 타겟 아이디가 없으면 에러 처리
        if (!targetId) {
            setError("잘못된 접근입니다.");
            setLoading(false);
            return;
        }

        // 
        const fetchDetail = async () => {

            let stockQuantity = null;

            try {
                setLoading(true);

                // serviceRoute인지에 따라 다른 endpoint 사용 service = serviceId, product = productId
                const endpoint = isServiceRoute
                    ? `/v1/service/${targetId}`
                    : `/v1/product/${targetId}`;

                // 위 api 호출해서 데이터 가져오기
                const { data } = await axios.get(endpoint);
// ---
                if(normalizedType!= "SERVICE"){
                    try{
                        const stockResponse = await axios.get(`/v1/stock/${targetId}`)
                        stockQuantity = stockResponse.data;
                    }catch(err){
                        console.log(err);
                    } 
                }
// ---
                // 응답 데이터의 코드네임 있으면 카테고리 라벨 생성 코드A-코드B 형식으로 (ex.서비스-PT), 코드네임이 없으면 서비스인지 실물인지라도 파악
                const categoryLabel =
                    data.codeAName && data.codeBName
                        ? `${data.codeAName} - ${data.codeBName}`
                        : `${isServiceRoute ? "서비스" : "실물 상품"}`;


                // 코드B가 PT면 남은 횟수, 멤버십이면 남은 일수로 라벨 설정 
                let quantityLabel = isServiceRoute ? "서비스 수량" : "재고 수량";
                if (isServiceRoute) {
                    if (data.codeBId === "PT") quantityLabel = "남은 횟수";
                    else if (data.codeBId === "MEMBERSHIP") quantityLabel = "남은 일수";
                };

                const normalized = {
                    // 서비스인지 실물인지에 따라 productType 설정
                    productType: normalizedType,
                    categoryLabel,
                    productName: data.name ?? "",
                    salePrice:
                        typeof data.price === "number" // 가격이 숫자형이면 천단위 콤마 추가 
                            ? data.price.toLocaleString()
                            : data.price || "",
// ---
                    // 재고량 또는 서비스 수량 가져오기 
                    // quantityInfo: data.quantity ?? data.serviceValue ?? "",
                    quantityInfo: stockQuantity ?? data.serviceValue ?? "",
// ---
                    saleStatus: data.isActive ? "ACTIVE" : "INACTIVE", // 활성화 여부
                    // 메모 있으면 넣어주고 없으면 기본값.
                    memo:
                        data.note && data.note.trim() !== ""
                            ? data.note
                            : "특이사항 없음",
                    createdAt: data.createdAt
                        ? new Date(data.createdAt).toISOString().slice(0, 10)
                        : "",
                    updatedAt: data.updatedAt
                        ? new Date(data.updatedAt).toISOString().slice(0, 10)
                        : data.createdAt
                            ? new Date(data.createdAt).toISOString().slice(0, 10)
                            : "",
                    quantityLabel,
                };
                // 위 정보를 values 상태값에 설정 
                setValues(normalized);
            } catch (err) {
                console.error("상세 조회 실패", err);
                setError("상세 정보를 불러오는 중 오류가 발생했습니다.");
            }
            finally {
                setLoading(false);
            } // 위 모든 과정들을 페치디테일에 담기
        };
        fetchDetail();
    }, [isServiceRoute, targetId, normalizedType]);

    if (loading) {
        return <div>상세 정보를 불러오는 중입니다...</div>;
    };
    if (error) {
        return <div>{error}</div>;
    }

    // 수정 버튼 클릭 핸들러
    const handleEdit = () => {
        const editType = normalizedType.toLowerCase();
        navigate(`/product/edit/${editType}/${targetId}`);
    };




    return (
        <div>
            {/* 탭은 readonly 표시 */}
            <TabSwitcher
                tabs={PRODUCT_OR_SERVICE}
                activeValue={values.productType}
                onChange={() => { }}
                disabled
            />

            <TextField
                label="상품 구분"
                name="categoryLabel"
                value={values.categoryLabel}
                onChange={() => { }}
                readOnly
            />

            {/* 재고 이름 */}
            <TextField
                label={values.productType === "PRODUCT" ? "상품명" : "서비스명"}
                name="productName"
                value={values.productName}
                onChange={() => { }}
                readOnly
            />

            <TextField
                label="판매 가격"
                name="salePrice"
                value={values.salePrice}
                onChange={() => { }}
                readOnly
            />

            <TextField
                label={values.quantityLabel}
                name="quantityInfo"
                value={values.quantityInfo}
                onChange={() => { }}
                readOnly
            />

            {/* Active 상태를 옵션값으로 나타냄. */}
            <BinaryRadioGroup
                label="판매 상태"
                name="saleStatus"
                value={values.saleStatus}
                onChange={() => { }}
                disabled
                options={[
                    { value: "ACTIVE", label: "판매중" },
                    { value: "INACTIVE", label: "판매중지" },
                ]}
            />

            <TextField
                label="메모"
                name="memo"
                value={values.memo}
                onChange={() => { }}
                readOnly
            />

            <TextField
                label="등록일"
                name="createdAt"
                value={values.createdAt}
                onChange={() => { }}
                readOnly
            />

            <TextField
                label="최종 수정일"
                name="updatedAt"
                value={values.updatedAt}
                onChange={() => { }}
                readOnly
            />

            <div className="d-flex gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(backToList)}>
                    목록으로
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEdit}>
                    수정하기
                </button>
            </div>
        </div>
    );
}

export default ProductDetail;
