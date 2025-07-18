
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClinicData } from '@/hooks/useClinicData';
import { Building2, AlertTriangle, CheckCircle, Clock, MapPin, Stethoscope, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsReport: React.FC = () => {
  const { data: clinics = [], isLoading, error } = useClinicData();

  const analytics = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Basic statistics
    const totalClinics = clinics.length;
    const activeClinics = clinics.filter(clinic => clinic.license_status === 'active').length;
    const expiredClinics = clinics.filter(clinic => clinic.license_status === 'expired').length;
    const pendingClinics = clinics.filter(clinic => clinic.license_status === 'pending').length;
    const suspendedClinics = clinics.filter(clinic => clinic.license_status === 'suspended').length;

    // Clinics expiring within 30 days
    const expiringClinics = clinics.filter(clinic => {
      if (!clinic.expiry_date || clinic.license_status !== 'active') return false;
      const expiryDate = new Date(clinic.expiry_date);
      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    });

    // Geographical distribution (by address/region)
    const geographicalDistribution = clinics.reduce((acc, clinic) => {
      if (!clinic.address) return acc;
      
      // Extract city/region from address
      const addressParts = clinic.address.split(',');
      const region = addressParts[addressParts.length - 1]?.trim() || 'غير محدد';
      
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const geographicalData = Object.entries(geographicalDistribution)
      .map(([region, count]) => ({
        region,
        count,
        percentage: ((count / totalClinics) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    // Specialization distribution
    const specializationDistribution = clinics.reduce((acc, clinic) => {
      const specialization = clinic.specialization || 'غير محدد';
      acc[specialization] = (acc[specialization] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const specializationData = Object.entries(specializationDistribution)
      .map(([specialization, count]) => ({
        specialization,
        count,
        percentage: ((count / totalClinics) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    // Status distribution for chart
    const statusData = [
      { name: 'صالح', value: activeClinics, color: '#10b981' },
      { name: 'منتهي', value: expiredClinics, color: '#ef4444' },
      { name: 'قيد المراجعة', value: pendingClinics, color: '#f59e0b' },
      { name: 'معلق', value: suspendedClinics, color: '#6b7280' }
    ].filter(item => item.value > 0);

    return {
      totalClinics,
      activeClinics,
      expiredClinics,
      pendingClinics,
      suspendedClinics,
      expiringClinics: expiringClinics.length,
      expiringClinicsList: expiringClinics,
      geographicalData,
      specializationData,
      statusData
    };
  }, [clinics]);

  if (isLoading) {
    return (
      <div className="text-center py-12" dir="rtl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">جاري تحميل التقارير...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600" dir="rtl">
        <p>خطأ في تحميل البيانات</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h2>
        <p className="text-gray-600">تقرير شامل عن حالة العيادات والتراخيص</p>
      </div>

      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العيادات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClinics}</div>
            <p className="text-xs text-muted-foreground">عدد العيادات المسجلة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العيادات الصالحة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.activeClinics}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.activeClinics / analytics.totalClinics) * 100).toFixed(1)}% من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العيادات المنتهية</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.expiredClinics}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.expiredClinics / analytics.totalClinics) * 100).toFixed(1)}% من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قريبة الانتهاء</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.expiringClinics}</div>
            <p className="text-xs text-muted-foreground">خلال 30 يوم القادمة</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              توزيع حالات التراخيص
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Specialization Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              توزيع التخصصات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.specializationData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="specialization" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographical Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              التوزيع الجغرافي للعيادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.geographicalData.slice(0, 10).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{item.region}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.count} عيادة</Badge>
                    <span className="text-sm text-gray-600">%{item.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clinics Expiring Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              العيادات قريبة الانتهاء (30 يوم)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {analytics.expiringClinicsList.length > 0 ? (
                analytics.expiringClinicsList.map((clinic) => (
                  <div key={clinic.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <div>
                      <p className="font-medium">{clinic.clinic_name}</p>
                      <p className="text-sm text-gray-600">{clinic.license_number}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-yellow-700">
                        {clinic.expiry_date ? new Date(clinic.expiry_date).toLocaleDateString('ar-JO') : 'غير محدد'}
                      </p>
                      <p className="text-xs text-gray-600">تاريخ الانتهاء</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>لا توجد عيادات قريبة الانتهاء</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Specialization Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل توزيع التخصصات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">التخصص</th>
                  <th className="text-right p-2">عدد العيادات</th>
                  <th className="text-right p-2">النسبة المئوية</th>
                  <th className="text-right p-2">التمثيل المرئي</th>
                </tr>
              </thead>
              <tbody>
                {analytics.specializationData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.specialization}</td>
                    <td className="p-2">{item.count}</td>
                    <td className="p-2">%{item.percentage}</td>
                    <td className="p-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsReport;
