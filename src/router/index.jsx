// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "../App.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

import Login from "../pages/Login.jsx";
import Home from "../pages/Home.jsx";
import EmpList from "../pages/EmpList.jsx";
import EmpDetail from "../pages/EmpDetail.jsx";
import EmpEdit from "../pages/EmpEdit.jsx";

import EmpAttendanceMy from "../pages/EmpAttendance/myAttendance.jsx";
import EmpAttendanceView from "../pages/EmpAttendance/viewAttendance.jsx";
import EmpAttendanceList from "../pages/EmpAttendance/list.jsx";
import EmpVacationList from "../pages/EmpVacation/list.jsx";
import JONGBOKHome from "../pages/JONGBOKHome.jsx";
import SchedulePage from "../pages/SchedulePage.jsx";

// ✅ ProductListComponent로 수정
import ProductListComponent from "../components/ProductListComponent.jsx";

import MemberList from "../pages/MemberList.jsx";
import MemberDetail from "../pages/MemberDetail.jsx";
import MemberEdit from "../pages/MemberEdit.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },

  {
    path: "/login",
    element: (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <Login />
      </div>
    ),
    errorElement: <div>로그인 페이지 에러</div>,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <div>Route 에러</div>,
    children: [
      { path: "home", element: <Home /> },
      { path: "jongbok", element: <JONGBOKHome /> },
      { path: "emp", element: <EmpList /> },
      { path: "emp/:empNum", element: <EmpDetail /> },
      { path: "emp/edit/:empNum", element: <EmpEdit /> },
      { path: "attendance", element: <EmpAttendanceList /> },
      { path: "attendance/my", element: <EmpAttendanceMy /> },
      { path: "attendance/view", element: <EmpAttendanceView /> },
      { path: "vacations", element: <EmpVacationList /> },
      { path: "schedule", element: <SchedulePage /> },

      // ✅ 수정된 Product 경로
      { path: "product", element: <ProductListComponent /> },

      { path: "member", element: <MemberList /> },
      { path: "member/:memNum", element: <MemberDetail /> },
      { path: "member/edit/:memNum", element: <MemberEdit /> },
    ],
  },
]);

export default router;
