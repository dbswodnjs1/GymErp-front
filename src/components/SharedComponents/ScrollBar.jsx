import { useEffect, useMemo, useRef, useState } from "react";

/**
 * SCROLL BAR 컴포넌트
 * - 클라이언트 사이드 무한 목록(20개씩 등) 표시
 * - 스크롤 바닥 근처에서 다음 pageSize 만큼 자동 추가 렌더
 *
 * props:
 *  - items: any[]                     전체 데이터(필터·정렬 후 배열)
 *  - pageSize?: number = 20           한 번에 추가 표시 개수
 *  - renderRow: (item, idx) => node   각 행 렌더(반환 요소에 key 넣는 걸 권장)
 *  - emptyNode?: ReactNode            비어있을 때 노드
 *  - loading?: boolean = false        로딩 표시
 *  - className?: string               래퍼 클래스
 *  - style?: React.CSSProperties      래퍼 인라인 스타일(기본: overflowY auto)
 *  - rootMargin?: string              IO rootMargin (기본 "0px 0px 200px 0px")
 *  - threshold?: number               IO threshold (기본 0.01)
 */
export default function ScrollBar({
  items,
  pageSize = 20,
  renderRow,
  emptyNode = null,
  loading = false,
  className = "",
  style = {},
  rootMargin = "0px 0px 200px 0px",
  threshold = 0.01,
}) {
  const [count, setCount] = useState(pageSize);
  const boxRef = useRef(null);
  const bottomRef = useRef(null);

  // 데이터/필터/정렬 변경 → 처음부터 다시
  useEffect(() => { setCount(pageSize); }, [items, pageSize]);

  const hasMore = count < (items?.length ?? 0);
  const visible = useMemo(() => (items || []).slice(0, count), [items, count]);

  // 바닥 감지 → 다음 pageSize 추가
  useEffect(() => {
    const root = boxRef.current;
    const sentinel = bottomRef.current;
    if (!root || !sentinel) return;

    const io = new IntersectionObserver((entries) => {
      const hit = entries.some((e) => e.isIntersecting);
      if (hit && hasMore && !loading) {
        setCount((c) => Math.min(c + pageSize, items.length));
      }
    }, { root, rootMargin, threshold });

    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loading, items?.length, pageSize, rootMargin, threshold]);

  return (
    <div
      ref={boxRef}
      className={`d-flex flex-column ${className}`}
      style={{ overflowY: "auto", minHeight: 0, height: "100%", ...style }}
    >
      {visible.length === 0 && !loading ? (
        emptyNode
      ) : (
        visible.map((item, idx) => renderRow(item, idx))
      )}
      <div ref={bottomRef} style={{ height: 1 }} />
      {loading && <div className="p-3 text-center text-muted">불러오는 중…</div>}
    </div>
  );
}
