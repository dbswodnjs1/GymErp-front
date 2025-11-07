import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaEdit, FaTrashAlt, FaSave, FaTimes, FaFolderOpen } from "react-icons/fa";

function MemberDetail() {
  const { memNum } = useParams();
  const [mem, setMem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const headerGradient = "linear-gradient(135deg, #2b314a, #4c5371)";
  const API_BASE = "http://localhost:9000";
  const MEMBERS_BASE = `${API_BASE}/v1/member`;
  const PROFILE_BASE = `${API_BASE}/profile/`;

  // ORA-17004 회피: nullable string -> ""
  function sanitizeMember(m) {
    const copy = { ...m };
    ["memName","memGender","memPhone","memEmail","memAddr","memProfile","memNote"].forEach(k=>{
      if (copy[k] == null) copy[k] = "";
    });
    if (!copy.memBirthday) delete copy.memBirthday;
    delete copy.memCreated;
    delete copy.memUpdated;
    delete copy.memNum;
    return copy;
  }

  const load = async () => {
    const res = await axios.get(`${MEMBERS_BASE}/${memNum}`);
    setMem(res.data);
  };

  useEffect(() => {
    load().catch((e) => console.error("회원 상세 조회 실패:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memNum]);

  if (!mem) return <div className="container mt-5 text-center">회원 정보를 불러오는 중...</div>;

  const profileUrl = preview
    ? preview
    : mem.memProfile
      ? PROFILE_BASE + mem.memProfile
      : null;

  // 회원 삭제
  const handleDelete = async () => {
    if (window.confirm(`정말 ${mem.memName} 회원을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`${MEMBERS_BASE}/${memNum}`);
        alert("회원이 삭제되었습니다.");
        navigate("/member");
      } catch (e) {
        console.error("회원 삭제 실패:", e);
        alert("회원 삭제에 실패했습니다.");
      }
    }
  };

  // 입력 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMem((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 업로드
  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${MEMBERS_BASE}/upload/${memNum}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const saved = res.data;
      const fileName =
        typeof saved === "string" ? saved : (saved.filename || saved.fileName || saved.name || "");
      setMem((prev) => ({ ...prev, memProfile: fileName }));
      alert("프로필 이미지 업로드 완료!");
    } catch (err) {
      console.error("업로드 실패:", err);
      alert("이미지 업로드 실패");
    }
  };

  // 저장
  const handleSave = async () => {
    try {
      await axios.put(`${MEMBERS_BASE}/${memNum}`, sanitizeMember(mem));
      alert("회원 정보가 수정되었습니다.");
      setIsEditMode(false);
      load();
    } catch (e) {
      console.error("수정 실패:", e);
      alert("회원 수정에 실패했습니다.");
    }
  };

  // ---- 주소찾기 팝업 (카카오 우편번호) ----
  const loadPostcodeScript = () =>
    new Promise((resolve, reject) => {
      if (window.daum?.Postcode) return resolve();
      const script = document.createElement("script");
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const openAddressSearch = async () => {
    try {
      await loadPostcodeScript();
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
          setMem((prev) => ({ ...prev, memAddr: address }));
        },
        width: 500,
        height: 550,
      }).open(); // 실제 팝업창으로 뜸
    } catch (e) {
      console.error("주소검색 로드 실패:", e);
      alert("주소 검색을 불러오지 못했습니다.");
    }
  };
  // -------------------------------------

  // 날짜 보정
  const dateValue = (s) => {
    if (!s) return "";
    const str = String(s);
    return str.length >= 10 ? str.slice(0, 10) : str;
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: "950px" }}>
        <div className="card border-0 rounded-4 shadow overflow-hidden">
          {/* 상단 헤더 */}
          <div
            className="p-4 text-white d-flex justify-content-between align-items-center position-relative"
            style={{ background: headerGradient, minHeight: "200px", padding: "2rem" }}
          >
            {/* 왼쪽: 프로필 + 이름 */}
            <div className="d-flex align-items-center gap-3" style={{ marginTop: "-10px" }}>
              <div
                className="position-relative"
                style={{ width: "110px", height: "110px", display: "flex", justifyContent: "center", alignItems: "center" }}
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
                    <input id="fileUpload" type="file" accept="image/*" hidden onChange={handleProfileUpload} />
                  </label>
                )}
              </div>

              <div className="ms-3">
                {isEditMode ? (
                  <input
                    type="text"
                    name="memName"
                    value={mem.memName || ""}
                    onChange={handleChange}
                    className="form-control fw-bold"
                    style={{ fontSize: "1.5rem" }}
                  />
                ) : (
                  <h3 className="fw-bold mb-1">{mem.memName}</h3>
                )}
                <small className="opacity-75">
                  {mem.memGender || "성별 미상"} / {mem.memEmail || "-"}
                </small>
              </div>
            </div>

            {/* 오른쪽 버튼 그룹 */}
            <div className="d-flex gap-2">
              {isEditMode ? (
                <>
                  <button onClick={handleSave} className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm">
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
                  <button onClick={() => setIsEditMode(true)} className="btn btn-light btn-sm d-flex align-items-center gap-1 shadow-sm">
                    <FaEdit /> 상세정보 수정
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger btn-sm d-flex align-items-center gap-1 shadow-sm">
                    <FaTrashAlt /> 회원 삭제
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 내용 */}
          <div className="p-4 bg-white">
            <section className="mb-4 p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
              <h5 className="fw-semibold mb-3">기본 정보</h5>
              <table className="table table-borderless align-middle text-secondary mb-0">
                <tbody>
                  <tr>
                    <th style={{ width: "130px" }}>주소</th>
                    <td>
                      {isEditMode ? (
                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            name="memAddr"
                            value={mem.memAddr || ""}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="주소"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm px-2 py-1"
                            onClick={openAddressSearch}
                            style={{
                                    fontSize: "0.8rem",
                                    whiteSpace: "nowrap",
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                  }}
                            title="주소 검색 팝업 열기"
                          >
                            주소찾기
                          </button>
                        </div>
                      ) : (
                        mem.memAddr || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>생년월일</th>
                    <td>
                      {isEditMode ? (
                        <input
                          type="date"
                          name="memBirthday"
                          value={dateValue(mem.memBirthday)}
                          onChange={handleChange}
                          className="form-control"
                        />
                      ) : (
                        dateValue(mem.memBirthday) || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>연락처</th>
                    <td>
                      {isEditMode ? (
                        <input type="text" name="memPhone" value={mem.memPhone || ""} onChange={handleChange} className="form-control" />
                      ) : (
                        mem.memPhone || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>이메일</th>
                    <td>
                      {isEditMode ? (
                        <input type="email" name="memEmail" value={mem.memEmail || ""} onChange={handleChange} className="form-control" />
                      ) : (
                        mem.memEmail || "-"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>등록/수정일</th>
                    <td>
                      {(mem.memCreated?.slice?.(0, 10) || "-") + " / " + (mem.memUpdated?.slice?.(0, 10) || "-")}
                    </td>
                    
                  </tr>
                    <tr>
                    <th>회원권 상태</th>
                    <td>
                      
                    </td>
                  </tr>
                   <tr>
                    <th>회원권</th>
                    <td>
                      
                    </td>
                  </tr>
                   <tr>
                    <th>담당직원</th>
                    <td>
                     
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
              <h5 className="fw-semibold mb-3">메모</h5>
              {isEditMode ? (
                <textarea name="memNote" value={mem.memNote || ""} onChange={handleChange} className="form-control" rows="3"></textarea>
              ) : (
                <div className="p-3 rounded-3 border" style={{ backgroundColor: "#f9fbff", minHeight: "80px" }}>
                  {mem.memNote ? mem.memNote : "등록된 메모가 없습니다."}
                </div>
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

export default MemberDetail;
