
// src/pages/Home.jsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ScheduleModal from '../components/ScheduleModal';
import { Button, Stack } from 'react-bootstrap';

function JONGBOKHome() {
    const [modal, setModal] = useState({ show: false, tab: "pt" });
    const open = (tab) => setModal({ show: true, tab });
    const close = () => setModal((s) => ({ ...s, show: false }));
    const saved = (payload) => {
        console.log("saved:", payload);
        // TODO: 목록 갱신 등
    };
    return <>

        <h1>박종복용 테스트 페이지 입니다</h1>
        <ul>
            <li>
                <NavLink to="/EmpVacationList" >휴가 리스트 테스트</NavLink>
            </li>
            <li>
                <NavLink to="/EmpAttendanceList">출퇴근 리스트 테스트</NavLink>
            </li>
            <li>
                <NavLink to="/EmpAttendanceMy">내 출퇴근 테스트</NavLink>
            </li>
            <li>
                <NavLink to="/EmpAttendanceView">출퇴근 상세 테스트</NavLink>
            </li>
            <hr></hr>
            <h3>모달 테스트</h3>
            <Stack direction="horizontal" gap={2} className="mb-3">
                <Button onClick={() => open("pt")}>PT 일정</Button>
                <Button variant="secondary" onClick={() => open("etc")}>기타 일정</Button>
                <Button variant="success" onClick={() => open("vacation")}>휴가</Button>
            </Stack>
            <ScheduleModal show={modal.show} defaultTab={modal.tab} onClose={close} onSaved={saved} />
        </ul>
    </>
}
export default JONGBOKHome;