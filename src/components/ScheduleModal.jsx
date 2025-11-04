import { useState, useEffect, useMemo } from "react";
import { Modal, Tabs, Tab, Button, Row, Col, Form } from "react-bootstrap";
import axios from "axios";

export default function ScheduleModal({
  show,
  defaultTab = "pt",
  empNum,
  empName,
  onClose,
  onSaved,
  editData,
  selectedDate,
}) {
  const [tab, setTab] = useState(defaultTab);

  // ✅ 수정 모드 시 탭 자동 전환
  useEffect(() => {
    if (!editData) return;
    if (editData.codeBid === "VACATION") setTab("vacation");
    else if (editData.codeBid?.startsWith("ETC")) setTab("etc");
    else if (editData.codeBid === "SCHEDULE-PT") setTab("pt");
  }, [editData]);

  const handleSaved = () => {
    onSaved?.();
    onClose?.();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editData ? "일정 수정" : "일정 등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          id="schedule-tabs"
          activeKey={tab}
          onSelect={(k) => setTab(k || "pt")}
          className="mb-3"
          justify
        >
          {/* PT */}
          <Tab eventKey="pt" title="PT">
            <PTTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
            />
          </Tab>

          {/* 휴가 */}
          <Tab eventKey="vacation" title="휴가">
            <VacationTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
            />
          </Tab>

          {/* 기타 */}
          <Tab eventKey="etc" title="기타">
            <EtcTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ============================================================= */
/* 🟢 PT 탭 */
function PTTab({ empNum, empName, onSaved, editData, selectedDate }) {
  const [form, setForm] = useState({
    memNum: "",
    empNum: empNum || "",
    empName: empName || "",
    date: selectedDate || "",
    startTime: "",
    endTime: "",
    memo: "",
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (empNum && empName)
      setForm((prev) => ({ ...prev, empNum, empName }));

    if (editData) {
      setForm({
        memNum: editData.memNum || "",
        empNum: editData.empNum || empNum,
        empName: editData.empName || empName,
        date: editData.startTime?.slice(0, 10) || selectedDate || "",
        startTime: editData.startTime?.slice(11, 16) || "",
        endTime: editData.endTime?.slice(11, 16) || "",
        memo: editData.memo || "",
      });
    } else if (selectedDate) {
      setForm((prev) => ({ ...prev, date: selectedDate }));
    }

    axios
      .get("http://localhost:9000/v1/member")
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("회원 목록 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
  e.preventDefault();

  // ✅ 필수 검증 추가
  if (!form.memNum) {
    alert("⚠️ 회원을 선택해주세요.");
    return;
  }

  const payload = {
    shNum: editData?.shNum,
    empNum: Number(form.empNum),
    memNum: form.memNum ? Number(form.memNum) : null,
    codeBid: "SCHEDULE-PT",
    startTime: `${form.date}T${form.startTime}`,
    endTime: `${form.date}T${form.endTime}`,
    memo: form.memo,
  };

  // ✅ 콘솔 로그 강화
  console.log("✅ 최종 payload:", payload);

  try {
    if (editData) {
      await axios.put("http://localhost:9000/v1/schedule/update", payload, {
        headers: { "Content-Type": "application/json" }, // ✅ JSON 전송 명시
      });
      alert("✅ PT 일정이 수정되었습니다.");
    } else {
      await axios.post("http://localhost:9000/v1/schedule/add", payload, {
        headers: { "Content-Type": "application/json" }, // ✅ JSON 전송 명시
      });
      alert("✅ PT 일정이 등록되었습니다.");
    }

    onSaved?.();
  } catch (err) {
    console.error("❌ PT 일정 등록/수정 실패:", err);
    alert("등록 중 오류가 발생했습니다. 콘솔을 확인하세요.");
  }
};

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>회원명</Form.Label>
          <Form.Select
            name="memNum"
            value={form.memNum}
            onChange={onChange}
          >
            <option value="">선택</option>
            {members.map((m) => (
              <option key={m.memNum} value={m.memNum}>
                {m.memName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>트레이너</Form.Label>
          <Form.Control value={form.empName} readOnly />
        </Col>
        <Col md={4}>
          <Form.Label>날짜</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
          />
        </Col>
        <Col md={4}>
          <Form.Label>시작 시간</Form.Label>
          <Form.Control
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
          />
        </Col>
        <Col md={4}>
          <Form.Label>종료 시간</Form.Label>
          <Form.Control
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
          />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="memo"
            value={form.memo}
            onChange={onChange}
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">
          {editData ? "수정" : "저장"}
        </Button>
      </div>
    </Form>
  );
}

/* ============================================================= */
/* 🟠 휴가 탭 */
function VacationTab({ empNum, empName, onSaved, editData, selectedDate }) {
  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    startDate: selectedDate || "",
    endDate: selectedDate || "",
    reason: "",
  });

  useEffect(() => {
    if (empNum && empName)
      setForm((prev) => ({ ...prev, empNum, registrant: empName }));

    if (editData && editData.codeBid === "VACATION") {
      setForm({
        empNum: editData.empNum || empNum,
        registrant: editData.empName || empName,
        startDate: editData.startTime?.slice(0, 10) || "",
        endDate: editData.endTime?.slice(0, 10) || "",
        reason: editData.memo || "",
      });
    }
  }, [empNum, empName, editData, selectedDate]);

  const usedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const d1 = new Date(form.startDate);
    const d2 = new Date(form.endDate);
    return Math.max(0, (d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  }, [form.startDate, form.endDate]);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      codeBid: "VACATION",
      startTime: `${form.startDate}T00:00`,
      endTime: `${form.endDate}T23:59`,
      memo: form.reason,
    };

    try {
      if (editData) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("휴가 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("휴가 일정이 등록되었습니다.");
      }
      onSaved?.();
    } catch (err) {
      console.error("휴가 일정 등록/수정 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control value={form.registrant} readOnly />
        </Col>
        <Col md={3}>
          <Form.Label>사용 일수</Form.Label>
          <Form.Control readOnly value={usedDays} />
        </Col>
        <Col md={6}>
          <Form.Label>시작일</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
          />
        </Col>
        <Col md={6}>
          <Form.Label>종료일</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
          />
        </Col>
        <Col md={12}>
          <Form.Label>사유</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="reason"
            value={form.reason}
            onChange={onChange}
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">
          {editData ? "수정" : "저장"}
        </Button>
      </div>
    </Form>
  );
}

/* ============================================================= */
/* 🔵 기타 탭 */
function EtcTab({ empNum, empName, onSaved, editData, selectedDate }) {
  const [scheduleCodes, setScheduleCodes] = useState([]);
  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    category: "",
    startDate: selectedDate || "",
    endDate: selectedDate || "",
    memo: "",
  });

  useEffect(() => {
    if (empNum && empName)
      setForm((prev) => ({ ...prev, empNum, registrant: empName }));

    if (editData && editData.codeBid?.startsWith("ETC")) {
      setForm({
        empNum: editData.empNum || empNum,
        registrant: editData.empName || empName,
        category: editData.codeBid || "",
        startDate: editData.startTime?.slice(0, 10) || "",
        endDate: editData.endTime?.slice(0, 10) || "",
        memo: editData.memo || "",
      });
    }

    axios
      .get("http://localhost:9000/v1/schedule-types")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const etc = res.data.filter(
            (c) => c && typeof c.codeBid === "string" && c.codeBid.startsWith("ETC")
          );
          setScheduleCodes(etc);
        } else {
          console.warn("⚠️ schedule-types 응답이 배열이 아닙니다:", res.data);
          setScheduleCodes([]);
        }
      })
      .catch((err) => console.error("일정유형 코드 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      codeBid: form.category,
      startTime: `${form.startDate}T00:00`,
      endTime: `${form.endDate}T23:59`,
      memo: form.memo,
    };

    try {
      if (editData) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("기타 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("기타 일정이 등록되었습니다.");
      }
      onSaved?.();
    } catch (err) {
      console.error("기타 일정 등록/수정 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control value={form.registrant} readOnly />
        </Col>
        <Col md={6}>
          <Form.Label>일정유형</Form.Label>
          <Form.Select
            name="category"
            value={form.category}
            onChange={onChange}
          >
            <option value="">선택</option>
            {scheduleCodes.map((c) => (
              <option key={c.codeBid} value={c.codeBid}>
                {c.codeBName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>시작일</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
          />
        </Col>
        <Col md={6}>
          <Form.Label>종료일</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
          />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="memo"
            value={form.memo}
            onChange={onChange}
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">
          {editData ? "수정" : "저장"}
        </Button>
      </div>
    </Form>
  );
}
