// src/pages/SchedulePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Modal, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleModal from "../components/ScheduleModal";

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editData, setEditData] = useState(null);
  const [clickedDate, setClickedDate] = useState(null);

  // 직원 상세 → 일정으로 넘어올 때 URL 파라미터로 empNum 받기
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const empNum = params.get("empNum");
  const empName = params.get("empName");

  /** ✅ 일정 로딩 */
  const loadSchedules = async () => {
    try {
      const url = empNum
        ? `http://localhost:9000/v1/schedule/emp/${empNum}`
        : "http://localhost:9000/v1/schedule/all";
      console.log("📡 [일정 로딩 요청] URL =", url);

      const res = await axios.get(url);

      const loaded = res.data.map((e) => {
        const isPT = e.codeBid === "PT" || e.codeBid === "SCHEDULE-PT";
        const typeLabel = e.codeBName || e.codeBId || "일정";
        const memLabel = isPT && e.memName ? ` ${e.memName}` : "";
        const empLabel = e.empName ? ` (${e.empName})` : "";
        const memoLabel = e.memo ? ` - ${e.memo}` : "";
        return {
          title: `[${typeLabel}]${memLabel}${empLabel}${memoLabel}`,
          start: new Date(e.startTime),
          end: new Date(e.endTime),
          color:
            isPT ? "#2ecc71"
              : e.codeBid === "VACATION" ? "#e74c3c"
                : e.codeBid?.startsWith("ETC") ? "#3498db"
                  : "#95a5a6",
          ...e, // ← e.memNum, e.memName 그대로 보존 (수정 모달에 넘겨줌)
        };
      });

      console.log("✅ [일정 로딩 완료]", loaded.length, "건");
      setEvents(loaded);
    } catch (err) {
      console.error("❌ [일정 불러오기 실패]:", err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [empNum]);

  /** ✅ 캘린더 빈 칸 클릭 → 등록 */
  const handleSelectSlot = (slotInfo) => {
    const dateStr = format(slotInfo.start, "yyyy-MM-dd");
    console.log("🟩 [빈 칸 클릭]", dateStr);
    setClickedDate(dateStr);
    setEditData(null);
    setShowModal(true);
  };

  /** ✅ 일정 클릭 → 상세 보기 */
  const handleSelectEvent = (event) => {
    console.log("🟦 [일정 클릭]", event);
    setSelectedEvent(event);
    setShowDetailModal(true);
  };
  //
  /** ✅ 상세 보기 → 삭제 */
  const handleDelete = async () => {
    if (!selectedEvent?.shNum) {
      alert("삭제할 일정의 shNum이 없습니다.");
      return;
    }
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;

    try {
      const url = `http://localhost:9000/v1/schedule/delete/${selectedEvent.shNum}`;
      console.log("🗑 [일정 삭제 요청]", url);

      await axios.delete(url);
      alert("✅ 일정이 삭제되었습니다.");

      // 모달 닫고 새로고침
      setShowDetailModal(false);
      setSelectedEvent(null);
      await loadSchedules();
    } catch (err) {
      console.error("❌ [일정 삭제 실패]:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 상세 → 수정 전환 */
  const handleEdit = () => {
    console.log("✏️ [상세 → 수정 모드 전환]");
    setShowDetailModal(false);
    setEditData(selectedEvent);
    setShowModal(true);
  };

  return (
    <div>
      <h4>📅 직원 일정 관리</h4>

      {/* 캘린더 */}
      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {/* 등록/수정 모달 */}
      {showModal && (
        <ScheduleModal
          show={showModal}
          empNum={empNum}
          empName={empName}
          onClose={() => {
            console.log("🔒 [등록 모달 닫기]");
            setShowModal(false);
            setEditData(null);
          }}
          onSaved={() => {
            console.log("💾 [저장 완료 → 새로고침]");
            loadSchedules();
            setShowModal(false);
            setEditData(null);
          }}
          editData={editData}
          selectedDate={clickedDate}
        />
      )}

      {/* 상세 보기 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📄 일정 상세 정보</Modal.Title>
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
          {/* 수정 버튼 */}
          <Button variant="primary" onClick={handleEdit}>
            수정
          </Button>
          {/* 삭제 버튼 */}
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          {/* 닫기 */}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
