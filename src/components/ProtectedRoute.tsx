
import React, { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (adminLoggedIn === 'true' && loginTime) {
      // فحص انتهاء الجلسة (24 ساعة)
      const loginTimestamp = parseInt(loginTime);
      const currentTime = Date.now();
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 ساعة
      
      if (currentTime - loginTimestamp < sessionDuration) {
        setIsAuthenticated(true);
      } else {
        // انتهت الجلسة
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // حالة التحميل
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // إذا لم يكن مصادق عليه
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // إذا كان مصادق عليه
  return <>{children}</>;
};

export default ProtectedRoute;
