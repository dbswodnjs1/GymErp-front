// src/components/ScheduleModal.jsx
import { useState, useEffect } from "react";
import { Modal, Tabs, Tab, Button, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import "./css/ScheduleModal.css";

/* 공통 에러 메시지 추출 유틸 */
const extractErrorMessage = (error) => {
  const res = error?.response;
  if (!res) return error?.message || "네트워크 오류가 발생했습니다.";
  return typeof res.data === "string"
    ? res.data
    : res.data?.message || res.statusText || "요청이 실패했습니다.";
};




/* ============================================================= */
/* 🧩 메인 ScheduleModal */
export default function ScheduleModal({
  show,
  defaultTab = "pt",
  empNum,
  empName,
  onSaved,
  editData,
  selectedDate,
}) {
  const [tab, setTab] = useState(defaultTab);

  // 수정 모드 → 탭 자동 변경
  useEffect(() => {
    if (!editData) return;
    if (editData.codeBid === "VACATION") setTab("vacation");
    else if (editData.codeBid?.startsWith("ETC")) setTab("etc");
    else if (editData.codeBid === "SCHEDULE-PT") setTab("pt");
  }, [editData]);

  const handleSaved = (payload) => {
    console.log("[일정 저장 완료] payload:", payload);
    onSaved?.(payload);
  };

  return (
    <Modal show={show} centered backdrop="static" size="lg">
      <Modal.Header>
        <Modal.Title>일정 관리</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          id="schedule-tabs"
          activeKey={tab}
          onSelect={(k) => setTab(k || "pt")}
          className="mb-3"
          justify
        >
          {/* PT 탭 */}
          <Tab eventKey="pt" title="PT">
            <PTTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
            />
          </Tab>

          {/* 휴가 탭 */}
          <Tab eventKey="vacation" title="휴가">
            <VacationTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
            />
          </Tab>

          {/* 기타 탭 */}
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
        <Button variant="secondary" onClick={() => onSaved?.()}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ============================================================= */
/* PT 탭 */
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

  //전화번호 포맷
  const fmtPhone = (v) => {
    if (!v) return "";
    const s = String(v).replace(/\D/g, "");
    if (s.length === 11) return s.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    if (s.length === 10) return s.replace(/(\d{2,3})(\d{3,4})(\d{4})/, "$1-$2-$3");
    return v;
  };

  const sortByKoName = (arr) =>
    [...(Array.isArray(arr) ? arr : [])].sort((a, b) =>
      (a.memName || "").localeCompare(b.memName || "", "ko")
    );

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (empNum) setForm((prev) => ({ ...prev, empNum, empName }));

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
    } else if (!editData) {
      setForm((prev) => ({
        ...prev,
        date: selectedDate || "",
      }));
    }

    axios
      .get("http://localhost:9000/v1/member")
      .then((res) => setMembers(sortByKoName(res.data)))
      .catch((err) => console.error("❌ 회원 목록 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      memNum: form.memNum,
      codeBid: "SCHEDULE-PT",
      startTime: `${form.date}T${form.startTime}`,
      endTime: `${form.date}T${form.endTime}`,
      memo: form.memo,
    };
    console.log("[PT payload 확인]", payload);

    try {
      if (editData) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("PT 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("PT 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
    } catch (err) {
      console.error("PT 일정 등록/수정 실패:", err);
      // ✅ 서버가 준 에러 메시지(회원권 만료/잔여 0/중복 등)를 그대로 표시
      alert(extractErrorMessage(err));
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>회원명</Form.Label>
          <Form.Select name="memNum" value={form.memNum} onChange={onChange}>
            <option value="">선택</option>
            {members.map((m) => {
              const rawPhone = m.memPhone ?? m.phone ?? m.tel ?? m.memTel ?? m.mobile ?? "";
              const label = `${m.memName}${rawPhone ? " : " + fmtPhone(rawPhone) : ""}`;
              return (
                <option key={m.memNum} value={m.memNum} title={label}>
                  {label}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>트레이너</Form.Label>
          <Form.Control name="empName" value={form.empName} readOnly />
        </Col>
        <Col md={4}>
          <Form.Label>날짜</Form.Label>
          <Form.Control type="date" name="date" value={form.date} onChange={onChange} />
        </Col>
        <Col md={4}>
          <Form.Label>시작 시간</Form.Label>
          <Form.Control type="time" name="startTime" value={form.startTime} onChange={onChange} />
        </Col>
        <Col md={4}>
          <Form.Label>종료 시간</Form.Label>
          <Form.Control type="time" name="endTime" value={form.endTime} onChange={onChange} />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control as="textarea" rows={3} name="memo" value={form.memo} onChange={onChange} />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">
          저장
        </Button>
      </div>
    </Form>
  );
}

/* ============================================================= */
/* 휴가 탭 */
function VacationTab({ empNum, empName, onSaved, editData, selectedDate }) {
  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    startDate: selectedDate || "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (empNum && empName) setForm((prev) => ({ ...prev, empNum, registrant: empName }));
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

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    console.log("[VACATION payload 확인]", payload);

    try {
      if (editData && editData.codeBid === "VACATION") {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("휴가 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("휴가 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
    } catch (err) {
      console.error("휴가 일정 등록 실패:", err);
      alert(extractErrorMessage(err));
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} readOnly />
        </Col>
        <Col md={6}>
          <Form.Label>사유</Form.Label>
          <Form.Control as="textarea" rows={2} name="reason" value={form.reason} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>시작일</Form.Label>
          <Form.Control type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>종료일</Form.Label>
          <Form.Control type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">
          저장
        </Button>
      </div>
    </Form>
  );
}

/* ============================================================= */
/* 기타 탭 */
function EtcTab({ empNum, empName, onSaved, editData, selectedDate }) {
  const [scheduleCodes, setScheduleCodes] = useState([]);
  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    category: "",
    startDate: selectedDate || "",
    endDate: "",
    memo: "",
  });

  useEffect(() => {
    if (empNum && empName) setForm((prev) => ({ ...prev, empNum, registrant: empName }));

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
        const nameMap = {
          "ETC-COMPETITION": "대회",
          "ETC-COUNSEL": "상담",
          "ETC-MEETING": "회의",
        };

        const etc = res.data
          .filter((c) => c.codeBId.startsWith("ETC"))
          .map((c) => ({
            ...c,
            displayName: nameMap[c.codeBId] || c.codeBName || c.codeBId,
          }));
        console.log("[ETC 코드 변환 결과]", etc);
        setScheduleCodes(etc);
      })
      .catch((err) => console.error("일정유형 코드 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    console.log("[ETC payload 확인]", payload);

    try {
      if (editData && editData.codeBid?.startsWith("ETC")) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("기타 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("기타 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
    } catch (err) {
      console.error("기타 일정 등록 실패:", err);
      alert(extractErrorMessage(err));
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} readOnly />
        </Col>
        <Col md={6}>
          <Form.Label>일정유형</Form.Label>
          <Form.Select name="category" value={form.category} onChange={onChange}>
            <option value="">선택</option>
            {scheduleCodes.map((c) => (
              <option key={c.codeBId} value={c.codeBId}>
                {c.displayName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>시작일</Form.Label>
          <Form.Control type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>종료일</Form.Label>
          <Form.Control type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control as="textarea" rows={3} name="memo" value={form.memo} onChange={onChange} />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">
          저장
        </Button>
      </div>
    </Form>
  );
}
