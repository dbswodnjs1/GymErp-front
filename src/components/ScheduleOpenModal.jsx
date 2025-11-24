// src/components/ScheduleOpenModal.jsx
import { useMemo } from "react";
import { Modal, Button, ListGroup, Badge } from "react-bootstrap";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import "./css/ScheduleOpenModal.css";

// 라벨/색
const typeMeta = {
  "SCHEDULE-PT":     { label: "PT",   variant: "success" },
  "VACATION":        { label: "휴가", variant: "danger"  },
  "ETC-COUNSEL":     { label: "상담", variant: "orange"  },
  "ETC-MEETING":     { label: "회의", variant: "navy"    },
  "ETC-COMPETITION": { label: "대회", variant: "purple"  },
};

const normalizeCodeBid = (codeBid = "") => {
  if (/vacation/i.test(codeBid)) return "VACATION";
  if (codeBid === "SCHEDULE-PT") return "SCHEDULE-PT";
  if (codeBid.startsWith("ETC")) return codeBid;
  return codeBid || "";
};

const toIsoLocalMinute = (v) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toEditData = (ev) => {
  const codeBid = normalizeCodeBid(ev.codeBid || ev.refType || "");
  return {
    shNum: ev.shNum ?? ev.id,
    empNum: ev.empNum,
    empName: ev.empName,
    memNum: ev.memNum,
    memName: ev.memberName || ev.memName,
    codeBid,
    memo: ev.memo || ev.content || ev.title || "",
    startTime: toIsoLocalMinute(ev.start),
    endTime:   toIsoLocalMinute(ev.end),
  };
};

const titleLine = (ev) => {
  const emp = ev.empName || "";
  const mem = ev.memberName || ev.memName || "";
  const base = emp || ev.title || "일정";
  return normalizeCodeBid(ev.codeBid) === "SCHEDULE-PT" && mem ? `${base} - ${mem}` : base;
};

export default function ScheduleOpenModal({
  show,
  date,
  events = [],
  onClose,
  onEdit,
  onDeleted,
  onExited,                       // ✅ 닫힘 완료 콜백
}) {
  const sorted = useMemo(() => [...events].sort((a,b) => new Date(a.start) - new Date(b.start)), [events]);
  const titleDate = useMemo(() => (date ? format(date, "yyyy.MM.dd (E)", { locale: ko }) : ""), [date]);
  const fmtTime = (d) => format(new Date(d), "HH:mm");

  const metaOf = (codeBid = "") => {
    const key = normalizeCodeBid(codeBid);
    if (typeMeta[key]) return typeMeta[key];
    if (key.startsWith?.("ETC")) return { label: "기타", variant: "warning" };
    return { label: "기타", variant: "secondary" };
  };

  const handleItemClick = (ev) => {
    if (!onEdit) return;
    const payload = toEditData(ev);
    onEdit(payload);              // 부모: setShowListModal(false), onExited에서 등록모달 오픈
  };

  return (
    <Modal show={show} onHide={onClose} onExited={onExited} centered size="lg" backdrop="static">
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
                <ListGroup.Item key={ev.shNum ?? ev.id} className="p-0">
                  <div
                    role="button"
                    tabIndex={0}
                    className="w-100 d-flex align-items-start gap-3 p-3 clickable-block"
                    onClick={() => handleItemClick(ev)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleItemClick(ev);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Badge
                      bg={!["purple","navy","orange"].includes(m.variant) ? m.variant : undefined}
                      className={`mt-1 ${m.variant === "purple" ? "badge-purple" : m.variant === "navy" ? "badge-navy" : m.variant === "orange" ? "badge-orange" : ""}`}
                    >
                      {m.label}
                    </Badge>

                    <div className="flex-grow-1">
                      <div className="fw-semibold">{titleLine(ev)}</div>
                      <div className="small text-muted">{fmtTime(ev.start)} ~ {fmtTime(ev.end)}</div>
                      {ev.memo && <div className="small mt-1 text-break">{ev.memo}</div>}
                    </div>

                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={(e) => { e.stopPropagation(); handleItemClick(ev); }}>
                        편집
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}
