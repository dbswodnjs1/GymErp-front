// src/pages/Sales/SalesItemList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../components/Pagination';

// ✅ 백엔드 엔드포인트: 필요시 한 곳에서만 바꾸세요
const API_BASE = 'http://localhost:9000';
const LIST_API = `${API_BASE}/v1/sales/products`; // 예) /v1/sales/items 로 바꿔도 OK

/** ✅ 백엔드 응답 → 화면 표시에 쓰기 좋게 변환 */
const normalizeRow = (row, fallbackIndex) => {
  const id = row.itemSalesId ?? row.id ?? fallbackIndex;
  const unitPrice = row.unitPrice ?? row.price ?? 0;
  const qty = row.quantity ?? 0;
  return {
    id,
    salesAt: row.createdAt ?? row.salesAt ?? row.salesDate ?? null, // 판매일시(백엔드가 내려주는 이름에 맞춰 순차 매핑)
    category: row.categoryName ?? row.productType ?? row.codeBId ?? '-', // 구분
    productName: row.productName ?? row.name ?? '-', // 상품명
    quantity: qty,
    empText: row.empName ? `${row.empName} (${row.empNum ?? '-'})` : (row.empNum ?? '-'),
    totalAmount: row.totalAmount ?? unitPrice * qty
  };
};

/** ✅ 목록 조회 */
const fetchSalesData = async (filter) => {
  const params = {
    page: filter.page,
    size: filter.size,
    startDate: filter.startDate,
    endDate: filter.endDate
  };
  if (filter.empNum) params.empNum = filter.empNum;
  if (filter.keyword) params.productNameKeyword = filter.keyword;

  const res = await axios.get(LIST_API, { params });
  // 백엔드 표준 응답에 맞게 방어적으로 추출
  return {
    list: Array.isArray(res.data?.list) ? res.data.list : [],
    totalPage: Number(res.data?.totalPage ?? 1)
  };
};

function SalesItemList() {
  const navigate = useNavigate();

  // 상태
  const [salesList, setSalesList] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 검색/필터
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [filterDetails, setFilterDetails] = useState({
    startDate: '',
    endDate: '',
    empNum: ''
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { list, totalPage } = await fetchSalesData({
        page,
        size: 10,
        keyword,
        ...filterDetails
      });
      // ✅ 여기서 즉시 화면용으로 변환
      const normalized = list.map((row, idx) =>
        normalizeRow(row, list.length - idx)
      );
      setSalesList(normalized);
      setTotalPage(totalPage);
    } catch (e) {
      console.error('판매 내역 조회 실패:', e);
      setSalesList([]);
      setTotalPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, keyword, filterDetails]);

  useEffect(() => {
    load();
  }, [page, filterDetails, load]);

  const handleSearch = () => {
    if (page !== 1) setPage(1);
    else load();
  };

  const handleReset = () => {
    setPage(1);
    setKeyword('');
    setFilterDetails({ startDate: '', endDate: '', empNum: '' });
  };

  const handleGoToCreate = () => {
    // ✅ 라우터에 맞추세요: router/index.jsx에 "sales/item/create"가 있다면 아래처럼
    navigate('/sales/item/create');
  };

  const handleEmpSelect = (emp) => {
    setFilterDetails(prev => ({ ...prev, empNum: emp.empNum }));
  };

  return (
    <div className="container mt-4">
      <h2 className="border-bottom pb-2 mb-4">상품 판매 내역 조회</h2>


  <div className="card-body">
    <h5 className="card-title mb-3">검색 필터</h5>

    {/* ⬇️ 가운데 정렬된 입력 영역 */}
    <div className="row justify-content-center g-3 align-items-end">
      {/* 기간 선택 */}
      <div className="col-md-3">
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

      {/* 직원 선택 */}
      <div className="col-md-3">
        <label className="form-label">
          직원 <small className="text-muted">(사원번호: {filterDetails.empNum || "전체"})</small>
        </label>
        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => console.log("직원 검색 모달 열기")}
        >
          <i className="bi bi-person-fill me-1" />
          직원 선택
        </button>
      </div>

      {/* 상품명 + 검색 버튼 (한 줄) */}
      <div className="col-md-4">
        <label className="form-label">상품명 검색</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="품목 상품명을 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="btn btn-primary"
          >
            <i className="bi bi-search me-1" />
            검색
          </button>
        </div>
      </div>
    </div>

    {/* ⬇️ 오른쪽 아래 ‘초기화’ 버튼 */}
    <div className="row mt-3">
      <div className="col-12 d-flex justify-content-end">
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn btn-outline-secondary d-flex align-items-center"
        >
          <i className="bi bi-arrow-counterclockwise me-1" />
          초기화
        </button>
      </div>
    </div>
  </div>


      {/* 제목 + 등록 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>판매 목록 ({salesList.length} 건)</h4>
      </div>

      {/* 테이블 */}
      <table className="table table-striped table-hover text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>판매번호</th>
            <th>판매 일시</th>
            <th>구분</th>
            <th>상품명</th>
            <th>수량</th>
            <th>직원 ID</th>
            <th>총액(단위:원)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="7" className="text-center p-4">로딩중...</td>
            </tr>
          ) : salesList.length > 0 ? (
            salesList.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.salesAt ? new Date(item.salesAt).toLocaleString('ko-KR') : '-'}</td>
                <td className="fw-bold text-primary">{item.category}</td>
                <td>{item.productName}</td>
                <td>{Number(item.quantity ?? 0).toLocaleString()}</td>
                <td>{item.empText}</td>
                <td className="fw-bold">{Number(item.totalAmount ?? 0).toLocaleString()}원</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-muted">
                조회된 판매 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
        <button onClick={handleGoToCreate} className="btn btn-success">
          <i className="bi bi-journal-plus me-1" />
          판매 등록
        </button>    
      </table>

      {/* 페이지네이션 */}
      <div className="d-flex justify-content-center">
        <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default SalesItemList;
