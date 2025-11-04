// src/pages/EmpAttendance/myAttendance.jsx
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import axios from "axios";

function EmpAttendanceMy() {
  //myEmpNum은 로컬스토리지나 인증 컨텍스트에서 가져와야 함 하단은 테스트용으로 3고정값 넣음
  const myEmpNum = 3; // 임의 고정
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ---- 시간 유틸(로컬/KST 기준 포맷) ----
  const toDate = (s) => {
    if (!s) return null;
    const str = String(s).trim().replace(" ", "T"); // 'YYYY-MM-DD HH:mm:ss' 대응
    const d = new Date(str);
    return isNaN(d) ? null : d;
  };
  const fmtTimeOnly = (s) => {
    const d = toDate(s);
    if (!d) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };
  const fmtDateOnly = (s) => {
    const d = toDate(s);
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const fmtDur = (sec) => {
    if (sec == null) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // ---- API ----
  const fetchList = async () => {
    if (!myEmpNum) {
      setError("내 empNum이 없습니다. localStorage에 empNum을 저장해주세요.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/api/v1/attendance", {
        params: { empNum: myEmpNum },
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 오늘 출근(퇴근 전) 레코드
  const openToday = useMemo(() => {
    const now = new Date();
    const ty = now.getFullYear(),
      tm = now.getMonth(),
      td = now.getDate();
    return rows.find((r) => {
      const base = r.attDate || r.checkIn || r.startedAt;
      const d = toDate(base);
      const sameDay = d && d.getFullYear() === ty && d.getMonth() === tm && d.getDate() === td;
      const notOut = !r.checkOut;
      return sameDay && notOut;
    });
  }, [rows]);

  const handleCheckIn = async () => {
    if (!myEmpNum) return;
    try {
      setLoading(true);
      setError("");
      await axios.post("/api/v1/attendance", { empNum: myEmpNum });
      setMessage("출근 처리했습니다");
      await fetchList();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "출근 처리 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!openToday) return;
    const attNum = openToday.attNum ?? openToday.id ?? openToday.num;
    try {
      setLoading(true);
      setError("");
      await axios.put(`/api/v1/attendance/${attNum}/checkout`);
      setMessage("퇴근 처리했습니다");
      await fetchList();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "퇴근 처리 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <Alert
          variant="success"
          onClose={() => setMessage("")}
          dismissible
          className="mt-3"
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError("")}
          dismissible
          className="mt-3"
        >
          {error}
        </Alert>
      )}

      <h1 className="mt-3">내 출퇴근</h1>

      {/* 상단 컨트롤 */}
      <div className="my-3 d-flex gap-2">
        <Button
          variant={openToday ? "secondary" : "success"}
          disabled={loading || !!openToday || !myEmpNum}
          onClick={handleCheckIn}
        >
          출근
        </Button>
        <Button
          variant="danger"
          disabled={!openToday || loading || !myEmpNum}
          onClick={handleCheckOut}
        >
          퇴근
        </Button>
        <Button
          variant="outline-secondary"
          disabled={loading || !myEmpNum}
          onClick={fetchList}
        >
          새로고침
        </Button>
      </div>

      {/* 오늘 요약 */}
      <div className="p-3 border rounded-3 mb-3">
        <div className="fw-semibold mb-2">오늘 요약</div>
        {openToday ? (
          <div className="d-flex flex-wrap gap-4">
            <div>
              <span className="text-muted me-2">날짜</span>
              {fmtDateOnly(openToday.attDate || openToday.checkIn)}
            </div>
            <div>
              <span className="text-muted me-2">출근</span>
              {fmtTimeOnly(openToday.checkIn)}
            </div>
            <div>
              <span className="text-muted me-2">퇴근</span>
              {openToday.checkOut ? fmtTimeOnly(openToday.checkOut) : "미퇴근"}
            </div>
            <div>
              <span className="text-muted me-2">상태</span>
              <span
                className={`badge ${
                  openToday.checkOut ? "text-bg-secondary" : "text-bg-success"
                }`}
              >
                {openToday.checkOut ? "근무 종료" : "근무 중"}

              </span>
            </div>
          </div>
        ) : (
          <div className="text-muted">오늘 출근 기록 없음</div>
        )}
      </div>


      {/* 최근 기록 테이블 */}
      <Table bordered hover size="sm" className="align-middle">
        <thead>
          <tr>
            <th style={{ width: 110 }}>일자</th>
            <th>출근</th>
            <th>퇴근</th>
            <th style={{ width: 120 }}>근무시간</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted py-4">
                데이터 없음
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const attDate = fmtDateOnly(r.attDate || r.checkIn || r.startedAt);
            const started = r.checkIn ?? r.startedAt;
            const ended = r.checkOut ?? r.endedAt;
            const duration = r.workHours ?? r.duration ?? r.durationS ?? r.durationSec;
            const key = r.attNum ?? r.id ?? `${started}-${ended}`;
            return (
              <tr key={key}>
                <td>{attDate}</td>
                <td>{fmtTimeOnly(started)}</td>
                <td>
                  {ended ? (
                    fmtTimeOnly(ended)
                  ) : (
                    <span className="text-danger">미퇴근</span>
                  )}
                </td>
                <td>{duration != null ? fmtDur(duration) : ended ? "-" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

export default EmpAttendanceMy;