// src/components/BsSideBar.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

function DropdownMenu({ icon, title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li className="nav-item">
      <button
        className="nav-link text-white fs-6 w-100 text-start border-0"
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: 'transparent' }}
      >
        <i className={`bi bi-${icon}`} />
        <span className="ms-2">{title}</span>
        <i className={`bi bi-chevron-${isOpen ? 'down' : 'right'} float-end`} />
      </button>

      <div className={`collapse ${isOpen ? 'show' : ''}`}>
        <ul className="nav flex-column ms-3">{children}</ul>
      </div>
    </li>
  );
}

function SubMenuItem({ to, icon, text }) {
  return (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `nav-link text-white fs-6 py-2 ${isActive ? 'active' : ''}`
        }
      >
        <i className={`bi bi-${icon}`} />
        <span className="ms-2">{text}</span>
      </NavLink>
    </li>
  );
}

export default function BsSideBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/v1/emp/logout');
    } catch (e) {
      console.warn('logout failed:', e?.message);
    } finally {
      dispatch({ type: 'USER_LOGOUT' });
      sessionStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  return (
    // ❗ 여기서는 더 이상 fixed/top 주지 않는다. App.jsx가 포지셔닝 담당.
    <div
      className="bg-dark text-white d-flex flex-column"
      style={{
        height: '100%',          // App.jsx의 aside(height:100vh) 안에서 꽉 채움
        overflow: 'hidden',      // 스크롤은 메뉴 영역에만
      }}
    >
      {/* 상단 브랜드 */}
      <div className="p-3 border-bottom border-secondary">
        <NavLink to="/" className="text-decoration-none text-white d-flex align-items-center">
          <span className="fs-4 fw-bold">Gym</span>
        </NavLink>
      </div>

      {/* 스크롤 되는 메뉴 영역 */}
      <div className="p-3 flex-grow-1 overflow-auto">
        <ul className="nav nav-pills flex-column gap-2 m-0">
          <DropdownMenu icon="people" title="직원관리">
            <SubMenuItem to="/emp" icon="table" text="직원목록" />
            <SubMenuItem to="/attendance/my" icon="clock-history" text="출퇴근 기록" />
          </DropdownMenu>

          <DropdownMenu icon="people-fill" title="회원관리">
            <SubMenuItem to="/member" icon="table" text="회원목록" />
          </DropdownMenu>

          <DropdownMenu icon="people-fill" title="매출관리">

            <SubMenuItem to="/sales/SalesItemList" icon="cart-plus" text="상품판매리스트" />

          </DropdownMenu>
          <DropdownMenu icon="people-fill" title="상품관리">
            <SubMenuItem to="/product" icon="cart-plus" text="상품목록" />
            <SubMenuItem to="/stock" icon="cart-plus" text="재고현황" />
          </DropdownMenu>           

           {/* 게시판 */}
          <DropdownMenu icon="card-text" title="게시판">
            <SubMenuItem to="/post" icon="list-ul" text="게시글 목록" />
          </DropdownMenu>
        </ul>
      </div>

      {/* 하단 고정 로그아웃 */}
      <div className="border-top border-secondary p-3" style={{ position: 'sticky', bottom: 0, background: '#212529' }}>
        <button className="btn btn-sm btn-outline-light w-100" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1" />
          로그아웃
        </button>
      </div>
    </div>
  );
}
