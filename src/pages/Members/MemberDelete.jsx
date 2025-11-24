// =============================================
// src/pages/members/MemberDelete.jsx  (삭제)
// - 삭제 확인 + DELETE /v1/member/{id}
// =============================================
import { useState } from "react";
import api from "../../api/axiosConfig";

export default function MemberDelete({ memNum, onCancel, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    if (busy) return; setBusy(true);
    try {
      await api.delete(`/v1/member/${memNum}`);
      alert('회원이 삭제되었습니다.');
      onDeleted?.();
    } catch (e) {
      console.error('회원 삭제 실패:', e); alert('회원 삭제에 실패했습니다.');
    } finally { setBusy(false); }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">회원 삭제</h5>
        <p className="text-muted mb-4">정말 이 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>취소</button>
          <button className="btn btn-danger" onClick={remove} disabled={busy}>삭제</button>
        </div>
      </div>
    </div>
  );
}
