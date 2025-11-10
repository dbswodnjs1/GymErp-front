// =============================================================
// src/pages/members/MemberUpdate.jsx
// - EmpDetail과 동일 카드/헤더 스타일로 리팩토링
// - 기존 업로드/저장 로직 유지 + 사진 삭제 버튼 추가
// =============================================================
import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axiosConfig";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../styles/detail-pane.css";

// 백엔드 베이스 URL (.env의 VITE_API_BASE 없으면 기본값)
const API_BASE = import.meta?.env?.VITE_API_BASE || "/api";
// 파일명 → 표시용 절대 URL 변환
const resolveProfileUrl = (v) => (v ? (v.startsWith('http') ? v : `${API_BASE}/upload/${v}`) : null);

const PROFILE_UPLOAD_URL_U = (memNum) => `/v1/member/upload/${memNum}`;
async function uploadProfileFileU(file, memNum) {
  if (!file) return null;
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post(PROFILE_UPLOAD_URL_U(memNum), fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data || null;
}

export default function MemberUpdate({ memNum, onCancel, onUpdated }) {
  const [form, setForm] = useState({
    memName:'', memGender:'', memBirthday:'', memPhone:'', memEmail:'',
    memAddr:'', memNote:'', memProfile: null
  });
  const [busy, setBusy] = useState(false);

  // 전화 포맷터(생략 가능)
  const formatKRPhone = (raw) => {
    const d = String(raw).replace(/[^0-9]/g, "").slice(0, 11);
    if (/^1[568][0-9]{2}$/.test(d.slice(0,4))) {
      if (d.length <= 4) return d;
      if (d.length <= 8) return `${d.slice(0,4)}-${d.slice(4)}`;
      return `${d.slice(0,4)}-${d.slice(4,8)}`;
    }
    if (d.startsWith("02")) {
      if (d.length <= 2) return d;
      if (d.length <= 5) return `${d.slice(0,2)}-${d.slice(2)}`;
      if (d.length <= 9) return `${d.slice(0,2)}-${d.slice(2,5)}-${d.slice(5)}`;
      return `${d.slice(0,2)}-${d.slice(2,6)}-${d.slice(6,10)}`;
    }
    const p3 = d.slice(0,3);
    if (d.length <= 3) return p3;
    if (d.length <= 7) return `${p3}-${d.slice(3)}`;
    if (d.length === 10) return `${p3}-${d.slice(3,6)}-${d.slice(6)}`;
    return `${p3}-${d.slice(3,7)}-${d.slice(7,11)}`;
  };

  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // EmpDetail과 동일한 헤더 그라디언트
  const headerGradient = "linear-gradient(135deg, #2b314a, #4c5371)";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/v1/member/${memNum}`);
        const d = res.data || {};
        setForm({
          memName: d.memName || '',
          memGender: d.memGender || '',
          memBirthday: d.memBirthday ? String(d.memBirthday).slice(0,10) : '',
          memPhone: d.memPhone || '',
          memEmail: d.memEmail || '',
          memAddr: d.memAddr || '',
          memNote: d.memNote || '',
          memProfile: d.memProfile || null,
        });
        setPreviewUrl(resolveProfileUrl(d.memProfile));
      } catch (e) {
        console.error('회원 조회 실패:', e);
      }
    };
    if (memNum != null) load();
  }, [memNum]);

  useEffect(()=>()=>{ if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const onChangeProfile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfileFile(null);
      setPreviewUrl(resolveProfileUrl(form.memProfile));
      return;
    }
    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 사진 삭제(기본 이미지로 복구)
  const onRemoveProfile = () => {
    setProfileFile(null);
    setPreviewUrl(null);
    setForm((p)=>({ ...p, memProfile: null }));
  };

  // 주소검색
  const loadPostcodeScript = () => new Promise((resolve, reject) => {
    if (window.daum?.Postcode) return resolve();
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = resolve; script.onerror = reject; document.body.appendChild(script);
  });
  const openAddressSearch = async () => {
    try {
      await loadPostcodeScript();
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          setForm((p) => ({ ...p, memAddr: address }));
        }, width: 500, height: 550,
      }).open();
    } catch (e) {
      console.error('주소검색 실패:', e); alert('주소 검색을 불러오지 못했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const handlePhoneChange = (e) => setForm((p)=> ({...p, memPhone: formatKRPhone(e.target.value)}));

  const validate = () => {
    const { memName, memGender, memBirthday, memPhone, memEmail } = form;
    if (!memName || !memGender || !memBirthday || !memPhone || !memEmail) {
      alert('필수 항목(이름/성별/생년월일/연락처/이메일)을 모두 입력해주세요.');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate() || busy) return;
    setBusy(true);
    try {
      let memProfileUrl = form.memProfile ?? null;
      if (profileFile) {
        const url = await uploadProfileFileU(profileFile, memNum);
        if (url) memProfileUrl = url;
      }
      await api.put(`/v1/member/${memNum}`, { ...form, memProfile: memProfileUrl });
      alert('회원 정보가 수정되었습니다.');
      onUpdated?.();
    } catch (e) {
      console.error('회원 수정 실패:', e);
      alert('회원 수정에 실패했습니다.');
    } finally { setBusy(false); }
  };

  return (
      <div className="container" style={{ maxWidth: "950px" }}>
        <div className="card border-0 rounded-4 shadow overflow-hidden">

          {/* ===== 상단 헤더 (EmpDetail과 동일 무드) ===== */}
          <div
            className="p-4 text-white d-flex justify-content-between align-items-center position-relative"
            style={{ background: headerGradient, minHeight: "200px", padding: "2rem" }}
          >
            {/* 왼쪽: 프로필 + 이름 요약 */}
            <div className="d-flex align-items-center gap-3" style={{ marginTop: "-10px" }}>
              {/* 프로필 이미지 + 업로드/삭제 버튼 */}
              <div
                className="position-relative d-flex justify-content-center align-items-center"
                style={{ width: "110px", height: "110px" }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="프로필"
                    className="rounded-circle border border-white shadow"
                    width="100"
                    height="100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <i className="bi bi-person-circle" style={{ fontSize: "100px", color: "white" }} />
                )}

                {/* 업로드/삭제 버튼 묶음 (EmpDetail과 유사 위치) */}
                <div
                  className="d-flex align-items-center gap-2 position-absolute"
                  style={{
                    bottom: "0px",
                    left: "50%",
                    transform: "translate(-30%, 110%)",
                    height: 30,
                    zIndex: 2,
                  }}
                >
                  <label
                    htmlFor="memProfileUpload"
                    className="btn btn-light btn-sm border shadow-sm px-2"
                    style={{ borderRadius: 6, fontSize: "0.85rem", lineHeight: 1, whiteSpace: "nowrap" }}
                    title="사진 업로드"
                  >
                    <i className="bi bi-folder2-open me-1" />
                    사진 업로드
                  </label>
                  <input id="memProfileUpload" type="file" accept="image/*" hidden onChange={onChangeProfile} />
                  <button
                    type="button"
                    className="btn btn-light btn-sm border shadow-sm px-2"
                    style={{ borderRadius: 6, fontSize: "0.85rem", lineHeight: 1, whiteSpace: "nowrap" }}
                    onClick={onRemoveProfile}
                    disabled={!previewUrl && !form.memProfile}
                  >
                    사진 삭제
                  </button>
                </div>
              </div>

              {/* 이름/연락처 요약 */}
              <div className="ms-1">
                <h3 className="fw-bold mb-1">{form.memName || "-"}</h3>
                <small className="opacity-75">
                  {form.memGender || "성별 미상"} / {form.memEmail || "-"} / {form.memPhone || "-"}
                </small>
              </div>
            </div>

            {/* 오른쪽 버튼그룹 */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm"
                onClick={submit}
                disabled={busy}
              >
                <i className="bi bi-save" /> 저장
              </button>
              <button
                className="btn btn-secondary btn-sm d-flex align-items-center gap-1 shadow-sm"
                onClick={onCancel}
                disabled={busy}
              >
                <i className="bi bi-x-circle" /> 취소
              </button>
            </div>
          </div>

          {/* ===== 내용 영역 (EmpDetail 카드 톤과 호환) ===== */}
          <div className="p-4 bg-white">
            {/* 기본 정보 카드 */}
            <section className="mb-4 p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
              <h5 className="fw-semibold mb-3">기본 정보</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">이름 *</label>
                  <input className="form-control" name="memName" value={form.memName} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">성별 *</label>
                  <div className="d-flex align-items-center h-100">
                    <label className="me-3 mb-0">
                      <input type="radio" className="form-check-input me-1" name="memGender" value="남"
                             checked={form.memGender==='남'} onChange={handleChange}/>남
                    </label>
                    <label className="mb-0">
                      <input type="radio" className="form-check-input me-1" name="memGender" value="여"
                             checked={form.memGender==='여'} onChange={handleChange}/>여
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">생년월일 *</label>
                  <input type="date" className="form-control" name="memBirthday" value={form.memBirthday} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">연락처 *</label>
                  <input className="form-control" name="memPhone" value={form.memPhone} onChange={handlePhoneChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">이메일 *</label>
                  <input type="email" className="form-control" name="memEmail" value={form.memEmail} onChange={handleChange} />
                </div>

                <div className="col-12">
                  <label className="form-label">주소</label>
                  <div className="d-flex gap-2">
                    <input className="form-control" name="memAddr" value={form.memAddr} onChange={handleChange} placeholder="주소" />
                    <button type="button" className="btn btn-outline-secondary text-nowrap" onClick={openAddressSearch} style={{ minWidth: 100 }}>
                      주소찾기
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">메모</label>
                  <textarea className="form-control" name="memNote" rows={3} value={form.memNote} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* (확장 여지) 추가 카드 섹션이 있으면 EmpDetail 톤(#eef3ff 등)으로 맞춰서 배치 */}
          </div>
        </div>
      </div>
  );
}

