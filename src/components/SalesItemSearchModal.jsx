// src/components/SalesItemSearchModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Table, Form, InputGroup } from "react-bootstrap";
import axios from "axios";

const LIST_API = "/v1/modals/products";

function SalesItemSearchModal({ show, onHide, onSelect, onExited }) {
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalCount, setTotalCount] = useState(0);
  const totalPage = useMemo(
    () => Math.max(1, Math.ceil((totalCount || 0) / limit)),
    [totalCount]
  );

  const controllerRef = useRef(null);

  const fetchList = async ({ kw = keyword, pg = page } = {}) => {
    // 이전 요청 취소
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    try {
      const { data } = await axios.get(LIST_API, {
        params: { keyword: kw, page: pg, limit },
        signal: controllerRef.current.signal,
      });
      setList(Array.isArray(data?.list) ? data.list : []);
      setTotalCount(Number(data?.totalCount ?? 0));
    } catch (e) {
      if (axios.isCancel?.(e) || e.name === "CanceledError") return;
      console.error("상품 검색 실패:", e);
      setList([]);
      setTotalCount(0);
    }
  };

  // 모달 열릴 때 초기 로드
  useEffect(() => {
    if (show) {
      setPage(1);
      fetchList({ kw: "", pg: 1 });
    }
    // 모달 닫힐 때 진행 중 요청 취소
    return () => controllerRef.current?.abort();
  }, [show]);

  // 페이지 변경 시 로드
  useEffect(() => {
    if (show) fetchList({ pg: page });
  }, [page]);

  // 키워드 변경 시 디바운스 검색
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      // 키워드가 바뀌면 1페이지부터 검색
      setPage(1);
      fetchList({ kw: keyword, pg: 1 });
    }, 300);
    return () => {
      clearTimeout(t);
      controllerRef.current?.abort();
    };
  }, [keyword, show]);

  const handleSearch = () => {
    // 수동 검색(엔터/버튼)도 동일하게 1페이지부터
    if (page !== 1) setPage(1);
    else fetchList({ kw: keyword, pg: 1 });
  };

  const fmt = (v) => (v ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <Modal
      show={show}
      onHide={onHide}
      onExited={onExited}
      centered
      size="lg"
      backdrop="static"
      keyboard
    >
      {/* 가운데 정렬 + 큰 제목 */}
      <Modal.Header className="border-0">
        <div className="w-100 d-flex align-items-center justify-content-center position-relative">
          <h3 className="m-0 fw-bold">상품 검색 / 선택</h3>
          <button
            type="button"
            className="btn-close position-absolute end-0 top-0 mt-2 me-2"
            aria-label="Close"
            onClick={onHide}
          />
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* 🔎 검색바: 폭 축소 + 오른쪽 정렬 */}
        <div className="mb-3 d-flex justify-content-end">
          <div style={{ width: 280 }}>
            <InputGroup size="sm">
              <Form.Control
                placeholder="검색어 입력…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoFocus
              />
              <Button variant="secondary" onClick={handleSearch}>
                검색
              </Button>
            </InputGroup>
          </div>
        </div>

        <Table hover bordered className="text-center align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: "15%" }}>구분</th>
              <th>상품명</th>
              <th style={{ width: "18%" }}>단가(원)</th>
              <th style={{ width: "12%" }}>선택</th>
            </tr>
          </thead>
          <tbody>
            {list.length ? (
              list.map((p) => (
                <tr key={p.productId}>
                  <td className="fw-semibold">{p.codeBId}</td>
                  <td className="text-start">{p.name}</td>
                  <td className="fw-bold">{fmt(p.price)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onSelect(p)}
                    >
                      선택
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-muted py-3">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <div className="d-flex justify-content-center gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </Button>
          <span className="align-self-center">
            {page} / {totalPage}
          </span>
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={page >= totalPage}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default SalesItemSearchModal;
