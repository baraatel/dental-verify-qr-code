import React, { useState } from 'react';
import ClinicManagement from './ClinicManagement';
import SpecializationManagement from './SpecializationManagement';
import SiteSettingsManagement from './SiteSettingsManagement';
import AnalyticsReport from './AnalyticsReport';
import QRScanner from './QRScanner';
import VerificationResultDialog from './VerificationResultDialog';
import ExcelUpload from './ExcelUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2, Stethoscope, Settings, BarChart3, RefreshCw, QrCode, Camera } from 'lucide-react';
import { useUpdateExpiredLicenses } from '@/hooks/useUpdateExpiredLicenses';
import { useClearAllQRCodes } from '@/hooks/useClinicBulkOperations';
import { useVerifyLicense } from '@/hooks/useClinicData';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const updateExpiredMutation = useUpdateExpiredLicenses();
  const clearQRMutation = useClearAllQRCodes();
  const { verifyLicense } = useVerifyLicense();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    clinic: any;
    status: 'success' | 'failed' | 'not_found';
    licenseNumber: string;
  } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const handleUpdateExpiredLicenses = async () => {
    try {
      const result = await updateExpiredMutation.mutateAsync();
      toast({
        title: "تم تحديث التراخيص المنتهية",
        description: `تم تحديث ${result.updated_count} ترخيص منتهي`,
      });
    } catch (error) {
      console.error('Error updating expired licenses:', error);
      toast({
        title: "خطأ في تحديث التراخيص",
        description: "حدث خطأ أثناء تحديث التراخيص المنتهية",
        variant: "destructive",
      });
    }
  };

  const handleClearQRCodes = async () => {
    try {
      await clearQRMutation.mutateAsync();
      toast({
        title: "تم مسح رموز QR",
        description: "تم مسح جميع رموز QR للعيادات",
      });
    } catch (error) {
      console.error('Error clearing QR codes:', error);
      toast({
        title: "خطأ في مسح رموز QR",
        description: "حدث خطأ أثناء مسح رموز QR",
        variant: "destructive",
      });
    }
  };

  const handleQRScan = async (result: string) => {
    try {
      console.log('QR Scan result received:', result);
      const verificationResult = await verifyLicense(result, 'qr_scan');
      console.log('Verification result:', verificationResult);
      
      setVerificationResult({
        clinic: verificationResult.clinic,
        status: verificationResult.status,
        licenseNumber: result
      });
      setShowResultDialog(true);
      setShowQRScanner(false);
    } catch (error) {
      console.error('خطأ في التحقق:', error);
      setVerificationResult({
        clinic: null,
        status: 'failed',
        licenseNumber: result
      });
      setShowResultDialog(true);
      setShowQRScanner(false);
    }
  };

  const handleScanAgain = () => {
    setShowResultDialog(false);
    setVerificationResult(null);
    setShowQRScanner(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الإدارة</h1>
        <p className="text-gray-600">إدارة شاملة لنظام التحقق من تراخيص العيادات</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-start flex-wrap">
        <Button
          onClick={handleUpdateExpiredLicenses}
          disabled={updateExpiredMutation.isPending}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {updateExpiredMutation.isPending ? 'جاري التحديث...' : 'تحديث التراخيص المنتهية'}
        </Button>
        <Button
          onClick={handleClearQRCodes}
          disabled={clearQRMutation.isPending}
          variant="outline"
          className="gap-2"
        >
          <QrCode className="h-4 w-4" />
          {clearQRMutation.isPending ? 'جاري المسح...' : 'مسح رموز QR من قاعدة البيانات'}
        </Button>
        <Button
          onClick={() => setShowQRScanner(true)}
          variant="secondary"
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          مسح رمز QR للتحقق
        </Button>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">مسح رمز QR</h2>
              <Button
                variant="ghost"
                onClick={() => setShowQRScanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <QRScanner 
              onScan={handleQRScan}
              onClose={() => setShowQRScanner(false)}
            />
          </div>
        </div>
      )}

      <Tabs defaultValue="clinics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clinics" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            إدارة العيادات
          </TabsTrigger>
          <TabsTrigger value="specializations" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            إدارة التخصصات
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إعدادات الموقع
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            التقارير والإحصائيات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinics" className="space-y-6">
          <ExcelUpload />
          <ClinicManagement />
        </TabsContent>

        <TabsContent value="specializations">
          <SpecializationManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SiteSettingsManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsReport />
        </TabsContent>
      </Tabs>

      {/* نافذة النتائج المنبثقة */}
      <VerificationResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        clinic={verificationResult?.clinic || null}
        status={verificationResult?.status || 'failed'}
        licenseNumber={verificationResult?.licenseNumber || ''}
        onScanAgain={handleScanAgain}
      />
    </div>
  );
};

export default Dashboard;
