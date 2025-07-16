
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClinicData } from '@/hooks/useClinicData';
import { Building2, FileCheck, AlertTriangle, TrendingUp, QrCode, Search, Upload, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QRScanner from './QRScanner';
import LicenseVerificationResult from './LicenseVerificationResult';
import ExcelUpload from './ExcelUpload';
import ClinicManagement from './ClinicManagement';

const Dashboard: React.FC = () => {
  const { data: clinics = [], isLoading } = useClinicData();
  const [activeView, setActiveView] = useState<'dashboard' | 'qr' | 'upload' | 'manage'>('dashboard');
  const [verificationResult, setVerificationResult] = useState<{
    clinic: any;
    status: 'success' | 'failed' | 'not_found';
    licenseNumber: string;
  } | null>(null);

  const totalClinics = clinics.length;
  const activeClinics = clinics.filter(c => c.license_status === 'active').length;
  const expiredClinics = clinics.filter(c => c.license_status === 'expired').length;
  const suspendedClinics = clinics.filter(c => c.license_status === 'suspended').length;
  const totalVerifications = clinics.reduce((sum, clinic) => sum + (clinic.verification_count || 0), 0);

  const getStatusColor = (count: number, total: number) => {
    const percentage = (count / total) * 100;
    if (percentage > 80) return 'text-green-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleQRScan = (result: string) => {
    const clinic = clinics.find(c => c.license_number === result || c.qr_code === result);
    setVerificationResult({
      clinic: clinic || null,
      status: clinic ? 'success' : 'not_found',
      licenseNumber: result
    });
  };

  if (activeView === 'qr') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">مسح رمز QR</h2>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            العودة للوحة التحكم
          </Button>
        </div>
        
        <QRScanner onScan={handleQRScan} />
        
        {verificationResult && (
          <LicenseVerificationResult
            clinic={verificationResult.clinic}
            status={verificationResult.status}
            licenseNumber={verificationResult.licenseNumber}
          />
        )}
      </div>
    );
  }

  if (activeView === 'upload') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">رفع ملف Excel</h2>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            العودة للوحة التحكم
          </Button>
        </div>
        
        <ExcelUpload />
      </div>
    );
  }

  if (activeView === 'manage') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">إدارة العيادات</h2>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            العودة للوحة التحكم
          </Button>
        </div>
        
        <ClinicManagement />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <Badge variant="outline" className="text-sm">
          آخر تحديث: {new Date().toLocaleDateString('ar-JO')}
        </Badge>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العيادات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClinics}</div>
            <p className="text-xs text-muted-foreground">
              عيادة مسجلة في النظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التراخيص الصالحة</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(activeClinics, totalClinics)}`}>
              {activeClinics}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalClinics > 0 ? ((activeClinics / totalClinics) * 100).toFixed(1) : 0}% من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التراخيص المنتهية</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredClinics + suspendedClinics}</div>
            <p className="text-xs text-muted-foreground">
              {expiredClinics} منتهية، {suspendedClinics} معلقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عمليات التحقق</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalVerifications}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي مرات التحقق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الإجراءات السريعة */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => setActiveView('qr')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <QrCode className="h-6 w-6" />
              <span>مسح رمز QR</span>
            </Button>

            <Button
              onClick={() => setActiveView('manage')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Search className="h-6 w-6" />
              <span>البحث والإدارة</span>
            </Button>

            <Button
              onClick={() => setActiveView('upload')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Upload className="h-6 w-6" />
              <span>رفع ملف Excel</span>
            </Button>

            <Button
              className="h-20 flex flex-col gap-2"
              variant="outline"
              disabled
            >
              <Settings className="h-6 w-6" />
              <span>الإعدادات</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* العيادات المنتهية الصلاحية */}
      {expiredClinics > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تنبيه: عيادات منتهية الصلاحية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              يوجد {expiredClinics} عيادة منتهية الصلاحية تحتاج لتجديد التراخيص
            </p>
            <Button
              variant="destructive"
              onClick={() => setActiveView('manage')}
            >
              عرض العيادات المنتهية
            </Button>
          </CardContent>
        </Card>
      )}

      {/* آخر العيادات المضافة */}
      <Card>
        <CardHeader>
          <CardTitle>آخر العيادات المضافة</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">جاري التحميل...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clinics.slice(0, 5).map((clinic) => (
                <div key={clinic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{clinic.clinic_name}</h4>
                    <p className="text-sm text-gray-600">{clinic.specialization}</p>
                  </div>
                  <div className="text-left">
                    <Badge
                      variant={clinic.license_status === 'active' ? 'default' : 'destructive'}
                      className="mb-1"
                    >
                      {clinic.license_status === 'active' ? 'صالح' : 'منتهي'}
                    </Badge>
                    <p className="text-xs text-gray-500">{clinic.license_number}</p>
                  </div>
                </div>
              ))}
              
              {clinics.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  لا توجد عيادات مسجلة حتى الآن
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
