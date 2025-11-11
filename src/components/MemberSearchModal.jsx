import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Table, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import Pagination from "./Pagination";

function MemberSearchModal({ show, onHide, onSelect }) {
  const [type, setType] = useState("all");      // all | name | phone
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState([]);

  // 페이징 상태
  const [page, setPage] = useState(1);
  const size = 10; // 페이지당 표시 개수
  const [totalPage, setTotalPage] = useState(1);

  const fetchMembers = async ({ forcePage } = {}) => {
    try {
      // 1) 서버가 페이징을 지원하는 경우(있다면 이 주석 해제해서 사용)
      // const { data } = await axios.get("http://localhost:9000/v1/member/search", {
      //   params: { type, keyword, page, size },
      // });
      // setList(data.list || []);
      // setTotalPage(data.totalPage || 1);

      // 2) 서버 페이징 없음 → 한 번에 받아서 프론트에서 슬라이싱
      const { data } = await axios.get("/v1/member/search", {
        params: { type, keyword },
      });
      const all = Array.isArray(data) ? data : (data?.list || []);
      setList(all);
      const tp = Math.max(1, Math.ceil(all.length / size));
      setTotalPage(tp);

      // 검색 조건 바뀌면 1페이지로
      if (forcePage === 1) setPage(1);
    } catch (err) {
      console.error("회원 검색 실패:", err);
      setList([]);
      setTotalPage(1);
      if (forcePage === 1) setPage(1);
    }
  };

  // 모달 열릴 때 기본 검색
  useEffect(() => {
    if (show) {
      // 초기화
      setPage(1);
      fetchMembers({ forcePage: 1 });
    }
  }, [show]);

  // 현재 페이지의 슬라이스(서버 페이징 미사용 시)
  const pagedList = useMemo(() => {
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  }, [list, page]);

  const onSearchClick = () => fetchMembers({ forcePage: 1 });

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>회원 검색</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* 검색 바(멤버 전용 옵션만) */}
        <Row className="g-2 mb-3">
          <Col xs="auto">
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: 150 }}
              title="검색 조건"
            >
              <option value="all">전체</option>
              <option value="name">이름</option>
              <option value="phone">연락처</option>
            </Form.Select>
          </Col>
          <Col>
            <Form.Control
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색어 입력..."
              onKeyDown={(e) => e.key === "Enter" && onSearchClick()}
            />
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" onClick={onSearchClick}>
              검색
            </Button>
          </Col>
        </Row>

        {/* 결과 테이블 */}
        <Table hover bordered className="text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>이름</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            {pagedList.length > 0 ? (
              pagedList.map((m) => (
                <tr key={m.memNum}>
                  <td>{m.memName}</td>
                  <td>{m.memPhone}</td>
                  <td>{m.memEmail}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        onSelect(m);
                        onHide();
                      }}
                    >
                      선택
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-muted py-3">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* 페이징 */}
        <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
      </Modal.Body>
    </Modal>
  );
}

export default MemberSearchModal;
