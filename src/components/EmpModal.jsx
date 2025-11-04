import axios from "axios";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function EmpModal({ show, onClose, onSuccess }) {
  const [form, setForm] = useState({
    empName: "",
    gender: "",
    empBirth: "",
    empPhone: "",
    empEmail: "",
    hireDate: new Date().toISOString().split("T")[0], // 오늘 날짜 기본값
    role: "EMP",
    empAddress: "",
    empMemo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.empName || !form.gender || !form.empBirth || !form.empPhone || !form.empEmail) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      await axios.post("http://localhost:9000/v1/emp", form);
      alert("직원이 등록되었습니다.");
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>신규 직원 등록</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>이름 *</Form.Label>
            <Form.Control name="empName" onChange={handleChange} value={form.empName} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>성별 *</Form.Label><br />
            <Form.Check inline label="남" name="gender" type="radio" value="남" onChange={handleChange} />
            <Form.Check inline label="여" name="gender" type="radio" value="여" onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>생년월일 *</Form.Label>
            <Form.Control type="date" name="empBirth" onChange={handleChange} value={form.empBirth} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>연락처 *</Form.Label>
            <Form.Control name="empPhone" onChange={handleChange} value={form.empPhone} placeholder="010-1234-5678" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>이메일 *</Form.Label>
            <Form.Control type="email" name="empEmail" onChange={handleChange} value={form.empEmail} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>입사일 *</Form.Label>
            <Form.Control type="date" name="hireDate" onChange={handleChange} value={form.hireDate} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>직급 *</Form.Label>
            <Form.Select name="role" value={form.role} onChange={handleChange}>
              <option value="EMP">사원</option>
              <option value="MANAGER">매니저</option>
              <option value="ADMIN">관리자</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>주소</Form.Label>
            <Form.Control name="empAddress" onChange={handleChange} value={form.empAddress} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>메모</Form.Label>
            <Form.Control as="textarea" rows={3} name="empMemo" onChange={handleChange} value={form.empMemo} />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>취소</Button>
        <Button variant="success" onClick={handleSubmit}>저장</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EmpModal;