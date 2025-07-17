
-- First, let's create a proper user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table for more flexible role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on profiles and user_roles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR public.get_current_user_role() = 'admin';
$$;

-- Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing database functions to be more secure
CREATE OR REPLACE FUNCTION generate_clinic_qr(license_num TEXT, clinic_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN json_build_object(
    'type', 'clinic',
    'license', license_num,
    'id', clinic_id_param,
    'issued', CURRENT_DATE,
    'version', '1.0'
  )::text;
END;
$$;

CREATE OR REPLACE FUNCTION auto_generate_qr_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Generate QR code if not provided
  IF NEW.qr_code IS NULL OR NEW.qr_code = '' THEN
    NEW.qr_code = generate_clinic_qr(NEW.license_number, NEW.id);
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Enable all operations for clinics" ON public.clinics;

-- Create secure RLS policies for clinics
CREATE POLICY "Anyone can view active clinics"
  ON public.clinics
  FOR SELECT
  USING (license_status = 'active');

CREATE POLICY "Admins can view all clinics"
  ON public.clinics
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert clinics"
  ON public.clinics
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update clinics"
  ON public.clinics
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete clinics"
  ON public.clinics
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Update verifications policies to be more secure
DROP POLICY IF EXISTS "Anyone can create verifications" ON public.verifications;
DROP POLICY IF EXISTS "Anyone can view verifications" ON public.verifications;

CREATE POLICY "Anyone can create verifications"
  ON public.verifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view verifications"
  ON public.verifications
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can view all verifications"
  ON public.verifications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update verifications"
  ON public.verifications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete verifications"
  ON public.verifications
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- User roles policies
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add rate limiting for verifications (simple approach using timestamps)
CREATE TABLE public.verification_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_verification_rate_limits_ip_time ON public.verification_rate_limits(ip_address, window_start);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_verification_rate_limit(client_ip INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clean old entries (older than 1 hour)
  DELETE FROM public.verification_rate_limits 
  WHERE window_start < now() - INTERVAL '1 hour';
  
  -- Check current requests in the last hour
  SELECT COUNT(*) INTO current_count
  FROM public.verification_rate_limits
  WHERE ip_address = client_ip
    AND window_start > now() - INTERVAL '1 hour';
  
  -- Allow up to 100 requests per hour per IP
  IF current_count >= 100 THEN
    RETURN FALSE;
  END IF;
  
  -- Log this request
  INSERT INTO public.verification_rate_limits (ip_address)
  VALUES (client_ip);
  
  RETURN TRUE;
END;
$$;
