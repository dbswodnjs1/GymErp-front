import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";

function EmpAttendanceList() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState({ empNum: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fmt = (v) => {
    if (!v) return "";
    try {
      const d =
        typeof v === "string"
          ? new Date(v)
          : typeof v === "number"
          ? new Date(v)
          : new Date(v.time ?? v);
      const t = d.getTime();
      return Number.isNaN(t) ? String(v) : d.toLocaleString("ko-KR");
    } catch {
      return String(v);
    }
  };

  const fetchList = async (empNum) => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (empNum) qs.set("empNum", empNum);
      const url = `/v1/attendance${qs.toString() ? `?${qs.toString()}` : ""}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("attendance list error", e);
      setRows([]);
      setError("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const empNum = params.get("empNum") || "";
    setSearch({ empNum });
    fetchList(empNum);
  }, [params]);

  const handleSearch = () => {
    const qs = new URLSearchParams();
    if (search.empNum) qs.set("empNum", search.empNum.trim());
    navigate(`/empattendance${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  const handleReset = () => {
    setSearch({ empNum: "" });
    navigate(`/empattendance`);
  };

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1 className="h4 m-0">근태 목록</h1>
        <NavLink className="btn btn-primary" to="/empattendance/myAttendance">
          출근 등록
        </NavLink>
      </div>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          inputMode="numeric"
          name="empNum"
          className="form-control"
          placeholder="직원번호"
          value={search.empNum}
          onChange={handleChange}
          onKeyDown={onKeyDown}
        />
        <button className="btn btn-outline-secondary" onClick={handleSearch}>
          검색
        </button>
        <button className="btn btn-outline-dark" onClick={handleReset}>
          초기화
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>attNum</th>
            <th>empNum</th>
            <th>checkIn</th>
            <th>checkOut</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {!loading &&
            rows.map((r) => (
              <tr key={r.attNum}>
                <td>{r.attNum}</td>
                <td>{r.empNum}</td>
                <td>{fmt(r.checkIn)}</td>
                <td>{fmt(r.checkOut)}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center">
                데이터 없음
              </td>
            </tr>
          )}
          {loading && (
            <tr>
              <td colSpan={5} className="text-center">
                로딩 중...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default EmpAttendanceList;