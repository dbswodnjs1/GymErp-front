// src/components/icons/GymLinkLogo.jsx
import React from "react";

export default function GymLinkLogo({
  width = 220,
  colorStart = "#1e3a8a", // Deep navy blue (#1e3a8a)
  colorEnd = "#0f172a",   // Almost black-blue (#0f172a)
}) {
  return (
    <svg
      width={width}
      height={width * 0.32}
      viewBox="0 0 600 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        verticalAlign: "middle",
        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))",
      }}
    >
      <defs>
        <linearGradient id="gymlinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorStart} />
          <stop offset="100%" stopColor={colorEnd} />
        </linearGradient>
      </defs>

      <text
        x="50%"
        y="68%"
        textAnchor="middle"
        fontSize="92"
        fontWeight="900"
        letterSpacing="5"
        fill="url(#gymlinkGradient)"
        fontFamily="'Bebas Neue', 'Poppins', 'Pretendard', sans-serif"
      >
        GYMLINK
      </text>

      <rect
        x="100"
        y="142"
        width="400"
        height="5"
        rx="2.5"
        fill="url(#gymlinkGradient)"
      />
    </svg>
  );
}
