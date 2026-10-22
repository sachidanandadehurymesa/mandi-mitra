-- Mandi Mitra — demo seed data.
-- Mirrors src/lib/data/*.ts so a connected Supabase project shows the same
-- illustrative numbers as the no-database demo mode. All rows here are
-- demo/illustrative, NOT real market prices — source is tagged accordingly.

insert into villages (id, name, name_mr, taluka, district) values
  ('lasalgaon', 'Lasalgaon', 'लासलगाव', 'Niphad', 'Nashik'),
  ('vinchur', 'Vinchur', 'विंचूर', 'Niphad', 'Nashik'),
  ('pimpalgaon-b', 'Pimpalgaon Baswant', 'पिंपळगाव बसवंत', 'Niphad', 'Nashik'),
  ('niphad', 'Niphad', 'निफाड', 'Niphad', 'Nashik'),
  ('yeola', 'Yeola', 'येवला', 'Yeola', 'Nashik'),
  ('chandwad', 'Chandwad', 'चांदवड', 'Chandwad', 'Nashik'),
  ('dindori', 'Dindori', 'दिंडोरी', 'Dindori', 'Nashik'),
  ('manmad', 'Manmad', 'मनमाड', 'Nandgaon', 'Nashik'),
  ('satana', 'Satana (Baglan)', 'सटाणा (बागलाण)', 'Baglan', 'Nashik'),
  ('sinnar', 'Sinnar', 'सिन्नर', 'Sinnar', 'Nashik')
on conflict (id) do nothing;

insert into mandis (id, name, name_mr, taluka, district) values
  ('lasalgaon-apmc', 'Lasalgaon APMC', 'लासलगाव एपीएमसी', 'Niphad', 'Nashik'),
  ('pimpalgaon-apmc', 'Pimpalgaon Baswant APMC', 'पिंपळगाव बसवंत एपीएमसी', 'Niphad', 'Nashik'),
  ('niphad-apmc', 'Niphad APMC', 'निफाड एपीएमसी', 'Niphad', 'Nashik'),
  ('yeola-apmc', 'Yeola APMC', 'येवला एपीएमसी', 'Yeola', 'Nashik'),
  ('chandwad-apmc', 'Chandwad APMC', 'चांदवड एपीएमसी', 'Chandwad', 'Nashik'),
  ('dindori-apmc', 'Dindori APMC', 'दिंडोरी एपीएमसी', 'Dindori', 'Nashik'),
  ('manmad-apmc', 'Manmad APMC', 'मनमाड एपीएमसी', 'Nandgaon', 'Nashik'),
  ('nashik-apmc', 'Nashik (Main) APMC', 'नाशिक (मुख्य) एपीएमसी', 'Nashik', 'Nashik')
on conflict (id) do nothing;

insert into mandi_charges (mandi_id, commission_rate, handling_charge_per_quintal, cess_flat, notes) values
  ('lasalgaon-apmc', 0.06, 8, 40, 'Standard APMC commission + hamali'),
  ('pimpalgaon-apmc', 0.06, 10, 45, null),
  ('niphad-apmc', 0.05, 8, 35, null),
  ('yeola-apmc', 0.06, 7, 30, null),
  ('chandwad-apmc', 0.055, 9, 35, null),
  ('dindori-apmc', 0.06, 8, 40, null),
  ('manmad-apmc', 0.05, 6, 25, null),
  ('nashik-apmc', 0.065, 12, 60, 'Higher-volume main market, higher handling fee')
on conflict (mandi_id) do nothing;

insert into transport_rates (type, label, label_mr, default_rate_per_km, typical_capacity_quintals) values
  ('tractor', 'Tractor + trolley', 'ट्रॅक्टर + ट्रॉली', 18, 25),
  ('tempo', 'Tempo', 'टेम्पो', 25, 40),
  ('truck', 'Truck', 'ट्रक', 35, 100)
on conflict (type) do nothing;

-- Approximate one-way distances (km), Lasalgaon village only, for illustration.
-- See src/lib/data/distances.ts for the full demo matrix used by the app.
insert into mandi_distances (village_id, mandi_id, distance_km) values
  ('lasalgaon', 'lasalgaon-apmc', 2),
  ('lasalgaon', 'pimpalgaon-apmc', 18),
  ('lasalgaon', 'niphad-apmc', 10),
  ('lasalgaon', 'yeola-apmc', 35),
  ('lasalgaon', 'chandwad-apmc', 28),
  ('lasalgaon', 'dindori-apmc', 32),
  ('lasalgaon', 'manmad-apmc', 45),
  ('lasalgaon', 'nashik-apmc', 38)
on conflict (village_id, mandi_id) do nothing;

insert into mandi_prices (mandi_id, crop, quality, modal_price_per_quintal, price_date, source, is_quality_adjusted) values
  ('lasalgaon-apmc', 'onion', 'reference', 1850, current_date, 'demo-dataset', false),
  ('pimpalgaon-apmc', 'onion', 'reference', 1790, current_date, 'demo-dataset', false),
  ('niphad-apmc', 'onion', 'reference', 1810, current_date, 'demo-dataset', false),
  ('yeola-apmc', 'onion', 'reference', 1740, current_date, 'demo-dataset', false),
  ('chandwad-apmc', 'onion', 'reference', 1770, current_date, 'demo-dataset', false),
  ('dindori-apmc', 'onion', 'reference', 1800, current_date, 'demo-dataset', false),
  ('manmad-apmc', 'onion', 'reference', 1690, current_date, 'demo-dataset', false),
  ('nashik-apmc', 'onion', 'reference', 1920, current_date, 'demo-dataset', false);
