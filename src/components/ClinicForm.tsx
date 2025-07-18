
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSpecializations } from '@/hooks/useSpecializations';
import { ClinicFormData } from '@/hooks/useClinicCRUD';
import { Clinic } from '@/types/clinic';

const formSchema = z.object({
  clinic_name: z.string().min(1, 'اسم العيادة مطلوب'),
  doctor_name: z.string().optional(),
  license_number: z.string().min(1, 'رقم الترخيص مطلوب'),
  specialization: z.string().min(1, 'التخصص مطلوب'),
  phone: z.string().optional(),
  address: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  license_status: z.enum(['active', 'expired', 'suspended', 'pending']).default('active'),
});

interface ClinicFormProps {
  clinic?: Clinic;
  onSubmit: (data: ClinicFormData) => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const ClinicForm: React.FC<ClinicFormProps> = ({
  clinic,
  onSubmit,
  isLoading = false,
  mode,
}) => {
  const { toast } = useToast();
  const { data: specializations, isLoading: specializationsLoading } = useSpecializations();

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clinic_name: clinic?.clinic_name || '',
      doctor_name: clinic?.doctor_name || '',
      license_number: clinic?.license_number || '',
      specialization: clinic?.specialization || '',
      phone: clinic?.phone || '',
      address: clinic?.address || '',
      issue_date: clinic?.issue_date || '',
      expiry_date: clinic?.expiry_date || '',
      license_status: clinic?.license_status || 'active',
    },
  });

  const handleSubmit = (data: ClinicFormData) => {
    console.log('Form submitted with data:', data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clinic_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم العيادة *</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم العيادة" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الطبيب</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الطبيب" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="license_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الترخيص *</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم الترخيص" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التخصص *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={specializationsLoading ? "جاري التحميل..." : "اختر التخصص"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specializations?.map((spec) => (
                      <SelectItem key={spec.id} value={spec.name_ar}>
                        {spec.name_ar}
                        {spec.name_en && <span className="text-gray-500 text-sm"> ({spec.name_en})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم الهاتف" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="license_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حالة الترخيص</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الترخيص" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                    <SelectItem value="suspended">معلق</SelectItem>
                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الإصدار</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ انتهاء الصلاحية</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <Input placeholder="أدخل عنوان العيادة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button type="submit" disabled={isLoading || specializationsLoading}>
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClinicForm;
