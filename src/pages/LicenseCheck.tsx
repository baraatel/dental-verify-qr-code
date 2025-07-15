
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowRight, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LicenseCheck = () => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [clinicData, setClinicData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
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
    },
    "LIC003": {
      name: "عيادة الابتسامة المشرقة",
      licenseNumber: "LIC003",
      address: "شارع التحلية، الخبر",
      phone: "013-555-7890",
      specialty: "جراحة الفم والأسنان",
      doctorName: "د. محمد حسن",
      issueDate: "2023-08-20",
      expiryDate: "2025-08-20",
      status: "valid"
    }
  };

  const handleSearch = async () => {
    if (!licenseNumber.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال رقم الترخيص",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const clinic = mockClinics[licenseNumber as keyof typeof mockClinics];
      if (clinic) {
        setClinicData(clinic);
        // Add to search history if not already present
        if (!searchHistory.includes(licenseNumber)) {
          setSearchHistory(prev => [licenseNumber, ...prev.slice(0, 4)]);
        }
        toast({
          title: "تم العثور على العيادة",
          description: "تم استرجاع بيانات العيادة بنجاح",
        });
      } else {
        setClinicData(null);
        toast({
          title: "العيادة غير موجودة",
          description: "لم يتم العثور على عيادة بهذا الرقم",
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

  const handleHistoryClick = (license: string) => {
    setLicenseNumber(license);
    handleSearchForLicense(license);
  };

  const handleSearchForLicense = async (license: string) => {
    setLoading(true);
    const clinic = mockClinics[license as keyof typeof mockClinics];
    await new Promise(resolve => setTimeout(resolve, 800));
    setClinicData(clinic || null);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "text-green-600 bg-green-50 border-green-200";
      case "expired": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-yellow-600 bg-yellow-50 border-yellow-200";
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
              <h1 className="text-2xl font-bold text-gray-800">البحث برقم الترخيص</h1>
              <p className="text-gray-600">أدخل رقم الترخيص للتحقق من صحته</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Search className="h-6 w-6 text-green-600" />
                  <span>البحث</span>
                </CardTitle>
                <CardDescription>
                  أدخل رقم الترخيص للبحث
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="license-input" className="block text-sm font-medium mb-2">
                    رقم الترخيص
                  </Label>
                  <Input
                    id="license-input"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="مثال: LIC001"
                    className="w-full"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 ml-2" />
                      بحث
                    </>
                  )}
                </Button>

                {/* Sample License Numbers */}
                <div className="border-t pt-4">
                  <Label className="block text-sm font-medium mb-2">أمثلة للتجربة:</Label>
                  <div className="space-y-2">
                    {Object.keys(mockClinics).map((license) => (
                      <Button
                        key={license}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLicenseNumber(license);
                          handleSearchForLicense(license);
                        }}
                        className="w-full text-left justify-start"
                      >
                        {license}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="block text-sm font-medium mb-2">البحث السابق:</Label>
                    <div className="space-y-1">
                      {searchHistory.map((license, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHistoryClick(license)}
                          className="w-full text-left justify-start text-gray-600"
                        >
                          <FileText className="h-3 w-3 ml-2" />
                          {license}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>نتائج البحث</CardTitle>
                <CardDescription>
                  بيانات العيادة ومعلومات الترخيص
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg">جاري البحث عن البيانات...</p>
                    <p className="text-gray-500 text-sm mt-2">قد يستغرق هذا بضع ثوانٍ</p>
                  </div>
                ) : clinicData ? (
                  <div className="space-y-6">
                    {/* Status Badge */}
                    <div className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 ${getStatusColor(clinicData.status)}`}>
                      {getStatusIcon(clinicData.status)}
                      <span className="font-bold text-lg">
                        {getStatusText(clinicData.status)}
                      </span>
                    </div>

                    {/* Clinic Information Card */}
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">اسم العيادة</Label>
                            <p className="text-xl font-bold text-gray-800 mt-1">{clinicData.name}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">رقم الترخيص</Label>
                            <p className="text-lg font-semibold text-blue-600 mt-1">{clinicData.licenseNumber}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">اسم الطبيب</Label>
                            <p className="text-lg text-gray-800 mt-1">{clinicData.doctorName}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">التخصص</Label>
                            <p className="text-lg text-gray-800 mt-1">{clinicData.specialty}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">العنوان</Label>
                            <p className="text-lg text-gray-800 mt-1">{clinicData.address}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">الهاتف</Label>
                            <p className="text-lg text-gray-800 mt-1" dir="ltr">{clinicData.phone}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">تاريخ الإصدار</Label>
                              <p className="text-gray-800 mt-1">{clinicData.issueDate}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">تاريخ الانتهاء</Label>
                              <p className="text-gray-800 mt-1">{clinicData.expiryDate}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Actions */}
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={() => window.print()}>
                        طباعة البيانات
                      </Button>
                      <Button 
                        onClick={() => {
                          navigator.share?.({
                            title: 'بيانات العيادة',
                            text: `${clinicData.name} - ${clinicData.licenseNumber}`,
                          });
                        }}
                      >
                        مشاركة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                    <p className="text-xl mb-2">لم يتم البحث بعد</p>
                    <p className="text-sm">أدخل رقم الترخيص في الخانة المخصصة للبدء</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseCheck;
