-- Create storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-images', 'verification-images', true);

-- Create RLS policies for the bucket
CREATE POLICY "Anyone can view verification images"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-images');

CREATE POLICY "Anyone can upload verification images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verification-images');