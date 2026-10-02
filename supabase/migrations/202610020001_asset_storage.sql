-- Private storage bucket for seller-submitted property photographs.
-- Uploads are written only by the server using the Supabase service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('seller-inquiries', 'seller-inquiries', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Staff can view seller inquiry photos" on storage.objects;
create policy "Staff can view seller inquiry photos" on storage.objects
for select to authenticated
using (bucket_id = 'seller-inquiries' and public.is_staff());
