
-- Drop the overly permissive update policy on verification_codes
DROP POLICY "Mark code as used on activation" ON public.verification_codes;

-- More restrictive: only allow updating 'used' field, and only for unused codes
CREATE POLICY "Mark code as used on activation" ON public.verification_codes
  FOR UPDATE USING (used = false)
  WITH CHECK (used = true);
