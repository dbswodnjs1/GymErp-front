// src/components/BsSideBar.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";               // ✅ Navbar와 동일 axios 인스턴스
import {
  Modal, Tabs, Tab, Form, Button
} from "react-bootstrap";                               // ✅ Navbar에서 쓰던 모달 그대로 사용

function DropdownMenu({ icon, title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li className="nav-item">
      <button
        className="nav-link text-white fs-6 w-100 text-start border-0"
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: "transparent" }}
      >
        <i className={`bi bi-${icon}`} />
        <span className="ms-2">{title}</span>
        <i className={`bi bi-chevron-${isOpen ? "down" : "right"} float-end`} />
      </button>
      <div className={`collapse ${isOpen ? "show" : ""}`}>
        <ul className="nav flex-column ms-3">{children}</ul>
      </div>
    </li>
  );
}

function SubMenuItem({ to, icon, text }) {
  return (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `nav-link text-white fs-6 py-2 ${isActive ? "active" : ""}`
        }
      >
        <i className={`bi bi-${icon}`} />
        <span className="ms-2">{text}</span>
      </NavLink>
    </li>
  );
}

export default function BsSideBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Navbar와 동일: Redux → sessionStorage 순으로 사용자 로딩
  const storeUser = useSelector((s) => s.user);
  const user = storeUser || JSON.parse(sessionStorage.getItem("user") || "null");

  // ✅ Navbar의 모달/탭/폼 상태 그대로
  const [open, setOpen] = useState(false);                   // 사용자 정보/변경 모달
  const [tabKey, setTabKey] = useState("profile");           // "profile" | "password"

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);

  // ✅ 로그아웃 (Navbar와 동일 흐름)
  const handleLogout = async () => {
    try {
      await api.post("/v1/emp/logout");
    } catch (e) {
      // ignore
    } finally {
      dispatch({ type: "USER_LOGOUT" });
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  // ✅ 비밀번호 변경 (Navbar 엔드포인트·처리 그대로)
  const submitChangePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      alert("새 비밀번호와 확인이 일치하지 않습니다.");
      return;
    }
    try {
      setPwBusy(true);
      const { data } = await api.post("/v1/emp/change-password", {
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      alert(data?.message || "비밀번호가 변경되었습니다. 다시 로그인 해주세요.");

      // 성공 시 세션 정리 & 로그인 페이지로
      sessionStorage.removeItem("user");
      setPw({ current: "", next: "", confirm: "" });
      setOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message;
      if (status === 401) {
        alert(msg || "세션이 만료되었습니다. 다시 로그인 해주세요.");
        sessionStorage.removeItem("user");
        setOpen(false);
        navigate("/login", { replace: true });
      } else {
        alert("기존 비밀번호가 일치하지 않습니다.");
      }
    } finally {
      setPwBusy(false);
    }
  };

  // ✅ Navbar의 “사용자 정보/변경” 트리거를 사이드바 하단으로 이동
  return (
    <div className="bg-dark text-white d-flex flex-column" style={{ height: "100%", overflow: "hidden" }}>
      {/* 브랜드 */}
      <div className="px-3 border-bottom border-secondary d-flex align-items-center" style={{ height: 56 }}>
        <NavLink to="/" className="text-decoration-none text-white d-flex align-items-center">
          <span className="fs-4 fw-bold">Gym</span>
        </NavLink>
      </div>

      {/* 메뉴 스크롤 영역 */}
      <div className="p-3 flex-grow-1 overflow-auto">
        <ul className="nav nav-pills flex-column gap-2">
          <DropdownMenu icon="person-badge" title="직원">
            <SubMenuItem to="/emp" icon="table" text="직원목록" />
            <SubMenuItem to="/schedule" icon="calendar-event" text="일정관리" />
            <SubMenuItem to="/attendance/my" icon="clock-history" text="출퇴근관리" />
          </DropdownMenu>

          <DropdownMenu icon="people-fill" title="회원">
            <SubMenuItem to="/member" icon="table" text="회원목록" />
          </DropdownMenu>
  
          {/* 판매 */}
          <DropdownMenu icon="graph-up" title="판매">
            <SubMenuItem to="/sales/salesitemlist" icon="receipt" text="상품 판매내역" />
            <SubMenuItem to="/sales/salesitemcreate" icon="cart" text="상품 판매등록" />
            <SubMenuItem to="/sales/salesservicelist" icon="receipt" text="서비스 판매내역" />
            <SubMenuItem to="/sales/salesservicecreate" icon="cart" text="서비스 판매등록" />
          </DropdownMenu>

          <DropdownMenu icon="box-seam" title="상품관리">
            <SubMenuItem to="/product" icon="box-seam" text="상품목록" />
            <SubMenuItem to="/stock"  icon="boxes"    text="재고현황" />
          </DropdownMenu>

          <DropdownMenu icon="chat-dots" title="게시판">
            <SubMenuItem to="/post" icon="list-ul" text="게시글 목록" />
          </DropdownMenu>
        </ul>
      </div>

      {/* 하단 고정: 사용자 영역 + 로그아웃 (Navbar의 트리거를 버튼으로) */}
      <div className="border-top border-secondary p-2" style={{ position: "sticky", bottom: 0, background: "#212529" }}>
        <button
          className="btn btn-dark w-100 d-flex align-items-center px-2 py-2"
          onClick={() => { setTabKey("profile"); setOpen(true); }}   // ✅ Navbar처럼 모달 오픈
          style={{ background: "#2a2f34" }}
        >
          <i className="bi bi-person-circle fs-5 me-2" />
          <div className="text-start flex-grow-1">
            <div className="fw-semibold">{user?.empName || "게스트"}</div>
          </div>
          <i className="bi bi-gear ms-2" />
        </button>

        <div className="pt-2 d-grid">
          <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1" />
            로그아웃
          </button>
        </div>
      </div>

      {/* ✅ Navbar 모달 그대로: 사용자 정보 / 비밀번호 변경 */}
      <Modal show={open} onHide={() => setOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>사용자 정보/변경</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs activeKey={tabKey} onSelect={(k) => setTabKey(k || "profile")} justify>
            {/* 사용자 정보 탭 (Navbar와 동일 정보 표시) */}
            <Tab eventKey="profile" title="사용자 정보">
              <div className="mt-3">
                <div className="mb-2"><strong>이름</strong><br />{user?.empName || "-"}</div>
                <div className="mb-2"><strong>이메일</strong><br />{user?.empEmail || user?.email || "-"}</div>
                <div className="mb-2"><strong>직급/권한</strong><br />{user?.role || user?.auth || "-"}</div>
                {/* 필요 시 추가 필드들 그대로 노출 */}
              </div>
            </Tab>

            {/* 비밀번호 변경 탭 */}
            <Tab eventKey="password" title="비밀번호 변경">
              <Form className="mt-3" onSubmit={submitChangePassword}>
                <Form.Group className="mb-2" controlId="curPw">
                  <Form.Label>현재 비밀번호</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                </Form.Group>

                <div className="row g-2">
                  <div className="col-6">
                    <Form.Group controlId="newPw">
                      <Form.Label>새 비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        value={pw.next}
                        onChange={(e) => setPw({ ...pw, next: e.target.value })}
                        autoComplete="new-password"
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group controlId="newPw2">
                      <Form.Label>새 비밀번호 확인</Form.Label>
                      <Form.Control
                        type="password"
                        value={pw.confirm}
                        onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                        autoComplete="new-password"
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <Button variant="secondary" className="me-2" onClick={() => setOpen(false)}>
                    닫기
                  </Button>
                  <Button type="submit" disabled={pwBusy}>
                    {pwBusy ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </div>
  );
}
