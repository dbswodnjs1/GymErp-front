import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { FaSearch } from "react-icons/fa";
import MemberSearchModal from "../../components/MemberSearchModal";
import EmpSearchModal from "../../components/EmpSearchModal";

function SalesPtList() {
  const [ptList, setPtList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [ptTotalPage, setPtTotalPage] = useState(1);
  const [ptPage, setPtPage] = useState(1);
  const [ptLoading, setPtLoading] = useState(false);

  const [ptFilters, setPtFilters] = useState({
    startDate: "",
    endDate: "",
    member: "",
    memberName: "",
    employee: "",
    employeeName: "",
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchPtList();
  }, [ptPage, ptFilters]);

  const fetchPtList = async () => {
    setPtLoading(true);
    try {
      const res = await axios.get("/v1/log/pt/paged", {
        params: {
          page: ptPage,
          limit: 20,
          startDate: ptFilters.startDate || undefined,
          endDate: ptFilters.endDate || undefined,
          memNum: ptFilters.member || undefined,
          empNum: ptFilters.employee || undefined,
        },
      });
      console.log("📗 [FRONT/PT] 응답 데이터:", res.data);
      const { list, totalCount } = res.data;

      const normalizedList = (list || []).map((p) => ({
        usageId: p.USAGEID ?? p.usageId,
        memberName: p.MEMBERNAME ?? p.memberName,
        empName: p.EMPNAME ?? p.empName,
        status: p.STATUS ?? p.status,
        countChange: p.COUNTCHANGE ?? p.countChange,
        createdAt: p.CREATEDAT ?? p.createdAt,
      }));

      setPtList(normalizedList);
      setPtTotalPage(Math.ceil(totalCount / 20));
    } catch (err) {
      console.error("PT 내역 조회 실패:", err);
    } finally {
      setPtLoading(false);
    }
  };

  const handlePtFilterChange = (key, value) =>
    setPtFilters((prev) => ({ ...prev, [key]: value }));

  const resetPtFilters = () => {
    setPtFilters({
      startDate: "",
      endDate: "",
      member: "",
      memberName: "",
      employee: "",
      employeeName: "",
    });
  };

  const handleSelectMemberPt = (member) => {
    setPtFilters((prev) => ({
      ...prev,
      member: member.memNum,
      memberName: member.memName,
    }));
    setShowMemberModal(false);
  };

  const handleSelectEmp = (emp) => {
    setPtFilters((prev) => ({
      ...prev,
      employee: emp.empNum,
      employeeName: emp.empName,
    }));
    setShowEmpModal(false);
  };

  const handleRowClick = (id) => setSelectedRow(Number(id));

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
            PT 이용 내역 조회
            <br />
            <br />
          </h2>

          {/* 필터바 */}
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
                value={ptFilters.startDate}
                onChange={(e) => handlePtFilterChange("startDate", e.target.value)}
              />
              <span className="mx-2">~</span>
              <input
                type="date"
                className="form-control"
                style={{ width: "140px" }}
                value={ptFilters.endDate}
                onChange={(e) => handlePtFilterChange("endDate", e.target.value)}
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
                value={ptFilters.memberName}
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
                value={ptFilters.employeeName}
                readOnly
              />
              <FaSearch
                size={18}
                className="text-secondary ms-2"
                style={{ cursor: "pointer" }}
                onClick={() => setShowEmpModal(true)}
              />
            </div>
          </div>

          {/* 초기화 */}
          <div className="d-flex justify-content-end mt-4 mb-3">
            <button
              className="btn btn-outline-dark d-flex align-items-center"
              style={{ height: "38px" }}
              onClick={resetPtFilters}
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
              className="table text-center align-middle mb-0"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "20%" }}>회원명</th>
                  <th style={{ width: "20%" }}>직원명</th>
                  <th style={{ width: "20%" }}>상태</th>
                  <th style={{ width: "20%" }}>횟수</th>
                  <th style={{ width: "20%" }}>날짜</th>
                </tr>
              </thead>
              <tbody>
                {ptLoading ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center">
                      로딩중...
                    </td>
                  </tr>
                ) : ptList.length > 0 ? (
                  ptList.map((item) => {
                    const isSelected =
                      Number(selectedRow) === Number(item.usageId);
                    return (
                      <tr key={item.usageId}>
                        <td colSpan="5" style={{ padding: 0 }}>
                          <div
                            onClick={() => handleRowClick(item.usageId)}
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
                            <div style={{ width: "20%" }}>
                              {item.memberName}
                            </div>
                            <div style={{ width: "20%" }}>
                              {item.empName}
                            </div>
                            <div style={{ width: "20%" }}>{item.status}</div>
                            <div style={{ width: "20%" }}>
                              {item.countChange}
                            </div>
                            <div style={{ width: "20%" }}>
                              {item.createdAt}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-muted">
                      PT 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 하단 페이징 */}
          <div className="d-flex justify-content-center mt-4 mb-5">
            <Pagination
              page={ptPage}
              totalPage={ptTotalPage}
              onPageChange={setPtPage}
            />
          </div>

          {/* 모달 연결 */}
          <MemberSearchModal
            show={showMemberModal}
            onHide={() => setShowMemberModal(false)}
            onSelect={handleSelectMemberPt}
          />
          <EmpSearchModal
            show={showEmpModal}
            onHide={() => setShowEmpModal(false)}
            onSuccess={(selected) => {
              if (selected && selected.length > 0)
                handleSelectEmp(selected[0]);
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default SalesPtList;
