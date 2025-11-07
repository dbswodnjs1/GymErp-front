// src/components/ScheduleCalendar.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import CustomToolbar from "./CustomToolbar";             // 그대로 사용
import "bootstrap/dist/css/bootstrap.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../components/css/ScheduleCalendar.css";

const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // 0=일요일 시작
  getDay,
  locales,
});


/** ✅ 주말 배경 (CSS 없이 inline) */
const weekendPropGetter = (date) => {
  const d = date.getDay(); // 0=Sun, 6=Sat
  if (d === 0) return { style: { background: "#fff1f1" } }; // 일
  if (d === 6) return { style: { background: "#f1f6ff" } }; // 토
  return {};
};

/** yyyyMMdd 문자열 만들기 */
const ymd = (d) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;


function ScheduleCalendar({
  events,
  onSelectSlot,
  onSelectEvent,                                         // ★ FIX: 부모 위임
  isAdmin = false,
  focusDate,
}) {
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());


  // ✅ 공휴일 상태
  const [holidaySet, setHolidaySet] = useState(() => new Set());
  const [holidayEvents, setHolidayEvents] = useState([]);

  // 🔎 검색 결과로 넘어온 특정 날짜에 포커스
  useEffect(() => {
    if (focusDate instanceof Date && !Number.isNaN(focusDate)) {
      setCurrentDate(focusDate);
    }
  }, [focusDate]);


  // ✅ 현재 표시 연도(달력 네비에 맞춰) 기준으로 공휴일 로드
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  useEffect(() => {
    // ⚠️ 여기에 본인의 서비스키를 넣어주세요.
    const SERVICE_KEY = "22a7450681f54029593c12edd88ecfe7e3a91e6338559ca77a3398d25ec6c9b6"; // URL 인코딩된 키 사용 권장
    const url =
      `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo`
      + `?solYear=${currentYear}&numOfRows=100&ServiceKey=${SERVICE_KEY}&_type=json`;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        const items = data?.response?.body?.items?.item;

        if (!items) {
          if (!cancelled) { setHolidaySet(new Set()); setHolidayEvents([]); }
          return;
        }

        const arr = Array.isArray(items) ? items : [items];
        const hSet = new Set();
        const hEvents = arr.map((it) => {
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
        }).filter(Boolean);

        if (!cancelled) {
          setHolidaySet(hSet);
          setHolidayEvents(hEvents);
        }
      } catch (e) {
        // 실패해도 앱이 깨지지 않도록 초기화
        if (!cancelled) {
          setHolidaySet(new Set());
          setHolidayEvents([]);
        }
        console.warn("공휴일 로드 실패:", e);
      }
    })();

    return () => { cancelled = true; };
  }, [currentYear]);

  // ✅ dayPropGetter: 주말 + 공휴일 배경 겹침 처리
  const dayPropGetter = (date) => {
    const base = weekendPropGetter(date);
    const key = ymd(date);
    if (holidaySet.has(key)) {
      // 공휴일이 더 우선: 옅은 노랑
      const holidayBg = { background: "#fff7d6" };
      return { ...base, style: { ...(base.style || {}), ...holidayBg } };
    }
    return base;
  };

  // ✅ 최종 렌더 이벤트 = 기존 이벤트 + 공휴일 이벤트
  const mergedEvents = useMemo(() => {
    // 공휴일을 제일 위에 보이게 하고 싶으면 concat 순서 바꿔도 됨
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
        onSelectEvent={onSelectEvent}
        style={{ height: 600 }}
        /** 이벤트 색상(공휴일/기타) */
        eventPropGetter={(event) => {
          // 공휴일 이벤트는 비선택/연한 배경
          if (event.isHoliday) {
            return {
              style: {
                backgroundColor: event.color || "#ff8a00",
                borderRadius: "6px",
                color: "white",
                opacity: 0.9,
              },
              // 클릭을 막고 싶다면: className: "no-pointer" + CSS pointer-events: none;
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
        /** ✅ 주말 + 공휴일 배경 강조 */
        dayPropGetter={dayPropGetter}
        /** 뷰/네비게이션 상태 */
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        /** 커스텀 툴바 */
        components={{ toolbar: Toolbar }}
        views={["month", "week", "day"]}
        defaultView="month"
        popup={false}
        doShowMoreDrillDown={false}
        onDrillDown={() => {}}
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

export default ScheduleCalendar;
