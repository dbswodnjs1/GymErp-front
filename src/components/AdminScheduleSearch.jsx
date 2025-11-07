import { useState } from "react";
import { Form, Button, Row, Col, InputGroup } from "react-bootstrap";

/** 관리자 전용 검색 폼 */
export default function AdminScheduleSearch({ defaultPageSize = 20, onSearch }) {
  const [empNum, setEmpNum] = useState("");
  const [codeBid, setCodeBid] = useState("");
  const [keyword, setKeyword] = useState("");
  const [from, setFrom] = useState("");       // datetime-local 값 그대로 전달
  const [to, setTo] = useState("");
  const [size, setSize] = useState(defaultPageSize);

  const submit = (e) => {
    e.preventDefault();
    onSearch?.({ empNum, codeBid, keyword, from, to, page: 1, size: Number(size) || defaultPageSize });
  };

  const reset = () => {
    setEmpNum(""); setCodeBid(""); setKeyword(""); setFrom(""); setTo(""); setSize(defaultPageSize);
    onSearch?.({ empNum: "", codeBid: "", keyword: "", from: "", to: "", page: 1, size: defaultPageSize });
  };

  return (

    <Form onSubmit={submit} className="mb-3">
      <Row className="gy-2 align-items-end">
        <Col md={2}>
          <Form.Label>직원번호</Form.Label>
          <Form.Control value={empNum} onChange={(e) => setEmpNum(e.target.value.replace(/\D/g, ""))} placeholder="예) 1" />
        </Col>
        <Col md={2}>
          <Form.Label>유형</Form.Label>
          <Form.Select value={codeBid} onChange={(e) => setCodeBid(e.target.value)}>
            <option value="">전체</option>
            <option value="SCHEDULE-PT">PT</option>
            <option value="VACATION">휴가</option>
            <option value="ETC-MEETING">회의</option>
            <option value="ETC-COUNSEL">상담</option>
            <option value="ETC-COMPETITION">대회</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label>키워드(직원/회원)</Form.Label>
          <Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="이름 또는 메모" />
        </Col>
        <Col md={2}>
          <Form.Label>시작</Form.Label>
          <Form.Control type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Col>
        <Col md={2}>
          <Form.Label>종료</Form.Label>
          <Form.Control type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
        </Col>
        <Col md={1}>
          <Form.Label>페이지당</Form.Label>
          <InputGroup>
            <Form.Control value={size} onChange={(e) => setSize(e.target.value.replace(/\D/g, ""))} />
          </InputGroup>
        </Col>
      </Row>

      <div className="mt-2 d-flex gap-2">
        <Button type="submit" variant="primary">검색</Button>
        <Button type="button" variant="secondary" onClick={reset}>초기화</Button>
      </div>
    </Form>
  );
}
