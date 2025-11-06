// src/components/CustomToolbar.jsx
import { format } from "date-fns";
import { ko } from "date-fns/locale";

function CustomToolbar({ date, label, onNavigate, onView, isAdmin = false, onAdminTest }) {

  const monthLabel = format(date, "yyyy년 M월", {locale:ko});

  return (
    <div className="mb-3">

      {/* 상단: 좌(이동) - 가운데(월/Today) - 우(뷰전환) */}
      <div className="rbc-toolbar d-flex align-items-center justify-content-between gap-2 toolbar-wrap">

        {/* 이동 버튼 그룹 */}
        <div className="btn-group">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("PREV")}>‹ Back</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("TODAY")}>Today</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("NEXT")}>Next ›</button>
        </div>
        
        {/* 월 제목 + 살짝 간격 */}
        <div className="text-center flex-grow-0">
          <div className="month-title">{monthLabel}</div>
        </div>

        {/* 보기 전환 + (옵션) 관리자 버튼 */}
        <div className="d-flex align-items-center">
          {isAdmin && (
            <button
              className="btn btn-danger btn-sm me-2"
              onClick={onAdminTest}
              title="관리자만 보임(테스트)"
            >
              관리자 테스트
            </button>
          )}
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onView("month")}>Month</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onView("week")}>Week</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onView("day")}>Day</button>
          </div>
        </div>
      </div>
      
      <hr className="my-3 toolbar-divider" />

    </div>
  );
}
export default CustomToolbar;
