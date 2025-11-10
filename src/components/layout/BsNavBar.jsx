// src/components/BsNavBar.jsx
import api from "../../api/axiosConfig";
import React, { useState } from "react";
import { Container, Navbar, Dropdown, Modal, Tabs, Tab, Form, Button, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { PersonCircle, Gear, ShieldLock } from "react-bootstrap-icons";

export default function BsNavBar() {
  const user = useSelector((s) => s.user) || JSON.parse(sessionStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);

  // 비밀번호 변경 폼
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);

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

    // 서버가 requireReLogin 플래그를 내려줌 (컨트롤러에서 세션 이미 무효화됨)
    alert(data?.message || "비밀번호가 변경되어 재로그인이 필요합니다.");

    // 클라이언트측 정리 & 로그인 화면으로 이동
    sessionStorage.removeItem("user");
    setPw({ current: "", next: "", confirm: "" });
    setOpen(false);
    window.location.replace("/login");

  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err.message;

    if (status === 401) {
      // 혹시 서버가 401로 재로그인 요구하는 경우
      alert(msg || "세션이 만료되었습니다. 다시 로그인 해주세요.");
      sessionStorage.removeItem("user");
      setPw({ current: "", next: "", confirm: "" });
      setOpen(false);
      window.location.replace("/login");
      return;
    }

    alert("기존 비밀번호가 일치하지 않습니다. ");
  } finally {
    setPwBusy(false);
  }
};


  return (
    <>
      <Navbar bg="dark" variant="dark" className="shadow-0 w-100 m-0" style={{ height: 56}}>
        <Container fluid>
          {/* <Navbar.Brand as={NavLink} to="/">GYM</Navbar.Brand> */}

          <div className="ms-auto d-flex align-items-center gap-3">
            {user && (
              <span className="text-white-50 d-none d-md-inline">
                어서오세요, <strong className="text-white">{user.empName}</strong> 님 👋
              </span>
            )}

            {/* 사용자 드롭다운 (프로필/보안 설정) */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm" className="d-flex align-items-center gap-2">
                <PersonCircle />
                <span className="d-none d-sm-inline">{user ? user.empName : "게스트"}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow">
                <Dropdown.Item onClick={() => setOpen(true)}>
                  <Gear className="me-2" /> 사용자 정보 / 설정
                </Dropdown.Item>
                {/* 필요하면 여기서 “내 페이지로 이동” 같은 라우팅 항목도 추가 가능 */}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Navbar>

      {/* 사용자 설정 모달: 탭 구성 (프로필 / 비밀번호 변경) */}
      <Modal show={open} onHide={() => setOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>내 계정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="profile" id="user-menu-tabs" className="mb-3">
            <Tab eventKey="profile" title={<span><PersonCircle className="me-1" />프로필</span>}>
                <div className="px-1">
                    <dl className="row mb-0">
                        <dt className="col-sm-3 text-muted">이름</dt>
                        <dd className="col-sm-9">{user?.empName || '-'}</dd>

                        <dt className="col-sm-3 text-muted">역할</dt>
                        <dd className="col-sm-9">{user?.role || 'EMP'}</dd>

                        <dt className="col-sm-3 text-muted">이메일</dt>
                        <dd className="col-sm-9">{user?.email || '-'}</dd>
                    </dl>
                </div>
            </Tab>

            <Tab eventKey="security" title={<span><ShieldLock className="me-1" />비밀번호 변경</span>}>
              <Form onSubmit={submitChangePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>현재 비밀번호</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    required
                  />
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>새 비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        value={pw.next}
                        onChange={(e) => setPw({ ...pw, next: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>새 비밀번호 확인</Form.Label>
                      <Form.Control
                        type="password"
                        value={pw.confirm}
                        onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end mt-3">
                  <Button variant="secondary" className="me-2" onClick={() => setOpen(false)}>닫기</Button>
                  <Button type="submit" disabled={pwBusy}>
                    {pwBusy ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </>
  );
}
