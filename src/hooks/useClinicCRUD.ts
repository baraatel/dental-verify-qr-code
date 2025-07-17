
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/types/clinic";
import { useToast } from "@/hooks/use-toast";

export interface ClinicFormData {
  clinic_name: string;
  license_number: string;
  doctor_name?: string;
  specialization: string;
  license_status: 'active' | 'expired' | 'suspended' | 'pending';
  issue_date?: string;
  expiry_date?: string;
  phone?: string;
  address?: string;
}

export const useCreateClinic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clinicData: ClinicFormData) => {
      // Validate input data
      if (!clinicData.clinic_name.trim()) {
        throw new Error("اسم العيادة مطلوب");
      }
      
      if (!clinicData.license_number.trim()) {
        throw new Error("رقم الترخيص مطلوب");
      }

      // Sanitize license number
      const sanitizedLicenseNumber = clinicData.license_number.trim().toUpperCase();
      
      // Check if license number already exists
      const { data: existingClinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("license_number", sanitizedLicenseNumber)
        .maybeSingle();

      if (existingClinic) {
        throw new Error("رقم الترخيص موجود مسبقاً");
      }

      const { data, error } = await supabase
        .from("clinics")
        .insert({
          ...clinicData,
          license_number: sanitizedLicenseNumber,
          clinic_name: clinicData.clinic_name.trim(),
          doctor_name: clinicData.doctor_name?.trim() || null,
          phone: clinicData.phone?.trim() || null,
          address: clinicData.address?.trim() || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating clinic:", error);
        throw new Error(error.message || "خطأ في إنشاء العيادة");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast({
        title: "تم إنشاء العيادة بنجاح",
        description: "تم إضافة العيادة وإنشاء رمز QR تلقائياً",
      });
    },
    onError: (error: any) => {
      console.error("Create clinic error:", error);
      toast({
        title: "خطأ في إنشاء العيادة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateClinic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...clinicData }: ClinicFormData & { id: string }) => {
      // Validate input data
      if (!clinicData.clinic_name.trim()) {
        throw new Error("اسم العيادة مطلوب");
      }
      
      if (!clinicData.license_number.trim()) {
        throw new Error("رقم الترخيص مطلوب");
      }

      // Sanitize license number
      const sanitizedLicenseNumber = clinicData.license_number.trim().toUpperCase();
      
      // Check if license number exists for other clinics
      const { data: existingClinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("license_number", sanitizedLicenseNumber)
        .neq("id", id)
        .maybeSingle();

      if (existingClinic) {
        throw new Error("رقم الترخيص موجود لعيادة أخرى");
      }

      const { data, error } = await supabase
        .from("clinics")
        .update({
          ...clinicData,
          license_number: sanitizedLicenseNumber,
          clinic_name: clinicData.clinic_name.trim(),
          doctor_name: clinicData.doctor_name?.trim() || null,
          phone: clinicData.phone?.trim() || null,
          address: clinicData.address?.trim() || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating clinic:", error);
        throw new Error(error.message || "خطأ في تحديث العيادة");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast({
        title: "تم تحديث العيادة بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: any) => {
      console.error("Update clinic error:", error);
      toast({
        title: "خطأ في تحديث العيادة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteClinic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error("معرف العيادة مطلوب");
      }

      const { error } = await supabase
        .from("clinics")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting clinic:", error);
        throw new Error(error.message || "خطأ في حذف العيادة");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast({
        title: "تم حذف العيادة بنجاح",
        description: "تم إزالة العيادة من النظام",
      });
    },
    onError: (error: any) => {
      console.error("Delete clinic error:", error);
      toast({
        title: "خطأ في حذف العيادة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });
};
