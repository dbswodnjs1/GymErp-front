// =============================================================
// src/pages/members/MemberDetail.jsx
// - 상세 정보 + 프로필 썸네일 표시(우상단) + URL 행(선택)
// =============================================================
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function MemberDetail({ memNum, onBack, onEdit, onDelete }) {
  const API_BASE = (import.meta?.env?.VITE_API_BASE) || (typeof window !== 'undefined' && window.API_BASE) || "/api";
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

  if (!data) return <div className="text-muted">상세 정보를 불러오는 중…</div>;

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body position-relative">
        {/* 프로필 썸네일 */}
        <div className="position-absolute top-0 end-0 translate-middle-y me-3" style={{ marginTop: '24px' }}>
          <div className="rounded-circle overflow-hidden border" style={{width:72, height:72, background:'#f8f9fa'}}>
            {data.memProfile
              ? <img src={data.memProfile?.startsWith('http') ? data.memProfile : `${API_BASE}/upload/${data.memProfile}`} alt="profile" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <div className="d-flex w-100 h-100 justify-content-center align-items-center text-muted">
                  <i className="bi bi-person-circle fs-3" />
                </div>}
          </div>
        </div>

        <h4 className="fw-bold mb-4">회원 상세 정보</h4>
        <table className="table table-borderless">
          <tbody>
            <tr><th style={{ width: 120 }}>이름</th><td>{data.memName || '-'}</td></tr>
            <tr><th>성별</th><td>{data.memGender || '-'}</td></tr>
            <tr><th>생년월일</th><td>{data.memBirthday ? String(data.memBirthday).slice(0,10) : '-'}</td></tr>
            <tr><th>연락처</th><td>{data.memPhone || '-'}</td></tr>
            <tr><th>이메일</th><td>{data.memEmail || '-'}</td></tr>
            <tr><th>주소</th><td>{data.memAddr || '-'}</td></tr>
            <tr><th>메모</th><td>{data.memNote || '-'}</td></tr>
            <tr><th>담당 트레이너</th><td>{data.trainerName || '-'}</td></tr>
            <tr>
              <th>회원권</th>
              <td>
                {data.voucherStartDate ? String(data.voucherStartDate).slice(0,10) : '-'} ~ {data.voucherEndDate ? String(data.voucherEndDate).slice(0,10) : '-'}
                <span className={`badge ms-2 ${data.membershipStatus==='미사용중'?'bg-secondary':'bg-success'}`}>{data.membershipStatus || '-'}</span>
              </td>
            </tr>
            <tr><th>잔여 PT</th><td>{data.ptRemain ?? 0}</td></tr>
            <tr><th>등록/수정일</th><td>{(data.memCreated?.slice?.(0,10) || '-') + ' / ' + (data.memUpdated?.slice?.(0,10) || '-')}</td></tr>
          </tbody>
        </table>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={onBack}>목록</button>
          <button className="btn btn-primary" onClick={onEdit}>수정</button>
          <button className="btn btn-danger" onClick={onDelete}>삭제</button>
        </div>
      </div>
    </div>
  );
}
