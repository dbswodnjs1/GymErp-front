// src/components/ScheduleCalendar.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import CustomToolbar from "./CustomToolbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./css/ScheduleCalendar.css";
import ScheduleOpenModal from "./ScheduleOpenModal"; // ✅ 추가됨

/* ====== date-fns localizer ====== */
const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // 0=일요일 시작
  getDay,
  locales,
});

/* ====== 주말 배경 ====== */
const weekendPropGetter = (date) => {
  const d = date.getDay(); // 0=Sun, 6=Sat
  if (d === 0) return { style: { background: "#fff1f1" } }; // 일
  if (d === 6) return { style: { background: "#f1f6ff" } }; // 토
  return {};
};

/* yyyyMMdd 문자열 */
const ymd = (d) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;

/* ====== 컴포넌트 ====== */
function ScheduleCalendar({
  events = [],
  onSelectSlot,
  onSelectEvent, // 부모에서 핸들러 넘기면 사용
  isAdmin = false,
  focusDate,
}) {
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // ✅ onShowMore에 사용할 모달 상태
  const [more, setMore] = useState({ show: false, date: null, events: [] });

  // ✅ 공휴일 상태
  const [holidaySet, setHolidaySet] = useState(() => new Set());
  const [holidayEvents, setHolidayEvents] = useState([]);

  // 🔎 검색 결과로 넘어온 특정 날짜로 포커스 이동
  useEffect(() => {
    if (focusDate instanceof Date && !Number.isNaN(focusDate)) {
      setCurrentDate(focusDate);
    }
  }, [focusDate]);

  // ✅ 현재 달력의 연도 기준 공휴일 로드
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  useEffect(() => {
    // ⚠️ 서비스키는 환경변수/서버 프록시로 다루는 게 안전합니다.
    const SERVICE_KEY =
      "22a7450681f54029593c12edd88ecfe7e3a91e6338559ca77a3398d25ec6c9b6";
    const url =
      `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo` +
      `?solYear=${currentYear}&numOfRows=100&ServiceKey=${SERVICE_KEY}&_type=json`;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        const items = data?.response?.body?.items?.item;

        if (!items) {
          if (!cancelled) {
            setHolidaySet(new Set());
            setHolidayEvents([]);
          }
          return;
        }

        const arr = Array.isArray(items) ? items : [items];
        const hSet = new Set();
        const hEvents = arr
          .map((it) => {
            const s = it.locdate?.toString(); // 예: 20250101
            if (!s || s.length !== 8) return null;
            const y = Number(s.slice(0, 4));
            const m = Number(s.slice(4, 6)) - 1;
            const d = Number(s.slice(6, 8));
            const start = new Date(y, m, d, 0, 0, 0);
            const end = new Date(y, m, d, 23, 59, 59);
            const key = `${y}${String(m + 1).padStart(2, "0")}${String(d).padStart(2, "0")}`;
            hSet.add(key);
            return {
              id: `HOLI-${key}`,
              title: `🌟 ${it.dateName || "공휴일"}`,
              start,
              end,
              allDay: true,
              isHoliday: true,
              color: "#ff8a00",
            };
          })
          .filter(Boolean);

        if (!cancelled) {
          setHolidaySet(hSet);
          setHolidayEvents(hEvents);
        }
      } catch (e) {
        if (!cancelled) {
          setHolidaySet(new Set());
          setHolidayEvents([]);
        }
        console.warn("공휴일 로드 실패:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentYear]);

  // ✅ 주말 + 공휴일 배경 강조
  const dayPropGetter = (date) => {
    const base = weekendPropGetter(date);
    const key = ymd(date);
    if (holidaySet.has(key)) {
      const holidayBg = { background: "#fff7d6" };
      return { ...base, style: { ...(base.style || {}), ...holidayBg } };
    }
    return base;
  };

  // ✅ 최종 렌더 이벤트: 기존 + 공휴일
  const mergedEvents = useMemo(() => {
    return [...events, ...holidayEvents];
  }, [events, holidayEvents]);

  // 툴바에 isAdmin 주입
  const Toolbar = (props) => <CustomToolbar {...props} isAdmin={isAdmin} />;

  return (
    <>
      <Calendar
        localizer={localizer}
        culture="ko"
        events={mergedEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent ?? (() => {})} // ✅ 부모 미전달 시 안전 처리
        style={{ height: 600 }}
        eventPropGetter={(event) => {
          if (event.isHoliday) {
            return {
              style: {
                backgroundColor: event.color || "#ff8a00",
                borderRadius: "6px",
                color: "white",
                opacity: 0.9,
              },
            };
          }
          return {
            style: {
              backgroundColor: event.color || "#007bff",
              borderRadius: "5px",
              color: "white",
            },
          };
        }}
        dayPropGetter={dayPropGetter}
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        components={{ toolbar: Toolbar }}
        views={["month", "week", "day"]}
        defaultView="month"
        popup={false}
        doShowMoreDrillDown={false}
        onDrillDown={() => {}}
        onShowMore={(evts, date) => setMore({ show: true, date, events: evts })} // ✅ more 사용
      />

      <ScheduleOpenModal
        show={more.show}
        date={more.date}
        events={more.events}
        onClose={() => setMore((s) => ({ ...s, show: false }))}
        // 필요 시 편집 콜백 연결:
        // onEdit={(payload) => { ...; setMore((s)=>({ ...s, show:false })); }}
        onExited={() => {}}
      />
    </>
  );
}

export default ScheduleCalendar;
