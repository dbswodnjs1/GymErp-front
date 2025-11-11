import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CategoryCheckbox from '../../components/CategoryCheckbox';
import ProductSearchBar from '../../components/ProductSearchBar';
import Pagination from '../../components/Pagination';
import ProductListComponent from '../../components/ProductListComponent';

function StockList() {
    // 왼쪽: 상품 목록 상태
    const [pageInfo, setPageInfo] = useState({ list: [], pageNum: 1, totalPageCount: 1 });
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ASC' });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState({ keyword: "" });

    // 오른쪽: 재고 내역 상태
    const [selectedProductDetails, setSelectedProductDetails] = useState(null); // 선택된 상품 상세 정보
    const [inboundPageInfo, setInboundPageInfo] = useState({ list: [], pageNum: 1, totalPageCount: 1 });
    const [outboundPageInfo, setOutboundPageInfo] = useState({ list: [], pageNum: 1, totalPageCount: 1 });
    const [filterDetails, setFilterDetails] = useState({ startDate: '', endDate: '' });

    const [params, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // URL 파라미터에서 값 추출
    const productPageNum = params.get("productPage") || 1;
    const keyword = params.get("keyword") || "";
    const categoryCodes = params.getAll("categoryCodes") || [];
    const selectedProductId = params.get('productId');

    // 상품 목록(왼쪽) 데이터 로드
    useEffect(() => {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set("pageNum", productPageNum.toString());
        if (keyword) qs.set("keyword", keyword);
        categoryCodes.forEach(cat => qs.append('categoryCodes', cat));
        qs.set("sortBy", sortConfig.key);
        qs.set("direction", sortConfig.direction);

        axios.get(`/v1/product?${qs.toString()}`)
            .then(res => {
                setPageInfo(res.data);
            })
            .catch(err => console.error('상품 목록 조회 실패:', err))
            .finally(() => setLoading(false));
    }, [productPageNum, keyword, JSON.stringify(categoryCodes), sortConfig]);

    // 페이지 첫 로드 시, URL에 productId가 없으면 목록의 첫 항목을 기본 선택
    useEffect(() => {
        const currentParams = new URLSearchParams(params);
        if (!currentParams.has('productId') && pageInfo.list.length > 0) {
            const firstProductId = pageInfo.list[0].productId;
            currentParams.set('productId', firstProductId);
            // `replace: true`는 브라우저 히스토리에 새 항목을 추가하는 대신 현재 항목을 교체합니다.
            setSearchParams(currentParams, { replace: true });
        }
    }, [pageInfo.list, params, setSearchParams]);

    // selectedProductId가 변경되면, 해당 상품의 상세 정보와 재고 내역을 불러옴
    useEffect(() => {
        if (!selectedProductId) {
            setSelectedProductDetails(null);
            return;
        };

        // 1. 상품 상세 정보 가져오기
        axios.get(`/v1/product/${selectedProductId}`)
            .then(res => {
                setSelectedProductDetails(res.data);
            })
            .catch(err => {
                console.error('상품 상세 정보 조회 실패:', err);
                setSelectedProductDetails(null);
            });

        // 2. 재고 내역 가져오기
        const fetchStockHistory = (type, page, setter) => {
            const qs = new URLSearchParams();
            const paramName = type === 'inbound' ? 'inboundPage' : 'outboundPage';
            qs.set(paramName, page);
            if (filterDetails.startDate) qs.set("startDate", filterDetails.startDate);
            if (filterDetails.endDate) qs.set("endDate", filterDetails.endDate);
            
            axios.get(`/v1/stock/${selectedProductId}/${type}?${qs.toString()}`)
                .then(res => setter(res.data))
                .catch(err => console.log(err));
        };

        fetchStockHistory('inbound', params.get("inboundPage") || 1, setInboundPageInfo);
        fetchStockHistory('outbound', params.get("outboundPage") || 1, setOutboundPageInfo);

    }, [selectedProductId, params, filterDetails]);

    // 왼쪽 상품 목록 핸들러
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    const handleCategoryChange = (newCategories) => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set("productPage", "1");
        newParams.delete("categoryCodes");
        newCategories.forEach(cat => newParams.append('categoryCodes', cat));
        setSearchParams(newParams);
    };

    const handleSearchChange = (e) => {
        setSearch({ keyword: e.target.value });
    };

    const handleSearchClick = () => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set("productPage", "1");
        newParams.set("keyword", search.keyword);
        setSearchParams(newParams);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleReset = () => {
        const newParams = new URLSearchParams();
        if (params.get('productId')) {
            newParams.set('productId', params.get('productId'));
        }
        newParams.set("productPage", "1");
        setSearchParams(newParams);
        setSearch({ keyword: "" });
    };

    const productPageMove = (num) => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set("productPage", num.toString());
        setSearchParams(newParams);
    };

    const handleRowClick = (item) => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set('productId', item.productId);
        newParams.set('inboundPage', '1');
        newParams.set('outboundPage', '1');
        setSearchParams(newParams);
        setFilterDetails({ startDate: '', endDate: '' });
    };

    // 오른쪽 재고 내역 핸들러
    const inboundPageMove = (num) => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set("inboundPage", num.toString());
        setSearchParams(newParams);
    };

    const outboundPageMove = (num) => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set("outboundPage", num.toString());
        setSearchParams(newParams);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('ko-KR');
    };

    const productColumns = [
        { key: 'codeBName', label: '상품 구분' },
        { key: 'name', label: '상품 이름' },
        { key: 'quantity', label: '재고' }
    ];

    const renderRightPanel = () => {
        if (!selectedProductDetails) {
            return <div className="d-flex justify-content-center align-items-center h-100 text-muted">좌측에서 상품을 선택하거나 정보를 불러오는 중입니다...</div>;
        }

        return (
            <div>
                <h3 className="mb-1">{selectedProductDetails.name || '상품 정보'}</h3>
                <p className="text-muted mb-3">
                    상품 구분: {selectedProductDetails.codeBName || '-'}
                </p>
                <div className="row justify-content-center g-2 align-items-end mb-4">
                    <div className="col-md-8">
                        <label htmlFor="startDate" className="form-label">기간 선택</label>
                        <div className="input-group">
                            <input type="date" id="startDate" className="form-control" value={filterDetails.startDate} onChange={e => setFilterDetails(prev => ({ ...prev, startDate: e.target.value }))} />
                            <span className="input-group-text">~</span>
                            <input type="date" id="endDate" className="form-control" value={filterDetails.endDate} onChange={e => setFilterDetails(prev => ({ ...prev, endDate: e.target.value }))} />
                        </div>
                    </div>
                </div>
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h4>입고 내역</h4>
                            <NavLink to={`/stock/inbound/${selectedProductId}`} className="btn btn-sm btn-primary">입고 등록</NavLink>
                        </div>
                        <table className="table table-sm text-center">
                            <thead className="table-light"><tr><th>날짜</th><th>수량</th></tr></thead>
                            <tbody>
                                {inboundPageInfo.list.map(item => <tr key={`in-${item.createdAt}`}><td>{formatDateTime(item.createdAt)}</td><td>{item.quantity}</td></tr>)}
                            </tbody>
                        </table>
                        <Pagination page={inboundPageInfo.pageNum} totalPage={inboundPageInfo.totalPageCount} onPageChange={inboundPageMove} />
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h4>출고 내역</h4>
                            <NavLink to={`/stock/outbound/${selectedProductId}`} className="btn btn-sm btn-secondary">출고 등록</NavLink>
                        </div>
                        <table className="table table-sm text-center">
                            <thead className="table-light"><tr><th>날짜</th><th>수량</th><th>사유</th></tr></thead>
                            <tbody>
                                {outboundPageInfo.list.map(item => <tr key={`out-${item.createdAt}`}><td>{formatDateTime(item.createdAt)}</td><td>{item.quantity}</td><td>{item.notes}</td></tr>)}
                            </tbody>
                        </table>
                        <Pagination page={outboundPageInfo.pageNum} totalPage={outboundPageInfo.totalPageCount} onPageChange={outboundPageMove} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="d-flex" style={{ height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
            {/* 왼쪽 패널 */}
            <div style={{ width: '350px', borderRight: '1px solid #dee2e6' }} className="bg-light d-flex flex-column">
                <div className="p-3 border-bottom">
                    <div className="border p-3 rounded bg-white">
                        <div className="mb-3">
                            <label className="form-label fw-bold">카테고리</label>
                            <CategoryCheckbox codeAId={'PRODUCT'} checkedList={categoryCodes} onChange={handleCategoryChange} />
                        </div>
                        <div>
                            <label className="form-label fw-bold">상품명</label>
                            <div className="d-flex gap-2">
                                <ProductSearchBar 
                                    keyword={search.keyword} 
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
                <div className="flex-grow-1 p-3" style={{ minHeight: 0, overflowY: 'auto' }}>
                    <ProductListComponent
                        pageInfo={pageInfo}
                        columns={productColumns}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                        onRowClick={handleRowClick}
                        loading={loading}
                        selectedRowId={selectedProductId}
                        rowIdKey="productId"
                        onPageChange={productPageMove}
                    />
                </div>
            </div>
            {/* 오른쪽 패널 */}
            <div className="flex-grow-1 p-4 overflow-auto bg-white">
                {renderRightPanel()}
            </div>
        </div>
    );
}

export default StockList;
