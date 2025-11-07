// 📄 PostView.jsx — Confirm Modal + Success Modal on Delete (no sessionStorage)
// - 입장시 재등장 방지: sessionStorage 사용 제거
// - (옵션) 다른 화면에서 state로 온 flash는 '한 번만' 소비 후 즉시 비움
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Container, Card, Button, Badge, Row, Col, Spinner, ButtonGroup,
  Modal
} from "react-bootstrap";
import { FaThumbtack, FaEdit, FaTrashAlt, FaArrowLeft } from "react-icons/fa";

export default function PostView() {
  const { postId } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const [dto, setDto] = useState(null);
  const [loading, setLoading] = useState(false);

  // 삭제 확인 모달/상태
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ 삭제 성공 모달
  const [success, setSuccess] = useState({
    show: false,
    msg: "",
  });

  // ✅ (옵션) 라우트 state로 넘어온 flash가 있으면 '한 번만' 보여주고 즉시 비움
  //  — 이제 토스트 대신 성공 모달로 보여줌
  useEffect(() => {
    const f = location.state?.flash;
    if (f?.msg) {
      setSuccess({ show: true, msg: f.msg });
      nav(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, nav]);

  // 상세 로드 (조회수 증가 inc=true)
  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    axios
      .get(`http://localhost:9000/v1/post/${postId}`, { params: { inc: true } })
      .then((res) => setDto(res.data))
      .catch(() => window.alert("상세 조회 실패"))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`http://localhost:9000/v1/post/${postId}`);

      // ✅ 이 화면에서 성공 모달로 알림
      setSuccess({ show: true, msg: "삭제되었습니다." });
    } catch (e) {
      console.error(e);
      // 실패는 간단히 alert (원하면 별도 오류 모달로 교체 가능)
      window.alert("삭제 실패");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const goList = () => {
    setSuccess({ show: false, msg: "" });
    nav("/post");
  };

  if (!postId) return <div className="container py-4">잘못된 접근입니다.</div>;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Container fluid="lg" className="py-4">
        <Card className="shadow-sm border-0 overflow-hidden" style={{ background: "#fff", border: "1px solid #eef2f7" }}>
          {/* 헤더 */}
          <Card.Header className="bg-white">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Button
                as={Link}
                to="/post"
                variant="outline-secondary"
                size="sm"
                className="d-inline-flex align-items-center gap-2"
              >
                <FaArrowLeft /> 목록
              </Button>

              <div className="ms-1 text-uppercase small fw-bold" style={{ color: "#64748b", letterSpacing: "0.06em" }}>
                Board
              </div>

              <div className="ms-auto d-flex align-items-center gap-2">
                {dto?.postPinned === "Y" && (
                  <Badge bg="warning" text="dark" className="px-3 py-2">
                    <FaThumbtack className="me-1" /> 고정됨
                  </Badge>
                )}
                <Badge bg="light" text="dark" className="px-3 py-2">
                  조회 <strong>{Number(dto?.postViewCnt ?? 0).toLocaleString()}</strong>
                </Badge>

                <ButtonGroup>
                  <Button
                    variant="primary"
                    className="px-3 d-inline-flex align-items-center gap-2"
                    onClick={() => nav(`/post/edit/${postId}`)}
                    disabled={loading || !dto}
                  >
                    <FaEdit /> 수정
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="px-3 d-inline-flex align-items-center gap-2"
                    onClick={() => setShowConfirm(true)}
                    disabled={loading || !dto}
                  >
                    <FaTrashAlt /> 삭제
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Card.Header>

          {/* 본문 */}
          <Card.Body>
            {loading || !dto ? (
              <div className="py-5 text-center text-muted">
                <Spinner animation="border" size="sm" className="me-2" />
                로딩중...
              </div>
            ) : (
              <Row className="g-4">
                <Col xs={12}>
                  <h3 className="m-0 fw-bold" style={{ letterSpacing: "-0.2px", wordBreak: "break-word" }}>
                    {dto.postTitle || "(제목 없음)"}
                  </h3>
                </Col>

                <Col xs={12} className="text-muted small d-flex flex-wrap gap-3">
                  <span>작성자: <strong className="text-dark">{dto.postWriter}</strong></span>
                  <span>작성일: {fmt(dto.postCreatedAt)}</span>
                  {dto.postUpdatedAt && <span>수정일: {fmt(dto.postUpdatedAt)}</span>}
                </Col>

                <Col xs={12}>
                  <div style={contentBox}>
                    <pre style={contentPre}>{dto.postContent}</pre>
                  </div>
                </Col>
              </Row>
            )}
          </Card.Body>

          {/* 푸터 */}
          <Card.Footer className="bg-white text-end">
            <Button as={Link} to="/post" variant="outline-secondary" className="px-3">
              목록으로
            </Button>
          </Card.Footer>
        </Card>
      </Container>

      {/* 삭제 확인 모달 */}
      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">삭제 확인</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            <div>이 게시글을 삭제하시겠습니까?</div>
            <small className="text-muted">삭제하면 되돌릴 수 없습니다.</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={deleting}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            삭제
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ 삭제 성공 모달 */}
      <Modal
        show={success.show}
        onHide={() => setSuccess({ show: false, msg: "" })}
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
          <Button variant="primary" onClick={goList}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/* ===== 유틸/스타일 ===== */
function fmt(d) {
  if (!d) return "-";
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));
  } catch {
    return String(d);
  }
}

const contentBox = { border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", padding: 18 };
const contentPre = { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.8, fontSize: 15 };
