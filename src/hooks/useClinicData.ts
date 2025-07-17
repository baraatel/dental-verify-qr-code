
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
    console.log(`Starting verification for license: ${licenseNumber} via ${method}`);
    
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
      console.log('Searching for clinic with license number:', sanitizedLicenseNumber);
      
      // Search for clinic
      const { data: clinic, error: clinicError } = await supabase
        .from("clinics")
        .select("*")
        .eq("license_number", sanitizedLicenseNumber)
        .maybeSingle();

      console.log('Clinic search result:', { clinic, error: clinicError });

      if (clinicError) {
        console.error("Error searching for clinic:", clinicError);
        throw new Error("خطأ في البحث عن العيادة");
      }

      const verificationStatus = clinic ? 'success' : 'not_found';
      console.log('Verification status:', verificationStatus);
      
      // Get client IP for logging
      let clientIP = '0.0.0.0';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        clientIP = ipData.ip;
      } catch (ipError) {
        console.warn('Could not fetch IP address:', ipError);
      }
      
      // Record verification attempt
      console.log('Recording verification attempt...');
      const { error: verificationError } = await supabase
        .from("verifications")
        .insert({
          clinic_id: clinic?.id || null,
          license_number: sanitizedLicenseNumber,
          verification_method: method,
          verification_status: verificationStatus,
          user_agent: navigator.userAgent,
          ip_address: clientIP,
        });

      if (verificationError) {
        console.error("Error recording verification:", verificationError);
        // Don't throw error here as verification recording is not critical
      } else {
        console.log('Verification recorded successfully');
      }

      // Type assertion for clinic data if it exists
      const typedClinic = clinic ? {
        ...clinic,
        license_status: clinic.license_status as 'active' | 'expired' | 'suspended' | 'pending'
      } : null;

      const result = {
        clinic: typedClinic,
        status: verificationStatus as 'success' | 'failed' | 'not_found',
        licenseNumber: sanitizedLicenseNumber
      };

      console.log('Final verification result:', result);
      return result;
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
