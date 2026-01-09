-- Add published_at column for the actual news publication date
ALTER TABLE public.grid_news
ADD COLUMN published_at timestamp with time zone;