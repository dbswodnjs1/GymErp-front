import { useEffect, useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import axios from "axios";
import SearchBar from "./SearchBar";

function MemberSearchModal({ show, onHide, onSelect }) {
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");

  // 회원 검색
  const handleSearch = async () => {
    try {
      const res = await axios.get("http://localhost:9000/v1/member/search", {
        params: { type, keyword },
      });
      setList(res.data);
    } catch (err) {
      console.error("회원 검색 실패:", err);
    }
  };

  // 모달 열릴 때 자동 검색
  useEffect(() => {
    if (show) handleSearch();
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>회원 검색</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3">
          <SearchBar
            type={type}
            keyword={keyword}
            onTypeChange={setType}
            onKeywordChange={setKeyword}
            onSearch={handleSearch}
          />
        </div>

        <Table hover bordered className="text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>회원번호</th>
              <th>이름</th>
              <th>연락처</th>
              <th>생년월일</th>
              <th>이메일</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map((m) => (
                <tr key={m.memNum}>
                  <td>{m.memNum}</td>
                  <td>{m.memName}</td>
                  <td>{m.memPhone}</td>
                  <td>{m.memBirthday}</td>
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
      </Modal.Body>
    </Modal>
  );
}

export default MemberSearchModal;