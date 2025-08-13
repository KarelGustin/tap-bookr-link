-- Update publish validation rules to allow either booking_url OR WhatsApp integration
-- This makes the system more flexible for businesses that don't use booking software

-- Drop the old validation trigger
drop trigger if exists trg_profiles_validate_publish on public.profiles;

-- Create new validation function that allows either booking_url OR WhatsApp
create or replace function public.validate_publish_rules()
returns trigger as $$
begin
  if new.status = 'published' then
    -- Require a business name
    if new.name is null or length(trim(new.name)) = 0 then
      raise exception 'Publishing requires a business name';
    end if;
    
    -- Require either a booking URL OR WhatsApp integration
    if (new.booking_url is null or length(trim(new.booking_url)) = 0) 
       and (new.use_whatsapp is not true or new.whatsapp_number is null or length(trim(new.whatsapp_number)) = 0) then
      raise exception 'Publishing requires either a booking URL or WhatsApp integration';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- Recreate the validation trigger
create trigger if not exists trg_profiles_validate_publish
before insert or update on public.profiles
for each row execute function public.validate_publish_rules();
