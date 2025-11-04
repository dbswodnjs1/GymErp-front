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

  // ✅ 직원 상세 → 일정으로 넘어올 때 URL 파라미터로 empNum, empName 받기
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const empNum = params.get("empNum");
  const empName = params.get("empName");

  /* ======================= 일정 로딩 ======================= */
  const loadSchedules = async () => {
    try {
      const url = empNum
        ? `http://localhost:9000/v1/schedule/emp/${empNum}`
        : "http://localhost:9000/v1/schedule/all";
      const res = await axios.get(url);

      console.log("📦 서버 응답:", res.data); // 디버깅용

      const loaded = res.data.map((e) => ({
        id: e.shNum,
        title: `[${e.codeBName || e.codeBid || "일정"}] ${e.empName || ""} - ${
          e.memo || ""
        }`,
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        color:
          e.codeBid === "SCHEDULE-PT"
            ? "#2ecc71" // PT
            : e.codeBid === "VACATION"
            ? "#e74c3c" // 휴가
            : e.codeBid?.startsWith("ETC")
            ? "#3498db" // 기타
            : "#95a5a6", // 기본색
        ...e,
      }));

      console.log("🎨 변환된 일정 데이터:", loaded);
      setEvents(loaded);
    } catch (err) {
      console.error("❌ 일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [empNum]);

  /* ======================= 캘린더 클릭 이벤트 ======================= */

  // 📅 빈칸 클릭 → 일정 등록
  const handleSelectSlot = (slotInfo) => {
    const dateStr = format(slotInfo.start, "yyyy-MM-dd");
    setClickedDate(dateStr);
    setEditData(null);
    setShowModal(true);
  };

  // 📄 일정 클릭 → 상세 보기
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  /* ======================= 일정 삭제 ======================= */
  const handleDelete = async () => {
    if (!selectedEvent?.shNum) return alert("삭제할 일정이 없습니다.");
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(
        `http://localhost:9000/v1/schedule/delete/${selectedEvent.shNum}`
      );
      alert("✅ 일정이 삭제되었습니다.");
      setShowDetailModal(false);
      loadSchedules();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /* ======================= 렌더 ======================= */
  return (
    <div>
      <h4 className="mb-3">📅 직원 일정 관리</h4>

      {/* 캘린더 */}
      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {/* 일정 등록/수정 모달 */}
      {showModal && (
        <ScheduleModal
          show={showModal}
          empNum={empNum}
          empName={empName}
          onClose={() => setShowModal(false)}
          onSaved={loadSchedules}
          editData={editData}
          selectedDate={clickedDate}
        />
      )}

      {/* 일정 상세 모달 */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📄 일정 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent ? (
            <>
              <p>
                <strong>유형:</strong> {selectedEvent.codeBName || "미지정"}
              </p>
              <p>
                <strong>직원:</strong> {selectedEvent.empName || "미지정"}
              </p>
              <p>
                <strong>내용:</strong> {selectedEvent.memo || "내용 없음"}
              </p>
              <p>
                <strong>시작:</strong>{" "}
                {format(selectedEvent.start, "yyyy-MM-dd HH:mm")}
              </p>
              <p>
                <strong>종료:</strong>{" "}
                {format(selectedEvent.end, "yyyy-MM-dd HH:mm")}
              </p>
            </>
          ) : (
            <p>일정 정보를 불러오는 중...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowDetailModal(false);
              setEditData(selectedEvent);
              setShowModal(true);
            }}
          >
            수정
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
