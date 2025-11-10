// src/App.jsx
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import "./components/css/detail-pane.css";
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

      {/* 본문: 사이드바 만큼 오른쪽, 네비바 만큼 아래로 오프셋 */}
      <main
        style={{
          marginLeft: SIDEBAR_W,
        }}
      >
        <div className="container-fluid py-3">
          {currentOutlet}
        </div>
      </main>
    </>
  );
}
