-- Create public storage bucket for admin-uploaded images (events, gallery, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-assets',
  'public-assets',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'];

-- Public read
DROP POLICY IF EXISTS "Public can view public-assets" ON storage.objects;
CREATE POLICY "Public can view public-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

-- Public upload (admin authenticates via app-level session, not Supabase auth)
DROP POLICY IF EXISTS "Public can upload public-assets" ON storage.objects;
CREATE POLICY "Public can upload public-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public-assets');

DROP POLICY IF EXISTS "Public can update public-assets" ON storage.objects;
CREATE POLICY "Public can update public-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public-assets');

DROP POLICY IF EXISTS "Public can delete public-assets" ON storage.objects;
CREATE POLICY "Public can delete public-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'public-assets');