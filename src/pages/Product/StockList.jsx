import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import CategoryCheckbox from '../../components/CategoryCheckbox';
import ProductSearchBar from '../../components/ProductSearchBar';
import ProductListComponent from '../../components/ProductListComponent';
import axios from 'axios';
import Pagination from '../../components/Pagination';

function StockList() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [search, setSearch] = useState({ keyword: "" });
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [pageInfo, setPageInfo] = useState({
        list: [],
        pageNum: 1,
        startPageNum: 1,
        endPageNum: 1,
        totalPageCount: 1
    });
    const [inboundPageInfo, setInboundPageInfo] = useState({
        list: [],
        pageNum: 1,
        totalPageCount: 1
    });
    const [outboundPageInfo, setOutboundPageInfo] = useState({
        list: [],
        pageNum: 1,
        totalPageCount: 1
    });
    //정렬 state
    const [sortConfig, setSortConfig] = useState({ 
        key: 'codeBName', // 백엔드 @RequestParam 기본값과 일치
        direction: 'ASC' // 백엔드 @RequestParam 기본값과 일치
    });
    //날짜 state
    const [filterDetails, setFilterDetails] = useState({
        startDate: '',
        endDate: ''
    });


    const productColumns = [
        { key: 'codeBName', label: '상품 구분' },
        { key: 'name', label: '상품 이름' },
        { key: 'quantity', label: '수량' } // 이 key가 renderCell의 if문과 일치
    ];

    const [params] = useSearchParams();
    const navigate = useNavigate();

    //상품 목록 가져오기
    useEffect(()=>{
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

        axios.get(`/v1/product?${qs.toString()}`)
            .then(res=>{
                setPageInfo(res.data);
                // 목록을 불러온 직후, 그리고 아직 아무것도 선택되지 않았을 때
                if (res.data.list.length > 0 && selectedItemId === null) {
                    // 목록의 "첫 번째 아이템 ID"로 selectedItemId를 설정
                    setSelectedItemId(res.data.list[0].productId); 
                }
            })
            .catch(err=>console.log(err));

    },[params, sortConfig]);

    //입고 내역 가져오기
    useEffect(()=>{
        const page = params.get("inboundPage") || 1;
        const qs = new URLSearchParams();
        qs.set("inboundPage", page.toString());
        if (filterDetails.startDate) {
            qs.set("startDate", filterDetails.startDate);
        }
        if (filterDetails.endDate) {
            qs.set("endDate", filterDetails.endDate);
        }
        if(selectedItemId){
            const url = `/v1/stock/${selectedItemId}/inbound?${qs.toString()}`;
            axios.get(url)
            .then(res=>{
                setInboundPageInfo(res.data);
            })
        }
        
    },[params, selectedItemId, filterDetails]);

    //출고 내역 가져오기
    useEffect(()=>{
        const page = params.get("outboundPage") || 1;
        const qs = new URLSearchParams();
        qs.set("outboundPage", page.toString());
        if (filterDetails.startDate) {
            qs.set("startDate", filterDetails.startDate);
        }
        if (filterDetails.endDate) {
            qs.set("endDate", filterDetails.endDate);
        }
        if(selectedItemId){
            const url = `/v1/stock/${selectedItemId}/outbound?${qs.toString()}`;
            axios.get(url)
            .then(res=>{
                setOutboundPageInfo(res.data);
            })
        }
    },[params, selectedItemId, filterDetails]);

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
        navigate({ search: qs.toString() }); // (경로는 현재 페이지에 맞게)
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
        navigate(`/stock?${qs.toString()}`);
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
        navigate(`/stock?${qs.toString()}`);
    };

    const handleRowClick = (item) => {
        setSelectedItemId(item.productId);
        const qs = new URLSearchParams(params);
        qs.set("inboundPage", "1");
        qs.set("outboundPage", "1");
        navigate({ search: qs.toString() });
        setFilterDetails({
            startDate: '',
            endDate: ''
        });
    };

    const pageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("pageNum", num.toString());
        navigate(`/stock?${qs.toString()}`);
    };

    const inboundPageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("inboundPage", num.toString());
        navigate({ search: qs.toString() });
    };

    const outboundPageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("outboundPage", num.toString());
        navigate({ search: qs.toString() });
    };

    return (
        <div className="container-fluid mt-3">
            
            {/* 1. 메인 영역: 왼쪽 사이드바 + 오른쪽 컨텐츠 */}
            <div className="row g-3">
                
                {/* 1-1. 왼쪽 사이드바 (col-md-3) */}
                <div className="col-md-3">
                    
                    
                    <div className="p-3 mb-3 border rounded shadow-sm bg-white">
                        {/* 1-1a. 체크박스 영역 (흰색 박스) */}
                        <div className="pt-3">
                            <CategoryCheckbox
                            codeAId={'PRODUCT'}
                            checkedList={selectedCategories}
                            onChange={handleCategoryChange}
                        />
                        </div>
                        {/* 1-1b. 검색창 영역 (흰색 박스, 체크박스 아래) */}
                        <div className='pt-3'>
                            <ProductSearchBar
                            keyword={search.keyword}
                            onSearchChange={handleSearchChange}
                            onSearchClick={handleSearchClick}
                        />
                        </div>
                    </div>
                    
                    {/* 1-1c. 상품 목록 테이블 */}
                    <div className="mt-3">
                        <ProductListComponent
                            pageInfo={pageInfo}
                            onPageChange={pageMove}
                            columns={productColumns}
                            onRowClick={handleRowClick}
                            onSort={handleSort}
                            sortConfig={sortConfig}
                        />
                    </div>
                </div>

                {/* 1-2. 오른쪽 메인 컨텐츠 (col-md-9) */}
                <div className="col-md-9">
                    
                    {/* 2. "기간 선택" UI (오른쪽 영역의 최상단) */}
                    <div className="row justify-content-center g-3 align-items-end mb-3">
                        <div className="col-md-6"> 
                            <label htmlFor="startDate" className="form-label">기간 선택</label>
                            <div className="input-group">
                                <input
                                    type="date"
                                    id="startDate"
                                    className="form-control"
                                    value={filterDetails.startDate}
                                    onChange={(e) =>
                                        setFilterDetails((prev) => ({ ...prev, startDate: e.target.value }))
                                    }
                                />
                                <span className="input-group-text">~</span>
                                <input
                                    type="date"
                                    id="endDate"
                                    className="form-control"
                                    value={filterDetails.endDate}
                                    onChange={(e) =>
                                        setFilterDetails((prev) => ({ ...prev, endDate: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. 입고/출고 테이블 */}
                    <div className="row g-3">
                        
                        {/* 3-1. 입고 내역 (col-6) */}
                        <div className="col-md-6">
                            <NavLink 
                                to={`/stock/inbound/${selectedItemId}`}
                                className="btn btn-primary mb-2" 
                            >
                                입고
                            </NavLink>
                            <table className="table table-striped text-center table-sm"> 
                                <thead className="table-dark">
                                    <tr>
                                        <th>날짜</th>
                                        <th>수량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inboundPageInfo.list.map(item => (
                                        <tr key={`in-${item.createdAt}`}> 
                                            <td>{item.createdAt}</td>
                                            <td>{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination
                                page={inboundPageInfo.pageNum} 
                                totalPage={inboundPageInfo.totalPageCount} 
                                onPageChange={inboundPageMove}
                            />
                        </div>

                        {/* 3-2. 출고 내역 (col-6) */}
                        <div className="col-md-6">
                            <NavLink 
                                to={`/stock/outbound/${selectedItemId}`}
                                className="btn btn-secondary mb-2" 
                            >
                                출고
                            </NavLink>
                            <table className="table table-striped text-center table-sm"> 
                                <thead className="table-dark">
                                    <tr>
                                        <th>날짜</th>
                                        <th>수량</th>
                                        <th>사유</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outboundPageInfo.list.map(item => (
                                        <tr key={`out-${item.createdAt}`}>
                                            <td>{item.createdAt}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination
                                page={outboundPageInfo.pageNum} 
                                totalPage={outboundPageInfo.totalPageCount} 
                                onPageChange={outboundPageMove}
                            />
                        </div>
                    </div> 
                </div> 
            </div> 
        </div>
    );
}

export default StockList;