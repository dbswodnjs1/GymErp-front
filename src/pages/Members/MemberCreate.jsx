// =============================================================
// src/pages/members/MemberCreate.jsx
// - 신규 회원 생성 + 프로필 이미지 업로드(선택)
//   1) POST /v1/member 로 기본정보 생성 → memNum 획득
//   2) 파일이 있으면 POST /v1/member/{memNum}/profile (multipart)
//   3) 응답 URL을 memProfile 로 PUT /v1/member/{memNum}
// =============================================================
import { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';

// 업로드 엔드포인트 (백엔드 경로와 맞추세요)
const PROFILE_UPLOAD_URL = (memNum) => `http://localhost:9000/v1/member/upload/${memNum}`;

async function uploadProfileFile(file, memNum) {
  if (!file) return null;
  const fd = new FormData();
  fd.append("file", file);
  const res = await axios.post(PROFILE_UPLOAD_URL(memNum), fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data || null;
}

export default function MemberCreate({ onCancel, onCreated }) {
  // ===== 전화번호 포맷터 =====
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
  const handlePhoneChange = (e) => {
    const formatted = formatKRPhone(e.target.value);
    setForm((prev) => ({ ...prev, memPhone: formatted }));
  };

  // ===== 주소 검색(카카오) =====
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

  // ===== 폼 상태 =====
  const [form, setForm] = useState({
    memName: '', memGender: '', memBirthday: '', memPhone: '', memEmail: '', memAddr: '', memNote: '', memProfile: null
  });
  const [busy, setBusy] = useState(false);

  // ===== 프로필 파일/미리보기 =====
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const onChangeProfile = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setProfileFile(null); setPreviewUrl(null); return; }
    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  useEffect(()=>()=>{ if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value }));
  };
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
      // 생성 응답이 memNum을 반환하지 않는 환경을 대비한 보조 함수
      const resolveNewMemberIdAfterCreate = async (payload) => {
        try {
          const key = payload.memEmail || payload.memPhone || payload.memName;
          if (!key) return null;
          const r = await axios.get('http://localhost:9000/v1/member/search', { params: { keyword: key } });
          const list = Array.isArray(r.data) ? r.data : [];
          // 이름/이메일이 정확히 같은 항목 중 가장 큰 memNum을 선택(동명이인/경합 최소화)
          const cand = list.filter(m => (
            (payload.memEmail && m.memEmail === payload.memEmail) ||
            (payload.memPhone && m.memPhone === payload.memPhone) ||
            (payload.memName && m.memName === payload.memName)
          ));
          if (!cand.length) return null;
          return cand.reduce((max, m) => m.memNum > max ? m.memNum : max, cand[0].memNum);
        } catch (_) { return null; }
      };

      // 1) 회원 생성 (기본정보)
      const createRes = await axios.post('http://localhost:9000/v1/member', { ...form, memProfile: null });
      let newId = createRes?.data?.memNum ?? null; // 백엔드가 memNum을 반환하면 사용
      if (!newId) {
        // 반환이 없으면 검색 엔드포인트로 보강 식별(임시 대안)
        newId = await resolveNewMemberIdAfterCreate(form);
      }

      // 2) 프로필 파일 업로드(신규 ID가 확인된 경우에만)
      if (profileFile && newId) {
        await uploadProfileFile(profileFile, newId); // 업로드가 DB memProfile까지 갱신
      }

      alert('회원이 등록되었습니다.');
      onCreated?.(newId);
    } catch (e) {
      console.error(e); alert('등록에 실패했습니다.');
    } finally { setBusy(false); }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body">
        <h4 className="fw-bold mb-4">신규 회원 등록</h4>

        {/* 프로필 업로드 */}
        <div className="mb-3">
          <label className="form-label">프로필 사진</label>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle overflow-hidden" style={{width:72,height:72,background:'#f3f3f3'}}>
              {previewUrl
                ? <img src={previewUrl} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <div className="d-flex w-100 h-100 justify-content-center align-items-center text-muted">
                    <i className="bi bi-person-circle fs-3" />
                  </div>}
            </div>
            <input type="file" accept="image/*" onChange={onChangeProfile}/>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">이름 *</label>
          <input className="form-control" name="memName" value={form.memName} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">성별 *</label>
          <div>
            <label className="me-3"><input type="radio" className="form-check-input me-1" name="memGender" value="남" checked={form.memGender==='남'} onChange={handleChange}/>남</label>
            <label><input type="radio" className="form-check-input me-1" name="memGender" value="여" checked={form.memGender==='여'} onChange={handleChange}/>여</label>
          </div>
        </div>
        <div className="mb-3"><label className="form-label">생년월일 *</label><input type="date" className="form-control" name="memBirthday" value={form.memBirthday} onChange={handleChange} /></div>
        <div className="mb-3"><label className="form-label">연락처 *</label><input className="form-control" name="memPhone" value={form.memPhone} onChange={handlePhoneChange} /></div>
        <div className="mb-3"><label className="form-label">이메일 *</label><input type="email" className="form-control" name="memEmail" value={form.memEmail} onChange={handleChange} /></div>
        <div className="mb-3">
          <label className="form-label">주소</label>
          <div className="d-flex gap-2">
            <input className="form-control" name="memAddr" value={form.memAddr} onChange={handleChange} placeholder="주소" />
            <button type="button" className="btn btn-outline-secondary btn-sm text-nowrap" onClick={openAddressSearch} style={{ minWidth: 90 }}>주소찾기</button>
          </div>
        </div>
        <div className="mb-4"><label className="form-label">메모</label><textarea className="form-control" name="memNote" rows={3} value={form.memNote} onChange={handleChange} /></div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>취소</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>등록</button>
        </div>
      </div>
    </div>
  );
}
