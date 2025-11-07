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
import SchedulePage from "../pages/SchedulePage.jsx";

import MembersList from "../pages/Members/MembersList.jsx";

import SalesItemList from "../pages/Sales/SalesItemList.jsx";
import SalesItemCreate from "../pages/Sales/SalesItemCreate.jsx";
import SalesServiceCreate from "../pages/Sales/SalesServiceCreate.jsx";
import ProductCreate from "../pages/Product/ProductCreate.jsx";
import ProductUpdate from "../pages/Product/ProductUpdate.jsx";
import ProductDetail from "../pages/Product/ProductDetail.jsx";
import StockList from "../pages/Product/StockList.jsx";
import StockInbound from "../pages/Product/StockInbound.jsx";
import StockOutbound from "../pages/Product/StockOutbound.jsx";
import ProductList from "../pages/Product/ProductList.jsx";

import PostList from "../pages/PostList.jsx";
import PostAdd from "../pages/PostAdd.jsx";
import PostEdit from "../pages/PostEdit.jsx";
import PostView from "../pages/PostView.jsx";






const router = createBrowserRouter([

  // 2) 로그인 (비보호)
  {
    path: "/login",
    element: (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <Login />
      </div>
    ),
    errorElement: <div>로그인 페이지 에러</div>
  },

  // 3) 메인 앱 (보호)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <div>Route 에러</div>,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "emp", element: <EmpList /> },
      { path: "emp/:empNum", element: <EmpDetail /> },
      { path: "emp/edit/:empNum", element: <EmpEdit /> },
      { path: "attendance/my", element: <EmpAttendanceMy /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "product", element: <ProductList /> },
      { path: "product/:itemType/:itemId", element: <ProductDetail /> },
      { path: "product/create", element: <ProductCreate /> },
      { path: "product/edit/:productId", element: <ProductUpdate /> },
      { path: "service/edit/:serviceId", element: <ProductUpdate /> },
      { path: "stock/inbound", element: <StockInbound /> },
      { path: "member", element: <MembersList /> },
      { path: "product/edit/:itemType/:itemId", element: <ProductUpdate /> },
      { path: "stock", element: <StockList/> },
      { path: "stock/inbound/:productId", element: <StockInbound /> },
      { path: "stock/outbound/:productId", element: <StockOutbound /> },
      { path: "sales/salesitemlist", element: <SalesItemList /> },
      { path: "sales/salesitemcreate", element: <SalesItemCreate /> },
      { path: "sales/salesservicecreate", element: <SalesServiceCreate /> },
      { path: "post", element: <PostList /> },
      { path: "post/new", element: <PostAdd /> },
      { path: "post/edit/:postId", element: <PostEdit /> },
      { path: "post/:postId", element: <PostView /> },



    ],
  },
]);

export default router;
