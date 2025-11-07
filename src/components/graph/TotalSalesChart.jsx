// ⚠️ import 및 초기화 부분 절대 수정 금지
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import ChartWrapper from "./ChartWrapper";
import HighchartsMore from "highcharts/highcharts-more";
import HC3D from "highcharts/highcharts-3d";
if (typeof HighchartsMore === "function") HighchartsMore(Highcharts);
if (typeof HC3D === "function") HC3D(Highcharts);

function TotalSalesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/v1/analytics/sales/total");
        const list = (res.data || []).map((d) => [
          d.LABEL || d.label,
          Number(d.TOTAL_SALES || d.total_sales || 0),
        ]);
        setData(list);
      } catch (err) {
        console.error("총매출 그래프 조회 실패:", err);
      }
    };
    fetchData();
  }, []);

  const colorMap = {
    PT: "#1565C0",
    VOUCHER: "#42A5F5",
    CLOTHES: "#FF7043",
    DRINK: "#FFA726",
    SUPPLEMENTS: "#FFCC80",
  };

  const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      options3d: { enabled: true, alpha: 45, beta: 0, depth: 50, viewDistance: 40 },
      height: 420,
      width: 520, // 그래프 자체 살짝 확대
      marginTop: 10,
      marginBottom: 40,
      spacingRight: 80, // 범례 짤림 방지
    },

    title: { text: null },

    tooltip: {
      useHTML: true,
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#ccc",
      style: { fontSize: "13px" },
      pointFormat:
        "<b>{point.name}</b><br/>매출: <b>{point.y:,.0f}원</b><br/>점유율: <b>{point.percentage:.1f}%</b>",
    },

    plotOptions: {
      pie: {
        innerSize: 90,
        depth: 50,
        size: "85%",
        center: ["45%", "52%"],
        showInLegend: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          distance: -35, // ✅ 중심보다 살짝 위로 띄움
          y: -8, // ✅ 3D 깊이 때문에 잘리는 것 보정
          style: {
            fontSize: "14px",
            color: "#fff",
            fontWeight: "bold",
            textOutline: "none",
          },
          formatter: function () {
            return this.percentage >= 10
              ? Highcharts.numberFormat(this.percentage, 1) + "%"
              : null;
          },
        },
      },
    },

    legend: {
      enabled: true,
      align: "right",
      verticalAlign: "middle",
      layout: "vertical",
      x: 40,
      width: 180,
      itemMarginBottom: 6,
      symbolHeight: 12,
      symbolWidth: 12,
      itemStyle: {
        fontSize: "13px",
        fontWeight: "500",
        whiteSpace: "nowrap",
      },
      labelFormatter: function () {
        return `${this.name} (${Highcharts.numberFormat(this.y, 0)}원)`;
      },
    },

    credits: { enabled: false },

    series: [
      {
        name: "매출액",
        data: data.map((d) => ({
          name: d[0],
          y: d[1],
          color: colorMap[d[0].toUpperCase()] || "#90CAF9",
        })),
      },
    ],
  };

  return (
    <ChartWrapper title="전체 매출 그래프">
      {/* ✅ 컴포넌트 자체 폭 제한 (그래프는 확대됨) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 380,
          width: "500px", // ✅ 컴포넌트 폭 자체 축소
          margin: "0 auto",
          overflow: "hidden", // ✅ 잘림 방지
        }}
      >
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </ChartWrapper>
  );
}

export default TotalSalesChart;
