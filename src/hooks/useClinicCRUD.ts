
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
      const { data, error } = await supabase
        .from("clinics")
        .insert(clinicData)
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: "خطأ في إنشاء العيادة",
        description: error.message,
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
      const { data, error } = await supabase
        .from("clinics")
        .update(clinicData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: "خطأ في تحديث العيادة",
        description: error.message,
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
      const { error } = await supabase
        .from("clinics")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast({
        title: "تم حذف العيادة بنجاح",
        description: "تم إزالة العيادة من النظام",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف العيادة",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
