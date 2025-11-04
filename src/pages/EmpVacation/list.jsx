import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function EmpVacationList() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState({
    empNum: "",
    empName: "",
    from: "",
    to: "",
  });

  // yyyy-MM-dd 보장
  const toYMD = (d) => {
    if (!d) return "";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt)) return "";
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  useEffect(() => {
    const empNum = params.get("empNum") || "";
    const empName = params.get("empName") || "";
    const from = params.get("from") || "";
    const to = params.get("to") || "";

    setSearch({ empNum, empName, from, to });

    // 1) 사원명만 있고 사번이 없으면 이름→사번 조회 시도(단건 가정)
    const resolveEmpNumByName = async (name) => {
      try {
        // 백엔드에 이름 검색 API가 있다고 가정 (없으면 이 부분은 건너뜀)
        const res = await fetch(`/api/v1/employees/search?name=${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error(`emp search HTTP ${res.status}`);
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          return list[0].empNum; // 여러 건이면 첫 건 사용(필요시 선택 UI 확장)
        }
      } catch (e) {
        console.warn("직원 이름 검색 실패:", e);
      }
      return "";
    };

    (async () => {
      let effectiveEmpNum = empNum;

      if (!effectiveEmpNum && empName) {
        effectiveEmpNum = await resolveEmpNumByName(empName);
        if (effectiveEmpNum) {
          // URL에 empNum 채워서 고정
          const qs2 = new URLSearchParams();
          qs2.set("empNum", effectiveEmpNum);
          if (from) qs2.set("from", from);
          if (to) qs2.set("to", to);
          navigate(`/EmpvacationList?${qs2.toString()}`, { replace: true });
        }
      }

      // 2) 휴가 목록 조회
      const qs = new URLSearchParams();
      if (effectiveEmpNum) qs.set("empNum", effectiveEmpNum);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);

      // 범위 파라미터는 둘 다 있어야 의미 있으니 한쪽만 있으면 제외
      if ((from && !to) || (!from && to)) {
        qs.delete("from"); qs.delete("to");
      }

      const url = `/api/v1/vacation${qs.toString() ? `?${qs.toString()}` : ""}`;

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => setRows(Array.isArray(data) ? data : []))
        .catch((e) => {
          console.error("vacation list error", e);
          setRows([]);
        });
    })();
  }, [params, navigate]);

  const handleChange = (e) => {
    setSearch((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSearch = () => {
    const qs = new URLSearchParams();
    if (search.empNum) qs.set("empNum", search.empNum.trim());
    else if (search.empName) qs.set("empName", search.empName.trim());

    const from = toYMD(search.from);
    const to = toYMD(search.to);
    if (from && to) {
      qs.set("from", from);
      qs.set("to", to);
    }
    navigate(`/EmpvacationList?${qs.toString()}`);
  };

  const fmt = (v) => {
    if (!v) return "";
    const d = new Date(v?.time ?? v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
    // 필요시: return toYMD(d);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1 className="h4 m-0">휴가 목록</h1>
        {/* 등록 버튼 제거됨 */}
      </div>

      {/* 검색 바 */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-2">
          <input
            type="text"
            name="empNum"
            className="form-control"
            placeholder="사번"
            value={search.empNum}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-3">
          <input
            type="text"
            name="empName"
            className="form-control"
            placeholder="사원명(사번 미입력 시 사용)"
            value={search.empName}
            onChange={handleChange}
          />
        </div>

        {/* 날짜 범위 (달력 인풋) */}
        <div className="col-6 col-md-2">
          <input
            type="date"
            name="from"
            className="form-control"
            value={search.from}
            onChange={handleChange}
          />
        </div>
        <div className="col-6 col-md-2">
          <input
            type="date"
            name="to"
            className="form-control"
            value={search.to}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-3 d-grid d-md-block">
          <button className="btn btn-outline-secondary w-100" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>vacNum</th>
            <th>empNum</th>
            <th>vacStartedAt</th>
            <th>vacEndedAt</th>
            <th>vacContent</th>
            <th>vacState</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.vacNum}>
              <td>{r.vacNum}</td>
              <td>{r.empNum}</td>
              <td>{fmt(r.vacStartedAt)}</td>
              <td>{fmt(r.vacEndedAt)}</td>
              <td>{r.vacContent}</td>
              <td>{r.vacState}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">데이터 없음</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default EmpVacationList;