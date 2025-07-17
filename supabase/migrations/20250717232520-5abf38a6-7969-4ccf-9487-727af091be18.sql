
-- First, let's check if the user exists and get their ID
-- Then set them as admin in the profiles table
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'baratel@gmail.com';

-- Also add them to the user_roles table for extra security
-- First get the user_id from profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'baratel@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
