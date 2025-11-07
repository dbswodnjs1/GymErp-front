// =============================================
// src/pages/members/MembersList.jsx  (전체보기 + 컨테이너)
// - 좌측: 목록/검색/필터/등록 버튼
// - 우측: 모드별 패널 (상세/등록/수정/삭제)
// =============================================
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MemberDetail from "./MemberDetail.jsx";
import MemberCreate from "./MemberCreate.jsx";
import MemberUpdate from "./MemberUpdate.jsx";
import MemberDelete from "./MemberDelete.jsx";
import ScrollBar from "../../components/SharedComponents/ScrollBar.jsx"; // ✅ 추가: 재사용 무한스크롤

export default function MembersList() {
  // 목록/선택/모드 상태
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('none'); // 'none' | 'detail' | 'create' | 'edit' | 'delete'

  // 검색 & 상태 필터
  const [searchKeyword, setSearchKeyword] = useState('');
  const deferredKw = useDeferredValue(searchKeyword);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('ALL'); // 'ALL' | 'USING' | 'NOT_USING'

  // 목록 로드
  const loadMembers = async () => {
    setLoading(true);
    try {
      // 항상 전체를 받아와서(ALL) 클라이언트에서 상태/검색/정렬 처리
      const res = await axios.get('http://localhost:9000/v1/member');
      setMembers(res.data || []);
    } catch (err) {
      console.error('회원 목록 조회 실패:', err);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadMembers(); }, []);

  const filteredMembers = useMemo(() => {
    const kw = deferredKw.trim().toLowerCase();
    if (!kw) return members;
    return members.filter((m) =>
      (m.memName && m.memName.toLowerCase().includes(kw)) ||
      (m.memPhone && String(m.memPhone).toLowerCase().includes(kw)) ||
      (m.memEmail && m.memEmail.toLowerCase().includes(kw))
    );
  }, [members, deferredKw]);

  // === 분류(회원권 상태), 카운트, 정렬 ===
  // 서버에서 계산해주는 membershipStatus('사용중' | '미사용중')만 신뢰
  // * 백엔드 Mapper: lv.endDate가 오늘 미만이거나 없음 => '미사용중', 오늘 이상 => '사용중'
  const isUsing = (m) => (m?.membershipStatus || '').trim() === '사용중';

  // 검색 결과 기준으로 카운트
  const counts = useMemo(() => {
    const base = filteredMembers;
    let using = 0, notUsing = 0;
    for (const m of base) { isUsing(m) ? using++ : notUsing++; }
    return { using, notUsing, all: base.length };
  }, [filteredMembers]);

  // 상태 필터는 클라이언트에서 적용 (서버와 동일 기준)
  const viewMembers = useMemo(() => {
    if (status === 'ALL') return filteredMembers;
    if (status === 'USING') return filteredMembers.filter(isUsing);
    return filteredMembers.filter((m) => !isUsing(m));
  }, [filteredMembers, status]);

  // 정렬 옵션
  const [sort, setSort] = useState('NAME_ASC'); // NAME_ASC | EXPIRY_ASC

  // 최종 정렬
  const sortedMembers = useMemo(() => {
    const arr = [...viewMembers];
    if (sort === 'NAME_ASC') {
      arr.sort((a,b)=> (a?.memName||'').localeCompare(b?.memName||'', 'ko-KR', { sensitivity:'base' }));
    } else if (sort === 'EXPIRY_ASC') {
      const toTime = (x)=> x?.voucherEndDate ? new Date(x.voucherEndDate).getTime() : Infinity;
      arr.sort((a,b)=> toTime(a) - toTime(b));
    }
    return arr;
  }, [viewMembers, sort]);

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
      <div
        style={{ width: '350px', borderRight: '1px solid #dee2e6', overflow: 'hidden' }} // ✅ 변경: 패널 자체 스크롤 제거
        className="bg-light d-flex flex-column"
      >
        {/* 등록 버튼 */}
        <div className="p-3 border-bottom">
          <button className="btn btn-primary w-100" onClick={() => { setMode('create'); setSelectedId(null); }}>
            <i className="bi bi-plus-lg me-2"></i>회원 등록하기
          </button>
        </div>

        {/* 상태 필터 + 카운트 */}
        <div className="p-3 border-bottom">
          <div className="btn-group w-100 mb-2">
            <button className={`btn btn-outline-secondary ${status==='ALL'?'active':''}`} onClick={()=>setStatus('ALL')}>전체</button>
            <button className={`btn btn-outline-secondary ${status==='USING'?'active':''}`} onClick={()=>setStatus('USING')}>사용중</button>
            <button className={`btn btn-outline-secondary ${status==='NOT_USING'?'active':''}`} onClick={()=>setStatus('NOT_USING')}>미사용중</button>
          </div>
          <div className="text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            전체 {counts.all}명 · 사용중 {counts.using}명 · 미사용중 {counts.notUsing}명
          </div>
        </div>

        {/* 검색 / 정렬 */}
        <div className="p-3 border-bottom">
          <input type="text" className="form-control mb-2" placeholder="회원명 / 연락처 검색" value={searchKeyword} onChange={(e)=>setSearchKeyword(e.target.value)} />
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 small text-muted">정렬</label>
            <select className="form-select form-select-sm" style={{ maxWidth: 220 }} value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option value="NAME_ASC">이름순 (가-하)</option>
              <option value="EXPIRY_ASC">회원권 만료일 빠른순</option>
            </select>
          </div>
        </div>

        {/* 리스트: 이 영역만 스크롤 + 20개씩 무한 로딩 */}
        <div className="flex-grow-1" style={{ minHeight: 0 }}> {/* ✅ 추가: 스크롤 허용 */}
          <ScrollBar                                   // ✅ 추가: 무한스크롤 적용
            items={sortedMembers}
            pageSize={20}
            loading={loading}
            emptyNode={<div className="p-3 text-center text-muted">검색된 회원이 없습니다.</div>}
            renderRow={(m) => {
              const selected = selectedId === m.memNum && mode !== 'create';
              return (
                <div
                  key={m.memNum}
                  className={`p-3 border-bottom small ${selected ? 'bg-primary text-white' : 'bg-white'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedId(m.memNum); setMode('detail'); }}
                >
                  <div className="fw-semibold">
                    {m.memName ? `${m.memName}${m.memBirthday ? `(${String(m.memBirthday).slice(0,10)})` : ''}` : '-'}
                  </div>
                  <div className={`mt-1 small ${selected ? 'text-white-50':'text-muted'}`}>
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
              );
            }}
          />
        </div>
      </div>

      {/* 오른쪽 패널 */}
      <div className="flex-grow-1 p-4 overflow-auto bg-white">
        {renderRight()}
      </div>
    </div>
  );
}
