import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const QRScan = () => {
  const [qrResult, setQrResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [clinicData, setClinicData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock clinic data for demonstration
  const mockClinics = {
    "LIC001": {
      name: "عيادة النور لطب الأسنان",
      licenseNumber: "LIC001",
      address: "شارع الملك فهد، الرياض",
      phone: "011-123-4567",
      specialty: "طب الأسنان العام",
      doctorName: "د. أحمد محمد",
      issueDate: "2023-01-15",
      expiryDate: "2025-01-15",
      status: "valid"
    },
    "LIC002": {
      name: "مجمع الصحة الطبي",
      licenseNumber: "LIC002",
      address: "طريق الأمير محمد بن سلمان، جدة",
      phone: "012-987-6543",
      specialty: "تقويم الأسنان",
      doctorName: "د. فاطمة علي",
      issueDate: "2022-06-10",
      expiryDate: "2024-06-10",
      status: "expired"
    }
  };

  const handleQRScan = async (qrData: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const clinic = mockClinics[qrData as keyof typeof mockClinics];
      if (clinic) {
        setClinicData(clinic);
        toast({
          title: "تم العثور على العيادة",
          description: "تم استرجاع بيانات العيادة بنجاح",
        });
      } else {
        setClinicData(null);
        toast({
          title: "العيادة غير موجودة",
          description: "لم يتم العثور على بيانات لهذا الرمز",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء البحث عن البيانات",
        variant: "destructive",
        
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const qrData = e.target?.result as string;
        setQrResult(qrData);
        handleQRScan(qrData);
      };
      reader.readAsText(file);
    }
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const sampleQR = "LIC001";
      setQrResult(sampleQR);
      handleQRScan(sampleQR);
      setIsScanning(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "text-green-600";
      case "expired": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "expired": return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid": return "ترخيص صالح";
      case "expired": return "ترخيص منتهي الصلاحية";
      default: return "حالة غير محددة";
    }
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
              <h1 className="text-2xl font-bold text-gray-800">مسح كود QR</h1>
              <p className="text-gray-600">امسح كود QR للتحقق من ترخيص العيادة</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Scanner Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <QrCode className="h-6 w-6 text-blue-600" />
                <span>مسح كود QR</span>
              </CardTitle>
              <CardDescription>
                استخدم الكاميرا أو ارفع صورة للكود
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Camera Scanner */}
              <div className="text-center">
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                  {isScanning ? (
                    <div className="animate-pulse">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">جاري المسح...</p>
                    </div>
                  ) : (
                    <div>
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">اضغط لبدء المسح</p>
                      <Button onClick={simulateQRScan} className="bg-blue-600 hover:bg-blue-700">
                        <Camera className="h-4 w-4 ml-2" />
                        تشغيل الكاميرا
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload Alternative */}
              <div className="border-t pt-6">
                <Label htmlFor="qr-file" className="block text-sm font-medium mb-2">
                  أو ارفع صورة الكود
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="qr-file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  اختيار صورة
                </Button>
              </div>

              {/* Manual Input */}
              <div className="border-t pt-6">
                <Label htmlFor="manual-qr" className="block text-sm font-medium mb-2">
                  إدخال يدوي للكود
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="manual-qr"
                    value={qrResult}
                    onChange={(e) => setQrResult(e.target.value)}
                    placeholder="أدخل كود QR يدوياً"
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleQRScan(qrResult)}
                    disabled={!qrResult || loading}
                  >
                    {loading ? "جاري البحث..." : "بحث"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>نتائج التحقق</CardTitle>
              <CardDescription>
                بيانات العيادة ومعلومات الترخيص
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">جاري البحث عن البيانات...</p>
                </div>
              ) : clinicData ? (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-50">
                    {getStatusIcon(clinicData.status)}
                    <span className={`font-semibold ${getStatusColor(clinicData.status)}`}>
                      {getStatusText(clinicData.status)}
                    </span>
                  </div>

                  {/* QR Code Display */}
                  <div className="flex justify-center">
                    <QRCodeDisplay value={clinicData.licenseNumber} size={150} />
                  </div>

                  {/* Clinic Information */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">اسم العيادة</Label>
                      <p className="text-lg font-semibold text-gray-800">{clinicData.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">رقم الترخيص</Label>
                      <p className="text-gray-800">{clinicData.licenseNumber}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">اسم الطبيب</Label>
                      <p className="text-gray-800">{clinicData.doctorName}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">التخصص</Label>
                      <p className="text-gray-800">{clinicData.specialty}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">العنوان</Label>
                      <p className="text-gray-800">{clinicData.address}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">الهاتف</Label>
                      <p className="text-gray-800" dir="ltr">{clinicData.phone}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">تاريخ الإصدار</Label>
                        <p className="text-gray-800">{clinicData.issueDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">تاريخ الانتهاء</Label>
                        <p className="text-gray-800">{clinicData.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>لم يتم مسح أي كود بعد</p>
                  <p className="text-sm">استخدم الكاميرا أو ارفع صورة للبدء</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRScan;
