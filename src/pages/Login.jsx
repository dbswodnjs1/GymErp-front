// src/pages/Login.jsx

import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

function Login() {

    const [empEmail, setEmpEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const from = location.state?.from?.pathname || "/home"; // 로그인 후 가야 할 경로(원하면 바꿔)

    const handleLogin = async(e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // api 서버에 로그인 요청 보내기
            const response = await axios.post("/v1/emp/login",
                {
                    empEmail : empEmail,
                    password: password
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log(response.data);

            // 로그인 성공
            if(response.data && response.data.empNum){
                const user = response.data
                // 사용자 정보를 redux store 에 저장
                const action = {type:"USER_INFO", payload: user};
                dispatch(action);
                // 사용자 정보를 sessionStorage 에 저장
                sessionStorage.setItem("user", JSON.stringify(user));
                navigate(from, { replace: true }); // 로그인 후 페이지 이동
            }
        } catch (error) {
            console.error("Login Error", error);

            if (error.response?.status === 401) {
                setError("이메일 또는 비밀번호가 일치하지 않습니다.");
            } else {
                setError("로그인에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card shadow-lg border-0" style={{width: "440px", borderRadius: "15px"}}>
            <div className="card-body p-5">
                <div className="text-center mb-4">
                    <div className="mb-3">
                        <i className="bi bi-building" style={{fontSize: "3rem", color: "#0d6efd"}}></i>
                    </div>
                    <h2 className="card-title fw-bold mb-2">GYM ERP</h2>
                    <p className="text-muted">관리 시스템</p>
                </div>
                { error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={()=> setError("")} aria-label="Close"></button>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="" className="form-label fw-semibold">
                            <i className="bi bi-envelope me-2"></i>이메일
                        </label>
                        <input type="text" className="form-control form-control-lg" placeholder="이메일을 입력하세요" value={empEmail} onChange={(e)=>setEmpEmail(e.target.value)} required disabled={loading} autoFocus />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-lock me-2"></i>비밀번호
                        </label>
                        <input type="password" className="form-control form-control-lg" placeholder="비밀번호를 입력하세요" value={password} onChange={(e)=> setPassword(e.target.value)} required disabled={loading}/>
                    </div>
                    <button type="submit" className="btn btn-primary btn-log w-100 py-3 fw-semibold" disabled={loading} style={{borderRadius: "10px"}}>
                        { loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                로그인 중...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                로그인
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <small className="text-muted">
                        문제가 있으신가요? 시스템 관리자에게 문의하세요.
                    </small>
                </div>
            </div>
        </div>
    );
}

export default Login;