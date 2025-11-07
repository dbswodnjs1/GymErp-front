// src/pages/Sales/SalesItemDetail.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Form, InputGroup, Button, Alert, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import SalesItemSearchModal from "../../components/SalesItemSearchModal";

const API_BASE = "http://localhost:9000";
const DETAIL_API  = (id) => `${API_BASE}/v1/sales/products/${id}`;
const UPDATE_API  = (id) => `${API_BASE}/v1/sales/products/${id}`;
const DELETE_API  = (id) => `${API_BASE}/v1/sales/products/${id}`;

export default function SalesItemDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();

  const stateId = location.state?.itemId;
  const queryId = searchParams.get("id");
  const itemId  = stateId ?? paramId ?? queryId ?? null;

  const [mode, setMode] = useState("view"); 
  const readOnly = mode === "view";

  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const [form, setForm] = useState({
    itemSalesId: "",
    productId: null,
    productName: "",
    productType: "",
    empNum: "",          // 저장/수정용 사번
    empEmail: "",        // 화면표시용(판매자 이메일)
    quantity: 1,
    unitPrice: 0,
    createdAt: "",       // yyyy-MM-dd (표시용)
    updatedAt: "",       // yyyy-MM-dd (표시용)
  });

  // 처음 조회값 스냅샷 (수정취소 복원용)
  const initialFormRef = useRef(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const totalAmount = useMemo(() => {
    const q = Number(form.quantity || 0);
    const u = Number(form.unitPrice || 0);
    return q * u;
  }, [form.quantity, form.unitPrice]);

  const numFmt = (v) => Number(v || 0).toLocaleString();

  const toDateInput = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 인풋 자체 배경색: 수정 가능 → 흰색, 그 외 → 연회색
  const ctrlStyle = (editable) =>
    editable && !readOnly ? { backgroundColor: "#ffffff" } : { backgroundColor: "#f1f3f5" };

  // 상세 재조회 헬퍼 (저장 직후 updatedAt 반영용)
  const fetchDetail = async (id, { snapshotIfEmpty = false } = {}) => {
    const { data } = await axios.get(DETAIL_API(id));
    const next = {
      itemSalesId: data.itemSalesId,
      productId: data.productId,
      productName: data.productName,
      productType: data.productType,
      empNum: data.empNum ?? "",
      empEmail: data.empEmail ?? "",
      quantity: data.quantity ?? 1,
      unitPrice: data.unitPrice ?? 0,
      createdAt: toDateInput(data.createdAt),
      updatedAt: toDateInput(data.updatedAt ?? data.modifiedAt),
    };
    setForm(next);
    if (snapshotIfEmpty && !initialFormRef.current) {
      initialFormRef.current = JSON.parse(JSON.stringify(next));
    }
  };

  // itemId가 바뀌면 스냅샷 초기화
  useEffect(() => {
    initialFormRef.current = null;
  }, [itemId]);

  // 상세 조회
  useEffect(() => {
    if (!itemId) {
      setErr("상세를 표시할 항목 ID가 없습니다.");
      return;
    }
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await fetchDetail(itemId, { snapshotIfEmpty: true });
      } catch (e) {
        console.error("상세 조회 실패:", e);
        setErr(
          e?.response?.data?.message ||
            `상세 조회에 실패했습니다. (Error: ${e.response?.status || e.message})`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [itemId]); 

  // 저장: **상품명 / 판매 수량만** 변경 (나머지는 서버 관리)
  const handleSave = async () => {
    if (readOnly) return;
    if (!form.productId || !form.productName) return setErr("상품을 선택하세요.");
    if (form.quantity < 0) return setErr("수량은 0 이상이어야 합니다.");

    setSaving(true);
    setErr("");
    try {
      const idForSave = form.itemSalesId || itemId;

      const payload = {
        itemSalesId: idForSave,
        productId: form.productId,
        productName: form.productName,
        empNum: form.empNum || null, 
        quantity: Number(form.quantity ?? 0),
        totalAmount,                  
      };

      await axios.put(UPDATE_API(idForSave), payload);

      await fetchDetail(idForSave);

      setMode("view");
    } catch (e) {
      console.error("저장 실패:", e);
      setErr(e?.response?.data?.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (initialFormRef.current) {
      setForm(JSON.parse(JSON.stringify(initialFormRef.current)));
    }
    setMode("view");
  };

  const handleDelete = async () => {
    if (!itemId) return;
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await axios.delete(DELETE_API(itemId));
      alert("판매 내역이 삭제되었습니다.");
      navigate(-1);
    } catch (e) {
      console.error("삭제 실패:", e);
      alert(e?.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  // 상품 검색 (수정 모드에서만)
  const openProductSearch = () => {
    if (readOnly) return;
    setProductModalOpen(true);
  };

  // 제목: n번 판매상품내역 조회 / n번 상품판매내역 수정
  const displayId = form.itemSalesId || itemId || "-";
  const titleText = readOnly
    ? `${displayId}번 판매상품내역 조회`
    : `${displayId}번 상품판매내역 수정`;

  return (
    <Container className="py-4">
      {/* 상단: 제목 */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">{titleText}</h3>
      </div>

      {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

      <Card className="rounded-4 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {/* 1) 상품명 — 수정 모드에만 입력/검색 가능 (흰색) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  상품명
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <InputGroup className="flex-grow-1">
                    <Form.Control
                      value={form.productName}
                      placeholder="상품명"
                      onChange={(e) => patch("productName", e.target.value)}
                      onClick={openProductSearch}
                      readOnly={readOnly}
                      style={ctrlStyle(true)}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={openProductSearch}
                      disabled={readOnly}
                      title="상품 검색"
                    >
                      <i className="bi bi-search" />
                    </Button>
                  </InputGroup>
                </Col>
              </Row>

              {/* 2) 구분 — 항상 읽기 전용 (연회색) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  구분
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <Form.Control
                    value={form.productType}
                    readOnly
                    style={ctrlStyle(false)}
                  />
                </Col>
              </Row>

              {/* 3) 판매자 이메일 — 항상 읽기 전용 (연회색) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  판매자 이메일
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <Form.Control
                    value={form.empEmail}
                    readOnly
                    placeholder="판매자 이메일"
                    style={ctrlStyle(false)}
                  />
                </Col>
              </Row>

              {/* 4) 판매 수량 — 수정 가능 (흰색) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  판매 수량
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => patch("quantity", Number(e.target.value || 0))}
                    readOnly={readOnly}
                    style={ctrlStyle(true)}
                  />
                </Col>
              </Row>

              {/* 5) 단가(원) — 항상 읽기 전용 (상품 선택 시 자동 반영, 연회색) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  단가 (원)
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <Form.Control
                    type="number"
                    value={form.unitPrice}
                    readOnly
                    style={ctrlStyle(false)}
                  />
                </Col>
              </Row>

              {/* 6) 총액(원) — 계산 표시용 (연회색) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  총액 (원)
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <Form.Control value={numFmt(totalAmount)} readOnly style={ctrlStyle(false)} />
                </Col>
              </Row>

              {/* 7) 등록일 — 항상 읽기 전용 */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  등록일
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <Form.Control type="date" value={form.createdAt} readOnly style={ctrlStyle(false)} />
                </Col>
              </Row>

              {/* 8) 수정일 — 항상 읽기 전용 */}
              <Row className="g-0">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  수정일
                </Col>
                <Col md={9} className="d-flex align-items-center px-3 py-3">
                  <Form.Control type="date" value={form.updatedAt} readOnly style={ctrlStyle(false)} />
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      {/* 하단 액션 바 */}
      <div className="d-flex justify-content-center gap-2 mt-3">
        {readOnly ? (
          <>
            <Button variant="primary" onClick={() => setMode("edit")} disabled={!itemId}>
              수정
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              확인
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
              수정취소
            </Button>
            <Button variant="success" onClick={handleSave} disabled={saving || loading}>
              {saving ? "저장 중..." : "저장"}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={saving || loading}>
              삭제
            </Button>
          </>
        )}
      </div>

      {/* 상품 검색 모달 (수정 모드에서만) */}
      <SalesItemSearchModal
        show={productModalOpen}
        onHide={() => setProductModalOpen(false)}
        onExited={() => {}}
        onSelect={(p) => {
          // 상품 선택 시 자동 반영(단가/구분도 서버 값 기반으로 표시만 변경)
          setForm((f) => ({
            ...f,
            productId: p.productId,
            productName: p.name,
            productType: p.codeBId || "PRODUCT",
            unitPrice: p.price ?? f.unitPrice,
          }));
          setProductModalOpen(false);
        }}
      />
    </Container>
  );
}
