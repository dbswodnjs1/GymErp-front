import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import cn from 'classnames';

import ProductListComponent from '../../components/ProductListComponent';
import ProductSearchBar from '../../components/ProductSearchBar';
import CategoryCheckbox from '../../components/CategoryCheckbox';

function ProductList() {
    const [currentTab, setCurrentTab] = useState('PRODUCT');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [search, setSearch] = useState({ keyword: "" });
    const [pageInfo, setPageInfo] = useState({
        list: [],
        pageNum: 1,
        startPageNum: 1,
        endPageNum: 1,
        totalPageCount: 1
    });
    //정렬 state
    const [sortConfig, setSortConfig] = useState({ 
        key: 'codeBName', // 백엔드 @RequestParam 기본값과 일치
        direction: 'ASC' // 백엔드 @RequestParam 기본값과 일치
    });

    const productColumns = [
        { key: 'codeBName', label: '상품 구분' },
        { key: 'name', label: '상품 이름' },
        { key: 'price', label: '판매가' },
        { key: 'isActive', label: '활성화' } // 이 key가 renderCell의 if문과 일치
    ];

    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const pageNum = params.get("pageNum") || 1;
        const keyword = params.get("keyword") || "";
        const categoryCodes = params.getAll("categoryCodes") || [];

        // URL 파라미터를 state에 동기화
        setSearch({ keyword });
        setSelectedCategories(categoryCodes);

        const qs = new URLSearchParams();
        qs.set("pageNum", pageNum.toString());
        if (keyword) {
            qs.set("keyword", keyword);
        }
        categoryCodes.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        qs.set("sortBy", sortConfig.key);
        qs.set("direction", sortConfig.direction);

        const apiEndpoint = (currentTab === 'PRODUCT') ? '/v1/product' : '/v1/service';

        axios.get(`${apiEndpoint}?${qs.toString()}`)
            .then(res => {
                setPageInfo(res.data);

            })
            .catch(err => {
                if (err.response) {
                    console.error('Error response from server:', err.response.data);
                }
                console.error('Axios error:', err);
            });

    }, [params, currentTab, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            // 다른 컬럼 클릭 시
            if (prevConfig.key !== key) {
                return { key: key, direction: 'DESC' };
            }
            // 같은 컬럼 클릭 시 (ASC -> DESC -> ASC)
            if (prevConfig.direction === 'DESC') {
                return { key: key, direction: 'ASC' };
            }
            return { key: key, direction: 'DESC' };
        });

        // 정렬 시 1페이지로 이동
        const qs = new URLSearchParams(params);
        qs.set("pageNum", "1");
        navigate(`/product?${qs.toString()}`); // (경로는 현재 페이지에 맞게)
    };

    // 신규 상품 등록 페이지로 이동 하는 핸들러 (상품/서비스)
    const handleCreateClick = () => {
        navigate("/product/create");
    };


    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        // URL을 변경하여 useEffect를 트리거
        navigate("/product");
    };

    const handleCategoryChange = (newCategories) => {
        const qs = new URLSearchParams();
        qs.set("pageNum", "1");
        if (search.keyword) {
            qs.set("keyword", search.keyword);
        }
        newCategories.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/product?${qs.toString()}`);
    };

    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleSearchClick = () => {
        const qs = new URLSearchParams();
        qs.set("pageNum", "1");
        if (search.keyword) {
            qs.set("keyword", search.keyword);
        }
        selectedCategories.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/product?${qs.toString()}`);
    };

    const pageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("pageNum", num.toString());
        navigate(`/product?${qs.toString()}`);
    };

    const handleStatusChange = (item, newIsActive) => {
        // 1. 'item' 객체에서 ID를 바로 꺼내 씀
        const id = (currentTab === 'PRODUCT' ? item.productId : item.serviceId);
        const apiEndpoint = (currentTab === 'PRODUCT') ? `/v1/product/${id}` : `/v1/service/${id}`;
        axios.patch(apiEndpoint, { isActive: newIsActive })
            .then(res => {
                // 서버 응답 성공 시, 클라이언트(React)의 'pageInfo' state도 갱신
                setPageInfo(prevPageInfo => {

                    // 기존 list 배열을 'map'으로 순회하여 새 배열 생성
                    const newList = prevPageInfo.list.map(listItem => {
                        const listItemId = (currentTab === 'PRODUCT' ? listItem.productId : listItem.serviceId);

                        // 방금 ID가 일치하는 항목을 찾으면,
                        if (listItemId === id) {
                            // 6. 'listItem'의 다른 값은 그대로 복사하고,
                            //    'isActive' 값만 'newIsActive'로 덮어쓴 새 객체를 반환
                            return { ...listItem, isActive: newIsActive };
                        }

                        // ID가 다르면, 기존 'listItem'을 그대로 반환
                        return listItem;
                    });

                    // 'prevPageInfo'를 복사하고 'list'만 'newList'로 교체한
                    // '새 pageInfo 객체'를 반환
                    return {
                        ...prevPageInfo,
                        list: newList
                    };
                });
            })
            .catch(err => console.log(err));
    };

    const handleRowClick = (item) => {
        const fromPath = `/product${location.search || ""}`;

        if (currentTab === 'PRODUCT' && item.productId) {
            navigate(`/product/product/${item.productId}`, {
                state: { from: fromPath, type: "PRODUCT" },
            });
            return;
        }

        if (currentTab === 'SERVICE' && item.serviceId) {
            navigate(`/product/service/${item.serviceId}`, {
                state: { from: fromPath, type: "SERVICE" },
            });
        }
    };

    return (
        <>
            <button className={cn("btn", "btn-lg", { "btn-dark": currentTab == "PRODUCT", "btn-light": currentTab == "SERVICE" })} onClick={() => handleTabChange('PRODUCT')}>실물 상품</button>
            <button className={cn("btn", "btn-lg", { "btn-dark": currentTab == "SERVICE", "btn-light": currentTab == "PRODUCT" })} onClick={() => handleTabChange('SERVICE')}>서비스 상품</button>

            <div className="row mt-3">
                <div className="col-md-3 mt-3">
                    <CategoryCheckbox
                        codeAId={currentTab}
                        checkedList={selectedCategories}
                        onChange={handleCategoryChange}
                    />
                    <ProductSearchBar
                        keyword={search.keyword}
                        onSearchChange={handleSearchChange}
                        onSearchClick={handleSearchClick}
                    />

                </div>
                <div className="col-3">
                    <button className="btn btn-primary mt-3" onClick={handleCreateClick}>상품 등록</button>
                </div>
                <div className="col-md-9 mt-3">
                    <ProductListComponent
                        pageInfo={pageInfo}
                        onPageChange={pageMove}
                        onToggleChange={handleStatusChange}
                        columns={productColumns}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                </div>
            </div>
        </>
    );
}

export default ProductList;
