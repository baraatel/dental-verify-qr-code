
import React from 'react';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminContent = () => {
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    toast({
      title: "تم تسجيل الخروج بنجاح",
      description: "نراك قريباً",
    });
    // إعادة تحميل الصفحة لإظهار شاشة تسجيل الدخول
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط علوي للإدارة */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">لوحة تحكم الإدارة</span>
          </div>
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

      <div className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>
      <Footer />
    </div>
  );
};

const Admin = () => {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
};

export default Admin;
