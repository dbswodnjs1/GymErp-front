// src/pages/Sales/SalesItemList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../components/Pagination';
import EmpSearchModal from '../../components/EmpSearchModal';
import SalesServiceSearchModal from '../../components/SalesServiceSearchModal';

const API_BASE = 'http://localhost:9000';
const LIST_API = `${API_BASE}/v1/sales/products`;

// empEmail을 목록 표시용으로 사용
const normalizeRow = (row, fallbackIndex) => {
  const id = row.itemSalesId ?? fallbackIndex;
  const qty = row.quantity ?? 0;
  const unit = row.unitPrice ?? 0;

  return {
    id,
    salesAt: row.createdAt ?? null,
    category: row.productType ?? '-',
    productName: row.productName ?? '-',
    quantity: qty,
    empText: row.empEmail ?? row.empNum ?? '-',
    totalAmount: row.totalAmount ?? unit * qty,
  };
};

const fetchSalesData = async (filter) => {
  const params = {
    page: filter.page,
    size: filter.size,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };
  if (filter.empNum) params.empNum = filter.empNum;
  if (filter.keyword) params.productNameKeyword = filter.keyword;

  const res = await axios.get(LIST_API, { params });

  const pageSize = Number(res.data?.pageSize ?? filter.size ?? 10);
  const totalCount = Number(res.data?.totalCount ?? 0);
  const list = Array.isArray(res.data?.list) ? res.data.list : [];

  return {
    list,
    totalPage: Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize,
    currentPage: Number(res.data?.currentPage ?? filter.page ?? 1),
  };
};

function SalesItemList() {
  const navigate = useNavigate();

  const tableRef = useRef(null);

  const [salesList, setSalesList] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 검색/필터
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [filterDetails, setFilterDetails] = useState({
    startDate: '',
    endDate: '',
    empNum: ''
  });

  // 직원 모달
  const [empModalOpen, setEmpModalOpen] = useState(false);

  // 서비스 모달(테스트용)
  const [svcModalOpen, setSvcModalOpen] = useState(false);
  const [pickedService, setPickedService] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { list, totalPage } = await fetchSalesData({
        page,
        size: 20,
        keyword,
        ...filterDetails
      });
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
    setPickedService(null);
    setFilterDetails({ startDate: '', endDate: '', empNum: '' });
  };

  const handleGoToCreate = () => {
    navigate('/sales/salesitemcreate');
  };

  const handleRowClick = (id) => setSelectedRow(Number(id));
  const handleRowDoubleClick = (id) => navigate('/sales/salesitemdetail', { state: { itemId: id } });

  const goToDetail = (id) => {
    navigate('/sales/salesitemdetail', { state: { itemId: id } });
  };

  return (
    <div
      className="d-flex"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f8f9fa',
        overflowX: 'hidden',
      }}
    >
      <main
        className="flex-grow-1 d-flex justify-content-center"
        style={{ padding: '40px 20px', boxSizing: 'border-box' }}
      >
        <div
          className="content-wrapper"
          style={{
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '30px 40px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            boxSizing: 'border-box',
          }}
        >
          <h2 className="border-bottom pb-2 mb-4 fw-bold">
            상품 판매 내역 조회
            <br />
            <br />
          </h2>

          {/* 필터 바 (SalesServiceList.jsx 스타일 적용) */}
          <div
            className="d-flex align-items-center flex-nowrap justify-content-end"
            style={{
              gap: "16px",
              overflowX: "auto",
              whiteSpace: "nowrap",
              width: "100%",
            }}
          >
            {/* 기간 */}
            <div className="d-flex align-items-center flex-shrink-0">
              <span className="me-2 fw-semibold">기간</span>
              <input
                type="date"
                className="form-control"
                style={{ width: "140px" }}
                value={filterDetails.startDate}
                onChange={(e) =>
                  setFilterDetails((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
              <span className="mx-2">~</span>
              <input
                type="date"
                className="form-control"
                style={{ width: "140px" }}
                value={filterDetails.endDate}
                onChange={(e) =>
                  setFilterDetails((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>

            {/* 직원 */}
            <div className="d-flex align-items-center flex-shrink-0">
              <span className="me-2 fw-semibold">직원</span>
              <input
                type="text"
                className="form-control"
                style={{ width: "180px" }}
                placeholder="선택된 직원"
                value={filterDetails.empNum ? `사원번호: ${filterDetails.empNum}`: ''}
                readOnly
                onClick={() => setEmpModalOpen(true)}
              />
              <button
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => setEmpModalOpen(true)}
                >
                  <i className="bi bi-search" />
              </button>
            </div>

            {/* 품목 */}
            <div className="d-flex align-items-center flex-shrink-0">
              <span className="me-2 fw-semibold">품목</span>
              <input
                type="text"
                className="form-control"
                style={{ width: "230px" }}
                placeholder="상품명을 입력하세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          {/* 초기화 버튼 (SalesServiceList.jsx 스타일 적용) */}
          <div className="d-flex justify-content-end mt-4 mb-3">
              <button
                className="btn btn-outline-dark d-flex align-items-center"
                style={{ height: "38px" }}
                onClick={handleReset}
              >
                <i className="bi bi-arrow-counterclockwise me-1" />
                초기화
              </button>
          </div>

          {/* 테이블 */}
          <div
            ref={tableRef}
            style={{
              maxHeight: "520px",
              overflowY: "auto",
              overflowX: "hidden",
              border: "1px solid #dee2e6",
              borderRadius: "6px",
            }}
          >
            <table
              className="table table-hover text-center align-middle mb-0"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "10%" }}>판매번호</th>
                  <th style={{ width: "15%" }}>판매 일시</th>
                  <th style={{ width: "10%" }}>구분</th>
                  <th style={{ width: "25%" }}>상품명</th>
                  <th style={{ width: "10%" }}>수량</th>
                  <th style={{ width: "20%" }}>판매자 이메일</th>
                  <th style={{ width: "10%" }}>총액(원)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">
                      로딩중...
                    </td>
                  </tr>
                ) : salesList.length > 0 ? (
                  salesList.map((item) => {
                    const formattedDate = item.salesAt
                      ? new Date(item.salesAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })
                      : '-';
                    const isSelected = Number(selectedRow) === Number(item.id);

                    return (
                      <tr key={item.id}>
                        <td colSpan="7" style={{ padding: 0 }}>
                          <div
                            onClick={() => handleRowClick(item.id)}
                            onDoubleClick={() => handleRowDoubleClick(item.id)}
                            className="d-flex text-center"
                            style={{
                              cursor: "pointer",
                              backgroundColor: isSelected
                                ? "#d9ffae"
                                : "transparent",
                              transition: "background-color 0.2s ease-in-out",
                              padding: "8px 0",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.backgroundColor =
                                  "#f5f6f7";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                            }}
                          >
                            <div style={{ width: "10%" }}>{item.id}</div>
                            <div style={{ width: "15%" }}>{formattedDate}</div>
                            <div style={{ width: "10%" }}>{item.category}</div>
                            <div style={{ width: "25%" }}>{item.productName}</div>
                            <div style={{ width: "10%" }}>{Number(item.quantity ?? 0).toLocaleString()}</div>
                            <div style={{ width: "20%" }}>{item.empText}</div>
                            <div style={{ width: "10%" }}>{Number(item.totalAmount ?? 0).toLocaleString()}</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-muted">조회된 판매 내역이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 하단: 페이지네이션 + 등록 버튼 */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="flex-grow-1 d-flex justify-content-center">
              <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
            </div>
            <button
              onClick={handleGoToCreate}
              className="btn btn-success d-flex align-items-center ms-3"
            >
              <i className="bi bi-journal-plus me-2" />
              판매 등록
            </button>
          </div>

          {/* 직원 선택 모달 */}
          <EmpSearchModal
            show={empModalOpen}
            onHide={() => setEmpModalOpen(false)}
            onExited={() => { }}
            onConfirm={(picked) => {
              setFilterDetails(prev => ({ ...prev, empNum: picked.empNum }));
              setPage(1);
            }}
            multi={false}
          />

          {/* 서비스 선택/검색 모달 (테스트용) */}
          <SalesServiceSearchModal
            show={svcModalOpen}
            onHide={() => setSvcModalOpen(false)}
            onExited={() => { }}
            onSelect={(svc) => {
              const name = svc.name || svc.serviceName || '';
              setPickedService(svc);
              setKeyword(name);
              setPage(1);
              setSvcModalOpen(false);
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default SalesItemList;
