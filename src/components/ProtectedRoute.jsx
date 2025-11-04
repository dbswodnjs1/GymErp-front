// src/components/ProtectedRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const user = useSelector(s => s.user);
    const location = useLocation();
    
    // 디버깅: 현재 값 확인
    // console.log('[Guard]', location.pathname, 'user=', user);
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
}
