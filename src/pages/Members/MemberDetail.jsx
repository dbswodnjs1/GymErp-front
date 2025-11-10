// =============================================================
// src/pages/members/MemberDetail.jsx
// - EmpDetail과 동일한 카드/헤더 레이아웃 적용
// =============================================================
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../styles/detail-pane.css";

export default function MemberDetail({ memNum, onBack, onEdit, onDelete }) {
  const API_BASE =
    (import.meta?.env?.VITE_API_BASE) ||
    (typeof window !== 'undefined' && window.API_BASE) ||
    "/api";

  const headerGradient = "linear-gradient(135deg, #2b314a, #4c5371)"; // EmpDetail과 동일
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const res = await api.get(`/v1/member/${memNum}`);
      setData(res.data);
    } catch (e) {
      console.error('회원 상세 조회 실패:', e);
    }
  };
  useEffect(() => { if (memNum != null) load(); }, [memNum]);

  // 프로필 URL 계산 (EmpDetail 방식과 동일 철학)
  const getProfileUrl = () => {
    if (!data?.memProfile) return null;
    return data.memProfile.startsWith('http')
      ? data.memProfile
      : `${API_BASE}/upload/${data.memProfile}`;
  };
  const profileUrl = getProfileUrl();

  const fmtDate = (v) => (v ? String(v).slice(0, 10) : "-");

  if (!data) return <div className="text-muted">상세 정보를 불러오는 중…</div>;

  return (
    <div className="min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "950px" }}>
        <div className="card border-0 rounded-4 shadow overflow-hidden">

          {/* ===== 상단 헤더 (EmpDetail과 동일한 느낌) ===== */}
          <div
            className="p-4 text-white d-flex justify-content-between align-items-center position-relative"
            style={{ background: headerGradient, minHeight: "200px", padding: "2rem" }}
          >
            {/* 왼쪽: 프로필 + 이름/요약 */}
            <div className="d-flex align-items-center gap-3" style={{ marginTop: "-10px" }}>
              {/* 프로필 썸네일 */}
              <div
                className="position-relative d-flex justify-content-center align-items-center"
                style={{ width: "110px", height: "110px" }}
              >
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt="profile"
                    className="rounded-circle border border-white shadow"
                    width="100"
                    height="100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <i className="bi bi-person-circle" style={{ fontSize: "100px", color: "white" }} />
                )}
              </div>

              {/* 이름/연락처 요약 */}
              <div className="ms-1">
                <h3 className="fw-bold mb-1">{data.memName || "-"}</h3>
                <small className="opacity-75">
                  {data.memGender || "성별 미상"} / {data.memEmail || "-"} / {data.memPhone || "-"}
                </small>
              </div>
            </div>

            {/* 오른쪽 버튼 그룹 (동일 구조) */}
            <div className="d-flex gap-2">
              <button className="btn btn-light btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={onEdit}>
                <i className="bi bi-pencil-square" /> 상세정보 수정
              </button>
              <button className="btn btn-danger btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={onDelete}>
                <i className="bi bi-trash3" /> 회원 삭제
              </button>
            </div>
          </div>

          {/* ===== 내용 영역 ===== */}
          <div className="p-4 bg-white">

            {/* 기본 정보 (EmpDetail의 “기본 정보” 카드 톤과 동일) */}
            <section className="mb-4 p-3 rounded-3" style={{ backgroundColor: "#eef3ff" }}>
              <h5 className="fw-semibold mb-3">기본 정보</h5>
              <table className="table table-borderless align-middle text-secondary mb-0">
                <tbody>
                  <tr>
                    <th style={{ width: 130 }}>생년월일</th>
                    <td>{fmtDate(data.memBirthday)}</td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td>{data.memAddr || "-"}</td>
                  </tr>
                  <tr>
                    <th>담당 트레이너</th>
                    <td>{data.trainerName || "-"}</td>
                  </tr>
                  <tr>
                    <th>메모</th>
                    <td>{data.memNote || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 회원권/PT 영역 (EmpDetail “인사 정보” 카드 톤 응용) */}
            <section className="mb-4 p-3 rounded-3" style={{ backgroundColor: "#eef3ff" }}>
              <h5 className="fw-semibold mb-3">회원권 / PT</h5>
              <table className="table table-borderless align-middle text-secondary mb-2">
                <tbody>
                  <tr>
                    <th style={{ width: 130 }}>회원권 기간</th>
                    <td>
                      {fmtDate(data.voucherStartDate)} ~ {fmtDate(data.voucherEndDate)}
                      <span className={`badge ms-2 ${data.membershipStatus==='미사용중'?'bg-secondary':'bg-success'}`}>
                        {data.membershipStatus || '-'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>잔여 PT</th>
                    <td><span className="badge bg-success">잔여 {data.ptRemain ?? 0}</span></td>
                  </tr>
                </tbody>
              </table>

              <div>
                <br />
                <label className="form-label fw-semibold">등록/수정일</label>
                <div className="p-3 rounded-3 border" style={{ backgroundColor: "#f9fbff", minHeight: "56px" }}>
                  {(data.memCreated?.slice?.(0,10) || '-') + ' / ' + (data.memUpdated?.slice?.(0,10) || '-')}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
