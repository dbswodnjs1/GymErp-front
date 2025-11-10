import React from "react";

export default function CalendarLegend({ items = [] }) {
  return (
    <div className="rbc-legend">
      {items.map(({ key, label, color }) => (
        <div className="rbc-legend-item" key={key} title={label}>
          <span className="rbc-legend-dot" style={{ background: color }} />
          <span className="rbc-legend-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
