// src/pages/Sales/SalesServiceEdit.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import MemberSearchModal from "../../components/MemberSearchModal";
import SalesServiceSearchModal from "../../components/SalesServiceSearchModal";

function SalesServiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    memName: "",
    empNum: "",
    empName: "",
    createdAt: "",
    updatedAt: "",
  });

  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 모달 상태
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // 숫자 포맷 / 파싱 함수
  const formatNumber = (value) =>
    value === null || value === ""
      ? ""
      : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const parseNumber = (value) => Number(value.replace(/[^0-9]/g, "")) || 0;

  // 1. 초기 데이터 로딩
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`/v1/sales/services/${id}`);

        const data =
          res?.data?.serviceName !== undefined
            ? res.data
            : res?.data?.data
            ? res.data.data
            : null;

        if (!data) {
          setError("데이터를 불러오지 못했습니다.");
          return;
        }

        const today = new Date().toISOString().slice(0, 10);

        // 회원 이름 조회
        let memName = "";
        if (data.memNum) {
          try {
            const memberRes = await axios.get(`/v1/member/${data.memNum}`);
            memName = memberRes.data.memName || "";
          } catch {
            memName = "(탈퇴 회원)";
          }
        }

        // 직원 이름 조회
        let empName = "";
        if (data.empNum) {
          try {
            const empRes = await axios.get(`/v1/emp/${data.empNum}`);
            empName = empRes.data.empName || "";
          } catch {
            empName = "(퇴사자)";
          }
        }

        const filled = { ...data, memName, empName, updatedAt: today };
        setForm(filled);
        setOriginal(filled);
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        setError("데이터 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 로딩 중
  if (loading)
    return (
      <div className="text-center mt-5">
        <h5>데이터를 불러오는 중입니다...</h5>
      </div>
    );

  // 에러 발생
  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        <h5>{error}</h5>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    );

  // 2. 입력값 변경
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
    } else if (name === "actualCount") {
      setForm((prev) => ({ ...prev, actualCount: num }));
    } else {
      setForm((prev) => ({ ...prev, [name]: num }));
    }
  };

  // 회원 선택 완료
  const handleSelectMember = (member) => {
    setForm((prev) => ({
      ...prev,
      memNum: member.memNum,
      memName: member.memName,
    }));
    setShowMemberModal(false);
  };

  // 서비스 선택 완료
  const handleSelectService = (service) => {
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
  };

  // ✅ 3. 수정 확인 (예외 메시지 처리 강화)
  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      const storedUser = sessionStorage.getItem("user");
      const currentEmpNum = storedUser ? JSON.parse(storedUser).empNum : null;

      const payload = {
        serviceSalesId: Number(id),
        serviceName: form.serviceName,
        serviceType: form.serviceType,
        baseCount: form.baseCount,
        actualCount: form.actualCount,
        baseAmount: form.baseAmount,
        actualAmount: form.actualAmount,
        discount: form.discount,
        memNum: form.memNum,
        empNum: currentEmpNum ?? form.empNum,
      };

      const res = await axios.put(`/v1/sales/services/${id}`, payload);

      if (res.data.success) {
        alert("판매 내역이 성공적으로 수정되었습니다.");
        navigate(`/sales/salesservicedetail/${id}`);
      } else {
        const msg = res.data.message || "수정 실패: 요청을 다시 확인해주세요.";

        // ✅ 최저점 보장 관련 메시지 강조
        if (msg.includes("최소 1회") || msg.includes("1일 이상")) {
          alert(`❗ ${msg}`);
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error("수정 오류:", err);
      alert(err.response?.data?.message || "서버 오류가 발생했습니다.");
    }
  };

  // 4. 수정 취소
  const handleCancel = () => {
    navigate(`/sales/salesservicedetail/${id}`);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h4 className="fw-bold mb-5 text-start">
        {id}번 서비스 판매 내역 수정
      </h4>

      {/* 모달 연결 */}
      <MemberSearchModal
        show={showMemberModal}
        onHide={() => setShowMemberModal(false)}
        onSelect={handleSelectMember}
      />

      <SalesServiceSearchModal
        show={showServiceModal}
        onHide={() => setShowServiceModal(false)}
        onSelect={handleSelectService}
      />

      <form
        onSubmit={handleConfirm}
        className="border rounded-4 shadow-sm overflow-hidden mt-4"
      >
        <table className="table table-striped m-0 align-middle text-center">
          <tbody>
            {/* 상품명 */}
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
                    name="serviceName"
                    className="form-control text-center"
                    placeholder="상품 선택"
                    value={form.serviceName}
                    readOnly
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary position-absolute"
                    style={{
                      right: "calc(50% - 170px - 45px)",
                      height: "38px",
                    }}
                    onClick={() => setShowServiceModal(true)}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* 구분 */}
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

            {/* 회원 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                회원
              </th>
              <td className="bg-light align-middle position-relative">
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "340px", margin: "0 auto" }}
                >
                  <input
                    type="text"
                    name="memName"
                    className="form-control text-center"
                    placeholder="회원 선택"
                    value={form.memName}
                    readOnly
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary position-absolute"
                    style={{
                      right: "calc(50% - 170px - 45px)",
                      height: "38px",
                    }}
                    onClick={() => setShowMemberModal(true)}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* 직원 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                직원
              </th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="empName"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.empName}
                  readOnly
                />
              </td>
            </tr>

            {/* 횟수/일수 */}
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

            {/* 실제 횟수/일수 */}
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

            {/* 총액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                총액(원)
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

            {/* 할인금액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                할인금액(원)
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

            {/* 최종금액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                최종금액(원)
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

            {/* 등록일 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                등록일
              </th>
              <td className="bg-light align-middle">
                <input
                  type="date"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.createdAt ? form.createdAt.slice(0, 10) : ""}
                  readOnly
                />
              </td>
            </tr>

            {/* 수정일 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                수정일
              </th>
              <td className="bg-light align-middle">
                <input
                  type="date"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.updatedAt ? form.updatedAt.slice(0, 10) : ""}
                  readOnly
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      {/* 버튼 영역 */}
      <div
        className="d-flex justify-content-center align-items-center mt-4"
        style={{ gap: "20px" }}
      >
        <button
          type="button"
          className="btn btn-secondary px-5"
          onClick={handleCancel}
        >
          취소
        </button>

        <button
          type="submit"
          className="btn btn-primary px-5"
          onClick={handleConfirm}
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default SalesServiceEdit;
