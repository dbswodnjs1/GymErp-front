// src/components/Graph/ServiceSalesChart.jsx
import React, { useState } from "react";
import ChartWrapper from "./ChartWrapper";
import ChartFilterBar from "./ChartFilterBar";

function ServiceSalesChart() {
  // ✅ 필터 상태 (기간 + 품목 모달)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categories: [],
  });

  return (
    <div>
      {/* 🔹 필터바 (기간 + 서비스 품목 선택 모달 예정) */}
      <ChartFilterBar
        type="service"
        filters={filters}
        setFilters={setFilters}
      />

      {/* 🔹 그래프 */}
      <ChartWrapper
        title="서비스 매출 그래프"
        apiUrl="/v1/analytics/sales/service"
        defaultType="bar"
        filters={filters}
      />
    </div>
  );
}

export default ServiceSalesChart;
