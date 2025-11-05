// src/main.jsx
import 'bootstrap/dist/css/bootstrap.min.css';

import './api/axiosConfig'; // axios 설정 import d
import store from "./store"; // store import d
import router from "./router"; // 라우팅 설정 d

import React, { StrictMode } from "react"; d
import { createRoot } from 'react-dom/client'; d
import { RouterProvider } from "react-router-dom"; // SPA 구현을 위한 RouterProvider d
import { Provider } from "react-redux";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
