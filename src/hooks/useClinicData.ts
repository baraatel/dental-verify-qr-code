
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clinic, VerificationResult } from "@/types/clinic";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useClinicData = () => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["clinics"],
    queryFn: async (): Promise<Clinic[]> => {
      console.log('Fetching clinics data...');
      
      try {
        const { data, error } = await supabase
          .from("clinics")
          .select("*")
          .order("created_at", { ascending: false });

        console.log('Clinics query result:', { data: data?.length, error });

        if (error) {
          console.error("Error fetching clinics:", error);
          throw new Error(`خطأ في جلب البيانات: ${error.message}`);
        }

        // Type assertion to ensure proper typing
        const typedClinics = (data || []).map(clinic => ({
          ...clinic,
          license_status: clinic.license_status as 'active' | 'expired' | 'suspended' | 'pending',
          verification_count: clinic.verification_count || 0
        }));

        console.log('Successfully fetched clinics:', typedClinics.length);
        return typedClinics;
      } catch (error) {
        console.error('Error in clinic query:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      console.log('Query retry attempt:', failureCount, error);
      if (failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Set up real-time subscription for clinic changes
  useEffect(() => {
    const channel = supabase
      .channel('clinics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinics'
        },
        (payload) => {
          console.log('Real-time clinic change:', payload);
          // Invalidate and refetch queries when data changes
          query.refetch();
          
          // Show toast notification for real-time updates
          if (payload.eventType === 'INSERT') {
            toast({
              title: "عيادة جديدة",
              description: "تم إضافة عيادة جديدة",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "تحديث عيادة",
              description: "تم تحديث بيانات عيادة",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query.refetch, toast]);

  return query;
};

export const useVerifyLicense = () => {
  const verifyLicense = async (
    licenseNumber: string,
    method: 'qr_scan' | 'manual_entry' | 'image_upload'
  ): Promise<VerificationResult> => {
    console.log(`Verifying license: ${licenseNumber} via ${method}`);
    
    // البحث عن العيادة
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("license_number", licenseNumber)
      .maybeSingle();

    const verificationStatus = clinic ? 'success' : 'not_found';
    
    // تسجيل محاولة التحقق
    const { error: verificationError } = await supabase
      .from("verifications")
      .insert({
        clinic_id: clinic?.id,
        license_number: licenseNumber,
        verification_method: method,
        verification_status: verificationStatus,
        user_agent: navigator.userAgent,
      });

    if (verificationError) {
      console.error("Error recording verification:", verificationError);
    }

    // Type assertion for clinic data if it exists
    const typedClinic = clinic ? {
      ...clinic,
      license_status: clinic.license_status as 'active' | 'expired' | 'suspended' | 'pending'
    } : null;

    return {
      clinic: typedClinic,
      status: verificationStatus as 'success' | 'failed' | 'not_found',
      licenseNumber
    };
  };

  return { verifyLicense };
};
