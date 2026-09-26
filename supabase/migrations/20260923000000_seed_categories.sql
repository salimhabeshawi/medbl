begin;

-- Restore the seven canonical bilingual categories. These are the values the
-- app expects to exist (see AGENTS.md → categories). Safe to re-run: the insert
-- matches on the unique name_en column and does nothing for rows already there.
insert into public.categories (name_en, name_am)
values
  ('Love', 'ፍቅር'),
  ('Culture', 'ባህል'),
  ('Nature', 'ተፈጥሮ'),
  ('Spirituality', 'መንፈሳዊነት'),
  ('Society', 'ህብረተሰብ'),
  ('History', 'ታሪክ'),
  ('Contemporary', 'ዘመናዊ')
on conflict (name_en) do nothing;

commit;
