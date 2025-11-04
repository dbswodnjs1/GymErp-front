import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaEdit, FaCalendarAlt, FaTrashAlt, FaSave, FaTimes, FaFolderOpen } from "react-icons/fa";

function EmpDetail() {
  const { empNum } = useParams();
  const [emp, setEmp] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const headerGradient = "linear-gradient(135deg, #2b314a, #4c5371)";
  
  // 일정관리 버튼 클릭 시 직원num 과 name 을 파라미터로 전달하며 이동
  // 나중에 로그인 기능 합치면 로그인된 id 로 
  const handleGoSchedule = () => {
    navigate(`/schedule?empNum=${emp.empNum}&empName=${emp.empName}`); 
  };

  // 직원 목록 조회 api
  useEffect(() => {
    axios
      .get(`http://localhost:9000/v1/emp/${empNum}`)
      .then((res) => setEmp(res.data))
      .catch((err) => console.error("직원 상세조회 실패:", err));
  }, [empNum]);

  if (!emp)
    return <div className="container mt-5 text-center">직원 정보를 불러오는 중...</div>;

  const profileUrl = preview
    ? preview
    : emp.profileImage
    ? `http://localhost:9000/profile/${emp.profileImage}`
    : null;

  // 직원 삭제
  const handleDelete = async () => {
    if (window.confirm(`정말 ${emp.empName} 직원을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:9000/v1/emp/${empNum}`);
        alert("직원 정보가 삭제되었습니다.");
        navigate("/emp");
      } catch (error) {
        console.error("직원 삭제 실패:", error);
        alert("직원 삭제에 실패했습니다.");
      }
    }
  };

  // 근속연수 계산
  const calcYears = (hireDate, fireDate) => {
    if (!hireDate) return "-";
    const start = new Date(hireDate);
    const end = fireDate ? new Date(fireDate) : new Date();
    const diff = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    const total = diff + (months >= 0 ? months / 12 : (12 + months) / 12);
    return `${Math.floor(total)}년 ${Math.floor((total % 1) * 12)}개월`;
  };

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmp((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 이미지 업로드
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    axios
      .post(`http://localhost:9000/v1/emp/upload/${empNum}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        alert("프로필 이미지 업로드 완료!");
        setEmp((prev) => ({ ...prev, profileImage: res.data }));
      })
      .catch((err) => {
        console.error("업로드 실패:", err);
        alert("이미지 업로드 실패");
      });
  };

  // 수정 저장
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:9000/v1/emp/${empNum}`, emp);
      alert("직원 정보가 수정되었습니다.");
      setIsEditMode(false);
    } catch (error) {
      console.error("수정 실패:", error);
      alert("직원 수정에 실패했습니다.");
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: "950px" }}>
        <div className="card border-0 rounded-4 shadow overflow-hidden">
          {/* 상단 헤더 */}
          <div
            className="p-4 text-white d-flex justify-content-between align-items-center position-relative"
            style={{
                background: headerGradient,
                minHeight: "200px", 
                padding: "2rem", 
            }}
            >
            {/* 왼쪽: 프로필 + 이름 */}
            <div className="d-flex align-items-center gap-3"
                style={{ marginTop: "-10px" }} 
            >
            {/* 프로필 이미지 + 업로드 버튼 */}
            <div
            className="position-relative"
            style={{
                width: "110px",
                height: "110px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
            >
            {profileUrl ? (
                <img
                src={profileUrl}
                alt="프로필"
                className="rounded-circle border border-white shadow"
                width="100"
                height="100"
                style={{ objectFit: "cover" }}
                />
            ) : (
                <FaUserCircle size={100} color="white" />
            )}

            {/* 업로드 버튼 */}
            {isEditMode && (
                <label
                htmlFor="fileUpload"
                className="btn btn-light btn-sm border d-inline-flex align-items-center justify-content-center gap-2 shadow-sm position-absolute"
                style={{
                    bottom: "0px",              
                    left: "50%",
                    transform: "translate(-50%, 110%)", 
                    backgroundColor: "white",
                    borderRadius: "6px",
                    padding: "3px 10px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    whiteSpace: "nowrap",
                    height: "30px",
                }}
                >
                <FaFolderOpen className="text-secondary" />
                사진 업로드
                <input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleProfileUpload}
                />
                </label>
            )}
            </div>
                {/* 이름 / 이메일 */}
                <div className="ms-3">
                {isEditMode ? (
                    <input
                    type="text"
                    name="empName"
                    value={emp.empName || ""}
                    onChange={handleChange}
                    className="form-control fw-bold"
                    style={{ fontSize: "1.5rem" }}
                    />
                ) : (
                    <h3 className="fw-bold mb-1">{emp.empName}</h3>
                )}
                <small className="opacity-75">
                    {emp.gender || "성별 미상"} / {emp.empEmail || "-"}
                </small>
                </div>
            </div>

            {/* 오른쪽 버튼 그룹 */}
            <div className="d-flex gap-2">
                {isEditMode ? (
                <>
                    <button
                    onClick={handleSave}
                    className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm"
                    >
                    <FaSave /> 저장
                    </button>
                    <button
                    onClick={() => {
                        setIsEditMode(false);
                        setPreview(null);
                    }}
                    className="btn btn-secondary btn-sm d-flex align-items-center gap-1 shadow-sm"
                    >
                    <FaTimes /> 취소
                    </button>
                </>
                ) : (
                <>
                    <button
                    onClick={() => setIsEditMode(true)}
                    className="btn btn-light btn-sm d-flex align-items-center gap-1 shadow-sm"
                    >
                    <FaEdit /> 상세정보 수정
                    </button>
                    <button onClick={handleGoSchedule} className="btn btn-light btn-sm d-flex align-items-center gap-1 shadow-sm">
                    <FaCalendarAlt /> 일정 관리
                    </button>
                    <button
                    onClick={handleDelete}
                    className="btn btn-danger btn-sm d-flex align-items-center gap-1 shadow-sm"
                    >
                    <FaTrashAlt /> 직원 삭제
                    </button>
                </>
                )}
            </div>
            </div>


          {/* 내용 영역 */}
          <div className="p-4 bg-white">
            {/* 기본 정보 */}
            <section
              className="mb-4 p-3 rounded-3"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <h5 className="fw-semibold mb-3">기본 정보</h5>
              <table className="table table-borderless align-middle text-secondary mb-0">
                <tbody>
                  <tr>
                    <th style={{ width: "130px" }}>주소</th>
                    <td>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="empAddress"
                          value={emp.empAddress || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        emp.empAddress || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>생년월일</th>
                    <td>
                      {isEditMode ? (
                        <input
                          type="date"
                          name="empBirth"
                          value={emp.empBirth || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        emp.empBirth || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>연락처</th>
                    <td>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="empPhone"
                          value={emp.empPhone || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        emp.empPhone || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>이메일</th>
                    <td>
                      {isEditMode ? (
                        <input
                          type="email"
                          name="empEmail"
                          value={emp.empEmail || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        emp.empEmail || "-"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 인사 정보 */}
            <section
              className="mb-4 p-3 rounded-3"
              style={{ backgroundColor: "#eef3ff" }}
            >
              <h5 className="fw-semibold mb-3">인사 정보</h5>
              <table className="table table-borderless align-middle text-secondary mb-2">
                <tbody>
                  <tr>
                    <th style={{ width: "130px" }}>입사일</th>
                    <td>
                      {isEditMode ? (
                        <input
                          type="date"
                          name="hireDate"
                          value={emp.hireDate || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        emp.hireDate || "-"
                      )}
                    </td>
                    <th style={{ width: "130px" }}>퇴사일</th>
                    <td>
                      {isEditMode ? (
                        <input
                          type="date"
                          name="fireDate"
                          value={emp.fireDate || ""}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        emp.fireDate || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>근속연수</th>
                    <td colSpan="3">
                      {calcYears(emp.hireDate, emp.fireDate)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div>
                <label className="form-label small text-secondary">메모</label>
                {isEditMode ? (
                  <textarea
                    name="empMemo"
                    value={emp.empMemo || ""}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                  ></textarea>
                ) : (
                  <div
                    className="p-3 rounded-3 border"
                    style={{ backgroundColor: "#f9fbff", minHeight: "80px" }}
                  >
                    {emp.empMemo ? emp.empMemo : "등록된 메모가 없습니다."}
                  </div>
                )}
              </div>
            </section>

            {/* 회원 정보 */}
            <section
              className="p-3 rounded-3"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <h5 className="fw-semibold mb-3">회원 정보</h5>
              {emp.memberList && emp.memberList.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {emp.memberList.map((m, i) => (
                    <span key={i} className="badge bg-light text-dark border">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">등록된 회원이 없습니다.</p>
              )}
            </section>

            <div className="text-end mt-4">
              <button className="btn btn-secondary px-4" onClick={() => navigate(-1)}>
                ← 목록으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpDetail;