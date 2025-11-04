import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ScheduleOpenModal from "./ScheduleOpenModal";

const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // ✅ 일요일 시작
  getDay,
  locales,
});

function ScheduleCalendar({ events, onSelectSlot, onSelectEvent }) {
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [more, setMore] = useState({ show: false, date: null, events: [] });
  const [holidayEvents, setHolidayEvents] = useState([]);

  /* ✅ 공휴일 불러오기 */
  useEffect(() => {
    const year = new Date().getFullYear();
    axios
      .get(`http://localhost:9000/api/public/holidays?year=${year}`)
      .then((res) => {
        const items = res.data?.response?.body?.items?.item || [];
        const holidays = items.map((d) => ({
          title: d.dateName,
          start: new Date(
            d.locdate.toString().slice(0, 4),
            Number(d.locdate.toString().slice(4, 6)) - 1,
            d.locdate.toString().slice(6, 8)
          ),
          end: new Date(
            d.locdate.toString().slice(0, 4),
            Number(d.locdate.toString().slice(4, 6)) - 1,
            d.locdate.toString().slice(6, 8)
          ),
          color: "#dc3545", // 공휴일 = 빨간색
        }));
        setHolidayEvents(holidays);
      })
      .catch((err) => console.error("❌ 공휴일 불러오기 실패:", err));
  }, []);

  /* 🔹 직원 일정 + 공휴일 병합 */
  const mergedEvents = [...events, ...holidayEvents];

  /* 🎨 요일별 + 오늘 날짜 스타일 지정 */
  const dayPropGetter = (date) => {
    const day = date.getDay();
    const today = new Date();

    // ✅ 오늘 날짜 강조 (밝은 연두색)
    if (isSameDay(date, today)) {
      return {
        style: {
          backgroundColor: "#e9ffd9", // 🌿 연두색 배경
          border: "2px solid #7bd857",
          fontWeight: "bold",
        },
      };
    }

    // 일요일
    if (day === 0) {
      return {
        style: {
          backgroundColor: "#fff5f5", // 연한 빨강
          color: "#e74c3c",
          fontWeight: "600",
        },
      };
    }

    // 토요일
    if (day === 6) {
      return {
        style: {
          backgroundColor: "#f0f6ff", // 연한 파랑
          color: "#3498db",
          fontWeight: "600",
        },
      };
    }

    // 평일
    return { style: {} };
  };

  return (
    <>
      <Calendar
        localizer={localizer}
        events={mergedEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        style={{ height: 600 }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color || "#007bff",
            borderRadius: "5px",
            color: "white",
            border: "none",
          },
        })}
        dayPropGetter={dayPropGetter} // ✅ 요일 및 오늘 강조
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        components={{ toolbar: CustomToolbar }}
        views={["month", "week", "day"]}
        defaultView="month"
        popup={false}
        onShowMore={(evts, date) => setMore({ show: true, date, events: evts })}
      />

      <ScheduleOpenModal
        show={more.show}
        date={more.date}
        events={more.events}
        onClose={() => setMore((s) => ({ ...s, show: false }))}
      />
    </>
  );
}

/* 🎛️ 커스텀 툴바 */
function CustomToolbar({ label, onNavigate, onView }) {
  return (
    <div className="rbc-toolbar d-flex justify-content-between align-items-center mb-3">
      <div>
        <button
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => onNavigate("PREV")}
        >
          Back
        </button>
        <button
          className="btn btn-outline-primary btn-sm me-1"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onNavigate("NEXT")}
        >
          Next
        </button>
      </div>
      <span className="fw-bold">{label}</span>
      <div>
        <button
          className="btn btn-outline-dark btn-sm me-1"
          onClick={() => onView("month")}
        >
          Month
        </button>
        <button
          className="btn btn-outline-dark btn-sm me-1"
          onClick={() => onView("week")}
        >
          Week
        </button>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={() => onView("day")}
        >
          Day
        </button>
      </div>
    </div>
  );
}

export default ScheduleCalendar;
