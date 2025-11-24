// src/components/layout/AuthLayout.jsx

import { useOutlet } from 'react-router-dom';

function AuthLayout() {
  const currentOutlet = useOutlet();

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      {currentOutlet}
    </div>
  );
}

export default AuthLayout;