// =============================================
// src/pages/members/MemberCreate.jsx  (등록)
// - 신규 등록 폼 + POST /v1/member
// =============================================
import { useState } from "react";
import axios from "axios";

export default function MemberCreate({ onCancel, onCreated }) {

    // 숫자만 남기고 한국 전화번호 규칙으로 하이픈 삽입
    const formatKRPhone = (raw) => {
    const d = String(raw).replace(/\D/g, "").slice(0, 11); // 최대 11자리

    // 대표번호(1588-1234 등)
    if (/^1[568]\d{2}/.test(d)) {
        if (d.length <= 4) return d;
        if (d.length <= 8) return `${d.slice(0,4)}-${d.slice(4)}`;
        return `${d.slice(0,4)}-${d.slice(4,8)}`; // 4-4 고정
    }

    // 서울(02)
    if (d.startsWith("02")) {
        if (d.length <= 2) return d;
        if (d.length <= 5) return `${d.slice(0,2)}-${d.slice(2)}`;
        if (d.length <= 9) return `${d.slice(0,2)}-${d.slice(2,5)}-${d.slice(5)}`;
        return `${d.slice(0,2)}-${d.slice(2,6)}-${d.slice(6,10)}`;
    }

    // 휴대폰/일반 국번(010/011/016/017/018/019 or 기타 3자리)
    const p3 = d.slice(0,3);
        if (d.length <= 3) return p3;
        if (d.length <= 7) return `${p3}-${d.slice(3)}`;               // 3-최대4
        if (d.length === 10) return `${p3}-${d.slice(3,6)}-${d.slice(6)}`; // 3-3-4
        return `${p3}-${d.slice(3,7)}-${d.slice(7,11)}`;               // 3-4-4 (11자리)
    };

    // 전화번호 onChange
    const handlePhoneChange = (e) => {
        const formatted = formatKRPhone(e.target.value);
        setForm((prev) => ({ ...prev, memPhone: formatted }));
    };

    const [form, setForm] = useState({
        memName: '', memGender: '', memBirthday: '', memPhone: '', memEmail: '', memAddr: '', memNote: ''
    });
    const [busy, setBusy] = useState(false);

    

    // 카카오 우편번호 스크립트 로더
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
        const res = await axios.post('http://localhost:9000/v1/member', form);
        alert('회원이 등록되었습니다.');
        onCreated?.(res.data?.memNum); // 백엔드가 생성된 ID를 반환하지 않으면 null 전달
        } catch (e) {
        console.error(e); alert('등록에 실패했습니다.');
        } finally { setBusy(false); }
    };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body">
        <h4 className="fw-bold mb-4">신규 회원 등록</h4>

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