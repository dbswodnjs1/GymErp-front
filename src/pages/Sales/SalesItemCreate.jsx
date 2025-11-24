// src/pages/Sales/SalesItemCreate.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import SalesItemSearchModal from "../../components/SalesItemSearchModal";
import { FaSearch } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const fmt = (v) =>
  (v ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function SalesItemCreate() {
  const navigate = useNavigate();
  const loggedInUser = useSelector(state => state.user);
  const [form, setForm] = useState({
    productId: "",
    productName: "",
    productType: "",
    quantity: 1,
    unitPrice: 0,
    baseAmount: 0,
    discount: 0,
    actualAmount: 0,
    status: "ACTIVE",
    empNum: loggedInUser?.empNum || null, // 로그인한 사용자의 empNum 사용
    memNum: null,
  });

  // Form 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 제출 막기

    // 유효성 검사
    if (!form.productId) {
      alert("상품을 선택해주세요.");
      return;
    }
    if (form.quantity <= 0) {
      alert("수량은 1 이상이어야 합니다.");
      return;
    }

    // API에 보낼 최소 데이터
    console.log("Debug: loggedInUser object:", loggedInUser); // 디버깅 로그 추가
    const salesItemData = {
      productId: form.productId,
      quantity: form.quantity,
      empNum: loggedInUser?.empNum, // form 상태 대신, 현재 로그인된 사용자 정보 직접 사용
      memNum: form.memNum,
    };

    try {
      // ✅ 엔드포인트 확인: /v1/sales/products
      await axios.post("/v1/sales/products", salesItemData);

      alert("판매 내역이 성공적으로 등록되었습니다.");
      navigate("/sales/salesitemlist"); // 등록 후 목록으로 이동
    } catch (error) {
      console.error("판매 내역 등록 실패:", error);
      const errorMessage =
        error.response?.data?.message || "판매 내역 등록 중 오류가 발생했습니다.";
      alert(errorMessage);
    }
  };


  // ... (기존 수량 변경 핸들러 등)


  // ✅ MemberList 처럼 show/onClose로 제어
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // 모달 오픈/클로즈
  const openProductModal = () => setIsProductModalOpen(true);
  const closeProductModal = () => setIsProductModalOpen(false);



  // 모달에서 “선택” 눌렀을 때 부모 폼 반영
  const handleSelectProduct = (p) => {
    const unit = Number(p.price ?? 0);
    const qty = Math.max(1, Number(form.quantity || 1));
    const base = unit * qty;
    setForm((prev) => ({
      ...prev,
      productId: p.productId,
      productName: p.name,
      productType: p.codeBId,
      unitPrice: unit,
      quantity: qty,
      baseAmount: base,
      discount: 0,
      actualAmount: base,
    }));
    closeProductModal();
  };

  // 수량 변경 시 금액 재계산
  const handleQuantityChange = (e) => {
    const qty = Math.max(1, Number(e.target.value || 1));
    const base = form.unitPrice * qty;
    setForm((prev) => ({
      ...prev,
      quantity: qty,
      baseAmount: base,
      actualAmount: Math.max(0, base - (prev.discount || 0)),
    }));
  };

  return (
    <div
      className="d-flex justify-content-center align-items-start"
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8f9fa",
        overflowX: "hidden",
        paddingTop: "60px",
      }}
    >
      <div
        style={{
          width: "1200px",
          zoom: "1.15",
          transformOrigin: "top center",
          overflow: "visible",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "900px",
            overflow: "visible",
          }}
        >
          <h4 className="fw-bold mb-5 text-center">상품 판매 등록</h4>

          <form
            onSubmit={handleSubmit}
            className="border rounded-4 shadow-sm overflow-hidden mt-4 bg-white"
            style={{
              overflow: "visible",
            }}
          >
            <table
              className="table table-striped m-0 align-middle text-center"
              style={{
                overflow: "visible",
              }}
            >
              <tbody>
                <tr>
                  <th className="bg-dark text-white text-center align-middle" style={{ width: "30%" }}>
                    상품명
                  </th>
                  <td className="bg-light align-middle position-relative">
                    <div className="d-flex justify-content-center" style={{ width: 340, margin: "0 auto" }}>
                      <input
                        type="text"
                        className="form-control text-center"
                        placeholder="상품 선택"
                        value={form.productName}
                        readOnly
                        onClick={openProductModal}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary position-absolute"
                        style={{ right: "calc(50% - 170px - 45px)", height: 38 }}
                        onClick={openProductModal}
                      >
                        <FaSearch />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className="bg-dark text-white text-center align-middle">구분</th>
                  <td className="bg-light align-middle">
                    <input className="form-control text-center mx-auto" style={{ width: 340 }} value={form.productType} readOnly />
                  </td>
                </tr>

                <tr>
                  <th className="bg-dark text-white text-center align-middle">판매 수량</th>
                  <td className="bg-light align-middle">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="form-control text-center mx-auto"
                      style={{ width: 340 }}
                      value={form.quantity}
                      onChange={handleQuantityChange}
                    />
                  </td>
                </tr>

                <tr>
                  <th className="bg-dark text-white text-center align-middle">단가 (원)</th>
                  <td className="bg-light align-middle">
                    <input className="form-control text-center mx-auto" style={{ width: 340 }} value={fmt(form.unitPrice)} readOnly />
                  </td>
                </tr>

                <tr>
                  <th className="bg-dark text-white text-center align-middle">총액 (원)</th>
                  <td className="bg-light align-middle">
                    <input className="form-control text-center mx-auto" style={{ width: 340 }} value={fmt(form.actualAmount)} readOnly />
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

          <SalesItemSearchModal
            show={isProductModalOpen}
            onHide={closeProductModal}
            onSelect={handleSelectProduct}
          />
        </div>
      </div>
    </div>
  );
}

export default SalesItemCreate;
