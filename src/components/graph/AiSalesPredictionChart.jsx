// import 및 초기화 부분은 수정하지 말 것
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import ChartWrapper from "./ChartWrapper";

function AiSalesPredictionChart() {
  const [data, setData] = useState([]);

  /* ===============================
     1. 데이터 조회
     - AI 매출 예측 데이터 호출
  =============================== */
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

  /* ===============================
     2. 연도 계산 및 데이터 가공
     - 올해, 작년, 내년 데이터 분리
     - 월별 매출 배열 생성
  =============================== */
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const nextYear = currentYear + 1;
  const categories = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

  // 키 대소문자 혼용 방지용
  const getValue = (obj, key) =>
    obj[key] ?? obj[key.toUpperCase()] ?? obj[key.toLowerCase()] ?? 0;

  // 특정 연도의 월별 데이터 생성
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

  // 올해 데이터는 전 달까지 표시
  const thisMonth = new Date().getMonth() + 1;
  const lastMonth = thisMonth - 1 <= 0 ? 12 : thisMonth - 1;
  currentYearData = currentYearData.slice(0, lastMonth);

  /* ===============================
     3. Highcharts 옵션 정의
  =============================== */
  const options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      spacingTop: 10,
      spacingBottom: 0,
      marginBottom: 100,
    },
    title: {
      text: "",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    xAxis: {
      categories,
      labels: {
        style: { fontSize: "11px" },
        y: 10,
      },
      lineColor: "#ccc",
      tickLength: 5,
      offset: -10,
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
            (p) => `${p.series.name}: <b>${p.y.toLocaleString()}원</b>`
          )
          .join("<br/>")}`;
      },
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
      floating: true,
      y: -150,
      x: 50,
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 6,
      padding: 6,
      symbolPadding: 6,
      itemStyle: { fontSize: "12px" },
      itemMarginTop: 1,
      itemMarginBottom: 1,
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
        color: "#090a55ff",
      },
      {
        name: `${nextYear}년 (예측)`,
        data: nextYearPredicted,
        color: "#fb1100ff",
        lineWidth: 2,
        dashStyle: "Solid",
      },
    ],
    credits: { enabled: false },
  };

  /* ===============================
     4. 렌더링
  =============================== */
  return (
    <ChartWrapper title="작년+올해+내년 매출 분석 및 예측">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </ChartWrapper>
  );
}

export default AiSalesPredictionChart;
