
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Search, Shield, Users, LogIn, LogOut, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, isAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header with authentication */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">نظام التحقق من التراخيص</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                    {isAdmin && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        مدير
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        لوحة التحكم
                      </Button>
                    </Link>
                  )}
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
              ) : (
                <Link to="/auth">
                  <Button variant="outline" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            نظام التحقق من تراخيص العيادات
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            تحقق من صحة تراخيص العيادات الطبية في الأردن بسهولة وأمان
          </p>

          {/* Admin Quick Access - يظهر فقط للمدراء */}
          {user && isAdmin && (
            <div className="mb-12">
              <Card className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
                    <Settings className="h-6 w-6" />
                    وصول سريع للإدارة
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    أدر النظام وتحكم في العيادات والتراخيص
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/admin">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      دخول لوحة التحكم
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-6 w-6 text-blue-600" />
                مسح رمز QR
              </CardTitle>
              <CardDescription>
                استخدم كاميرا هاتفك لمسح رمز QR الخاص بالترخيص
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/qr-scan">
                <Button className="w-full">ابدأ المسح</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-6 w-6 text-green-600" />
                البحث اليدوي
              </CardTitle>
              <CardDescription>
                أدخل رقم الترخيص يدوياً للتحقق من صحته
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/license-check">
                <Button variant="outline" className="w-full">ابدأ البحث</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">مميزات النظام</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">آمن ومحمي</h3>
              <p className="text-gray-600 text-sm">نظام آمن مع تشفير البيانات وحماية المعلومات</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <QrCode className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">سهل الاستخدام</h3>
              <p className="text-gray-600 text-sm">واجهة بسيطة ومسح سريع لرموز QR</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">موثوق</h3>
              <p className="text-gray-600 text-sm">نتائج فورية ودقيقة من مصادر رسمية</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
