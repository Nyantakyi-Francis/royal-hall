-- Seed rooms and logistics items

insert into public.rooms (blog, code, capacity)
values
  ('MAIN_BLOG', 'MAIN', 60),
  ('TRASSACO_BLOG', 'R1', 6),
  ('TRASSACO_BLOG', 'R2', 6),
  ('TRASSACO_BLOG', 'R3', 6),
  ('TRASSACO_BLOG', 'R4', 6),
  ('TRASSACO_BLOG', 'R5', 6),
  ('TRASSACO_BLOG', 'R6', 6),
  ('TRASSACO_BLOG', 'R7', 6),
  ('TRASSACO_BLOG', 'R8', 6),
  ('TRASSACO_BLOG', 'R9', 6),
  ('ANNEX_BLOG', '1A', 35),
  ('ANNEX_BLOG', '1B', 25),
  ('ANNEX_BLOG', '1C', 25),
  ('ANNEX_BLOG', '1D', 10),
  ('EAST_LEGON_BLOG', 'R16', 6),
  ('EAST_LEGON_BLOG', 'R17', 6),
  ('EAST_LEGON_BLOG', 'R18', 6),
  ('EAST_LEGON_BLOG', 'R19', 6)
on conflict (code) do nothing;


insert into public.logistics_items (
  item_description,
  quantity,
  good_condition,
  poor_condition,
  items_in_store,
  items_in_use
)
values
  ('Fan', 26, 18, 8, 0, 18),
  ('Mattress', 211, 210, 1, 0, 210),
  ('Bucket', 62, 42, 20, 7, 35),
  ('Scrubbing brush', 60, 28, 32, 10, 18),
  ('T-roll', 63, null, null, 12, null),
  ('Long broom', 57, 26, 31, 7, 19),
  ('Metal bed', 123, 113, 10, 0, 113)
on conflict (item_description) do nothing;

