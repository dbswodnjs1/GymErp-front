// import 및 초기화 부분은 수정하지 말 것
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

  /* ===============================
     1. 데이터 조회
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/v1/analytics/sales/total");
        console.log("실제 응답 구조:", res.data);
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

  /* ===============================
     2. 색상 및 라벨 매핑
  =============================== */
  const colorMap = {
    PT: "#1565C0",
    VOUCHER: "#42A5F5",
    CLOTHES: "#FF7043",
    DRINK: "#FFA726",
    SUPPLEMENTS: "#FFCC80",
  };

  const labelMap = {
    VOUCHER: "이용권",
    CLOTHES: "의류",
    DRINK: "음료",
    SUPPLEMENTS: "보충제",
  };

  /* ===============================
     3. Highcharts 옵션 설정
  =============================== */
  const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      options3d: { enabled: true, alpha: 45, beta: 0, depth: 50, viewDistance: 40 },
      height: 380,         // (기존 420 → 380)
      width: 460,          // (기존 520 → 460)
      marginTop: -30,      // (기존 -50 → -30)
      marginBottom: 40,    // (기존 70 → 40)
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
    series: [
      {
        name: "매출액",
        data: data.map((d) => {
          const key = d[0].toUpperCase();
          const displayName = labelMap[key] || (key === "PT" ? "PT" : d[0]);
          return {
            name: displayName,
            y: d[1],
            color: colorMap[key] || "#90CAF9",
          };
        }),
      },
    ],
  };

  /* ===============================
     4. 렌더링
  =============================== */
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
        {/* (1) 그래프 영역 */}
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

        {/* (2) 우측 범례 (한글 변환 적용) */}
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
