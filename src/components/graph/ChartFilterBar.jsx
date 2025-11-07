// src/components/Graph/ChartFilterBar.jsx
import React from "react";

function ChartFilterBar({
  type = "", // "total" | "service" | "item" | "trainer"
  filters,
  setFilters,
}) {
  // ✅ 초기화 버튼
  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      categories: [],
      empId: "",
      categoryType: "",
    });
  };

  // ✅ 드롭다운 (총매출 그래프 전용)
  const handleDropdownChange = (e) => {
    setFilters({ ...filters, categoryType: e.target.value });
  };

  // ✅ 임시 alert 기반 모달 호출
  const handleDummyClick = (label) => {
    alert(`${label} 선택 모달이 열릴 예정입니다.`);
  };

  return (
    <div className="d-flex flex-column align-items-end mb-3">
      {/* ==========================
           1. 필터 행
      ========================== */}
      <div className="d-flex align-items-end justify-content-end flex-wrap gap-3 w-100">

        {/* ✅ 기간 필터 */}
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-1 fw-semibold">기간</label>
          <input
            type="date"
            className="form-control"
            style={{ width: "140px" }}
            value={filters.startDate || ""}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <span className="mb-2">~</span>
          <input
            type="date"
            className="form-control"
            style={{ width: "140px" }}
            value={filters.endDate || ""}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>

        {/* ✅ 품목 필터 (총매출 그래프 → 드롭다운) */}
        {type === "total" && (
          <div>
            <label className="form-label mb-1 fw-semibold">품목</label>
            <select
              className="form-select"
              style={{ width: "160px" }}
              value={filters.categoryType || ""}
              onChange={handleDropdownChange}
            >
              <option value="">전체</option>
              <option value="SERVICE">서비스 상품</option>
              <option value="ITEM">실물 상품</option>
            </select>
          </div>
        )}

        {/* ✅ 품목 필터 (서비스 / 실물 그래프 → alert 모달 호출) */}
        {type === "service" && (
          <div>
            <label className="form-label mb-1 fw-semibold">품목</label>
            <button
              className="btn btn-outline-primary w-100"
              style={{ width: "160px" }}
              onClick={() => handleDummyClick("서비스 품목")}
            >
              서비스 품목 선택
            </button>
          </div>
        )}

        {type === "item" && (
          <div>
            <label className="form-label mb-1 fw-semibold">품목</label>
            <button
              className="btn btn-outline-success w-100"
              style={{ width: "160px" }}
              onClick={() => handleDummyClick("실물 상품")}
            >
              실물 상품 선택
            </button>
          </div>
        )}

        {/* ✅ 직원 필터 (트레이너 실적 그래프 → alert 모달 호출) */}
        {type === "trainer" && (
          <div>
            <label className="form-label mb-1 fw-semibold">직원</label>
            <button
              className="btn btn-outline-secondary w-100"
              style={{ width: "160px" }}
              onClick={() => handleDummyClick("직원")}
            >
              직원 선택
            </button>
          </div>
        )}
      </div>

      {/* ==========================
           2. 초기화 버튼
      ========================== */}
      <div className="mt-2 w-100 d-flex justify-content-end">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={handleReset}
        >
          초기화
        </button>
      </div>
    </div>
  );
}

export default ChartFilterBar;
