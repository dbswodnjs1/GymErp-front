// src/components/ScrollBar.jsx
import axios from "axios";
import { forwardRef, useEffect, useRef, useState, useCallback } from "react";
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
 * ScrollBar – 간단 사용:
 * <ScrollBar endpoint="/api/v1/attendance" params={{ date: '2025-11-04' }}
 *   provide={({ items }) => (<div>{items.length}건</div>)} />
 *
 * 옵션:
 * - method: "GET" | "POST" (기본 GET)
 * - body:   POST 바디
 * - pageSize: 기본 10 (백이 page/size 받으면 자동 전달)
 * - height:  "70vh"
 * - rememberKey: 스크롤 위치 저장/복원 키
 * - extract(res): { items, totalPage }로 매핑 (기본 extractor 내장)
 * - provide: ({ items, loading, error, reload, page, totalPage }) => ReactNode
 * - children/renderItem/itemComponent: 아이템 단위 렌더(간단 목록용)
 */
const ScrollBar = forwardRef(function ScrollBar({
  endpoint,
  params = {},
  method = "GET",
  body = null,

  pageSize = 10,
  height = "70vh",
  rememberKey,

  extract,          // (res) => ({ items, totalPage })
  provide,          // ({ items, loading, error, reload, page, totalPage }) => ReactNode
  children,
  renderItem,
  itemComponent,
}, ref){
  injectStyle();

  // ---- 상태 ----
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetFlag, setResetFlag] = useState(false);

  const boxRef = useRef(null);
  const bottomRef = useRef(null);
  const lastRef = useRef(null);
  const pagerRef = useRef(null);

  const hasMore = page < totalPage;

  // ---- remember util ----
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

  // ---- 기본 extractor: 흔한 응답 형태 자동지원 ----
  const defaultExtract = (res) => {
    const d = res?.data ?? res;
    const items = d?.list ?? d?.content ?? d?.items ?? d?.rows ?? (Array.isArray(d) ? d : []);
    const tp    = d?.totalPage ?? d?.totalPages ?? d?.pages ?? 1;
    return { items: Array.isArray(items) ? items : [], totalPage: tp || 1 };
  };
  const doExtract = extract || defaultExtract;

  // ---- 기본 렌더러(아무 것도 안 넘기면 이걸로) ----
  const DefaultItem = ({ item }) => {
    const title = item?.title || item?.name || item?.empName || item?.memName || `#${item?.id ?? ""}`;
    const sub   = item?.memo || item?.note || item?.email || item?.empPhone || "";
    return (
      <div className="p-3 mb-2 border rounded bg-white">
        <div className="fw-semibold">{title}</div>
        {sub ? <div className="text-muted small">{sub}</div> : null}
      </div>
    );
  };

  // 최종 렌더 선택 (children > renderItem > itemComponent > DefaultItem)
  const render = (item, idx) => {
    if (typeof children === "function") return children(item, idx);
    if (typeof renderItem === "function") return renderItem(item, idx);
    if (typeof itemComponent === "function") return itemComponent({ item, idx });
    return <DefaultItem key={idx} item={item} />;
  };

  // ---- 데이터 로딩 ----
  const fetchPage = useCallback(async (p)=>{
    if (!endpoint) { setError("endpoint가 필요합니다."); return; }
    setLoading(true); setError("");
    try{
      const q = { ...params, page: p, size: pageSize };
      const res = method.toUpperCase() === "POST"
        ? await axios.post(endpoint, body ?? {}, { params: q })
        : await axios.get(endpoint, { params: q });

      const { items, totalPage: tp } = doExtract(res);
      if (!Array.isArray(items)) throw new Error("items 형식 오류");
      setTotalPage(tp || 1);
      setRows(prev => (p===1 || resetFlag ? items : [...prev, ...items]));
      setResetFlag(false);
    }catch(e){
      setError(e?.response?.data?.message || e?.response?.data || e?.message || "로딩 실패");
    }finally{
      setLoading(false);
    }
  }, [endpoint, params, method, body, pageSize, resetFlag, doExtract]);

  // params/endpoint 변경 → 1페이지부터 리셋
  useEffect(()=>{
    setRows([]); setPage(1); setResetFlag(true);
  }, [endpoint, JSON.stringify(params), pageSize]);

  // 페이지 변경 시 로딩
  useEffect(()=>{ fetchPage(page); }, [page, fetchPage]);

  // 스크롤 리스너 + remember + autohide
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

  // 새 데이터가 붙으면 하단으로
  useEffect(()=>{
    const target = lastRef.current || pagerRef.current;
    target?.scrollIntoView({ behavior:"smooth", block:"end" });
  }, [rows]);

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

  // 페이지네이션 클릭 → 해당 페이지로 점프 (누적 초기화)
  const handlePageChange = (p)=>{
    if (p<1 || p>totalPage) return;
    setRows([]); setResetFlag(true); setPage(p);
    setTimeout(()=> pagerRef.current?.scrollIntoView({ behavior:"smooth", block:"end" }), 0);
  };

  const reload = useCallback(()=>{
    setRows([]); setResetFlag(true); setPage(1);
  }, []);

  // ✅ provide가 있으면 “데이터 단위로” 그대로 렌더(테이블/그리드 등)
  if (typeof provide === "function") {
    return (
      <div className="d-flex flex-column" style={{ gap: 12 }}>
        <div
          ref={boxRef}
          className="jb-scroll"
          data-autohide="1"
          style={{ height, overflow:"auto", border:"1px solid #e7e7ef", borderRadius:8, padding:12 }}
        >
          {provide({ items: rows, loading, error, reload, page, totalPage })}
          <div ref={bottomRef} style={{ height: 1 }} />
          {loading && (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" /> 불러오는 중…
            </div>
          )}
          {error && <div className="text-danger small py-2">{String(error)}</div>}
        </div>

        <div ref={pagerRef} className="d-flex justify-content-center">
          <Pagination page={page} totalPage={totalPage} onPageChange={handlePageChange} />
        </div>
      </div>
    );
  }

  // 아이템 단위(간단 목록) 렌더 모드
  return (
    <div className="d-flex flex-column" style={{ gap: 12 }}>
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
              {typeof children === "function" ? children(it, idx) : render(it, idx)}
            </div>
          );
        })}

        <div ref={bottomRef} style={{ height: 1 }} />

        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" /> 불러오는 중…
          </div>
        )}
        {error && <div className="text-danger small py-2">{String(error)}</div>}

        {!loading && hasMore && (
          <div className="text-center py-2">
            <Button variant="outline-secondary" size="sm" onClick={()=>setPage(p=>p+1)}>
              더 보기(+{pageSize})
            </Button>
          </div>
        )}
      </div>

      <div ref={pagerRef} className="d-flex justify-content-center">
        <Pagination page={page} totalPage={totalPage} onPageChange={handlePageChange} />
      </div>
    </div>
  );
});

export default ScrollBar;
