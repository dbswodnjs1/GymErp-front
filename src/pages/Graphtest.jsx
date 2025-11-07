// src/pages/GraphTest.jsx
import React, { useState } from "react";
import TotalSalesChart from "../components/graph/TotalSalesChart";
import ServiceSalesChart from "../components/graph/ServiceSalesChart";
import ItemSalesChart from "../components/graph/ItemSalesChart";
import TrainerPerformanceChart from "../components/graph/TrainerPerformanceChart";
import AiMemberPredictionChart from "../components/graph/AiMemberPredictionChart";
import AiSalesPredictionChart from "../components/graph/AiSalesPredictionChart";

function GraphTest() {
  const [activeChart, setActiveChart] = useState(null); // 현재 선택된 그래프 상태

  // ✅ 버튼 목록 (제목 + key)
  const chartButtons = [
    { id: 1, label: "① 전체 매출 그래프" },
    { id: 2, label: "② 서비스 매출 그래프" },
    { id: 3, label: "③ 실물 상품 매출 그래프" },
    { id: 4, label: "④ 트레이너 실적 그래프" },
    { id: 5, label: "⑤ AI 회원수 예측 그래프" },
    { id: 6, label: "⑥ AI 매출 예측 그래프" },
  ];

  // ✅ 버튼 클릭 시 해당 그래프만 표시
  const renderChart = () => {
    switch (activeChart) {
      case 1:
        return <TotalSalesChart />;
      case 2:
        return <ServiceSalesChart />;
      case 3:
        return <ItemSalesChart />;
      case 4:
        return <TrainerPerformanceChart />;
      case 5:
        return <AiMemberPredictionChart />;
      case 6:
        return <AiSalesPredictionChart />;
      default:
        return (
          <p className="text-center text-muted mt-4">
            🔍 상단의 버튼을 클릭하면 그래프가 표시됩니다.
          </p>
        );
    }
  };

  return (
    <div className="container-fluid p-4 bg-light">
      <h4 className="fw-bold mb-4 text-center">📊 그래프 전체 테스트 페이지</h4>

      {/* ==========================
           그래프 선택 버튼 영역
      ========================== */}
      <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
        {chartButtons.map((btn) => (
          <button
            key={btn.id}
            className={`btn ${
              activeChart === btn.id ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setActiveChart(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ==========================
           그래프 출력 영역
      ========================== */}
      <div className="p-3 bg-white rounded-3 shadow-sm">
        {renderChart()}
      </div>
    </div>
  );
}

export default GraphTest;
