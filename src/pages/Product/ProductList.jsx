import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';

import ProductListComponent from '../../components/ProductListComponent';
import ProductSearchBar from '../../components/ProductSearchBar';
import CategoryCheckbox from '../../components/CategoryCheckbox';

function ProductList() {
    const [pageInfo, setPageInfo] = useState({
        list: [],
        pageNum: 1,
        startPageNum: 1,
        endPageNum: 1,
        totalPageCount: 1
    });
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'codeBName', direction: 'ASC' });

    const [params] = useSearchParams();
    const navigate = useNavigate();

    const currentTab = params.get("tab") || "PRODUCT";
    const keyword = params.get("keyword") || "";
    const categoryCodes = params.getAll("categoryCodes") || [];

    const [localKeyword, setLocalKeyword] = useState(keyword);

    useEffect(() => {
        setLocalKeyword(keyword); // URL의 keyword가 변경될 때 localKeyword 동기화
    }, [keyword]);

    useEffect(() => {
        setLoading(true);
        const pageNum = params.get("pageNum") || 1;

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

        const apiEndpoint = (currentTab === 'PRODUCT') ? '/v1/product/withoutQuantity' : '/v1/service';

        axios.get(`${apiEndpoint}?${qs.toString()}`)
            .then(res => {
                setPageInfo(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Axios error:', err);
                setLoading(false);
            });

    }, [params, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            if (prevConfig.key !== key) {
                return { key: key, direction: 'DESC' };
            }
            if (prevConfig.direction === 'DESC') {
                return { key: key, direction: 'ASC' };
            }
            return { key: key, direction: 'DESC' };
        });
        const qs = new URLSearchParams(params);
        qs.set("pageNum", "1");
        navigate(`/product?${qs.toString()}`);
    };

    const handleTabChange = (tab) => {
        navigate(`/product?tab=${tab}`);
    };

    const handleCategoryChange = (newCategories) => {
        const qs = new URLSearchParams();
        qs.set("tab", currentTab);
        qs.set("pageNum", "1");
        if (keyword) {
            qs.set("keyword", keyword);
        }
        newCategories.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/product?${qs.toString()}`);
    };

    const handleSearchChange = (e) => {
        setLocalKeyword(e.target.value);
    };

    const handleSearchClick = () => {
        const qs = new URLSearchParams();
        qs.set("pageNum", "1");
        qs.set("tab", currentTab);
        if (localKeyword) { // localKeyword 사용
            qs.set("keyword", localKeyword);
        }
        categoryCodes.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/product?${qs.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const pageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("pageNum", num.toString());
        navigate(`/product?${qs.toString()}`);
    };

    const handleStatusChange = (item, newIsActive) => {
        const id = (currentTab === 'PRODUCT' ? item.productId : item.serviceId);
        const apiEndpoint = (currentTab === 'PRODUCT') ? `/v1/product/${id}` : `/v1/service/${id}`;
        axios.patch(apiEndpoint, { isActive: newIsActive })
            .then(() => {
                setPageInfo(prevPageInfo => {
                    const newList = prevPageInfo.list.map(listItem => {
                        const listItemId = (currentTab === 'PRODUCT' ? listItem.productId : listItem.serviceId);
                        if (listItemId === id) {
                            return { ...listItem, isActive: newIsActive };
                        }
                        return listItem;
                    });
                    return { ...prevPageInfo, list: newList };
                });
            })
            .catch(err => console.log(err));
    };

    const handleRowClick = (item) => {
        const fromPath = `/product?${params.toString()}`;
        const type = currentTab;
        const id = type === 'PRODUCT' ? item.productId : item.serviceId;
        const detailPath = type === 'PRODUCT' ? `/product/product/${id}` : `/product/service/${id}`;
        navigate(detailPath, { state: { from: fromPath, type } });
    };

    const handleReset = () => {
        navigate(`/product?tab=${currentTab}`);
        setLocalKeyword(""); // localKeyword 초기화
    };

    const productColumns = [
        { key: 'codeBName', label: '상품 구분' },
        { key: 'name', label: '상품 이름' },
        { key: 'price', label: '판매가' },
        { key: 'isActive', label: '활성화' }
    ];

    return (
        <div className="d-flex" style={{ height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
            {/* 왼쪽 패널 */}
            <div
                style={{ width: '350px', borderRight: '1px solid #dee2e6', overflowY: 'auto' }}
                className="bg-light d-flex flex-column p-3"
            >
                {/* 등록 버튼 */}
                <div className="mb-3">
                    <NavLink
                        to="/product/create"
                        className="btn btn-primary w-100"
                        state={{ defaultTab: currentTab }}
                    >
                        <i className="bi bi-plus-lg me-2"></i>상품 등록하기
                    </NavLink>
                </div>

                {/* 탭 필터 */}
                <div className="mb-3">
                    <div className="btn-group w-100">
                        <button
                            className={`btn btn-outline-secondary ${currentTab === 'PRODUCT' ? 'active' : ''}`}
                            onClick={() => handleTabChange('PRODUCT')}
                        >
                            실물 상품
                        </button>
                        <button
                            className={`btn btn-outline-secondary ${currentTab === 'SERVICE' ? 'active' : ''}`}
                            onClick={() => handleTabChange('SERVICE')}
                        >
                            서비스 상품
                        </button>
                    </div>
                </div>

                {/* 필터 및 검색 영역 */}
                <div className="border p-3 rounded bg-white">
                    <div className="mb-3">
                        <label className="form-label fw-bold">카테고리</label>
                        <CategoryCheckbox
                            codeAId={currentTab}
                            checkedList={categoryCodes}
                            onChange={handleCategoryChange}
                        />
                    </div>
                    <div>
                        <label className="form-label fw-bold">상품명</label>
                        <div className="d-flex gap-2">
                            <ProductSearchBar
                                keyword={localKeyword} // localKeyword 사용
                                onSearchChange={handleSearchChange}
                                onSearchClick={handleSearchClick}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="btn btn-outline-secondary" onClick={handleReset}>
                                <i className="bi bi-arrow-counterclockwise" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 오른쪽 패널 */}
            <div className="flex-grow-1 p-4 overflow-auto bg-white">
                <ProductListComponent
                    pageInfo={pageInfo}
                    onPageChange={pageMove}
                    onToggleChange={handleStatusChange}
                    columns={productColumns}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={handleRowClick}
                    loading={loading}
                />
            </div>
        </div>
    );
}

export default ProductList;