
import React, { useState } from 'react';
import ClinicManagement from './ClinicManagement';
import SpecializationManagement from './SpecializationManagement';
import SiteSettingsManagement from './SiteSettingsManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Stethoscope, Settings, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الإدارة</h1>
        <p className="text-gray-600">إدارة شاملة لنظام التحقق من تراخيص العيادات</p>
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
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">التقارير والإحصائيات</h3>
            <p>سيتم تطوير هذا القسم قريباً</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
