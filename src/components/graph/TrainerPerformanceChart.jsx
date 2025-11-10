// ⚠️ import 및 초기화 부분 절대 수정 금지
import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ChartWrapper from "./ChartWrapper";

function TrainerPerformanceChart() {
  const [data, setData] = useState([]);

  // ✅ 지난달 기준 트레이너 Top5 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/v1/analytics/trainer/performance");
        let sorted = (res.data || [])
          .sort((a, b) => {
            const sessionsA = Number(a.TOTAL_SESSIONS || a.total_sessions || 0);
            const sessionsB = Number(b.TOTAL_SESSIONS || b.total_sessions || 0);
            if (sessionsB === sessionsA) {
              return (
                Number(a.MEMBERID || a.memberId || 0) -
                Number(b.MEMBERID || b.memberId || 0)
              );
            }
            return sessionsB - sessionsA;
          })
          .slice(0, 5)
          .reverse(); // 왼쪽이 Top1

        // ✅ 부족한 항목은 "이름 없음"으로 채우기
        const filled = [...sorted];
        while (filled.length < 5) {
          filled.push({
            label: "이름 없음",
            TOTAL_SESSIONS: 0,
          });
        }
        setData(filled);
      } catch (err) {
        console.error("트레이너 실적 그래프 조회 실패:", err);
      }
    };
    fetchData();
  }, []);

  // ✅ 제목용: 지난달 계산
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const titleText = `트레이너 실적 순위 (${lastMonth}월)`;

  // ✅ 색상 정의 (Top5 + 빈칸용 회색)
  const colors = ["#1565C0", "#159277", "#FFA726", "#7E57C2", "#26C6DA"];
  while (colors.length < 5) colors.push("#E0E0E0");

  const options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      height: 360,
      spacingLeft: 0,
      spacingRight: 0,
    },
    title: { text: null },
    xAxis: {
      categories: data.map((d) => d.LABEL || d.label || "이름 없음"),
      title: { text: null },
      labels: {
        style: { fontSize: "13px", fontWeight: "500" },
      },
      lineColor: "#ccc",
      tickWidth: 0,
    },
    // ✅ yAxis만 수정
    yAxis: {
      min: 0,
      softMax:
        data.length > 0
          ? Math.max(
              ...data.map(
                (d) => Number(d.TOTAL_SESSIONS || d.total_sessions || 0)
              )
            ) + 2
          : 2,
      endOnTick: true,
      startOnTick: true,
      tickInterval: 1,
      allowDecimals: false,
      title: { text: null },
      labels: {
        formatter() {
          return Highcharts.numberFormat(this.value, 0);
        },
        style: { fontSize: "12px", color: "#666" },
      },
      gridLineDashStyle: "Dash",
      gridLineColor: "#e0e0e0",
    },
    legend: { enabled: false },
    tooltip: {
      useHTML: true,
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#ccc",
      style: { fontSize: "13px" },
      formatter() {
        return `<b>${this.x+1+"위"}</b><br/>세션 수: <b>${this.y}회</b>`;
      },
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        pointPadding: 0.05,
        groupPadding: 0.1,
        dataLabels: {
          enabled: true,
          format: "{y}회",
          style: { fontSize: "12px", fontWeight: "600" },
          y: -6,
        },
      },
      series: { colorByPoint: true },
    },
    credits: { enabled: false },
    series: [
      {
        data: data.map((d, i) =>
          Math.abs(Number(d.TOTAL_SESSIONS || d.total_sessions || 0))
        ),
        colors: colors,
      },
    ],
  };

  return (
    <ChartWrapper title={titleText}>
      <div
        style={{
          width: "95%",
          maxWidth: "700px",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </ChartWrapper>
  );
}

export default TrainerPerformanceChart;
