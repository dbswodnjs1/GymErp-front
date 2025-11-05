// src/App.jsx
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { useOutlet } from 'react-router-dom';
import BsNavBar from './components/layout/BsNavBar';
import BsSideBar from './components/layout/BsSideBar';

const NAVBAR_H = 56;     // 네비바 높이
const SIDEBAR_W = 250;   // 사이드바 폭

export default function App() {
  const currentOutlet = useOutlet();

  return (
    <>
      {/* 좌측: 사이드바 (화면 전체 높이 고정) */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: SIDEBAR_W,
          height: '100vh',
          zIndex: 1030,
        }}
      >
        <BsSideBar />
      </aside>

      {/* 우측 상단: 네비바 (사이드바 오른쪽부터) */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: SIDEBAR_W,   // ← 사이드바 오른쪽부터 시작
          right: 0,
          height: NAVBAR_H,
          zIndex: 1040,      // 사이드바보다 낮게 두고 싶으면 1020 정도로
          background: 'var(--bs-secondary)', // ← 네비바 배경은 header가 칠함
          overflow: 'visible' // ← 네비바 내부 배경이 새어나가지 않게
        }}
      >
        <BsNavBar />  {/* 이 컴포넌트는 투명 배경으로 바꿀 거임 */}
      </header>

      {/* 본문: 사이드바 만큼 오른쪽, 네비바 만큼 아래로 오프셋 */}
      <main
        style={{
          marginLeft: SIDEBAR_W,
          paddingTop: NAVBAR_H,
        }}
      >
        <div className="container-fluid py-3">
          {currentOutlet}
        </div>
      </main>
    </>
  );
}
