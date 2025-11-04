// src/components/ScrollBar.jsx
import { forwardRef, useEffect, useRef, useState, useCallback} from "react";
import { Spinner, Button } from "react-bootstrap";
import Pagination from "./Pagination";

/** 내부 CSS 주입(별도 css 파일 불필요) */
const STYLE_ID = "jb-scrollbar-style";
const CSS = `
.jb-scroll{ scrollbar-width:thin; scrollbar-color:#b7b7c2 transparent; }
.jb-scroll::-webkit-scrollbar{ width:10px; height:10px; }
.jb-scroll::-webkit-scrollbar-thumb{ border-radius:8px; background-clip:padding-box; background:#b7b7c2; }
.jb-scroll::-webkit-scrollbar-track{ background:transparent; }
.jb-scroll[data-autohide="1"]:not([data-active])::-webkit-scrollbar{ width:6px; height:6px; }
.jb-scroll[data-autohide="1"]:not([data-active]){ scrollbar-width:thin; }
`;

function injectStyle(){
  if (typeof document==="undefined") return;
  if (!document.getElementById(STYLE_ID)){
    const el=document.createElement("style");
    el.id=STYLE_ID; el.textContent=CSS;
    document.head.appendChild(el);
  }
}

/**
 * ScrollBar
 * props:
 * - loadPage: async (page:number, size:number) => { items:any[], totalPage:number }
 * - renderItem: (item:any, idx:number) => ReactNode
 * - height: 스크롤 영역 높이 (기본 "70vh")
 * - pageSize: 페이지당 개수(기본 10)
 * - startPage: 시작 페이지(기본 1)
 * - autoScroll: 새 데이터 붙을 때 아래로 스크롤(기본 true)
 * - rememberKey: 스크롤 위치 저장/복원 키(선택)
 */
const ScrollBar = forwardRef(function ScrollBar({
  loadPage,
  renderItem,
  height = "70vh",
  pageSize = 10,
  startPage = 1,
  autoScroll = true,
  rememberKey,
}, ref){
  injectStyle();

  const [page, setPage] = useState(startPage);
  const [totalPage, setTotalPage] = useState(1);
  const [rows, setRows] = useState([]);        // 누적 목록
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetFlag, setResetFlag] = useState(false); // 페이지 이동 시 누적 초기화용

  const boxRef = useRef(null);      // 스크롤 상자
  const bottomRef = useRef(null);   // 무한 스크롤 센티널
  const lastRef = useRef(null);     // 마지막 아이템
  const pagerRef = useRef(null);    // 페이지네이션 영역

  const hasMore = page < totalPage;

  // 위치 저장/복원
  const savePos = useCallback((el)=>{
    if (!rememberKey || !el) return;
    try{ sessionStorage.setItem(`scroll:${rememberKey}`, String(el.scrollTop)); }catch{}
  }, [rememberKey]);
  const loadPos = useCallback(()=>{
    if (!rememberKey) return 0;
    try{
      const v = sessionStorage.getItem(`scroll:${rememberKey}`);
      return v ? Number(v) : 0;
    }catch{ return 0; }
  }, [rememberKey]);

  const fetchPage = useCallback(async (p)=>{
    setLoading(true); setError("");
    try{
      const { items, totalPage: tp } = await loadPage(p, pageSize);
      if (!Array.isArray(items)) throw new Error("items 형식이 올바르지 않습니다.");
      setTotalPage(tp || 1);
      setRows(prev => (p===1 || resetFlag ? items : [...prev, ...items]));
      setResetFlag(false);
    }catch(e){
      setError(e?.message || "로딩 실패");
    }finally{
      setLoading(false);
    }
  }, [loadPage, pageSize, resetFlag]);

  // 초기/외부 변경 대응
  useEffect(()=>{ setPage(startPage); setRows([]); setResetFlag(true); }, [startPage]);

  // 페이지 변경 시 로드
  useEffect(()=>{ fetchPage(page); }, [page, fetchPage]);

  // 스크롤 리스너 + remember
  useEffect(()=>{
    const el = boxRef.current; if (!el) return;
    if (rememberKey) el.scrollTop = loadPos();

    let hideTimer;
    const show = ()=> el.setAttribute("data-active","1");
    const hide = ()=> el.removeAttribute("data-active");
    const onScroll = ()=>{
      savePos(el);
      show();
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 600);
    };
    hide(); // 초기 얇게
    el.addEventListener("scroll", onScroll, { passive:true });
    return ()=>{ el.removeEventListener("scroll", onScroll); clearTimeout(hideTimer); };
  }, [rememberKey, savePos, loadPos]);

  // 새 데이터가 붙을 때 아래로 스크롤(마지막 아이템 또는 페이지네이션)
  useEffect(()=>{
    if (!autoScroll) return;
    const target = lastRef.current || pagerRef.current;
    target?.scrollIntoView({ behavior:"smooth", block:"end" });
  }, [rows, autoScroll]);

  // 무한 스크롤
  useEffect(()=>{
    const root = boxRef.current;
    const sentinel = bottomRef.current;
    if (!root || !sentinel) return;
    const io = new IntersectionObserver((entries)=>{
      const hit = entries.some(e=>e.isIntersecting);
      if (hit && !loading && hasMore) setPage(p=>p+1);
    }, { root, rootMargin:"0px 0px 200px 0px", threshold:0.01 });
    io.observe(sentinel);
    return ()=> io.disconnect();
  }, [loading, hasMore]);

  // 페이지네이션 클릭 → 누적 초기화 후 그 페이지부터
  const handlePageChange = (p)=>{
    if (p<1 || p>totalPage) return;
    setRows([]);
    setResetFlag(true);
    setPage(p);
    // 페이지 선택 시 페이지네이션 위치로 스크롤
    setTimeout(()=> pagerRef.current?.scrollIntoView({ behavior:"smooth", block:"end" }), 0);
  };

  return (
    <div className="d-flex flex-column" style={{ gap: 12 }}>
      {/* 스크롤 영역 */}
      <div
        ref={boxRef}
        className="jb-scroll"
        data-autohide="1"
        style={{ height, overflow:"auto", border:"1px solid #e7e7ef", borderRadius:8, padding:12 }}
      >
        {rows.map((it, idx)=>{
          const isLast = idx === rows.length - 1;
          return (
            <div key={idx} ref={isLast ? lastRef : null}>
              {renderItem(it, idx)}
            </div>
          );
        })}
        <div ref={bottomRef} style={{ height: 1 }} />

        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" /> 불러오는 중…
          </div>
        )}
        {error && <div className="text-danger small py-2">{error}</div>}
        {!loading && hasMore && (
          <div className="text-center py-2">
            <Button variant="outline-secondary" size="sm" onClick={()=>setPage(p=>p+1)}>
              더 보기(+{pageSize})
            </Button>
          </div>
        )}
      </div>

      {/* 네가 만든 Pagination을 “항상 아래”에 표시 */}
      <div ref={pagerRef} className="d-flex justify-content-center">
        <Pagination page={page} totalPage={totalPage} onPageChange={handlePageChange} />
      </div>
    </div>
  );
});

export default ScrollBar;
