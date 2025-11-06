// src/components/CustomToolbar.jsx
function CustomToolbar({ label, onNavigate, onView, isAdmin = false, onAdminTest }) {
  return (
    <div className="rbc-toolbar d-flex justify-content-between align-items-center mb-3">
      <div>
        <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => onNavigate("PREV")}>Back</button>
        <button className="btn btn-outline-primary btn-sm me-1" onClick={() => onNavigate("TODAY")}>Today</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("NEXT")}>Next</button>
      </div>

      <span className="fw-bold">{label}</span>

      <div className="d-flex align-items-center">
        <button className="btn btn-outline-dark btn-sm me-1" onClick={() => onView("month")}>Month</button>
        <button className="btn btn-outline-dark btn-sm me-1" onClick={() => onView("week")}>Week</button>
        <button className="btn btn-outline-dark btn-sm" onClick={() => onView("day")}>Day</button>
      </div>
    </div>
  );
}
export default CustomToolbar;
