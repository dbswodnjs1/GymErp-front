// src/components/ScheduleOpenModal.jsx
import { useMemo } from "react";
import { Modal, Button, ListGroup, Badge } from "react-bootstrap";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import axios from "axios";
import "./css/ScheduleOpenModal.css";


// 타입별 표시(라벨/색)
const typeMeta = {
  "SCHEDULE-PT":     { label: "PT", variant: "success" },   // 초록
  "ETC-VACATION":    { label: "휴가", variant: "danger" },  // 빨강
  "ETC-COUNSEL":     { label: "상담", variant: "orange" }, // 노랑
  "ETC-MEETING":     { label: "회의", variant: "navy" }, // 남색
  "ETC-COMPETITION": { label: "대회", variant: "purple" },  // 보라 (커스텀)
};

export default function ScheduleOpenModal({
  show,
  date,          // Date 객체
  events = [],   // [{ id/shNum, title, start, end, codeBid, memo, ... }]
  onClose,
  onEdit,        // (optional) (event) => void
  onDeleted,     // (optional) () => void
}) {
  const sorted = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events]);

  const titleDate = useMemo(() => {
    if (!date) return "";
    return format(date, "yyyy.MM.dd (E)", { locale: ko });
  }, [date]);

  const fmtTime = (d) => format(new Date(d), "HH:mm");

  const metaOf = (codeBid = "") => {
    if (typeMeta[codeBid]) return typeMeta[codeBid];
    if (codeBid.startsWith?.("ETC")) return { label: "기타", variant: "warning" };
    return { label: "기타", variant: "secondary" };
  };

//   const handleDelete = async (ev) => {
//     if (!window.confirm("이 일정을 삭제할까요?")) return;
//     try {
//       // 프론트 규칙: 항상 /api/v1 사용
//       await axios.delete(`/api/v1/schedules/${ev.shNum ?? ev.id}`);
//       onDeleted?.();
//     } catch (e) {
//       alert("삭제 실패");
//       console.error(e);
//     }
//   };

// 유틸 함수
const titleLine = (ev) => {
  const emp = ev.empName || "";                          // 직원명
  const mem = ev.memberName || ev.memName || "";         // 회원명(필드명 여러 케이스 대응)
  const base = emp || ev.title || "일정";

  // PT인 경우에만 "직원 - 회원" 붙이기, 그 외는 직원/제목만
  if (ev.codeBid === "SCHEDULE-PT" && mem) return `${base} - ${mem}`;
  return base;
};


  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{titleDate} 일정 목록</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {sorted.length === 0 ? (
          <div className="text-muted">등록된 일정이 없습니다.</div>
        ) : (
          <ListGroup>
            {sorted.map((ev) => {
              const m = metaOf(ev.codeBid);
              return (
                <ListGroup.Item
                  key={ev.shNum ?? ev.id}
                  className="d-flex align-items-start gap-3"
                >
                  <Badge
                    bg={
                      !["purple", "navy", "orange"].includes(m.variant)
                        ? m.variant
                        : undefined
                    }
                    className={`mt-1 ${
                      m.variant === "purple"
                        ? "badge-purple"
                        : m.variant === "navy"
                        ? "badge-navy"
                        : m.variant === "orange"
                        ? "badge-orange"
                        : ""
                    }`}
                  >
                    {m.label}
                  </Badge>

                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                     {titleLine(ev)}
                    </div>
                    <div className="small text-muted">
                      {fmtTime(ev.start)} ~ {fmtTime(ev.end)}
                    </div>
                    {ev.memo && (
                      <div className="small mt-1 text-break">
                        {ev.memo}
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(ev)}
                      >
                        편집
                      </Button>
                    )}
                    {/* <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(ev)}
                    >
                      삭제
                    </Button> */}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
