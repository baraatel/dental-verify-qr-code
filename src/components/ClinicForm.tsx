
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Clinic } from '@/types/clinic';
import { ClinicFormData } from '@/hooks/useClinicCRUD';
import QRCodeGenerator from './QRCodeGenerator';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const clinicSchema = z.object({
  clinic_name: z.string().min(1, 'اسم العيادة مطلوب'),
  license_number: z.string().min(1, 'رقم الترخيص مطلوب'),
  doctor_name: z.string().optional(),
  specialization: z.string().min(1, 'التخصص مطلوب'),
  license_status: z.enum(['active', 'expired', 'suspended', 'pending']),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

interface ClinicFormProps {
  clinic?: Clinic;
  onSubmit: (data: ClinicFormData) => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// Common dental and medical specializations in Arabic
const specializations = [
  'طب الأسنان العام',
  'جراحة الفم والوجه والفكين',
  'تقويم الأسنان',
  'طب أسنان الأطفال',
  'علاج الجذور',
  'أمراض اللثة',
  'تركيبات الأسنان',
  'جراحة الأسنان',
  'طب الأسنان التجميلي',
  'زراعة الأسنان',
  'الطب العام',
  'طب الأطفال',
  'أمراض النساء والتوليد',
  'الجراحة العامة',
  'طب القلب',
  'أمراض الجهاز الهضمي',
  'طب العيون',
  'أنف وأذن وحنجرة',
  'جراحة العظام',
  'الأمراض الجلدية',
  'الطب النفسي',
  'طب الأعصاب',
  'أمراض الكلى',
  'أمراض الرئة',
  'الأشعة التشخيصية',
  'التخدير',
  'طب الطوارئ',
  'الطب الباطني'
];

const ClinicForm: React.FC<ClinicFormProps> = ({ 
  clinic, 
  onSubmit, 
  isLoading = false,
  mode 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      clinic_name: clinic?.clinic_name || '',
      license_number: clinic?.license_number || '',
      doctor_name: clinic?.doctor_name || '',
      specialization: clinic?.specialization || '',
      license_status: clinic?.license_status || 'active',
      issue_date: clinic?.issue_date || '',
      expiry_date: clinic?.expiry_date || '',
      phone: clinic?.phone || '',
      address: clinic?.address || '',
    }
  });

  // Enhanced form submission with better error handling
  const handleFormSubmit = async (data: ClinicFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Form submission started:', data);
      
      // Validate network connectivity
      if (!navigator.onLine) {
        toast({
          title: "لا يوجد اتصال بالإنترنت",
          description: "تأكد من اتصالك بالإنترنت وحاول مرة أخرى",
          variant: "destructive",
        });
        return;
      }

      await onSubmit(data);
      console.log('Form submission completed successfully');
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء حفظ البيانات. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedValues = watch();

  useEffect(() => {
    if (clinic) {
      Object.keys(clinic).forEach((key) => {
        const value = clinic[key as keyof Clinic];
        if (value !== null && value !== undefined) {
          setValue(key as keyof ClinicFormData, value as any);
        }
      });
    }
  }, [clinic, setValue]);

  // Generate preview QR code data
  const generatePreviewQR = () => {
    if (watchedValues.license_number) {
      return JSON.stringify({
        type: 'clinic',
        license: watchedValues.license_number,
        id: clinic?.id || 'new',
        issued: new Date().toISOString().split('T')[0]
      });
    }
    return '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'create' ? 'إضافة عيادة جديدة' : 'تعديل بيانات العيادة'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinic_name">اسم العيادة *</Label>
                  <Input
                    id="clinic_name"
                    {...register('clinic_name')}
                    placeholder="أدخل اسم العيادة"
                  />
                  {errors.clinic_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.clinic_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="license_number">رقم الترخيص *</Label>
                  <Input
                    id="license_number"
                    {...register('license_number')}
                    placeholder="JOR-DEN-001"
                  />
                  {errors.license_number && (
                    <p className="text-sm text-red-600 mt-1">{errors.license_number.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="doctor_name">اسم الطبيب</Label>
                  <Input
                    id="doctor_name"
                    {...register('doctor_name')}
                    placeholder="د. أحمد محمد"
                  />
                </div>

                <div>
                  <Label htmlFor="specialization">التخصص *</Label>
                  <Select
                    value={watchedValues.specialization || ''}
                    onValueChange={(value) => setValue('specialization', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialization && (
                    <p className="text-sm text-red-600 mt-1">{errors.specialization.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="license_status">حالة الترخيص</Label>
                  <Select
                    value={watchedValues.license_status}
                    onValueChange={(value) => setValue('license_status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الترخيص" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">صالح</SelectItem>
                      <SelectItem value="expired">منتهي</SelectItem>
                      <SelectItem value="suspended">معلق</SelectItem>
                      <SelectItem value="pending">قيد المراجعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+962 6 123 4567"
                  />
                </div>

                <div>
                  <Label htmlFor="issue_date">تاريخ الإصدار</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    {...register('issue_date')}
                  />
                </div>

                <div>
                  <Label htmlFor="expiry_date">تاريخ الانتهاء</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    {...register('expiry_date')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="عنوان العيادة الكامل"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || isSubmitting || !navigator.onLine}
                  className="flex items-center gap-2"
                >
                  {(isLoading || isSubmitting) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {mode === 'create' ? 'إضافة العيادة' : 'حفظ التغييرات'}
                    </>
                  )}
                </Button>
                {!navigator.onLine && (
                  <p className="text-sm text-red-600 flex items-center">
                    لا يوجد اتصال بالإنترنت
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>معاينة رمز QR</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeGenerator 
              value={generatePreviewQR()}
              title="رمز QR للعيادة"
              showDownload={mode === 'edit'}
            />
            {mode === 'create' && (
              <p className="text-xs text-gray-500 mt-2">
                سيتم إنشاء رمز QR نهائي عند حفظ العيادة
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicForm;
