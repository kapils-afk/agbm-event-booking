-- Create contact_enquiries table
CREATE TABLE public.contact_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert enquiries"
  ON public.contact_enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view enquiries"
  ON public.contact_enquiries FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update enquiries"
  ON public.contact_enquiries FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete enquiries"
  ON public.contact_enquiries FOR DELETE
  USING (true);

CREATE TRIGGER update_contact_enquiries_updated_at
  BEFORE UPDATE ON public.contact_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_contact_enquiries_created_at ON public.contact_enquiries (created_at DESC);