import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";

/**
 * EmpModal.jsx — 직원 등록 모달
 * - 폰 입력 중 하이픈 자동 포맷(표시용)
 * - 저장 시 하이픈 제거해 숫자만 전송
 * - 필수값/형식 검증, 저장 중 중복 클릭 방지
 */

function extractErrorMessage(error) {
  const res = error?.response;
  if (!res) return error?.message || "네트워크 오류가 발생했습니다.";
  return typeof res.data === "string"
    ? res.data
    : res.data?.message || res.statusText || "요청이 실패했습니다.";
}

// 숫자만(하이픈 X) 검증용 정규식
const PHONE_REGEX = /^(010|011|016|017|018|019)[0-9]{7,8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 입력값을 하이픈 포함 형식으로 변환 (표시용)
function formatPhone(value) {
  const d = String(value || "").replace(/\D/g, "").slice(0, 11); // 최대 11자리
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  // 3-4-4
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function EmpModal({ show, onClose, onSuccess, postUrl = "/v1/emp" }) {
  const [form, setForm] = useState({
    empName: "",
    gender: "", // "남" | "여"
    empBirth: "",
    empPhone: "",          // 화면에는 하이픈 포함으로 보임
    empEmail: "",
    hireDate: new Date().toISOString().split("T")[0],
    role: "EMP",
    empAddress: "",
    empMemo: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ======== 검증기 =========
  const required = (v) => (v === undefined || v === null || String(v).trim() === "" ? "필수 입력입니다." : "");
  const validators = useMemo(
    () => ({
      empName: (v) => required(v),
      gender: (v) => required(v),
      empBirth: (v) => (required(v) || (/^\d{4}-\d{2}-\d{2}$/.test(v) ? "" : "YYYY-MM-DD 형식")),
      empPhone: (v) => {
        const onlyNum = String(v || "").replace(/\D/g, "");
        return required(onlyNum) || (!PHONE_REGEX.test(onlyNum) ? "휴대폰 번호(숫자 10~11자리)" : "");
      },
      empEmail: (v) => required(v) || (!EMAIL_REGEX.test(String(v)) ? "이메일 형식이 올바르지 않습니다." : ""),
      hireDate: (v) => (required(v) || (/^\d{4}-\d{2}-\d{2}$/.test(v) ? "" : "YYYY-MM-DD 형식")),
      role: (v) => required(v),
      empAddress: () => "",
      empMemo: () => "",
    }),
    []
  );

  const validateAll = (draft = form) => {
    const next = {};
    Object.entries(validators).forEach(([k, fn]) => {
      const msg = fn(draft[k]);
      if (msg) next[k] = msg;
    });
    return next;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // 연락처는 입력 중 하이픈 자동 포맷
    if (name === "empPhone") {
      const formatted = formatPhone(value);
      setForm((prev) => ({ ...prev, empPhone: formatted }));
      if (errors.empPhone) {
        const msg = validators.empPhone?.(formatted) || "";
        setErrors((prev) => ({ ...prev, empPhone: msg }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === "radio" ? value : value }));
    if (errors[name]) {
      const msg = validators[name]?.(type === "radio" ? value : value) || "";
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // blur 시에도 연락처는 포맷을 한번 더 정리
    const val = name === "empPhone" ? formatPhone(value) : value;
    if (name === "empPhone" && val !== form.empPhone) {
      setForm((prev) => ({ ...prev, empPhone: val }));
    }
    const msg = validators[name]?.(val) || "";
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleSubmit = async () => {
    setSubmitError("");
    const next = validateAll();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // 전송: 휴대폰 하이픈 제거
    const payload = {
      ...form,
      empPhone: String(form.empPhone).replace(/\D/g, ""),
    };

    setIsSubmitting(true);
    try {
      await axios.post(postUrl, payload);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ESC로 닫기, Enter로 저장
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!show) return;
      if (e.key === "Enter" && !isSubmitting) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show, isSubmitting, form]);

  const isInvalid = (name) => !!errors[name];

  // 숫자/삭제/방향키 외 입력 차단(휴대폰)
  const restrictToPhoneKeys = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (allowed.includes(e.key)) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop={isSubmitting ? "static" : true}>
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>신규 직원 등록</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {submitError && <div className="alert alert-danger" role="alert">{submitError}</div>}

        <Form noValidate>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>이름 <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  name="empName"
                  value={form.empName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={isInvalid("empName")}
                  placeholder="홍길동"
                  required
                  aria-required
                />
                <Form.Control.Feedback type="invalid">{errors.empName}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>성별 <span className="text-danger">*</span></Form.Label>
                <div>
                  <Form.Check
                    inline id="gender-m" type="radio" name="gender" value="남" label="남"
                    onChange={handleChange} onBlur={handleBlur}
                    checked={form.gender === "남"} isInvalid={isInvalid("gender")}
                  />
                  <Form.Check
                    inline id="gender-f" type="radio" name="gender" value="여" label="여"
                    onChange={handleChange} onBlur={handleBlur}
                    checked={form.gender === "여"} isInvalid={isInvalid("gender")}
                  />
                </div>
                {errors.gender && <div className="invalid-feedback d-block">{errors.gender}</div>}
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>생년월일 <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date" name="empBirth" value={form.empBirth}
                  onChange={handleChange} onBlur={handleBlur}
                  isInvalid={isInvalid("empBirth")}
                />
                <Form.Control.Feedback type="invalid">{errors.empBirth}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>연락처 <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  name="empPhone"
                  value={form.empPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={restrictToPhoneKeys}
                  isInvalid={isInvalid("empPhone")}
                  placeholder="010-1234-5678"
                  inputMode="tel"
                  autoComplete="tel"
                />
                <Form.Control.Feedback type="invalid">{errors.empPhone}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>이메일 <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email" name="empEmail" value={form.empEmail}
                  onChange={handleChange} onBlur={handleBlur}
                  isInvalid={isInvalid("empEmail")}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                <Form.Control.Feedback type="invalid">{errors.empEmail}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>입사일 <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date" name="hireDate" value={form.hireDate}
                  onChange={handleChange} onBlur={handleBlur}
                  isInvalid={isInvalid("hireDate")}
                />
                <Form.Control.Feedback type="invalid">{errors.hireDate}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>직급 <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="role" value={form.role}
                  onChange={handleChange} onBlur={handleBlur}
                  isInvalid={isInvalid("role")}
                >
                  <option value="EMP">사원</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={8}>
              <Form.Group>
                <Form.Label>주소</Form.Label>
                <Form.Control name="empAddress" value={form.empAddress} onChange={handleChange} />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>메모</Form.Label>
                <Form.Control
                  as="textarea" rows={3} name="empMemo"
                  value={form.empMemo} onChange={handleChange}
                  placeholder="특이사항 또는 참고 메모"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>취소</Button>
        <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (<><Spinner size="sm" className="me-2" /> 저장 중...</>) : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
