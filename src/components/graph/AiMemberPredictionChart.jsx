// src/components/Graph/AiMemberPredictionChart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import ChartWrapper from "./ChartWrapper";

function AiMemberPredictionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 데이터 로드 (AI 회원 예측)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/v1/analytics/ai/members");
        setData(res.data || []);
      } catch (err) {
        console.error("AI 회원 예측 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ 로딩 상태
  if (loading)
    return (
      <ChartWrapper title="연말 회원수 예측 그래프">
        <div className="text-center text-secondary">데이터를 불러오는 중입니다</div>
      </ChartWrapper>
    );

  // ✅ 데이터 없음
  if (!data || data.length === 0)
    return (
      <ChartWrapper title="연말 회원수 예측 그래프">
        <div className="text-center text-muted">표시할 데이터가 없습니다</div>
      </ChartWrapper>
    );

  // ✅ 월 보정 + 예측 라벨 처리
  const processedData = data.map((d) => {
    const rawMonth = d.month || d.MONTH || "";
    const dataType = d.data_type || d.DATA_TYPE || "";
    let adjustedMonth = rawMonth;
    if (dataType === "예측") {
      const dateObj = new Date(rawMonth + "-01");
      dateObj.setMonth(dateObj.getMonth() - 1);
      adjustedMonth = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}`;
    }
    return {
      month: adjustedMonth,
      predictedCount: d.predictedCount || d.PREDICTEDCOUNT,
      type: dataType,
    };
  }).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <ChartWrapper title="연말 회원수 예측 그래프">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={(v) => `${parseInt(v.split("-")[1])}월`}
          />
          <YAxis />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const info = payload[0].payload;
                const title =
                  info.type === "예측" ? "예측 회원수" : "실제 회원수";
                return (
                  <div
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      padding: "5px 10px",
                      borderRadius: "5px",
                    }}
                  >
                    <strong>{label}</strong>
                    <br />
                    {title}: {info.predictedCount?.toLocaleString()}명
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="predictedCount">
            {processedData.map((d, idx) => {
              const color =
                d.month.includes("2025-11") || d.month.includes("2025-12")
                  ? "#FF4C4C"
                  : "#0088FE";
              return <Cell key={`cell-${idx}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default AiMemberPredictionChart;
