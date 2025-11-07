// src/main.jsx
import 'bootstrap/dist/css/bootstrap.min.css';

import './api/axiosConfig'; // axios 설정 import 
import store from "./store"; // store import 
import router from "./router"; // 라우팅 설정 

import React, { StrictMode } from "react"; 
import { createRoot } from 'react-dom/client'; 
import { RouterProvider } from "react-router-dom"; // SPA 구현을 위한 RouterProvider
import { Provider } from "react-redux";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
