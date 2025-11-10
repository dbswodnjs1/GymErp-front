// ⚠️ import 및 초기화 부분 절대 수정 금지
import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMoreModule from "highcharts/highcharts-more";
import SolidGaugeModule from "highcharts/modules/solid-gauge";
import ChartWrapper from "./ChartWrapper";

// ✅ 모듈 초기화
const initModule = (mod) => {
  const fn = mod?.default || mod;
  if (typeof fn === "function") fn(Highcharts);
};
initModule(HighchartsMoreModule);
initModule(SolidGaugeModule);

function MemberVoucherPtStatusChart() {
  const [voucherPercent, setVoucherPercent] = useState(0);
  const [ptPercent, setPtPercent] = useState(0);
  const [voucherValid, setVoucherValid] = useState(0);
  const [voucherTotal, setVoucherTotal] = useState(0);
  const [ptRemain, setPtRemain] = useState(0);
  const [ptTotal, setPtTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, ptRes] = await Promise.all([
          axios.get("/v1/analytics/members/voucher"),
          axios.get("/v1/analytics/members/pt"),
        ]);

        const v = voucherRes.data || {};
        const valid = v.VALID || v.valid_count || 0;
        const expired = v.EXPIRED || v.expired_count || 0;
        const totalVoucher = valid + expired;
        const validPercent =
          totalVoucher > 0 ? Number(((valid / totalVoucher) * 100).toFixed(1)) : 0;

        const p = ptRes.data || {};
        const remaining = p.REMAINING_COUNT || p.remaining_count || 0;
        const exhausted = p.EXHAUSTED_COUNT || p.exhausted_count || 0;
        const totalPt = remaining + exhausted;
        const remainingPercent =
          totalPt > 0 ? Number(((remaining / totalPt) * 100).toFixed(1)) : 0;

        setVoucherValid(valid);
        setVoucherTotal(totalVoucher);
        setVoucherPercent(validPercent);

        setPtRemain(remaining);
        setPtTotal(totalPt);
        setPtPercent(remainingPercent);
      } catch (err) {
        console.error("❌ 회원권/PT 통계 조회 실패:", err);
      }
    };
    fetchData();
  }, []);

  // ✅ 반원 게이지 옵션
  const createGaugeOptions = (title, percent, validCount, totalCount, color, leftLabel, rightLabel) => ({
    chart: {
      type: "solidgauge",
      backgroundColor: "transparent",
      height: 270,
    },
    title: {
      text: title,
      style: { fontSize: "16px", fontWeight: "600", color: "#333" },
    },
    pane: {
      startAngle: -90,
      endAngle: 90,
      center: ["50%", "70%"],
      size: "110%",
      background: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "#f5f5f5"],
            [1, "#e0e0e0"],
          ],
        },
        innerRadius: "60%",
        outerRadius: "100%",
        shape: "arc",
        borderWidth: 0,
        shadow: true,
      },
    },
    tooltip: { enabled: false },
    yAxis: {
      min: 0,
      max: 100,
      stops: [
        [0.3, "#BDBDBD"],
        [0.7, color === "blue" ? "#64B5F6" : "#81C784"],
        [1.0, color === "blue" ? "#1976D2" : "#2E7D32"],
      ],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      labels: {
        distance: -35,
        y: 20,
        style: { fontSize: "13px", color: "#444", fontWeight: "600" },
        formatter: function () {
          if (this.value === 0) return `${leftLabel}${validCount}명`;
          if (this.value === 100) return `${rightLabel}${totalCount}명`;
          return "";
        },
      },
    },
    plotOptions: {
      solidgauge: {
        rounded: true,
        dataLabels: {
          y: -60, // ✅ 반원 상단 중앙
          borderWidth: 0,
          useHTML: true,
          format: `
            <div style="text-align:center;">
              <span style="
                font-size:34px;
                font-weight:900;
                color:#000;
                text-shadow:1px 1px 3px rgba(0,0,0,0.4);
              ">${percent}%</span>
            </div>
          `,
        },
      },
    },
    credits: { enabled: false },
    series: [
      {
        name: "비율",
        data: [percent],
        innerRadius: "60%",
        outerRadius: "100%",
        borderRadius: 20,
        shadow: {
          color: "rgba(0,0,0,0.25)",
          width: 3,
          offsetX: 1,
          offsetY: 2,
        },
      },
    ],
  });

  const voucherOptions = createGaugeOptions(
    "회원권 유효 회원 비율",
    voucherPercent,
    voucherValid,
    voucherTotal,
    "blue",
    "유효 회원 ",
    "총 회원 "
  );

  const ptOptions = createGaugeOptions(
    "PT 잔여 횟수 보유 회원 비율",
    ptPercent,
    ptRemain,
    ptTotal,
    "green",
    "잔여 회원 ",
    "총 회원 "
  );

  return (
    <ChartWrapper title="회원권 및 PT 잔여 현황">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          justifyItems: "center",
          width: "100%",
          padding: "10px 0 20px 0",
        }}
      >
        <div style={{ width: "80%" }}>
          <HighchartsReact highcharts={Highcharts} options={voucherOptions} />
        </div>
        <div style={{ width: "80%" }}>
          <HighchartsReact highcharts={Highcharts} options={ptOptions} />
        </div>
      </div>
    </ChartWrapper>
  );
}

export default MemberVoucherPtStatusChart;
