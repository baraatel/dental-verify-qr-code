import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clinic } from "@/types/clinic";

export const useClearAllClinics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("clinics")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast({
        title: "تم مسح جميع العيادات بنجاح",
        description: "تم حذف جميع البيانات من قاعدة البيانات",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في مسح البيانات",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useExportClinicsCSV = () => {
  const { toast } = useToast();

  const exportToCSV = (clinics: Clinic[]) => {
    if (clinics.length === 0) {
      toast({
        title: "لا توجد بيانات للتصدير",
        description: "لا توجد عيادات في قاعدة البيانات",
        variant: "destructive",
      });
      return;
    }

    // Define CSV headers in Arabic
    const headers = [
      "اسم العيادة",
      "رقم الترخيص", 
      "اسم الطبيب",
      "التخصص",
      "حالة الترخيص",
      "رقم الهاتف",
      "العنوان",
      "تاريخ الإصدار",
      "تاريخ الانتهاء",
      "عدد مرات التحقق",
      "تاريخ الإنشاء"
    ];

    // Convert clinics data to CSV rows
    const csvRows = [
      headers.join(','),
      ...clinics.map(clinic => [
        `"${clinic.clinic_name || ''}"`,
        `"${clinic.license_number || ''}"`,
        `"${clinic.doctor_name || ''}"`,
        `"${clinic.specialization || ''}"`,
        `"${clinic.license_status || ''}"`,
        `"${clinic.phone || ''}"`,
        `"${clinic.address || ''}"`,
        `"${clinic.issue_date ? new Date(clinic.issue_date).toLocaleDateString('ar-JO') : ''}"`,
        `"${clinic.expiry_date ? new Date(clinic.expiry_date).toLocaleDateString('ar-JO') : ''}"`,
        `"${clinic.verification_count || 0}"`,
        `"${new Date(clinic.created_at).toLocaleDateString('ar-JO')}"`
      ].join(','))
    ];

    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `clinics_export_${timestamp}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم تصدير البيانات بنجاح",
      description: `تم تصدير ${clinics.length} عيادة إلى ملف CSV`,
    });
  };

  return { exportToCSV };
};