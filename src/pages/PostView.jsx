// 📄 PostView.jsx — Confirm Modal + Success Modal on Delete (KST fixed)
import { useEffect, useState, useMemo } from "react"; // [ADD] useMemo 추가
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Container, Card, Button, Badge, Row, Col, Spinner, ButtonGroup, Modal
} from "react-bootstrap";
import { FaThumbtack, FaEdit, FaTrashAlt, FaArrowLeft } from "react-icons/fa";

export default function PostView() {
  const { postId } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const [dto, setDto] = useState(null);
  const [loading, setLoading] = useState(false);

  // 삭제 확인 모달
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 삭제 성공 모달
  const [success, setSuccess] = useState({ show: false, msg: "" });

  // [ADD] 로그인 사용자 (세션에서)
  const loginUser = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  // [ADD] 소유자/관리자만 수정·삭제 가능
  const canEdit = !!dto && (
    (loginUser?.empName && dto?.postWriter && loginUser.empName === dto.postWriter) ||
    loginUser?.role === "ADMIN"
  );

  // flash 메시지 1회성 소비
  useEffect(() => {
    const f = location.state?.flash;
    if (f?.msg) {
      setSuccess({ show: true, msg: f.msg });
      nav(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, nav]);

  // 상세 조회
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
    // [ADD] 프론트 가드
    if (!canEdit) {
      window.alert("본인 글만 삭제할 수 있습니다.");
      return;
    }
    try {
      setDeleting(true);
      await axios.delete(`http://localhost:9000/v1/post/${postId}`);
      setSuccess({ show: true, msg: "삭제되었습니다." });
    } catch (e) {
      console.error(e);
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
                게시판
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

                {/* [ADD] 소유자/관리자에게만 버튼 노출 */}
                {canEdit && (
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
                )}
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
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered backdrop="static">
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

      {/* 삭제 성공 모달 */}
      <Modal show={success.show} onHide={() => setSuccess({ show: false, msg: "" })} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>알림</Modal.Title>
        </Modal.Header>
        <Modal.Body className="fw-semibold">{success.msg}</Modal.Body>
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
    const date = new Date(d);
    // ✅ UTC 기준에서 한국시간(+9h)으로 변환
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, "0");
    return `${kst.getFullYear()}.${pad(kst.getMonth() + 1)}.${pad(kst.getDate())}. ${pad(kst.getHours())}:${pad(kst.getMinutes())}`;
  } catch {
    return String(d);
  }
}

/* ✅ 가독성 강화된 본문 스타일 */
const contentBox = {
  background: "#f3f4f6",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 18,
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

const contentPre = {
  margin: 0,
  color: "#111827",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.9,
  fontSize: 16,
};
