// src/pages/Sales/SalesServiceDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function SalesServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    serviceName: "",
    serviceType: "",
    memNum: "",
    memName: "",
    empNum: "",
    empName: "",
    baseCount: "",
    actualCount: "",
    baseAmount: "",
    discount: "",
    actualAmount: "",
    createdAt: "",
    updatedAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 숫자 포맷 함수
  const formatNumber = (value) =>
    value === null || value === ""
      ? ""
      : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 1. 데이터 로딩
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

        setForm({ ...data, memName, empName, updatedAt: today });
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        setError("데이터 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 2. 로딩 중일 때
  if (loading) {
    return (
      <div className="text-center mt-5">
        <h5>데이터를 불러오는 중입니다...</h5>
      </div>
    );
  }

  // 3. 에러 발생 시
  if (error) {
    return (
      <div className="text-center mt-5 text-danger">
        <h5>{error}</h5>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 4. 버튼 이벤트
  const handleEdit = () => navigate(`/sales/salesserviceedit/${id}`);
  const handleConfirm = () => {
    navigate("/sales/salesservicelist", {
      state: {
        preservedFilters: sessionStorage.getItem("salesServiceFilters"),
        preservedPage: sessionStorage.getItem("salesServicePage"),
      },
    });
  };

  // ✅ 삭제 (전체환불 예외 메시지 alert 표시)
  const handleDelete = async () => {
    const confirmed = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`/v1/sales/services/${id}`);

      // ✅ 성공
      if (res.data?.success) {
        alert(`${id}번 판매 내역이 성공적으로 삭제되었습니다.`);
        navigate("/sales/salesservicelist", {
          state: {
            preservedFilters: sessionStorage.getItem("salesServiceFilters"),
            preservedPage: sessionStorage.getItem("salesServicePage"),
          },
        });
      }
      // ⚠ 실패 (예외 메시지 alert 표시)
      else {
        const msg = res.data?.message || "삭제 실패: 요청을 다시 확인해주세요.";

        if (
          msg.includes("환불 불가") ||
          msg.includes("전체 환불") ||
          msg.includes("사용") ||
          msg.includes("불가능")
        ) {
          alert(`❗ ${msg}`);
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error("삭제 실패:", err);
      alert(err.response?.data?.message || "삭제 처리 중 서버 오류가 발생했습니다.");
    }
  };

  // 5. 화면 렌더링
  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h4 className="fw-bold mb-5 text-start">
        {id}번 서비스 판매 내역 조회
      </h4>

      {/* 테이블 - Edit과 동일한 구조 */}
      <form className="border rounded-4 shadow-sm overflow-hidden">
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
                    value={form.serviceName}
                    readOnly
                    style={{ width: "100%" }}
                  />
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
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="memName"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.memName}
                  readOnly
                />
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
                  readOnly
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
                  readOnly
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
                  readOnly
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
          className="btn btn-primary px-4"
          onClick={handleEdit}
        >
          수정
        </button>
        <button
          type="button"
          className="btn btn-success px-4"
          onClick={handleConfirm}
        >
          확인
        </button>
        <button
          type="button"
          className="btn btn-danger px-4"
          onClick={handleDelete}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default SalesServiceDetail;
