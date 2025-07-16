
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/types/clinic";

export const useClinicData = () => {
  return useQuery({
    queryKey: ["clinics"],
    queryFn: async (): Promise<Clinic[]> => {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching clinics:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useVerifyLicense = () => {
  const verifyLicense = async (
    licenseNumber: string,
    method: 'qr_scan' | 'manual_entry' | 'image_upload'
  ) => {
    console.log(`Verifying license: ${licenseNumber} via ${method}`);
    
    // البحث عن العيادة
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("license_number", licenseNumber)
      .single();

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

    return {
      clinic,
      status: verificationStatus,
      error: clinicError
    };
  };

  return { verifyLicense };
};
