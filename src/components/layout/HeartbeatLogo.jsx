// HeartbeatLogo.jsx (업데이트)
export default function HeartbeatLogo({
  size = 48,
  stroke = "#0a0f1f",     // ← 더 진한 다크 톤
  strokeWidth = 2.8,
  speed = 1.9,
  amplitude = 6,
  scaleAmp = 1.12,
  className = "",
}) {
  return (
    <svg
      width={size}
      height={(size * 24) / 64}
      viewBox="0 0 64 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`hb ${className}`}
      style={{
        "--hb-speed": `${speed}s`,
        "--hb-amp": `${amplitude}px`,
        "--hb-scale-amp": scaleAmp,
      }}
    >
      <path
        d="M2 12 H14 L18 4 L24 20 L30 6 L34 12 H62"
        // ⬇ 외부 CSS보다 우선하는 inline style로 강제 고정
        style={{
          stroke,                 // 진한 단색
          strokeOpacity: 1,       // 불투명 100%
          filter: "none",         // 글로우/블러 제거
          mixBlendMode: "normal", // 블렌드 해제
          shapeRendering: "auto", // 선 렌더링 기본
        }}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hb-path hb-solid" // 스코프 클래스 추가
        pathLength="100"
      />
    </svg>
  );
}
