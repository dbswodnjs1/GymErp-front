import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import ChartWrapper from "./ChartWrapper";

function AiSalesPredictionChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/v1/analytics/ai/sales");
        console.log("✅ AI 매출 예측 응답:", res.data);
        setData(res.data || []);
      } catch (err) {
        console.error("❌ AI 매출 예측 조회 실패:", err);
      }
    };
    fetchData();
  }, []);

  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const nextYear = currentYear + 1;

  const categories = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

  const getValue = (obj, key) =>
    obj[key] ?? obj[key.toUpperCase()] ?? obj[key.toLowerCase()] ?? 0;

  const makeMonthlyData = (year, field) => {
    const filtered = data.filter((d) => Number(d.YEAR ?? d.year) === year);
    const monthMap = new Map(
      filtered.map((d) => [
        Number(d.MONTH ?? d.month),
        Number(getValue(d, field) || 0),
      ])
    );
    return Array.from({ length: 12 }, (_, i) => monthMap.get(i + 1) || 0);
  };

  const prevYearData = makeMonthlyData(prevYear, "TOTALAMOUNT");
  let currentYearData = makeMonthlyData(currentYear, "TOTALAMOUNT");
  const nextYearPredicted = makeMonthlyData(nextYear, "PREDICTED_SALES");

  // ✅ 올해 데이터는 "전 달까지"만 표시 (현재 달은 제외)
  const thisMonth = new Date().getMonth() + 1; // 1~12
  const lastMonth = thisMonth - 1 <= 0 ? 12 : thisMonth - 1; // 1월이면 12월로 보정
  currentYearData = currentYearData.slice(0, lastMonth);

  const options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      spacingTop: 10,
      spacingBottom: 30,
    },
    title: {
      text: "",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    xAxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
      title: { text: null },
    },
    yAxis: {
      title: { text: null },
      top: "0%",
      height: "70%",
      labels: {
        formatter() {
          return this.value.toLocaleString();
        },
      },
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter() {
        return `<b>${this.x}</b><br/>${this.points
          .map(
            (p) =>
              `${p.series.name}: <b>${p.y.toLocaleString()}원</b>`
          )
          .join("<br/>")}`;
      },
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      itemStyle: { fontSize: "12px" },
      y: 10,
    },
    series: [
      {
        name: `${prevYear}년 (작년 실제)`,
        data: prevYearData,
        color: "#8c8c8dff",
      },
      {
        name: `${currentYear}년 (올해 실제)`,
        data: currentYearData,
        color: "#000a14ff",
      },
      {
        name: `${nextYear}년 (예측)`,
        data: nextYearPredicted,
        color: "#fb1100ff",
        dashStyle: "ShortDash",
      },
    ],
    credits: { enabled: false },
  };

  return (
    <ChartWrapper title="AI 매출 예측 (작년 + 올해 + 내년 예측)">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </ChartWrapper>
  );
}

export default AiSalesPredictionChart;
