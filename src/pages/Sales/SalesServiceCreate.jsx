import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import MemberSearchModal from "../../components/MemberSearchModal";
import SalesServiceSearchModal from "../../components/SalesServiceSearchModal"; // ✅ 서비스 검색 모달 import



// ✅ 프록시 강제 사용 (절대경로 방지)
// axios.defaults.baseURL = "";


function SalesServiceCreate() {
  const [form, setForm] = useState({
    serviceId: "",
    serviceName: "",
    serviceType: "",
    baseCount: 0,
    actualCount: 0,
    baseAmount: 0,
    actualAmount: 0,
    discount: 0,
    memNum: "",
    memberName: "",
    empNum: "",
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false); // ✅ 서비스 모달 상태

  // ✅ 로그인한 직원 empNum 자동 세팅
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.empNum) {
          setForm((prev) => ({ ...prev, empNum: user.empNum }));
          console.log("✅ 로그인한 직원:", user.empName, `(ID: ${user.empNum})`);
        }
      }
    } catch (err) {
      console.error("로그인 정보 로드 실패:", err);
    }
  }, []);

  const formatNumber = (value) =>
    value === null || value === ""
      ? ""
      : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const parseNumber = (value) => Number(value.replace(/[^0-9]/g, "")) || 0;

  /* ===============================
     [1] 서비스 선택 모달 열기
  =============================== */
  const handleSelectService = () => {
    setShowServiceModal(true);
  };

  // ✅ SalesServiceSearchModal → 선택된 서비스 데이터 반영
  const handleServiceSelect = (service) => {
    if (!service) return;
    const price = Number(service.price ?? 0);
    const count = Number(service.serviceValue ?? service.value ?? 1);
    const code = service.categoryCode ?? service.codeBId ?? "기타";

    setForm((prev) => ({
      ...prev,
      serviceId: service.serviceId,
      serviceName: service.serviceName ?? service.name,
      serviceType: code,
      baseCount: count,
      actualCount: count,
      baseAmount: price,
      actualAmount: price,
      discount: 0,
    }));

    setShowServiceModal(false);
    console.log("✅ 선택된 서비스:", service.serviceName, `(ID: ${service.serviceId})`);
  };

  /* ===============================
     [2] 회원 검색 모달 연동
  =============================== */
  const handleSelectMember = () => setShowMemberModal(true);

  const handleMemberSelect = (member) => {
    setForm((prev) => ({
      ...prev,
      memNum: member.memNum,
      memberName: member.memName,
    }));
    setShowMemberModal(false);
    console.log("✅ 선택된 회원:", member.memName, `(ID: ${member.memNum})`);
  };

  /* ===============================
     [3] 입력값 변경
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const num = parseNumber(value);

    if (name === "discount") {
      const actual = form.baseAmount - num;
      setForm((prev) => ({ ...prev, discount: num, actualAmount: actual }));
    } else if (name === "actualAmount") {
      const discount = form.baseAmount - num;
      setForm((prev) => ({
        ...prev,
        actualAmount: num,
        discount: discount >= 0 ? discount : 0,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: num }));
    }
  };

  /* ===============================
     [4] 등록 요청
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ 로그인한 사용자 정보에서 empNum 가져오기
      const storedUser = sessionStorage.getItem("user");
      const currentEmpNum = storedUser ? JSON.parse(storedUser).empNum : null;
      
      // ✅ payload에 empNum 포함 (UI에는 표시 안 됨)
      const { memberName, ...requestData } = form;
      const payload = {
        ...requestData,
        empNum: currentEmpNum ?? form.empNum,
      };
      const res = await axios.post("/v1/sales/services", payload);

      if (res.data.result > 0) {
        alert(res.data.message);
        setForm({
          serviceId: "",
          serviceName: "",
          serviceType: "",
          baseCount: 0,
          actualCount: 0,
          baseAmount: 0,
          actualAmount: 0,
          discount: 0,
          memNum: "",
          memberName: "",
          empNum: currentEmpNum,
        });
      } else {
        alert("등록 실패. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  const isSubmitDisabled = !form.memNum || !form.serviceId;

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h4 className="fw-bold mb-5 text-start">서비스 판매 등록</h4>

      {/* ✅ 회원 검색 모달 */}
      <MemberSearchModal
        show={showMemberModal}
        onHide={() => setShowMemberModal(false)}
        onSelect={handleMemberSelect}
      />

      {/* ✅ 서비스 검색 모달 */}
      <SalesServiceSearchModal
        show={showServiceModal}
        onHide={() => setShowServiceModal(false)}
        onSelect={handleServiceSelect}
      />

      <form
        onSubmit={handleSubmit}
        className="border rounded-4 shadow-sm overflow-hidden mt-4"
      >
        <table className="table table-striped m-0 align-middle text-center">
          <tbody>
            {/* [1] 상품명 */}
            <tr>
              <th
                className="bg-dark text-white text-center align-middle"
                style={{ width: "30%" }}
              >
                상품명
              </th>
              <td className="bg-light align-middle position-relative">
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "340px", margin: "0 auto" }}
                >
                  <input
                    type="text"
                    className="form-control text-center"
                    name="serviceName"
                    placeholder="서비스 선택"
                    value={form.serviceName}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary position-absolute"
                    style={{ right: "calc(50% - 170px - 45px)", height: "38px" }}
                    onClick={handleSelectService} // ✅ 모달 열기
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* [2] 구분 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                구분
              </th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="serviceType"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.serviceType}
                  readOnly
                />
              </td>
            </tr>

            {/* [3] 회원 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                회원
              </th>
              <td className="bg-light align-middle position-relative">
                <div
                  className="d-flex justify-content-center position-relative"
                  style={{ width: "340px", margin: "0 auto" }}
                >
                  <input
                    type="text"
                    name="memberName"
                    className="form-control text-center"
                    placeholder="회원 선택"
                    value={form.memberName}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary position-absolute"
                    style={{ right: "calc(50% - 170px - 45px)", height: "38px" }}
                    onClick={handleSelectMember}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* [4] 횟수/일수 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                횟수/일수
              </th>
              <td className="bg-light align-middle">
                <input
                  type="number"
                  name="baseCount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.baseCount}
                  readOnly
                />
              </td>
            </tr>

            {/* [5] 실제 횟수/일수 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                실제 횟수/일수
              </th>
              <td className="bg-light align-middle">
                <input
                  type="number"
                  name="actualCount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.actualCount}
                  onChange={handleChange}
                />
              </td>
            </tr>

            {/* [6] 금액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                금액
              </th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="baseAmount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={formatNumber(form.baseAmount)}
                  readOnly
                />
              </td>
            </tr>

            {/* [7] 할인금액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                할인금액
              </th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="discount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={formatNumber(form.discount)}
                  onChange={handleChange}
                />
              </td>
            </tr>

            {/* [8] 총액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                총액
              </th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="actualAmount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={formatNumber(form.actualAmount)}
                  onChange={handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center p-3 bg-white border-top">
          <button
            type="submit"
            className="btn btn-success px-5"
            disabled={isSubmitDisabled}
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}

export default SalesServiceCreate;
