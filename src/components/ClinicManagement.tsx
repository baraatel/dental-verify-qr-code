
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useClinicData } from '@/hooks/useClinicData';
import { Search, Plus, Edit, Trash2, Eye, Phone, MapPin, Calendar } from 'lucide-react';
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ClinicManagement: React.FC = () => {
  const { data: clinics = [], isLoading, error } = useClinicData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;

  const filteredClinics = clinics.filter(clinic =>
    clinic.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const viewClinicDetails = (clinic: any) => {
    setSelectedClinic(clinic);
    setShowDetails(true);
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
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>تفاصيل العيادة</CardTitle>
          <Button variant="outline" onClick={() => setShowDetails(false)}>
            العودة للقائمة
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedClinic.clinic_name}</h3>
                <p className="text-gray-600">{selectedClinic.specialization}</p>
                {getStatusBadge(selectedClinic.license_status)}
              </div>

              <div className="space-y-2">
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
            </div>

            <div className="space-y-4">
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

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">رمز QR</h4>
                <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 text-center">
                  <div className="font-mono text-lg">{selectedClinic.qr_code || selectedClinic.license_number}</div>
                  <p className="text-xs text-gray-500 mt-1">امسح هذا الرمز للتحقق السريع</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>إدارة العيادات</span>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة عيادة
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  <TableCell>{clinic.verification_count}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewClinicDetails(clinic)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
  );
};

export default ClinicManagement;
