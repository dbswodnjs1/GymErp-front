// src/components/Graph/ChartWrapper.jsx
import React from "react";

function ChartWrapper({ title, children }) {
  return (
    <div className="border rounded p-3 mb-4">
      <h6 className="fw-bold mb-3">{title}</h6>
      <div style={{ width: "100%", height: 300 }}>{children}</div>
    </div>
  );
}

export default ChartWrapper;
