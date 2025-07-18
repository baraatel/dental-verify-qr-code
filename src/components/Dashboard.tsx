import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClinicData } from '@/hooks/useClinicData';
import { useUpdateExpiredLicenses } from '@/hooks/useUpdateExpiredLicenses';
import { Building2, FileCheck, AlertTriangle, TrendingUp, QrCode, Search, Upload, Settings, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from 'react-error-boundary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Lazy load heavy components to prevent initialization issues
const QRScanner = React.lazy(() => import('./QRScanner'));
const LicenseVerificationResult = React.lazy(() => import('./LicenseVerificationResult'));
const ExcelUpload = React.lazy(() => import('./ExcelUpload'));
const ClinicManagement = React.lazy(() => import('./ClinicManagement'));

const LoadingComponent = () => (
  <div className="text-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
    <p className="mt-2 text-sm text-gray-600">جاري التحميل...</p>
  </div>
);

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="text-center py-8">
    <p className="text-red-600 mb-4">حدث خطأ في تحميل المحتوى</p>
    <Button onClick={resetErrorBoundary} variant="outline">
      إعادة المحاولة
    </Button>
  </div>
);

const Dashboard: React.FC = () => {
  const { data: clinics = [], isLoading } = useClinicData();
  const updateExpiredLicenses = useUpdateExpiredLicenses();
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

  // Count clinics expiring within 30 days
  const nearExpiryClinics = clinics.filter(clinic => {
    if (!clinic.expiry_date) return false;
    const expiryDate = new Date(clinic.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date() && clinic.license_status === 'active';
  }).length;

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

  const handleManualUpdate = async () => {
    try {
      await updateExpiredLicenses.mutateAsync();
    } catch (error) {
      console.error('Manual update failed:', error);
    }
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
        
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingComponent />}>
            <QRScanner onScan={handleQRScan} />
          </Suspense>
        </ErrorBoundary>
        
        {verificationResult && (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingComponent />}>
              <LicenseVerificationResult
                clinic={verificationResult.clinic}
                status={verificationResult.status}
                licenseNumber={verificationResult.licenseNumber}
              />
            </Suspense>
          </ErrorBoundary>
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
        
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingComponent />}>
            <ExcelUpload />
          </Suspense>
        </ErrorBoundary>
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
        
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingComponent />}>
            <ClinicManagement />
          </Suspense>
        </ErrorBoundary>
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

      {/* تنبيه للعيادات القريبة من الانتهاء */}
      {nearExpiryClinics > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تنبيه: عيادات قريبة من انتهاء الصلاحية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 mb-4">
              يوجد {nearExpiryClinics} عيادة ستنتهي صلاحيتها خلال 30 يوم
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveView('manage')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              عرض العيادات القريبة من الانتهاء
            </Button>
          </CardContent>
        </Card>
      )}

      {/* الإجراءات السريعة */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="h-20 flex flex-col gap-2"
                  variant="outline"
                  disabled={updateExpiredLicenses.isPending}
                >
                  <RefreshCw className={`h-6 w-6 ${updateExpiredLicenses.isPending ? 'animate-spin' : ''}`} />
                  <span>تحديث التراخيص فوراً</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد تحديث التراخيص</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم فحص جميع العيادات وتحديث حالة التراخيص المنتهية تلقائياً.
                    <br /><br />
                    هذه العملية آمنة ولن تؤثر على البيانات الصحيحة.
                    <br />
                    المجموع الحالي: {totalClinics} عيادة
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleManualUpdate}
                    disabled={updateExpiredLicenses.isPending}
                  >
                    {updateExpiredLicenses.isPending ? 'جاري التحديث...' : 'تحديث الآن'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setActiveView('manage')}
              >
                عرض العيادات المنتهية
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    تحديث فوري
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تحديث العيادات المنتهية</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم تحديث حالة جميع العيادات المنتهية الصلاحية ({expiredClinics} عيادة).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleManualUpdate}>
                      تحديث الآن
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
            <LoadingComponent />
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
