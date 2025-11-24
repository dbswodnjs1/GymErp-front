// 📄 PostAdd.jsx — React-Bootstrap Overhaul (2-Column, Light, Flash Message)
// 필요: react-bootstrap, bootstrap, react-icons, axios
// index/main에 'import "bootstrap/dist/css/bootstrap.min.css";' 포함.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Row, Col, Card, Form, Button, Badge,
  InputGroup, OverlayTrigger, Tooltip, ButtonGroup, Spinner, ProgressBar, Modal
} from "react-bootstrap";
import { FaThumbtack, FaSave, FaTimes, FaEye, FaEdit, FaInfoCircle } from "react-icons/fa";

/* === KST 포맷터 & 헬퍼 (추가) === */
const _kstFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
function formatKST(dateLike = Date.now()) {
  return _kstFormatter.format(new Date(dateLike));
}

export default function PostAdd() {
  const nav = useNavigate();

  const loginUser = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  const [form, setForm] = useState({ title: "", content: "", pinned: "N" });
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // ✅ 성공 모달 상태
  const [success, setSuccess] = useState({
    show: false,
    msg: "",
    nextPath: null,
  });

  const titleLen = form.title.trim().length;
  const contentLen = form.content.trim().length;
  const titleMax = 120;
  const contentSoftMax = 5000;

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));
  };

  const submit = async () => {
    const title = form.title.trim();
    const content = form.content.trim();

    if (!title) return toast("제목을 입력하세요.", "danger");
    if (!content) return toast("내용을 입력하세요.", "danger");
    if (!loginUser?.empName) return toast("로그인 정보가 없습니다.", "danger");

    const payload = {
      postTitle: title,
      postContent: content,
      postPinned: form.pinned,
      postWriter: loginUser.empName,
    };

    try {
      setSubmitting(true);
      const res = await axios.post("/v1/post", payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newId = res.data?.postId ?? res.data ?? null;

      // ✅ 세션/타이머 없이: 성공 모달 띄우고, 사용자 확인 시 이동
      setSuccess({
        show: true,
        msg: "게시글이 등록되었습니다.",
        nextPath: newId ? `/post/${newId}` : "/post",
      });
    } catch (err) {
      console.error(err);
      toast("등록 실패", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const closeSuccess = () => setSuccess((s) => ({ ...s, show: false }));
  const goNext = () => {
    const path = success.nextPath || "/post";
    setSuccess((s) => ({ ...s, show: false }));
    nav(path);
  };

  return (
    <div style={pageBg}>
      <Container fluid="xl" className="py-4">
        {/* 헤더 */}
        <Card className="shadow-sm border-0 mb-4" style={cardHeaderLight}>
          <Card.Body className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <div className="text-uppercase small fw-bold" style={{ color: "#64748b", letterSpacing: "0.06em" }}>
                게시판
              </div>
              {/* 🔧 겹침 방지: letterSpacing 0, lineHeight 보정, 한글 줄바꿈 유지 */}
              <h3
                className="m-0 fw-bold"
                style={{
                  letterSpacing: 0,           // 음수 자간 금지
                  lineHeight: "calc(1em + 8px)", // 픽셀 기반로 여유 확보 (1em + 8px)
                  wordBreak: "keep-all",      // 한글 단어 단위 줄바꿈
                  marginTop: 2                // 위쪽 살짝 띄우기
                }}
              >
                게시글 등록
              </h3>
            </div>

            <div className="ms-auto d-flex align-items-center gap-3">
              <Badge bg="secondary" pill className="py-2 px-3">
                작성자&nbsp; <strong>{loginUser?.empName || "관리자"}</strong>
              </Badge>

              <ButtonGroup>
                <OverlayTrigger overlay={<Tooltip>미리보기 토글</Tooltip>}>
                  <Button
                    variant={showPreview ? "outline-primary" : "outline-secondary"}
                    onClick={() => setShowPreview(v => !v)}
                  >
                    <FaEye className="me-2" />미리보기
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip>작성 가이드</Tooltip>}>
                  <Button variant="outline-secondary" onClick={() => toast("제목/본문을 명확히 입력하세요.", "info")}>
                    <FaInfoCircle />
                  </Button>
                </OverlayTrigger>
              </ButtonGroup>

              <Button
                variant="primary"
                className="px-4 d-flex align-items-center gap-2"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? <Spinner size="sm" animation="border" /> : <FaSave />}
                {submitting ? "등록 중..." : "등록"}
              </Button>
              <Button variant="outline-secondary" className="px-4" onClick={() => nav(-1)} disabled={submitting}>
                <FaTimes className="me-2" />취소
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* 본문 2열 */}
        <Row className="g-4">
          {/* 좌: 입력 */}
          <Col xs={12} lg={8}>
            <Card className="shadow-sm border-0" style={cardBodyLight}>
              <Card.Body className="d-grid gap-4">
                {/* 제목 */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <Form.Label className="mb-0 fw-semibold">제목</Form.Label>
                    <small className={titleLen > titleMax ? "text-danger" : "text-muted"}>
                      {titleLen}/{titleMax}
                    </small>
                  </div>
                  <InputGroup>
                    <InputGroup.Text style={chipLeft}><FaEdit /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={change}
                      placeholder=""     // ✅ 비워둠
                      maxLength={300}
                      style={inputStrong}
                      aria-invalid={titleLen === 0 || titleLen > titleMax}
                    />
                  </InputGroup>
                </div>

                {/* 내용 */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <Form.Label className="mb-0 fw-semibold">내용</Form.Label>
                    <small className={contentLen > contentSoftMax ? "text-danger" : "text-muted"}>
                      {contentLen.toLocaleString()}자
                    </small>
                  </div>
                  <Form.Control
                    as="textarea"
                    name="content"
                    value={form.content}
                    onChange={change}
                    rows={14}
                    placeholder=""     // ✅ 비워둠
                    style={textarea}
                  />
                </div>

                {/* 미리보기 */}
                {showPreview && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-semibold">미리보기</div>
                      <Badge bg="light" text="dark">
                        {form.pinned === "Y" ? "📌 고정됨" : "일반"}
                      </Badge>
                    </div>
                    <div style={previewBox}>
                      <h5 className="mb-2" style={{ wordBreak: "break-word" }}>
                        {form.title || <span className="text-muted">제목 미입력</span>}
                      </h5>
                      <div className="small text-muted mb-3">
                        작성자: {loginUser?.empName || "관리자"} · {formatKST()}
                      </div>
                      <pre style={previewPre}>
{form.content || "내용 미입력"}
                      </pre>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* 우: 옵션 */}
          <Col xs={12} lg={4}>
            <Card className="shadow-sm border-0" style={cardBodyLight}>
              <Card.Header as="h6" className="bg-white fw-bold">게시 옵션</Card.Header>
              <Card.Body className="d-grid gap-3">
                <Form.Check
                  type="switch"
                  id="pinCheck"
                  name="pinned"
                  checked={form.pinned === "Y"}
                  onChange={change}
                  label={<span className="d-inline-flex align-items-center gap-2"><FaThumbtack/> 상단 고정</span>}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ✅ 성공 모달 */}
      <Modal
        show={success.show}
        onHide={closeSuccess}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>알림</Modal.Title>
        </Modal.Header>
        <Modal.Body className="fw-semibold">
          {success.msg}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={goNext}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 기존 토스트 호스트(유지) */}
      <div id="_toast_host" style={toastHost} />
    </div>
  );
}

/* === Styles === */
const pageBg = { background: "#f8fafc", minHeight: "100vh" };
const cardHeaderLight = { background: "#ffffff", border: "1px solid #eef2f7" };
const cardBodyLight = { background: "#ffffff", border: "1px solid #eef2f7" };
const chipLeft = { background: "#eef2ff", borderColor: "#e0e7ff", color: "#4f46e5", fontWeight: 700 };
const chipRight = { background: "#f1f5f9", borderColor: "#e2e8f0", color: "#334155", fontWeight: 700 };
// 🔧 입력창 자간 겹침 방지: letterSpacing 0
const inputStrong = { fontWeight: 700, letterSpacing: 0, borderColor: "#dfe3ea" };
const textarea = { minHeight: 280, borderColor: "#dfe3ea", fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" };
const previewBox = { border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", padding: 16 };
const previewPre = { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.75, fontSize: 15 };
const toastHost = { position: "fixed", top: 16, right: 16, zIndex: 1080 };

/* === Tiny Toast === */
function toast(message, type = "primary") {
  const host = document.getElementById("_toast_host");
  if (!host) return alert(message);
  const el = document.createElement("div");
  el.className = "shadow-sm";
  el.style.cssText =
    "margin-top:8px;padding:10px 14px;border-radius:12px;font-weight:700;background:#111;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.2)";
  if (type === "success") el.style.background = "#16a34a";
  if (type === "danger") el.style.background = "#dc2626";
  if (type === "info") el.style.background = "#2563eb";
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .25s ease, transform .25s ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";
    setTimeout(() => el.remove(), 250);
  }, 1800);
}
