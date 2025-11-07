import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { FaSearch } from "react-icons/fa";
import MemberSearchModal from "../../components/MemberSearchModal";
import EmpModal from "../../components/EmpModal";

// axios.defaults.baseURL = "";

function SalesServiceList() {
  const [salesList, setSalesList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /* ✅ 필터 상태 */
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    member: "",
    memberName: "",
    employee: "",
    employeeName: "",
    productKeyword: "",
  });

  /* ✅ 모달 상태 */
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);

  const tableRef = useRef(null);

  /* ===============================
      [1] 데이터 로딩
  =============================== */
  useEffect(() => {
    fetchSalesList();
  }, [page, filters]);

  const fetchSalesList = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/v1/sales/services/paged", {
        params: {
          page,
          limit: 20,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          serviceNameKeyword: filters.productKeyword || undefined,
          memNum: filters.member || undefined,
          empNum: filters.employee || undefined,
        },
      });

      const { list, totalCount } = res.data;
      setSalesList(list || []);
      setTotalPage(Math.ceil(totalCount / 20));
    } catch (err) {
      console.error("판매 내역 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
      [2] 필터 핸들러
  =============================== */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      member: "",
      memberName: "",
      employee: "",
      employeeName: "",
      productKeyword: "",
    });
  };

  /* ===============================
      [3] 모달 선택 핸들러
  =============================== */
  const handleSelectMember = (member) => {
    setFilters((prev) => ({
      ...prev,
      member: member.memNum,
      memberName: member.memName,
    }));
    setShowMemberModal(false);
  };

  const handleSelectEmp = (emp) => {
    setFilters((prev) => ({
      ...prev,
      employee: emp.empNum,
      employeeName: emp.empName,
    }));
    setShowEmpModal(false);
  };

  const handleRowClick = (id) => setSelectedRow(Number(id));
  const handleRowDoubleClick = (id) =>
    navigate(`/sales/salesservicedetail/${id}`);
  const handleCreate = () => navigate("/sales/salesservicecreate");

  /* ===============================
      [4] 렌더링
  =============================== */
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8f9fa",
        overflowX: "hidden",
      }}
    >
      <main
        className="flex-grow-1 d-flex justify-content-center"
        style={{ padding: "40px 20px", boxSizing: "border-box" }}
      >
        <div
          className="content-wrapper"
          style={{
            width: "100%",
            maxWidth: "1200px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "30px 40px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            boxSizing: "border-box",
          }}
        >
          <h2 className="border-bottom pb-2 mb- fw-bold">
            서비스 상품 판매 내역 조회
            <br />
            <br />
          </h2>

          {/* ===============================
              [필터 바 + 돋보기 아이콘 모달 연결]
          =============================== */}
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
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
              <span className="mx-2">~</span>
              <input
                type="date"
                className="form-control"
                style={{ width: "140px" }}
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>

            {/* 회원 */}
            <div className="d-flex align-items-center flex-shrink-0">
              <span className="me-2 fw-semibold">회원</span>
              <input
                type="text"
                className="form-control"
                style={{ width: "180px" }}
                placeholder="선택된 회원"
                value={filters.memberName}
                readOnly
              />
              <FaSearch
                size={18}
                className="text-secondary ms-2"
                style={{ cursor: "pointer" }}
                onClick={() => setShowMemberModal(true)}
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
                value={filters.employeeName}
                readOnly
              />
              <FaSearch
                size={18}
                className="text-secondary ms-2"
                style={{ cursor: "pointer" }}
                onClick={() => setShowEmpModal(true)}
              />
            </div>

            {/* 품목 */}
            <div className="d-flex align-items-center flex-shrink-0">
              <span className="me-2 fw-semibold">품목</span>
              <input
                type="text"
                className="form-control"
                style={{ width: "230px" }}
                placeholder="서비스명을 입력하세요"
                value={filters.productKeyword}
                onChange={(e) =>
                  handleFilterChange("productKeyword", e.target.value)
                }
              />
            </div>
          </div>

          {/* 초기화 버튼 */}
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

          {/* ===============================
              [테이블 전체]
          =============================== */}
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
              className="table text-center align-middle mb-0"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "12.5%" }}>판매번호</th>
                  <th style={{ width: "12.5%" }}>판매 일시</th>
                  <th style={{ width: "12.5%" }}>구분</th>
                  <th style={{ width: "12.5%" }}>상품명</th>
                  <th style={{ width: "12.5%" }}>회원명</th>
                  <th style={{ width: "12.5%" }}>직원명</th>
                  <th style={{ width: "12.5%" }}>횟수</th>
                  <th style={{ width: "12.5%" }}>총액(원)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center">
                      로딩중...
                    </td>
                  </tr>
                ) : salesList.length > 0 ? (
                  salesList.map((item) => {
                    const formattedDate = item.createdAt
                      ? new Date(
                          new Date(item.createdAt).getTime() + 9 * 60 * 60 * 1000
                        )
                          .toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(/\./g, "-")
                          .replace(/\s/g, "")
                          .replace(",", "")
                      : "-";
                    const isSelected =
                      Number(selectedRow) === Number(item.serviceSalesId);

                    return (
                      <tr key={item.serviceSalesId}>
                        <td colSpan="8" style={{ padding: 0 }}>
                          <div
                            onClick={() => handleRowClick(item.serviceSalesId)}
                            onDoubleClick={() =>
                              handleRowDoubleClick(item.serviceSalesId)
                            }
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
                            <div style={{ width: "12.5%" }}>
                              {item.serviceSalesId}
                            </div>
                            <div style={{ width: "12.5%" }}>
                              {formattedDate}
                            </div>
                            <div style={{ width: "12.5%" }}>
                              {item.serviceType}
                            </div>
                            <div style={{ width: "12.5%" }}>
                              {item.serviceName}
                            </div>
                            <div style={{ width: "12.5%" }}>
                              {item.memName}
                            </div>
                            <div style={{ width: "12.5%" }}>
                              {item.empName}
                            </div>
                            <div style={{ width: "12.5%" }}>
                              {item.actualCount}
                            </div>
                            <div style={{ width: "12.5%" }}>
                              {item.actualAmount?.toLocaleString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-muted">
                      조회된 서비스 판매 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 하단 */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="flex-grow-1 d-flex justify-content-center">
              <Pagination
                page={page}
                totalPage={totalPage}
                onPageChange={(p) => setPage(p)}
              />
            </div>
            <button
              className="btn btn-success d-flex align-items-center ms-3"
              onClick={handleCreate}
            >
              <i className="bi bi-journal-plus me-2" />
              판매 등록
            </button>
          </div>

          {/* ===============================
              [모달 연결]
          =============================== */}
          <MemberSearchModal
            show={showMemberModal}
            onHide={() => setShowMemberModal(false)}
            onSelect={handleSelectMember}
          />
          <EmpModal
            show={showEmpModal}
            onClose={() => setShowEmpModal(false)}
            onSuccess={() => {
              setShowEmpModal(false);
              fetchSalesList();
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default SalesServiceList;
