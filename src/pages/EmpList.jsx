import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import EmpModal from "../components/EmpModal";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import MemberSearchModal from "../components/MemberSearchModal";
import ScrollBar from "../components/ScrollBar";


function EmpList() {
  const [list, setList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // 직원 데이터 조회
  const loadData = async () => {
    try {
      const res = await axios.get("http://localhost:9000/v1/emp/list/paging", {
        params: { page, size: 10, type, keyword },
      });
      setList(res.data.list || []);
      setTotalPage(res.data.totalPage || 1);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  // 페이지 또는 검색 조건 변경 시 목록 로드
  useEffect(() => {
    loadData();
  }, [page, type]);

  // App에서 전달된 상태로 모달 자동 오픈
  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    
    <div className="container mt-4">
      
      {/* 제목 + 검색창 + 등록버튼 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>직원 목록</h2>
        <div className="d-flex align-items-center">
          {/* 검색 컴포넌트 */}
          <SearchBar type={type} keyword={keyword} 
            onTypeChange={setType}
            onKeywordChange={setKeyword}
            onSearch={loadData}
          />
          <button className="btn btn-success ms-3"
            onClick={() => setIsModalOpen(true)}
          >
            직원 등록
          </button>
        </div>
      </div>

      {/* 직원 테이블 */}
      <table className="table table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>이름</th>
            <th>연락처</th>
            <th>이메일</th>
            <th>상세보기</th> 
          </tr>
        </thead>
        <tbody>
          {list.length > 0 ? (
            list.map((emp) => (
              <tr key={emp.empNum}>
                <td>{emp.empName}</td>
                <td>{emp.empPhone}</td>
                <td>{emp.empEmail}</td>
                <td>
                  <button
                    className="btn btn-link text-dark"
                    onClick={() => {
                      console.log("➡️ 이동 시도:", emp.empNum);
                      navigate(`/emp/${emp.empNum}`);
                    }}
                  >    
                    보기
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">직원 데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />

      {/* 회원 검색 모달 */}
      <MemberSearchModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSelect={(member) => {
          setSelectedMember(member);
          setShowModal(false);
        }}
      />
      <button
        className="btn btn-outline-dark ms-2"
        onClick={() => setShowModal(true)}
      >
        회원검색
      </button>
      
      {/* 선택된 회원 표시 */}
      {selectedMember && (
        <div className="alert alert-info mt-3">
          <strong>선택된 회원:</strong> {selectedMember.memName} (
          {selectedMember.memEmail})
        </div>
      )}

      {/* 직원 등록 모달 */}
      <EmpModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

export default EmpList;