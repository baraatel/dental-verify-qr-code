
import React, { useState } from 'react';
import ClinicManagement from './ClinicManagement';
import SpecializationManagement from './SpecializationManagement';
import SiteSettingsManagement from './SiteSettingsManagement';
import AnalyticsReport from './AnalyticsReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2, Stethoscope, Settings, BarChart3, RefreshCw, QrCode } from 'lucide-react';
import { useUpdateExpiredLicenses } from '@/hooks/useUpdateExpiredLicenses';
import { useClearAllQRCodes } from '@/hooks/useClinicBulkOperations';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const updateExpiredMutation = useUpdateExpiredLicenses();
  const clearQRMutation = useClearAllQRCodes();

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

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الإدارة</h1>
        <p className="text-gray-600">إدارة شاملة لنظام التحقق من تراخيص العيادات</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-start">
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
          {clearQRMutation.isPending ? 'جاري المسح...' : 'مسح رموز QR'}
        </Button>
      </div>

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

        <TabsContent value="clinics">
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
    </div>
  );
};

export default Dashboard;
