
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

const ExcelUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateTemplate = () => {
    const templateData = [
      {
        'اسم العيادة': 'عيادة المثال للأسنان',
        'رقم الترخيص': 'JOR-DEN-XXX',
        'اسم الطبيب': 'د. محمد أحمد',
        'التخصص': 'طب الأسنان العام',
        'حالة الترخيص': 'active',
        'تاريخ الإصدار': '2024-01-01',
        'تاريخ الانتهاء': '2026-01-01',
        'رقم الهاتف': '+962 6 123 4567',
        'العنوان': 'عمان، الأردن'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'العيادات');
    XLSX.writeFile(wb, 'نموذج_العيادات.xlsx');

    toast({
      title: "تم تحميل النموذج",
      description: "يمكنك الآن ملء البيانات ورفع الملف",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results = {
        total: jsonData.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        setUploadProgress(((i + 1) / jsonData.length) * 100);

        try {
          const clinicData = {
            clinic_name: row['اسم العيادة'] || row['clinic_name'],
            license_number: row['رقم الترخيص'] || row['license_number'],
            doctor_name: row['اسم الطبيب'] || row['doctor_name'],
            specialization: row['التخصص'] || row['specialization'],
            license_status: row['حالة الترخيص'] || row['license_status'] || 'active',
            issue_date: row['تاريخ الإصدار'] || row['issue_date'],
            expiry_date: row['تاريخ الانتهاء'] || row['expiry_date'],
            phone: row['رقم الهاتف'] || row['phone'],
            address: row['العنوان'] || row['address'],
            qr_code: row['رقم الترخيص'] || row['license_number'],
          };

          if (!clinicData.clinic_name || !clinicData.license_number || !clinicData.specialization) {
            throw new Error(`الصف ${i + 1}: بيانات مطلوبة مفقودة`);
          }

          const { error } = await supabase
            .from('clinics')
            .insert(clinicData);

          if (error) {
            throw error;
          }

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`الصف ${i + 1}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }

        // تأخير صغير لتجنب الضغط على قاعدة البيانات
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUploadResults(results);
      
      toast({
        title: "تم رفع الملف",
        description: `تم إضافة ${results.success} عيادة بنجاح، فشل في ${results.failed}`,
      });

    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      toast({
        title: "خطأ في رفع الملف",
        description: "حدث خطأ أثناء معالجة الملف",
        variant: "destructive",
      });
    }

    setIsUploading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          رفع ملف Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <Button
            onClick={generateTemplate}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            تحميل نموذج Excel
          </Button>

          <div className="text-sm text-gray-600">
            <p>1. حمل النموذج واملأ البيانات</p>
            <p>2. احفظ الملف واختره للرفع</p>
            <p>3. انتظر حتى يتم رفع جميع البيانات</p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'جاري الرفع...' : 'اختيار ملف Excel'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center text-gray-600">
              {uploadProgress.toFixed(0)}% مكتمل
            </p>
          </div>
        )}

        {uploadResults && (
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">نتائج الرفع</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">نجح: {uploadResults.success}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">فشل: {uploadResults.failed}</span>
                </div>
                {uploadResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">الأخطاء:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                      {uploadResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
