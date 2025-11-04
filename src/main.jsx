// src/main.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './api/axiosConfig' // axios 설정 import
import store from "./store" // store import\

import React, { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
// SPA 를 구현하기 위한 RouterProvider 를 import
import { RouterProvider } from "react-router-dom"; 
import router from "./router"; // 라우팅 설정 
import './api/axiosConfig' // axios 설정 import
import { Provider } from "react-redux";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);