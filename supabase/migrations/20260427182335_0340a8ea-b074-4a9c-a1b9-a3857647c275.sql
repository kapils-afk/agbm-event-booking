
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_no TEXT NOT NULL UNIQUE,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  donor_name TEXT NOT NULL,
  mobile TEXT,
  pan TEXT,
  amount NUMERIC(12,2) NOT NULL,
  amount_in_words TEXT,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  purpose TEXT NOT NULL,
  collected_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Anyone can manage donations" ON public.donations FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_donations_mobile ON public.donations(mobile);
CREATE INDEX idx_donations_name ON public.donations(donor_name);
CREATE INDEX idx_donations_date ON public.donations(donation_date DESC);
