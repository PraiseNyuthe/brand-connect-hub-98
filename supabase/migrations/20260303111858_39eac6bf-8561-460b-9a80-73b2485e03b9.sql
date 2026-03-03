
-- Managers table (activated accounts) - created first as other tables reference it
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  year_started INTEGER NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin status (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.managers WHERE user_id = _user_id AND is_admin = true
  )
$$;

-- Create security definer function to check if user is a verified manager
CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.managers WHERE user_id = _user_id
  )
$$;

CREATE POLICY "Verified managers can view all managers" ON public.managers
  FOR SELECT USING (public.is_manager(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "System can insert managers" ON public.managers
  FOR INSERT WITH CHECK (true);

-- Create table for brand verification form submissions
CREATE TABLE public.brand_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  year_started INTEGER NOT NULL,
  founders TEXT NOT NULL,
  contact TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application" ON public.brand_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can view applications" ON public.brand_applications
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admin can update applications" ON public.brand_applications
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Verification codes issued to approved managers
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.brand_applications(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage codes" ON public.verification_codes
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can check codes for activation" ON public.verification_codes
  FOR SELECT USING (true);

CREATE POLICY "Mark code as used on activation" ON public.verification_codes
  FOR UPDATE USING (true);

-- Messages in communication hub
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL REFERENCES public.managers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified managers can view messages" ON public.messages
  FOR SELECT USING (public.is_manager(auth.uid()));

CREATE POLICY "Verified managers can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    public.is_manager(auth.uid()) AND
    EXISTS (SELECT 1 FROM public.managers WHERE user_id = auth.uid() AND id = manager_id)
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
