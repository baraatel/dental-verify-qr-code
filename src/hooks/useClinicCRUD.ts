
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/types/clinic";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

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
      console.log('Creating clinic with data:', clinicData);
      
      const { data, error } = await supabase
        .from("clinics")
        .insert(clinicData)
        .select()
        .single();

      if (error) {
        console.error('Create clinic error:', error);
        throw error;
      }
      
      console.log('Clinic created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      // Optimistic update: immediately add to cache
      queryClient.setQueryData(["clinics"], (old: Clinic[] | undefined) => {
        if (!old) return [data];
        return [data, ...old];
      });
      
      // Also invalidate to ensure sync
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      
      toast({
        title: "تم إنشاء العيادة بنجاح",
        description: "تم إضافة العيادة وإنشاء رمز QR تلقائياً",
      });
    },
    onError: (error: any) => {
      console.error('Failed to create clinic:', error);
      toast({
        title: "خطأ في إنشاء العيادة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
    // Mobile-optimized retry configuration
    retry: (failureCount, error) => {
      if (failureCount < 2 && navigator.onLine !== false) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });
};

export const useUpdateClinic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...clinicData }: ClinicFormData & { id: string }) => {
      console.log('Updating clinic:', id, 'with data:', clinicData);
      
      const { data, error } = await supabase
        .from("clinics")
        .update(clinicData)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Update clinic error:', error);
        throw error;
      }
      
      console.log('Clinic updated successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      // Optimistic update: immediately update cache
      queryClient.setQueryData(["clinics"], (old: Clinic[] | undefined) => {
        if (!old || !data) return old;
        return old.map(clinic => 
          clinic.id === variables.id ? { ...clinic, ...data } : clinic
        );
      });
      
      // Also invalidate to ensure sync
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      
      toast({
        title: "تم تحديث العيادة بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: any, variables) => {
      console.error('Failed to update clinic:', variables.id, error);
      toast({
        title: "خطأ في تحديث العيادة",
        description: error.message || "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    },
    // Mobile-optimized retry configuration
    retry: (failureCount, error) => {
      if (failureCount < 2 && navigator.onLine !== false) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });
};

export const useDeleteClinic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting clinic:', id);
      
      const { error } = await supabase
        .from("clinics")
        .delete()
        .eq("id", id);

      if (error) {
        console.error('Delete clinic error:', error);
        throw error;
      }
      
      console.log('Clinic deleted successfully:', id);
    },
    onSuccess: (_, deletedId) => {
      // Optimistic update: immediately remove from cache
      queryClient.setQueryData(["clinics"], (old: Clinic[] | undefined) => {
        if (!old) return old;
        return old.filter(clinic => clinic.id !== deletedId);
      });
      
      // Also invalidate to ensure sync
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      
      toast({
        title: "تم حذف العيادة بنجاح",
        description: "تم إزالة العيادة من النظام",
      });
    },
    onError: (error: any, deletedId) => {
      console.error('Failed to delete clinic:', deletedId, error);
      toast({
        title: "خطأ في حذف العيادة",
        description: error.message || "فشل في حذف العيادة",
        variant: "destructive",
      });
    },
    // Mobile-optimized retry configuration
    retry: (failureCount, error) => {
      if (failureCount < 2 && navigator.onLine !== false) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
  });
};

// Network status detection hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "تم استعادة الاتصال",
        description: "عاد الاتصال بالإنترنت",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "انقطع الاتصال",
        description: "لا يوجد اتصال بالإنترنت",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
};
