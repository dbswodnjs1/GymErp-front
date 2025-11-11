// src/pages/EmpAttendance.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Alert, Button, Table, Badge } from "react-bootstrap";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../components/css/EmpAttendance.css";
import Pagination from "../components/Pagination";

const api = axios.create({ baseURL: "/api/v1", withCredentials: true });

/* ===== 유틸 ===== */
const msPerDay = 24 * 60 * 60 * 1000;
const toLocalDate = (ymdStr) => {
  if (!ymdStr) return null;
  const [y, m, d] = ymdStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};
const toYmd = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};
const parse = (s) => {
  if (!s) return null;
  const d = new Date(String(s).trim().replace(" ", "T"));
  return isNaN(d) ? null : d;
};
const fmtTime = (s) => {
  const d = parse(s);
  if (!d) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};
const fmtDur = (sec) => {
  if (sec == null) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
};
const fmtHM = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}시간 ${m}분`;
};
const initial = (name) => (name ? name.trim()[0] : "?");

/* ===== 컴포넌트 ===== */
export default function EmpAttendanceMy() {
  /* 로그인 사번 */
  const myEmpNum = (() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const n = Number(u?.empNum);
        if (Number.isFinite(n) && n > 0) return n;
      }
    } catch {}
    const n = Number(localStorage.getItem("empNum")) || Number(sessionStorage.getItem("empNum"));
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* 날짜 포커스(0=오늘) */
  const [pageOffset, setPageOffset] = useState(0);
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + pageOffset);
    return d;
  }, [pageOffset]);
  const ymd = useMemo(() => toYmd(targetDate), [targetDate]);

  /* 하루치(전직원) 조회 */
  const fetchDaily = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/attendance`, { params: { date: ymd } });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      console.error("fetchDaily error", e?.response || e);
      setError(e.response?.data?.message || e.message || "목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [ymd]);
  useEffect(() => { fetchDaily(); }, [fetchDaily]);

  /* 오늘 내 미퇴근 레코드(가장 최근 1건) */
  const openToday = useMemo(() => {
    if (pageOffset !== 0 || !myEmpNum) return null;
    const mine = rows.filter((r) => r.empNum === myEmpNum);
    const candidates = mine.filter((r) => {
      const base = r.attDate || r.checkIn || r.startedAt;
      if (!base) return false;
      const d = new Date(String(base).replace(" ", "T"));
      const dYmd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return dYmd === ymd && !r.checkOut && !r.endedAt;
    });
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      const ta = parse(a.checkIn || a.startedAt)?.getTime() ?? 0;
      const tb = parse(b.checkIn || b.startedAt)?.getTime() ?? 0;
      return tb - ta;
    });
    return candidates[0];
  }, [rows, myEmpNum, pageOffset, ymd]);

  /* 오늘 내 총 근무시간(초): 출근/퇴근 시각 합산(진행 중 포함) */
  const myTodayTotalSec = useMemo(() => {
    if (!myEmpNum) return 0;
    const sameYmd = (base) => {
      if (!base) return false;
      const d = new Date(String(base).replace(" ", "T"));
      const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return s === ymd;
    };
    const idOf = (r) => r?.attNum ?? r?.id ?? r?.num ?? `${r?.empNum}-${r?.checkIn || r?.startedAt}`;
    const openId = openToday ? idOf(openToday) : null;

    let sum = 0;
    for (const r of rows || []) {
      if (r.empNum !== myEmpNum) continue;
      const base = r.attDate || r.checkIn || r.startedAt;
      if (!sameYmd(base)) continue;
      const st = parse(r.checkIn || r.startedAt);
      const en = parse(r.checkOut || r.endedAt);
      if (st && en) sum += Math.max(0, Math.floor((en - st) / 1000));
      else if (st && !en && openId && idOf(r) === openId) sum += Math.max(0, Math.floor((Date.now() - st.getTime()) / 1000));
    }
    return sum;
  }, [rows, myEmpNum, ymd, openToday]);

  /* 출퇴근 액션 */
  const handleCheckIn = async () => {
    if (pageOffset !== 0) return;
    try {
      setLoading(true);
      setError("");
      await api.post(`/attendance`);
      setMessage("출근 처리했습니다.");
      await fetchDaily();
    } catch (e) {
      console.error("checkIn error", e?.response || e);
      setError(e.response?.data?.message || e.message || "출근 처리 실패");
    } finally {
      setLoading(false);
    }
  };
  const handleCheckOut = async () => {
    if (!openToday) return;
    const attNum = openToday.attNum ?? openToday.id ?? openToday.num;
    if (!attNum) return setError("퇴근 처리용 attNum이 없습니다.");
    try {
      setLoading(true);
      setError("");
      await api.put(`/attendance/${attNum}/checkout`);
      setMessage("퇴근 처리했습니다.");
      await fetchDaily();
    } catch (e) {
      console.error("checkOut error", e?.response || e);
      setError(e.response?.data?.message || e.message || "퇴근 처리 실패");
    } finally {
      setLoading(false);
    }
  };

  /* 화면용 가공 */
  const viewRows = useMemo(() => {
    const timeVal = (s) => {
      const d = parse(s);
      return d ? d.getTime() : Number.MAX_SAFE_INTEGER;
    };
    return (rows || [])
      .map((r) => ({
        ...r,
        _name: r.empName || String(r.empNum ?? ""),
        _start: r.checkIn ?? r.startedAt,
        _end: r.checkOut ?? r.endedAt,
        _dur: r.workHours ?? r.duration ?? r.durationS ?? r.durationSec,
      }))
      .sort((a, b) => {
        const ta = timeVal(a._start);
        const tb = timeVal(b._start);
        if (ta !== tb) return tb - ta; // 출근 내림차순
        return a._name.localeCompare(b._name, "ko");
      });
  }, [rows]);

  /* 페이지네이션 */
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPage = Math.max(1, Math.ceil(viewRows.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return viewRows.slice(start, start + pageSize);
  }, [viewRows, page, pageSize]);

  useEffect(() => { setPage(1); }, [ymd, rows]);
  useEffect(() => { if (page > totalPage) setPage(totalPage); }, [totalPage, page]);

  const totalCount = viewRows.length;
  const workingCount = viewRows.filter((r) => !r._end).length;

  /* 날짜 이동 */
  const goPrev = () => setPageOffset((v) => v - 1);
  const goNext = () => setPageOffset((v) => v + 1);
  const goToday = () => setPageOffset(0);

  const [pickedYmd, setPickedYmd] = useState(ymd);
  useEffect(() => { setPickedYmd(ymd); }, [ymd]);
  const goDate = (dateYmd) => {
    if (!dateYmd) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = toLocalDate(dateYmd);
    if (!target) return;
    const diff = Math.round((target.getTime() - today.getTime()) / msPerDay);
    setPageOffset(diff);
  };

  /* ===== 렌더 ===== */
  return (
    <>
      {message && (
        <Alert variant="success" onClose={() => setMessage("")} dismissible className="mt-3">
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible className="mt-3">
          {error}
        </Alert>
      )}

      {/* 히어로 */}
      <div className="att-hero mt-3">
        <div className="att-hero__left">
          <div className="att-hero__title">
            <i className="bi bi-clock-history me-2" />
            출퇴근(하루 단위 · 전직원)
          </div>
          <div className="att-hero__meta">
            <Badge bg="light" text="dark" className="me-2">
              <i className="bi bi-calendar3 me-1" />
              {ymd}
            </Badge>
            <Badge bg="primary" className="me-2">
              총 {totalCount}건
            </Badge>
            <Badge bg={workingCount > 0 ? "danger" : "success"}>
              {workingCount > 0 ? `미퇴근 ${workingCount}` : "모두 퇴근"}
            </Badge>
          </div>
          <div className="att-hero__actions">
            <Button
              size="sm"
              variant={openToday ? "secondary" : "success"}
              disabled={loading || pageOffset !== 0 || !!openToday}
              onClick={handleCheckIn}
            >
              <i className="bi bi-door-open me-1" />
              출근
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="ms-2"
              disabled={loading || pageOffset !== 0 || !openToday}
              onClick={handleCheckOut}
            >
              <i className="bi bi-door-closed me-1" />
              퇴근
            </Button>
            <Button
              size="sm"
              variant="outline-light"
              className="ms-2"
              disabled={loading}
              onClick={fetchDaily}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              새로고침
            </Button>
          </div>
        </div>
        <div className="att-hero__right">
          <div className="att-illo">
            <i className="bi bi-smartwatch" />
          </div>
        </div>
      </div>

      {/* 요약 */}
      <div className="att-card mt-3">
        <div className="d-flex align-items-center justify-content-between">
          <div className="fw-semibold">
            <i className="bi bi-person-badge me-2" />
            내 기록 요약 <span className="text-muted">({ymd})</span>
          </div>
          <div className="att-pager">
            <button className="page-link" onClick={() => setPageOffset((v) => v - 7)}>&laquo;</button>
            <button className="page-link" onClick={goPrev}>&lt;</button>
            <span className="page-link disabled">{ymd}</span>
            <button className="page-link" onClick={goNext}>&gt;</button>
            <button className={`page-link ${pageOffset === 0 ? "disabled" : ""}`} onClick={goToday}>오늘</button>
            <button className="page-link" onClick={() => setPageOffset((v) => v + 7)}>&raquo;</button>
            <input
              type="date"
              className="form-control form-control-sm ms-2"
              value={pickedYmd}
              onChange={(e) => { const v = e.target.value; setPickedYmd(v); goDate(v); }}
              aria-label="날짜 선택"
            />
          </div>
        </div>

        {openToday ? (
          <div className="att-summary">
            <div><span className="text-muted me-2">출근</span>{fmtTime(openToday.checkIn || openToday.startedAt)}</div>
            <div><span className="text-muted me-2">퇴근</span>{openToday.checkOut || openToday.endedAt ? fmtTime(openToday.checkOut || openToday.endedAt) : <span className="badge text-bg-danger">미퇴근</span>}</div>
            <div><span className="text-muted me-2">상태</span><span className={`badge ${openToday.checkOut || openToday.endedAt ? "text-bg-secondary" : "text-bg-success"}`}>{openToday.checkOut || openToday.endedAt ? "근무 종료" : "근무 중"}</span></div>
          </div>
        ) : myTodayTotalSec > 0 ? (
          <div className="fw-semibold">
            오늘 내 총 근무시간 <span className="badge text-bg-primary">{fmtHM(myTodayTotalSec)}</span>
          </div>
        ) : (
          <div className="text-muted">오늘 내 출근 기록 없음</div>
        )}
      </div>

      {/* 리스트 */}
      <div className="att-table mt-3">
        <Table hover responsive className="mb-0">
          <thead>
            <tr>
              <th style={{ width: 260 }}>직원</th>
              <th>출근</th>
              <th>퇴근</th>
              <th style={{ width: 140 }}>근무시간</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">데이터 없음</td>
              </tr>
            ) : (
              pageRows.map((r, idx) => {
                const key = r.attNum ?? r.id ?? `${r.empNum}-${r._start}-${r._end}-${idx}`;
                const isMine = myEmpNum && r.empNum === myEmpNum;
                return (
                  <tr key={key} className={isMine ? "table-primary" : ""}>
                    <td className="d-flex align-items-center gap-2">
                      <div className="att-avatar">{initial(r._name)}</div>
                      <div className="fw-semibold">{r._name}</div>
                      {!r._end && <span className="badge rounded-pill text-bg-danger ms-2">미퇴근</span>}
                    </td>
                    <td>{fmtTime(r._start)}</td>
                    <td>{r._end ? fmtTime(r._end) : <span className="text-danger">—</span>}</td>
                    <td>{r._dur != null ? fmtDur(r._dur) : (r._end ? "—" : "")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
    </>
  );
}
