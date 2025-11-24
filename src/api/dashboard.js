// src/api/dashboard.js (수정된 fetchDashboardKpis 함수)
import api from "./axiosConfig.js";

export const fetchDashboardKpis = async () => {
    try {
        const res = await api.get("/v1/home"); // http://localhost:9000/v1/home

        // 디버깅을 위해 res.data 전체를 로그로 찍어 데이터 구조 확인
        console.log("[API Response Data]", res.data);

        // 데이터 구조에 따라 data 변수 설정 (대부분의 경우 res.data가 맞음)
        let data = res.data;

        // ★ 만약 데이터가 res.data.data 형태로 중첩되어 있다면:
        if (data && data.data) {
            data = data.data; // 실제 데이터 객체로 재할당
            console.log("[Nested Data Adjusted]", data);
        }

        // data가 객체가 아니거나 null인 경우에도 아래 로직은 0을 반환함
        // 하지만, 디버깅을 위해 data가 null/undefined인지 한 번 더 확인!
        if (!data) {
            console.warn("KPI 데이터가 null이거나 정의되지 않았습니다. 백엔드 응답을 확인하세요.");
        }

        // ★ 숫자/문자 모두 커버하는 변환 로직 (이제 data에 값이 있다면 제대로 작동할 것)
        return {
            activeMembers: Number(data?.activeMembers ?? data?.active_members ?? 0),
            monthNewMembers: Number(data?.monthNewMembers ?? data?.month_new_members ?? 0),
            mtdRevenue: Number(data?.mtdRevenue ?? data?.mtd_revenue ?? 0),
        };
    } catch (error) {
        // API 호출 자체에 문제가 있는 경우 (4xx, 5xx)
        console.error("fetchDashboardKpis API 호출 실패:", error);
        // 호출 실패 시에도 Home.jsx에서 catch되도록 오류를 던집니다.
        throw error;
    }
};