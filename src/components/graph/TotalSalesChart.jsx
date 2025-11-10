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
        console.log("✅ 실제 응답 구조:", res.data);
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

  // ✅ 범례/라벨 한국어 변환용 매핑
  const labelMap = {
    VOUCHER: "이용권",
    CLOTHES: "의류",
    DRINK: "음료",
    SUPPLEMENTS: "보충제",
  };

  const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      options3d: { enabled: true, alpha: 45, beta: 0, depth: 50, viewDistance: 40 },
      height: 420,
      width: 520,
      marginTop: -50,
      marginBottom: 70,
      spacingRight: 80,
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
        showInLegend: false,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          distance: -50,
          y: -8,
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

    // ✅ series에 한글 변환 적용
    series: [
      {
        name: "매출액",
        data: data.map((d) => {
          const key = d[0].toUpperCase();
          const displayName = labelMap[key] || (key === "PT" ? "PT" : d[0]);
          return {
            name: displayName, // ✅ 툴팁·라벨용 한글명
            y: d[1],
            color: colorMap[key] || "#90CAF9",
          };
        }),
      },
    ],
  };

  return (
    <ChartWrapper title="총 매출 그래프(최근 30일)">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "96%",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* ✅ 그래프 영역 */}
        <div
          style={{
            flex: "0 0 65%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 380,
            overflow: "hidden",
          }}
        >
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>

        {/* ✅ 우측 범례 (수동 렌더링, 한글 변환 적용) */}
        <div
          style={{
            marginTop: "130px",
            flex: "0 0 30%",
            paddingLeft: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {data.map((d, i) => {
            const key = d[0].toUpperCase();
            const displayName = labelMap[key] || (key === "PT" ? "PT" : d[0]);
            return (
              <div key={i} style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    backgroundColor: colorMap[key] || "#90CAF9",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                ></span>
                {displayName} ({d[1].toLocaleString()}원)
              </div>
            );
          })}
        </div>
      </div>
    </ChartWrapper>
  );
}

export default TotalSalesChart;
