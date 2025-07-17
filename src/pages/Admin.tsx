
import React from 'react';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, Navigate } from 'react-router-dom';

const Admin = () => {
  const { user, isLoading, isAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check admin requirement
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600 mb-6">هذه الصفحة مخصصة للمدراء فقط</p>
          <Link to="/">
            <Button className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">لوحة تحكم الإدارة</span>
              <p className="text-sm text-gray-500">مرحباً، {user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                الصفحة الرئيسية
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
