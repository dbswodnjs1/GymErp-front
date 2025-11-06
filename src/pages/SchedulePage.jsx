// src/pages/SchedulePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleModal from "../components/ScheduleModal";
import "../components/css/SchedulePage.css"; // ✅ 스타일 적용
/* ========= 공통 유틸 ========= */
const safeJson = (s) => {
  try { return JSON.parse(s); } catch { return null; }
};

// 공통 매핑 함수 (일정 → 캘린더 이벤트)
const typeMap = {
  PT: "PT",
  "SCHEDULE-PT": "PT",
  VACATION: "휴가",
  "ETC-COUNSEL": "상담",
  "ETC-MEETING": "회의",
  "ETC-COMPETITION": "대회",
};
const codeColor = (codeBid) =>
  codeBid === "PT" || codeBid === "SCHEDULE-PT" ? "#2ecc71" :
  codeBid === "VACATION" ? "#e74c3c" :
  codeBid === "ETC-COMPETITION" ? "#9b59b6" :
  codeBid === "ETC-COUNSEL" ? "#f39c12" :
  codeBid === "ETC-MEETING" ? "#34495e" : "#95a5a6";

function mapToEvents(list = []) {
  return list.map((e) => {
    const label = typeMap[e.codeBid] || e.codeBName || "일정";
    return {
      title:
        label === "PT"
          ? `[${label}] ${e.memName || "회원"} - ${e.memo || ""}`
          : `[${label}] ${e.empName || ""} - ${e.memo || ""}`,
      start: new Date(e.startTime),
      end: new Date(e.endTime),
      color: codeColor(e.codeBid),
      ...e,
    };
  });
}

// 저장소에서 역할 뽑기(여러 케이스 커버)
function readRoleFromStorage() {
  const candidates = [
    localStorage.getItem("loginUser"),
    sessionStorage.getItem("loginUser"),
    localStorage.getItem("user"),
    sessionStorage.getItem("user"),
    localStorage.getItem("emp"),
    sessionStorage.getItem("emp"),
  ].filter(Boolean);

  for (const c of candidates) {
    const obj = safeJson(c);
    if (!obj) continue;

    if (obj.role) return String(obj.role).toUpperCase();
    if (Array.isArray(obj.roles) && obj.roles.length) {
      const found = obj.roles.map((x) => String(x).toUpperCase()).find((x) => x.includes("ADMIN"));
      if (found) return found;
    }
    if (Array.isArray(obj.authorities) && obj.authorities.length) {
      const toStr = (x) => (typeof x === "string" ? x : x?.authority ?? "");
      const found = obj.authorities.map(toStr).map((s) => s.toUpperCase()).find((x) => x.includes("ADMIN"));
      if (found) return found;
    }
  }

  const direct = (localStorage.getItem("role") || sessionStorage.getItem("role") || "").toUpperCase();
  return direct || "";
}
const isAdminRole = (r) => (r || "").toUpperCase().includes("ADMIN");

/* ========= 페이지 ========= */
export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [focusDate, setFocusDate] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editData, setEditData] = useState(null);
  const [clickedDate, setClickedDate] = useState(null);

  // 직원 상세 → 일정으로 넘어올 때 URL 파라미터로 empNum/empName 받기
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const empNumFromUrl = params.get("empNum");
  const empNameFromUrl = params.get("empName");
  const storedUser = safeJson(sessionStorage.getItem("user"));
  const empNum = empNumFromUrl || storedUser?.empNum || null;
  const empName = empNameFromUrl || storedUser?.empName || null;

  const roleStr = readRoleFromStorage();
  const isAdmin = isAdminRole(roleStr);

  /* ============================================ */
  /** 일정 로딩 */
  const loadSchedules = async () => {
    try {
      const url = empNum
        ? `http://localhost:9000/v1/schedule/emp/${empNum}`
        : "http://localhost:9000/v1/schedule/all";

      const { data } = await axios.get(url);
      const loaded = mapToEvents(data || []);
      setEvents(loaded);
    } catch (err) {
      console.error("[일정 불러오기 실패]:", err);
    }
  };

  // 최초 & empNum 변경 시 로딩
  useEffect(() => {
    loadSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empNum]);

  /* ============================================ */
  /** 관리자 검색 (직원이름, 유형, 키워드만) */
  const searchAdmin = async ({ empName, codeBid, keyword }) => {
    if (!isAdmin) return; // 이중 차단

    const q = { page: 1, size: 20 };
    const kw = (empName || keyword || "").trim();
    if (kw) q.keyword = kw;
    if (codeBid) q.codeBid = codeBid;

    try {
      const { data } = await axios.get(`http://localhost:9000/v1/schedules/search`, { params: q });
      const list = data?.list || [];
      setEvents(mapToEvents(list));

      if (list.length > 0) {
        const first = list[0];
        setFocusDate(new Date(first.startTime)); // 포커스 이동
        const next = new URLSearchParams(location.search);
        next.set("empNum", String(first.empNum));
        if (first.empName) next.set("empName", first.empName);
        navigate({ search: `?${next.toString()}` }, { replace: true });
      } else {
        alert("검색 결과가 없습니다.");
      }
    } catch (e) {
      console.error("[관리자 검색 실패]", e);
    }
  };

  /* ============================================ */
  /** 캘린더 빈 칸 클릭 → 등록 */
  const handleSelectSlot = (slotInfo) => {
    const dateStr = format(slotInfo.start, "yyyy-MM-dd");
    setClickedDate(dateStr);
    setEditData(null);
    setShowModal(true);
  };

  /** 일정 클릭 → 상세 보기 */
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  /** 상세 보기 → 삭제 */
  const handleDelete = async () => {
    if (!selectedEvent?.shNum) { alert("삭제할 일정의 shNum이 없습니다."); return; }
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;
    try {
      const url = `http://localhost:9000/v1/schedule/delete/${selectedEvent.shNum}`;
      await axios.delete(url);
      alert("일정이 삭제되었습니다.");

      setShowDetailModal(false);
      setSelectedEvent(null);
      await loadSchedules();
    } catch (err) {
      console.error("[일정 삭제 실패]:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /** 상세 → 수정 전환 */
  const handleEdit = () => {
    setShowDetailModal(false);
    setEditData(selectedEvent);
    setShowModal(true);
  };

  return (
    <div>
      <h4 style={{ fontWeight: 600, color: "#444", fontSize: "1.8rem", marginBottom: "1.2rem" }}>
        일정관리
      </h4>
      <hr />

      {/* 관리자 전용 간단 검색바 */}
      {isAdmin ? <AdminSearchBar onSearch={searchAdmin} isAdmin={isAdmin} /> : null}

      {/* 캘린더 */}
      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        isAdmin={isAdmin}
        focusDate={focusDate} // 해당 월로 이동
      />

      {/* 등록/수정 모달 */}
      {showModal && (
        <ScheduleModal
          show={showModal}
          empNum={empNum}
          empName={empName}
          onSaved={async () => {
            await loadSchedules(); // 즉시 새로고침
            setShowModal(false);   // 모달 닫기
            setEditData(null);
          }}
          editData={editData}
          selectedDate={clickedDate}
        />
      )}

      {/* 상세 보기 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>일정 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent ? (
            <>
              <p><strong>유형:</strong> {selectedEvent.codeBName || selectedEvent.codeBid || "미지정"}</p>
              <p><strong>직원:</strong> {selectedEvent.empName || "-"}</p>
              {selectedEvent.memName && <p><strong>회원:</strong> {selectedEvent.memName}</p>}
              <p><strong>내용:</strong> {selectedEvent.memo || "내용 없음"}</p>
              <p><strong>시작:</strong> {format(selectedEvent.start, "yyyy-MM-dd HH:mm")}</p>
              <p><strong>종료:</strong> {format(selectedEvent.end, "yyyy-MM-dd HH:mm")}</p>
            </>
          ) : (
            <p>일정 정보를 불러오는 중...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleEdit}>수정</Button>
          <Button variant="danger" onClick={handleDelete}>삭제</Button>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>닫기</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/* ========= 관리자 간단 검색바 ========= */
function AdminSearchBar({ onSearch, isAdmin = false }) {
  if (!isAdmin) return null; // 🔒 안전장치

  const [empName, setEmpName] = useState("");
  const [codeBid, setCodeBid] = useState("");
  const [keyword, setKeyword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSearch?.({ empName: empName.trim(), codeBid, keyword: keyword.trim() });
  };
  const reset = () => {
    setEmpName(""); setCodeBid(""); setKeyword("");
    onSearch?.({ empName: "", codeBid: "", keyword: "" });
  };

  return (
    <div className="sch-wrap">
      <Form onSubmit={submit} className="sch-card">
        <Row className="gy-3 align-items-end">
          <Col md={3}>
            <div className="sch-label">직원이름</div>
            <Form.Control
              className="sch-input"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              placeholder="예) 시스템관리자"
            />
          </Col>
          <Col md={2}>
            <div className="sch-label">유형</div>
            <Form.Select
              className="sch-select"
              value={codeBid}
              onChange={(e) => setCodeBid(e.target.value)}
            >
              <option value="">전체</option>
              <option value="SCHEDULE-PT">PT</option>
              <option value="VACATION">휴가</option>
              <option value="ETC-MEETING">회의</option>
              <option value="ETC-COUNSEL">상담</option>
              <option value="ETC-COMPETITION">대회</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <div className="sch-label">키워드(메모/회원명 등)</div>
            <Form.Control
              className="sch-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예) 초기상담, 김철수"
            />
          </Col>
          <Col md="auto">
            <div className="d-flex gap-2 sch-actions">
              <Button type="submit" variant="primary">검색</Button>
              <Button type="button" variant="secondary" onClick={reset}>초기화</Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}