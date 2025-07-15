
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Search, Building2, FileSpreadsheet, Shield, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">نظام التحقق من تراخيص العيادات</h1>
                <p className="text-sm text-gray-600">التحقق السريع والآمن من تراخيص عيادات الأسنان</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Building2 className="h-4 w-4 ml-2" />
                  لوحة الإدارة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              تحقق من <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">ترخيص العيادة</span> بسهولة
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              استخدم كود QR أو رقم الترخيص للتأكد من صحة ترخيص العيادة في ثوانٍ معدودة
            </p>

            {/* Main Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Link to="/qr-scan">
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">مسح كود QR</CardTitle>
                    <CardDescription className="text-blue-100">
                      امسح كود QR الخاص بالعيادة للتحقق الفوري
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/license-check">
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Search className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">البحث برقم الترخيص</CardTitle>
                    <CardDescription className="text-green-100">
                      أدخل رقم الترخيص للتحقق من صحته
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">مميزات النظام</h3>
            <p className="text-xl text-gray-600">نظام شامل ومتطور للتحقق من تراخيص العيادات</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">تحقق آمن وسريع</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">نظام تحقق متقدم يضمن صحة المعلومات في ثوانٍ معدودة</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">تقنية QR متطورة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">استخدام أحدث تقنيات QR Code للتحقق السريع والدقيق</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">إدارة شاملة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">إضافة وإدارة العيادات بسهولة مع دعم ملفات Excel</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">نظام التحقق من تراخيص العيادات</span>
          </div>
          <p className="text-gray-400">نظام آمن وموثوق للتحقق من تراخيص عيادات الأسنان</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
