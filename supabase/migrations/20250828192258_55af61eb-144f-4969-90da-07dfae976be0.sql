-- Create cron job to check expired previews every 5 minutes
SELECT cron.schedule(
  'check-expired-previews',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://rllgepvklxqyhegrqodw.supabase.co/functions/v1/check-expired-previews',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGdlcHZrbHhxeWhlZ3Jxb2R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxMDU3MSwiZXhwIjoyMDcwNDg2NTcxfQ.yVOKKjw0gJA2gfd8Mv3k_WIHo8adN1yvgpwS6b3isjQ"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);