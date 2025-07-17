
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clinic, VerificationResult } from "@/types/clinic";

export const useClinicData = () => {
  return useQuery({
    queryKey: ["clinics"],
    queryFn: async (): Promise<Clinic[]> => {
      console.log("Fetching clinics data...");
      
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching clinics:", error);
        throw error;
      }

      // Type assertion to ensure proper typing
      return (data || []).map(clinic => ({
        ...clinic,
        license_status: clinic.license_status as 'active' | 'expired' | 'suspended' | 'pending'
      }));
    },
  });
};

export const useVerifyLicense = () => {
  const verifyLicense = async (
    licenseNumber: string,
    method: 'qr_scan' | 'manual_entry' | 'image_upload'
  ): Promise<VerificationResult> => {
    console.log(`Verifying license: ${licenseNumber} via ${method}`);
    
    // Sanitize license number input
    const sanitizedLicenseNumber = licenseNumber.trim().toUpperCase();
    
    // Validate license number format (basic validation)
    if (!/^[A-Z0-9-]+$/.test(sanitizedLicenseNumber)) {
      throw new Error("تنسيق رقم الترخيص غير صحيح");
    }
    
    if (sanitizedLicenseNumber.length < 5 || sanitizedLicenseNumber.length > 20) {
      throw new Error("طول رقم الترخيص غير صحيح");
    }

    try {
      // Check rate limiting (if available)
      const clientIP = await fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(() => '0.0.0.0');

      // Search for clinic
      const { data: clinic, error: clinicError } = await supabase
        .from("clinics")
        .select("*")
        .eq("license_number", sanitizedLicenseNumber)
        .maybeSingle();

      if (clinicError) {
        console.error("Error searching for clinic:", clinicError);
        throw new Error("خطأ في البحث عن العيادة");
      }

      const verificationStatus = clinic ? 'success' : 'not_found';
      
      // Record verification attempt
      const { error: verificationError } = await supabase
        .from("verifications")
        .insert({
          clinic_id: clinic?.id,
          license_number: sanitizedLicenseNumber,
          verification_method: method,
          verification_status: verificationStatus,
          user_agent: navigator.userAgent,
          ip_address: clientIP,
        });

      if (verificationError) {
        console.error("Error recording verification:", verificationError);
        // Don't throw error here as verification recording is not critical
      }

      // Type assertion for clinic data if it exists
      const typedClinic = clinic ? {
        ...clinic,
        license_status: clinic.license_status as 'active' | 'expired' | 'suspended' | 'pending'
      } : null;

      return {
        clinic: typedClinic,
        status: verificationStatus as 'success' | 'failed' | 'not_found',
        licenseNumber: sanitizedLicenseNumber
      };
    } catch (error: any) {
      console.error("Verification error:", error);
      
      // Record failed verification
      try {
        await supabase
          .from("verifications")
          .insert({
            license_number: sanitizedLicenseNumber,
            verification_method: method,
            verification_status: 'failed',
            user_agent: navigator.userAgent,
          });
      } catch (recordError) {
        console.error("Error recording failed verification:", recordError);
      }

      return {
        clinic: null,
        status: 'failed' as const,
        licenseNumber: sanitizedLicenseNumber
      };
    }
  };

  return { verifyLicense };
};
