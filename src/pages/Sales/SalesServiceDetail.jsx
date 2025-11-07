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
    empName: "", // ✅ 추가
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

  // ✅ 숫자 포맷 함수
  const formatNumber = (value) =>
    value === null || value === ""
      ? ""
      : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ✅ 데이터 로딩
  useEffect(() => {
    if (!id) return; // id가 없으면 axios 호출 방지

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

        //  회원 이름 조회
        let memName = "";
        if (data.memNum) {
          try {
            const memberRes = await axios.get(`/v1/member/${data.memNum}`);
            memName = memberRes.data.memName || "";
          } catch {
            memName = "(탈퇴 회원)";
          }
        }

        //  직원 이름 조회
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
        console.error("❌ 데이터 조회 실패:", err);
        setError("데이터 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  //  로딩 중일 때
  if (loading) {
    return (
      <div className="text-center mt-5">
        <h5>데이터를 불러오는 중입니다...</h5>
      </div>
    );
  }

  //  에러 발생 시
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

  /* ===============================
       [버튼 이벤트]
     =============================== */

  const handleEdit = () => navigate(`/sales/salesserviceedit/${id}`);
  const handleConfirm = () => {
    navigate("/sales/salesservicelist", {
      state: {
        preservedFilters: sessionStorage.getItem("salesServiceFilters"),
        preservedPage: sessionStorage.getItem("salesServicePage"),
      },
    });
  };
  const handleDelete = async () => {
    const confirmed = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`/v1/sales/services/${id}`);

      if (res.status === 200 && res.data?.result > 0) {
        alert(`${id}번 판매 내역이 성공적으로 삭제되었습니다.`);
        navigate("/sales/salesservicelist", {
          state: {
            preservedFilters: sessionStorage.getItem("salesServiceFilters"),
            preservedPage: sessionStorage.getItem("salesServicePage"),
          },
        });
      } else {
        alert("삭제 요청은 완료되었지만, 서버에서 삭제되지 않았습니다.");
      }
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  /* ===============================
       [화면 렌더링]
     =============================== */
  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h4 className="fw-bold mb-5 text-start">
        {id}번 서비스 판매 내역 조회
      </h4>

      <form className="border rounded-4 shadow-sm overflow-hidden">
        <table className="table table-striped m-0 align-middle text-center">
          <tbody>
            {[
              ["상품명", "serviceName"],
              ["구분", "serviceType"],
              ["회원명", "memName"],
              ["판매자명", "empName"], // ✅ 직원명으로 변경
              ["횟수/일수", "baseCount"],
              ["실제 횟수/일수", "actualCount"],
              ["총액", "baseAmount"],
              ["할인금액", "discount"],
              ["최종금액", "actualAmount"],
            ].map(([label, key]) => (
              <tr key={key}>
                <th
                  className="bg-dark text-white text-center align-middle"
                  style={{ width: "30%" }}
                >
                  {label}
                </th>
                <td className="bg-light align-middle">
                  <input
                    type="text"
                    className="form-control text-center mx-auto"
                    style={{ width: "340px" }}
                    value={
                      ["baseAmount", "discount", "actualAmount"].includes(key)
                        ? formatNumber(form[key])
                        : form[key] ?? ""
                    }
                    readOnly
                  />
                </td>
              </tr>
            ))}

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
