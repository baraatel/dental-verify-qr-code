
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinicData } from '@/hooks/useClinicData';
import { useDeleteClinic } from '@/hooks/useClinicCRUD';
import { useClearAllClinics, useExportClinicsCSV } from '@/hooks/useClinicBulkOperations';
import { Search, Plus, Edit, Trash2, Eye, Phone, MapPin, Calendar, QrCode, Download, Database, Filter, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import ClinicDialog from './ClinicDialog';
import QRCodeGenerator from './QRCodeGenerator';
import { Clinic } from '@/types/clinic';

const ClinicManagement: React.FC = () => {
  const { data: clinics = [], isLoading, error } = useClinicData();
  const deleteMutation = useDeleteClinic();
  const clearAllMutation = useClearAllClinics();
  const { exportToCSV } = useExportClinicsCSV();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  
  const itemsPerPage = 10;

  // Get unique specializations for filter options
  const uniqueSpecializations = Array.from(new Set(
    clinics
      .map(clinic => clinic.specialization)
      .filter(spec => spec && spec.trim() !== '')
  )).sort();

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = clinic.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || clinic.license_status === statusFilter;
    const matchesSpecialization = specializationFilter === 'all' || clinic.specialization === specializationFilter;
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClinics = filteredClinics.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">صالح</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي</Badge>;
      case 'suspended':
        return <Badge variant="destructive">معلق</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSpecializationFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== 'all' || specializationFilter !== 'all' || searchTerm !== '';

  const handleCreateClick = () => {
    setSelectedClinic(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEditClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleViewClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowDetails(true);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting clinic:', error);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(clinics);
  };

  const handleClearAll = async () => {
    try {
      await clearAllMutation.mutateAsync();
    } catch (error) {
      console.error('Error clearing all clinics:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p>خطأ في تحميل البيانات</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showDetails && selectedClinic) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>تفاصيل العيادة</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleEditClick(selectedClinic)}>
              <Edit className="h-4 w-4 mr-2" />
              تعديل
            </Button>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              العودة للقائمة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedClinic.clinic_name}</h3>
                <p className="text-gray-600">{selectedClinic.specialization}</p>
                {getStatusBadge(selectedClinic.license_status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">رقم الترخيص:</span>
                    <span className="font-mono">{selectedClinic.license_number}</span>
                  </div>
                  
                  {selectedClinic.doctor_name && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">اسم الطبيب:</span>
                      <span>{selectedClinic.doctor_name}</span>
                    </div>
                  )}

                  {selectedClinic.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedClinic.phone}</span>
                    </div>
                  )}

                  {selectedClinic.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedClinic.address}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">معلومات الترخيص</h4>
                  
                  {selectedClinic.issue_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        تاريخ الإصدار: {new Date(selectedClinic.issue_date).toLocaleDateString('ar-JO')}
                      </span>
                    </div>
                  )}

                  {selectedClinic.expiry_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        تاريخ الانتهاء: {new Date(selectedClinic.expiry_date).toLocaleDateString('ar-JO')}
                      </span>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="font-medium">عدد مرات التحقق: </span>
                    <span>{selectedClinic.verification_count}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              {selectedClinic.qr_code && (
                <QRCodeGenerator 
                  value={selectedClinic.qr_code}
                  title="رمز QR للعيادة"
                  showDownload={true}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>إدارة العيادات</span>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عيادة
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث عن العيادات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="gap-2"
                disabled={clinics.length === 0}
              >
                <Download className="h-4 w-4" />
                تصدير CSV
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    disabled={clinics.length === 0 || clearAllMutation.isPending}
                  >
                    <Database className="h-4 w-4" />
                    مسح جميع البيانات
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد مسح جميع البيانات</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من حذف جميع العيادات من قاعدة البيانات؟ 
                      سيتم حذف {clinics.length} عيادة وجميع البيانات المرتبطة بها.
                      <br /><br />
                      <strong>تحذير: لا يمكن التراجع عن هذا الإجراء!</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAll}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={clearAllMutation.isPending}
                    >
                      {clearAllMutation.isPending ? 'جاري المسح...' : 'مسح جميع البيانات'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Filters Row */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">فلترة:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="حالة الترخيص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">صالح</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="suspended">معلق</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="التخصص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التخصصات</SelectItem>
                  {uniqueSpecializations.map((specialization) => (
                    <SelectItem key={specialization} value={specialization}>
                      {specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-gray-600">الفلاتر المفعلة:</span>
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    الحالة: {statusFilter === 'active' ? 'صالح' : statusFilter === 'expired' ? 'منتهي' : statusFilter === 'suspended' ? 'معلق' : 'قيد المراجعة'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setStatusFilter('all')}
                    />
                  </Badge>
                )}
                {specializationFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    التخصص: {specializationFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSpecializationFilter('all')}
                    />
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    البحث: {searchTerm}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Summary */}
            <div className="text-sm text-gray-600">
              عرض {filteredClinics.length} من أصل {clinics.length} عيادة
              {hasActiveFilters && ' (مفلترة)'}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم العيادة</TableHead>
                  <TableHead>رقم الترخيص</TableHead>
                  <TableHead>الطبيب</TableHead>
                  <TableHead>التخصص</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>عدد التحقق</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClinics.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-medium">{clinic.clinic_name}</TableCell>
                    <TableCell className="font-mono">{clinic.license_number}</TableCell>
                    <TableCell>{clinic.doctor_name || '-'}</TableCell>
                    <TableCell>{clinic.specialization}</TableCell>
                    <TableCell>{getStatusBadge(clinic.license_status)}</TableCell>
                    <TableCell className="dir-ltr">{clinic.verification_count}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClick(clinic)}
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(clinic)}
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="حذف">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف عيادة "{clinic.clinic_name}"؟ 
                                لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteClick(clinic.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <div className="text-sm text-gray-600 text-center">
            عرض {startIndex + 1} إلى {Math.min(startIndex + itemsPerPage, filteredClinics.length)} من أصل {filteredClinics.length} عيادة
          </div>
        </CardContent>
      </Card>

      <ClinicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clinic={selectedClinic}
        mode={dialogMode}
      />
    </>
  );
};

export default ClinicManagement;
