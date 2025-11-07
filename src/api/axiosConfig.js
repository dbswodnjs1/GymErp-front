// src/api/axiosConfig.js

import axios from "axios";

axios.defaults.baseURL = "/api"; // 스프링 주손
axios.defaults.withCredentials = true; // 모든 요청에 쿠키 포함

// 요청 인터셉터
axios.interceptors.request.use(
    config => {
        // 요청 전 처리
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 세션 만료 처리
axios.interceptors.response.use(
    response => response,
    error => {
        const { status } = error.response || {};

        // 401, 403 에러 시 로그인 페이지로 리다이렉트
        if ((status === 401 || status === 403) && 
                !window.location.pathname.includes('/login')) {
            sessionStorage.removeItem('user');
            window.location.href = '/login';
    }
    
        return Promise.reject(error);
    }
);

export default axios;