// =============================================
// src/pages/members/MembersList.jsx  (전체보기 + 컨테이너)
// - 좌측: 목록/검색/필터/등록 버튼
// - 우측: 모드별 패널 (상세/등록/수정/삭제)
// =============================================
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MemberDetail from "./MemberDetail.jsx";
import MemberCreate from "./MemberCreate.jsx";
import MemberUpdate from "./MemberUpdate.jsx";
import MemberDelete from "./MemberDelete.jsx";

export default function MembersList() {
  // 목록/선택/모드 상태
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('none'); // 'none' | 'detail' | 'create' | 'edit' | 'delete'

  // 검색 & 상태 필터
  const [searchKeyword, setSearchKeyword] = useState('');
  const [status, setStatus] = useState('ALL'); // 'ALL' | 'USING' | 'NOT_USING'

  // 목록 로드
  const loadMembers = async () => {
    try {
      const res = await axios.get('http://localhost:9000/v1/member', { params: { status } });
      setMembers(res.data || []);
    } catch (err) {
      console.error('회원 목록 조회 실패:', err);
    }
  };

  useEffect(() => { loadMembers(); }, [status]);

  const filteredMembers = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return members;
    return members.filter((m) =>
      (m.memName && m.memName.toLowerCase().includes(kw)) ||
      (m.memPhone && String(m.memPhone).toLowerCase().includes(kw)) ||
      (m.memEmail && m.memEmail.toLowerCase().includes(kw))
    );
  }, [members, searchKeyword]);

  // 우측 패널 렌더링
  const renderRight = () => {
    if (mode === 'create') {
      return (
        <MemberCreate
          onCancel={() => setMode('none')}
          onCreated={async (newId) => {
            await loadMembers();
            setSelectedId(newId ?? null);
            setMode('detail');
          }}
        />
      );
    }
    if (mode === 'edit' && selectedId != null) {
      return (
        <MemberUpdate
          memNum={selectedId}
          onCancel={() => setMode('detail')}
          onUpdated={async () => {
            await loadMembers();
            setMode('detail');
          }}
        />
      );
    }
    if (mode === 'delete' && selectedId != null) {
      return (
        <MemberDelete
          memNum={selectedId}
          onCancel={() => setMode('detail')}
          onDeleted={async () => {
            setSelectedId(null);
            setMode('none');
            await loadMembers();
          }}
        />
      );
    }
    if (mode === 'detail' && selectedId != null) {
      return (
        <MemberDetail
          memNum={selectedId}
          onBack={() => { setMode('none'); setSelectedId(null); }}
          onEdit={() => setMode('edit')}
          onDelete={() => setMode('delete')}
        />
      );
    }
    return (
      <div className="d-flex justify-content-center align-items-center h-100 text-muted">
        좌측에서 회원을 선택하거나 [회원 등록하기]를 눌러주세요.
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 왼쪽 패널 */}
      <div style={{ width: '350px', borderRight: '1px solid #dee2e6', overflowY: 'auto' }} className="bg-light d-flex flex-column">
        {/* 등록 버튼 */}
        <div className="p-3 border-bottom">
          <button className="btn btn-primary w-100" onClick={() => { setMode('create'); setSelectedId(null); }}>
            <i className="bi bi-plus-lg me-2"></i>회원 등록하기
          </button>
        </div>

        {/* 상태 필터 */}
        <div className="p-3 border-bottom">
          <div className="btn-group w-100">
            <button className={`btn btn-outline-secondary ${status==='ALL'?'active':''}`} onClick={()=>setStatus('ALL')}>전체</button>
            <button className={`btn btn-outline-secondary ${status==='USING'?'active':''}`} onClick={()=>setStatus('USING')}>사용중</button>
            <button className={`btn btn-outline-secondary ${status==='NOT_USING'?'active':''}`} onClick={()=>setStatus('NOT_USING')}>미사용중</button>
          </div>
        </div>

        {/* 검색 */}
        <div className="p-3 border-bottom">
          <input type="text" className="form-control" placeholder="회원 검색" value={searchKeyword} onChange={(e)=>setSearchKeyword(e.target.value)} />
        </div>

        {/* 리스트 */}
        <div className="flex-grow-1">
          {filteredMembers.map((m) => (
            <div
              key={m.memNum}
              className={`p-3 border-bottom small ${selectedId === m.memNum && mode !== 'create' ? 'bg-primary text-white' : 'bg-white'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => { setSelectedId(m.memNum); setMode('detail'); }}
            >
              <div className="fw-semibold">
                {m.memName ? `${m.memName}${m.memBirthday ? `(${String(m.memBirthday).slice(0,10)})` : ''}` : '-'}
              </div>
              <div className={`mt-1 small ${selectedId === m.memNum && mode!=='create' ? 'text-white-50':'text-muted'}`}>
                <i className="bi bi-person-badge me-1"></i>{m.trainerName || '담당 미지정'}
                <span className="mx-2">·</span>
                <i className="bi bi-ticket-detailed me-1"></i>{m.voucherEndDate ? `${String(m.voucherEndDate).slice(0,10)} 까지` : '회원권 없음'}
                <span className="mx-2">·</span>
                <i className="bi bi-dumbbell me-1"></i>잔여 PT {m.ptRemain ?? 0}
                <span className="float-end">
                  <span className={`badge rounded-pill ${m.membershipStatus==='미사용중' ? 'bg-secondary' : 'bg-success'}`}>
                    {m.membershipStatus || '-'}
                  </span>
                </span>
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div className="p-3 text-center text-muted">검색된 회원이 없습니다.</div>
          )}
        </div>
      </div>

      {/* 오른쪽 패널 */}
      <div className="flex-grow-1 p-4 overflow-auto bg-white">
        {renderRight()}
      </div>
    </div>
  );
}