// ⚠️ import 및 초기화 부분 절대 수정 금지
import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ChartWrapper from "./ChartWrapper";

function TrainerPerformanceChart() {
  const [data, setData] = useState([]);

  // ✅ 지난달 기준 트레이너 Top3 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/v1/analytics/trainer/performance");
        setData(res.data || []);
      } catch (err) {
        console.error("트레이너 실적 그래프 조회 실패:", err);
      }
    };
    fetchData();
  }, []);

  const options = {
    chart: {
      type: "bar", // ✅ 가로형 그래프
      backgroundColor: "transparent",
      height: 360,
    },
    title: { text: null },
    xAxis: {
      categories: data.map((d) => d.LABEL || d.label),
      title: { text: null },
      labels: { style: { fontSize: "13px", fontWeight: "500" } },
      lineColor: "#ccc",
      tickWidth: 0,
    },
    yAxis: {
      title: { text: null },
      labels: {
        formatter: function () {
          return Highcharts.numberFormat(this.value, 0);
        },
        style: { fontSize: "12px", color: "#666" },
      },
      gridLineDashStyle: "Dash",
      gridLineColor: "#e0e0e0",

      // ✅ 추가된 부분 (가로축 숫자 중복 방지)
      min: 0,
      tickInterval: 1,          // 눈금 간격 명확히 지정
      endOnTick: false,         // 마지막 눈금 중복 방지
      maxPadding: 0.05,         // 여백 줄이기
    },
    legend: { enabled: false },
    tooltip: {
      useHTML: true,
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#ccc",
      style: { fontSize: "13px" },
      pointFormat: "<b>{point.category}</b><br/>세션 수: <b>{point.y}회</b>",
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Math.abs(this.y) + "회";
          },
          style: { fontSize: "12px", fontWeight: "500" },
        },
      },
      series: { colorByPoint: true },
    },
    credits: { enabled: false },
    series: [
      {
        data: data.map((d) =>
          Math.abs(Number(d.TOTAL_SESSIONS || d.total_sessions || 0))
        ),
        colors: ["#1565C0", "#159277ff", "#FFA726"],
      },
    ],
  };

  return (
    <ChartWrapper title="트레이너 실적 그래프 (지난달 기준)">
      <div style={{ width: "600px", margin: "0 auto" }}>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </ChartWrapper>
  );
}

export default TrainerPerformanceChart;
