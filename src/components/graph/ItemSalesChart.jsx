// src/components/Graph/ItemSalesChart.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ChartWrapper from "./ChartWrapper";
import ChartFilterBar from "./ChartFilterBar";

function ItemSalesChart() {
  // ✅ 필터 상태 (기간 + 품목)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categories: [],
  });

  // ✅ API 데이터 상태
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 색상 팔레트 (상품 중분류 기준)
  const COLORS = ["#82ca9d", "#8884d8", "#ffc658", "#ff7f50", "#00c49f"];

  // ✅ 데이터 로드 함수
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
        categories: filters.categories.length > 0 ? filters.categories : null,
      };
      const res = await axios.get("/v1/analytics/sales/item", { params });
      setChartData(res.data || []);
    } catch (err) {
      console.error("❌ 실물 상품 매출 데이터 조회 실패:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 필터 변경 시 자동 재조회
  useEffect(() => {
    fetchData();
  }, [filters]);

  // ✅ 툴팁 포맷터
  const formatTooltip = (value) =>
    `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;

  return (
    <div>
      {/* 🔹 필터바 (기간 + 실물 상품 선택 모달 예정) */}
      <ChartFilterBar type="item" filters={filters} setFilters={setFilters} />

      {/* 🔹 그래프 Wrapper */}
      <ChartWrapper title="실물 상품 매출 그래프">
        {loading ? (
          <div className="text-center mt-5">⏳ 로딩 중...</div>
        ) : chartData.length === 0 ? (
          <div className="text-center mt-5 text-muted">데이터가 없습니다.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group_label" />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={formatTooltip} />
              <Bar dataKey="total_sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartWrapper>

      {/* 🔹 원형 그래프 (중분류별 비율 시각화) */}
      {chartData.length > 0 && (
        <ChartWrapper title="상품 중분류별 비중 (원형)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total_sales"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ label, total_sales }) =>
                  `${label} / ${total_sales.toLocaleString()}원`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}
    </div>
  );
}

export default ItemSalesChart;
