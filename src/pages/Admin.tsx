import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  FileSpreadsheet, 
  Building2, 
  ArrowRight, 
  Upload,
  Users,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  QrCode
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const Admin = () => {
  const [newClinic, setNewClinic] = useState({
    name: "",
    licenseNumber: "",
    doctorName: "",
    specialty: "",
    address: "",
    phone: "",
    issueDate: "",
    expiryDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([
    {
      id: 1,
      name: "عيادة النور لطب الأسنان",
      licenseNumber: "LIC001",
      doctorName: "د. أحمد محمد",
      specialty: "طب الأسنان العام",
      address: "شارع الملك فهد، الرياض",
      phone: "011-123-4567",
      status: "valid"
    },
    {
      id: 2,
      name: "مجمع الصحة الطبي",
      licenseNumber: "LIC002",
      doctorName: "د. فاطمة علي",
      specialty: "تقويم الأسنان",
      address: "طريق الأمير محمد بن سلمان، جدة",
      phone: "012-987-6543",
      status: "expired"
    }
  ]);
  
  const { toast } = useToast();

  const handleAddClinic = async () => {
    if (!newClinic.name || !newClinic.licenseNumber) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const clinic = {
        id: Date.now(),
        ...newClinic,
        status: "valid"
      };
      
      setClinics(prev => [...prev, clinic]);
      setNewClinic({
        name: "",
        licenseNumber: "",
        doctorName: "",
        specialty: "",
        address: "",
        phone: "",
        issueDate: "",
        expiryDate: ""
      });
      
      toast({
        title: "تم إضافة العيادة",
        description: "تم إضافة العيادة بنجاح إلى النظام",
      });
    } catch (error) {
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء إضافة العيادة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate Excel processing
      toast({
        title: "جاري رفع الملف",
        description: "سيتم معالجة ملف Excel وإضافة العيادات",
      });
      
      setTimeout(() => {
        toast({
          title: "تم رفع الملف بنجاح",
          description: "تم إضافة 15 عيادة جديدة من ملف Excel",
        });
      }, 2000);
    }
  };

  const deleteClinic = (id: number) => {
    setClinics(prev => prev.filter(clinic => clinic.id !== id));
    toast({
      title: "تم حذف العيادة",
      description: "تم حذف العيادة من النظام",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">لوحة الإدارة</h1>
              <p className="text-gray-600">إدارة العيادات وتراخيصها</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">العيادات المسجلة:</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {clinics.length}
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي العيادات</p>
                  <p className="text-2xl font-bold text-gray-800">{clinics.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التراخيص الصالحة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {clinics.filter(c => c.status === 'valid').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التراخيص المنتهية</p>
                  <p className="text-2xl font-bold text-red-600">
                    {clinics.filter(c => c.status === 'expired').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="add-clinic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add-clinic">إضافة عيادة</TabsTrigger>
            <TabsTrigger value="bulk-upload">رفع ملف Excel</TabsTrigger>
            <TabsTrigger value="manage-clinics">إدارة العيادات</TabsTrigger>
          </TabsList>

          {/* Add Single Clinic */}
          <TabsContent value="add-clinic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Plus className="h-6 w-6 text-green-600" />
                  <span>إضافة عيادة جديدة</span>
                </CardTitle>
                <CardDescription>
                  أدخل بيانات العيادة الجديدة وسيتم إنتاج QR Code تلقائياً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clinic-name">اسم العيادة *</Label>
                      <Input
                        id="clinic-name"
                        value={newClinic.name}
                        onChange={(e) => setNewClinic(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="مثال: عيادة النور لطب الأسنان"
                      />
                    </div>

                    <div>
                      <Label htmlFor="license-number">رقم الترخيص *</Label>
                      <Input
                        id="license-number"
                        value={newClinic.licenseNumber}
                        onChange={(e) => setNewClinic(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        placeholder="مثال: LIC001"
                      />
                    </div>

                    <div>
                      <Label htmlFor="doctor-name">اسم الطبيب</Label>
                      <Input
                        id="doctor-name"
                        value={newClinic.doctorName}
                        onChange={(e) => setNewClinic(prev => ({ ...prev, doctorName: e.target.value }))}
                        placeholder="مثال: د. أحمد محمد"
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialty">التخصص</Label>
                      <Select onValueChange={(value) => setNewClinic(prev => ({ ...prev, specialty: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التخصص" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">طب الأسنان العام</SelectItem>
                          <SelectItem value="orthodontics">تقويم الأسنان</SelectItem>
                          <SelectItem value="surgery">جراحة الفم والأسنان</SelectItem>
                          <SelectItem value="pediatric">طب أسنان الأطفال</SelectItem>
                          <SelectItem value="periodontics">أمراض اللثة</SelectItem>
                          <SelectItem value="endodontics">علاج الجذور</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Textarea
                        id="address"
                        value={newClinic.address}
                        onChange={(e) => setNewClinic(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="العنوان الكامل للعيادة"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={newClinic.phone}
                        onChange={(e) => setNewClinic(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="مثال: 011-123-4567"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="issue-date">تاريخ الإصدار</Label>
                        <Input
                          id="issue-date"
                          type="date"
                          value={newClinic.issueDate}
                          onChange={(e) => setNewClinic(prev => ({ ...prev, issueDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiry-date">تاريخ الانتهاء</Label>
                        <Input
                          id="expiry-date"
                          type="date"
                          value={newClinic.expiryDate}
                          onChange={(e) => setNewClinic(prev => ({ ...prev, expiryDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleAddClinic}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة العيادة
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Upload */}
          <TabsContent value="bulk-upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  <span>رفع ملف Excel</span>
                </CardTitle>
                <CardDescription>
                  ارفع ملف Excel يحتوي على بيانات عدة عيادات لإضافتها دفعة واحدة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">ارفع ملف Excel</p>
                    <p className="text-gray-500 mb-4">يدعم النظام ملفات .xlsx و .xls</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="excel-upload"
                    />
                    <Button asChild>
                      <label htmlFor="excel-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 ml-2" />
                        اختيار ملف
                      </label>
                    </Button>
                  </div>

                  {/* Excel Template Info */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-800">تنسيق ملف Excel المطلوب</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-700 mb-4">يجب أن يحتوي الملف على الأعمدة التالية:</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p><strong>اسم العيادة</strong> (مطلوب)</p>
                          <p><strong>رقم الترخيص</strong> (مطلوب)</p>
                          <p><strong>اسم الطبيب</strong></p>
                          <p><strong>التخصص</strong></p>
                        </div>
                        <div className="space-y-2">
                          <p><strong>العنوان</strong></p>
                          <p><strong>رقم الهاتف</strong></p>
                          <p><strong>تاريخ الإصدار</strong></p>
                          <p><strong>تاريخ الانتهاء</strong></p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4">
                        تحميل نموذج Excel
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Clinics */}
          <TabsContent value="manage-clinics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <span>إدارة العيادات</span>
                </CardTitle>
                <CardDescription>
                  عرض وإدارة جميع العيادات المسجلة في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clinics.map((clinic) => (
                    <Card key={clinic.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{clinic.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                clinic.status === 'valid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {clinic.status === 'valid' ? 'صالح' : 'منتهي'}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <p><strong>الترخيص:</strong> {clinic.licenseNumber}</p>
                              <p><strong>الطبيب:</strong> {clinic.doctorName}</p>
                              <p><strong>التخصص:</strong> {clinic.specialty}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>QR Code - {clinic.name}</DialogTitle>
                                  <DialogDescription>
                                    كود QR الخاص بالعيادة
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-center py-4">
                                  <QRCodeDisplay value={clinic.licenseNumber} size={200} />
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">
                                    يمكن للمرضى مسح هذا الكود للتحقق من ترخيص العيادة
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteClinic(clinic.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
