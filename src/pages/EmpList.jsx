import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import EmpModal from "../components/EmpModal";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import MemberSearchModal from "../components/MemberSearchModal";

function EmpList() {
  const [list, setList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 단일 드롭다운: all | name | phone | activeOnly | resignedOnly
  const [type, setType] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // type에 따라 백엔드 status 파라미터 파생
  const derivedStatus = useMemo(() => {
    if (type === "activeOnly") return "ACTIVE";
    if (type === "resignedOnly") return "RESIGNED";
    return "ALL";
  }, [type]);

  // 조회
  const loadData = async () => {
  try {
    const kw = keyword.trim();

    // 상태 매핑을 다 깔아놓음 (백엔드 어느 규격이어도 걸리도록)
    const statusWord =
      derivedStatus === "ACTIVE" ? "ACTIVE"
      : derivedStatus === "RESIGNED" ? "RESIGNED"
      : "ALL";

    const statusYN =
    
      derivedStatus === "ACTIVE" ? "Y"
      : derivedStatus === "RESIGNED" ? "N"
      : "ALL";

    const statusHR =
      derivedStatus === "ACTIVE" ? "EMPLOYED"
      : derivedStatus === "RESIGNED" ? "RETIRED"
      : "ALL";

    const params = {
      page,
      size: 10,

      // ✅ 이름/연락처 검색이면 그대로, 상태 선택이면 type을 'status'로 고정
      type:
        (type === "name" || type === "phone")
          ? type
          : (type === "activeOnly" || type === "resignedOnly")
            ? "status"
            : "all",

      // ✅ 키워드 있으면만 전송 (상태 검색과도 조합 가능)
      ...(kw && { keyword: kw }),

      // ✅ 백엔드 어떤 키/값을 쓰든 한 번에 대응
      status: statusWord,     // ACTIVE | RESIGNED | ALL
      empStatus: statusYN,    // Y | N | ALL
      employment: statusHR,   // EMPLOYED | RETIRED | ALL
    };

    const res = await axios.get("http://localhost:9000/v1/emp/list/paging", { params });
    setList(res.data.list || []);
    setTotalPage(res.data.totalPage || 1);
  } catch (e) {
    console.error("데이터 로드 실패:", e);
  }
};


  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, keyword]); // type 바뀌면 자동 조회

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const onSearch = () => {
    setPage(1);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>직원 목록</h2>
        <div className="d-flex align-items-center">
          <SearchBar
            type={type}
            keyword={keyword}
            onTypeChange={(v) => {
              setType(v);
              setPage(1);
            }}
            onKeywordChange={setKeyword}
            onSearch={onSearch}
          />
          <button className="btn btn-success ms-3" onClick={() => setIsModalOpen(true)}>
            직원 등록
          </button>
        </div>
      </div>

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
                    onClick={() => navigate(`/emp/${emp.empNum}`)}
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">직원 데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />

      <MemberSearchModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSelect={(member) => {
          setSelectedMember(member);
          setShowModal(false);
        }}
      />
      <button className="btn btn-outline-dark ms-2" onClick={() => setShowModal(true)}>
        회원검색
      </button>

      {selectedMember && (
        <div className="alert alert-info mt-3">
          <strong>선택된 회원:</strong> {selectedMember.memName} ({selectedMember.memEmail})
        </div>
      )}

      <EmpModal show={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadData} />
    </div>
  );
}

export default EmpList;
