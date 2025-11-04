import React, { useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

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
    empNum: 1,
    status: "ACTIVE",
  });

  const formatNumber = (value) =>
    value === null || value === "" ? "" : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const parseNumber = (value) => Number(value.replace(/[^0-9]/g, "")) || 0;

  const handleSelectService = () => {
    const selected = {
      serviceId: 3,
      serviceName: "PT 10회권",
      serviceValue: 10,
      price: 500000,
      codeBId: "PT",
    };
    setForm({
      ...form,
      serviceId: selected.serviceId,
      serviceName: selected.serviceName,
      serviceType: selected.codeBId === "PT" ? "PT" : "VOUCHER",
      baseCount: selected.serviceValue,
      actualCount: selected.serviceValue,
      baseAmount: selected.price,
      actualAmount: selected.price,
      discount: 0,
    });
  };

  const handleSelectMember = () => {
    const selected = { memNum: 101 };
    setForm((prev) => ({ ...prev, memNum: selected.memNum }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/sales/services", { ...form, status: "ACTIVE" });
      alert(res.data.message || "판매 등록 완료!");
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h4 className="fw-bold mb-5 text-start">서비스 판매 등록</h4>

      <form onSubmit={handleSubmit} className="border rounded-4 shadow-sm overflow-hidden mt-4">
        <table className="table table-striped m-0 align-middle text-center">
          <tbody>
            {/* [1] 상품명 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle" style={{ width: "30%" }}>
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
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary position-absolute"
                    style={{
                      right: "calc(50% - 170px - 45px)",
                      height: "38px",
                    }}
                    onClick={handleSelectService}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* [2] 구분 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">구분</th>
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
              <th className="bg-dark text-white text-center align-middle">회원</th>
              <td className="bg-light align-middle position-relative">
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "340px", margin: "0 auto" }}
                >
                  <input
                    type="text"
                    name="memNum"
                    className="form-control text-center"
                    placeholder="회원 선택"
                    value={form.memNum}
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
                    onClick={handleSelectMember}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* [4] 횟수/일수 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">횟수/일수</th>
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
              <th className="bg-dark text-white text-center align-middle">실제 횟수/일수</th>
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
              <th className="bg-dark text-white text-center align-middle">금액</th>
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
              <th className="bg-dark text-white text-center align-middle">할인금액</th>
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
              <th className="bg-dark text-white text-center align-middle">총액</th>
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
          <button type="submit" className="btn btn-success px-5">
            등록
          </button>
        </div>
      </form>
    </div>
  );
}

export default SalesServiceCreate;
