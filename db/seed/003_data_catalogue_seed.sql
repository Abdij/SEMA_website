-- Data Catalogue seed data (generated from the real IMSMA Core
-- Geographic Data Catalogue export, data_catalogue/IMSMA Core Geographic
-- Data Catalogue.docx, run against so.imsma.org 2026-10-06).
--
-- Idempotent: every insert is guarded by `where not exists`, so this file
-- can be re-run safely. Apply with:
--   psql "$DATABASE_URL" -f db/seed/003_data_catalogue_seed.sql
--
-- District/settlement-level availability stats are NOT seeded here --
-- the source document only reports State and Region level figures. Every
-- district below is created (from the bundled Somalia COD-AB boundaries)
-- with zero stats rows, so district pages honestly show "No shared
-- records identified in the currently available catalogue" until a real
-- IMSMA sync or admin entry adds district-level data.

-- States
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'galmudug-state', 'Galmudug State', true, 'Earliest/latest dates include some pre-1990 outliers across its datasets.'
where not exists (select 1 from catalogue_geo_areas where slug = 'galmudug-state');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'south-west-state', 'South West State', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'south-west-state');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'banadir-regional', 'Banadir Regional Administration', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'banadir-regional');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'hirshabelle-state', 'Hirshabelle State', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'hirshabelle-state');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'jubaland-state', 'Jubaland State', true, 'Most internally consistent record dates of any state.'
where not exists (select 1 from catalogue_geo_areas where slug = 'jubaland-state');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'puntland-state', 'Puntland State', true, 'Mudug region''s administration is genuinely contested in SEMA''s own records: most Mudug records are attributed to Galmudug State, with a substantial minority attributed to Puntland State. This reflects real, documented contested administration around Galkayo, not a data error.'
where not exists (select 1 from catalogue_geo_areas where slug = 'puntland-state');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'ssc-khatumo-state', 'SSC-Khatumo State', true, 'Self-declared administration (Sool/Sanaag/Cayn); SEMA records it as its own category.'
where not exists (select 1 from catalogue_geo_areas where slug = 'ssc-khatumo-state');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'disputed-area', 'Disputed Area', true, 'SEMA''s own neutral label for contested territory (Togdheer).'
where not exists (select 1 from catalogue_geo_areas where slug = 'disputed-area');
insert into catalogue_geo_areas (level, slug, name, is_official, data_quality_note)
select 'state', 'somaliland', 'Somaliland', true, 'Near-absent in this catalogue -- Somaliland runs its own separate demining authority (SDA), largely outside SEMA''s IMSMA data. A handful of legacy records are tagged to this state without a specific region and are not shown as a navigable region.'
where not exists (select 1 from catalogue_geo_areas where slug = 'somaliland');

-- Official regions (admin1)
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'south-west-state'), 'bakool', 'Bakool', 'SO25', 'SO25', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'bakool');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'banadir-regional'), 'banadir', 'Banadir', 'SO22', 'SO22', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'banadir');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'puntland-state'), 'bari', 'Bari', 'SO16', 'SO16', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'bari');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'south-west-state'), 'bay', 'Bay', 'SO24', 'SO24', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'bay');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'galmudug-state'), 'galgaduud', 'Galgaduud', 'SO19', 'SO19', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'galgaduud');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'jubaland-state'), 'gedo', 'Gedo', 'SO26', 'SO26', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'gedo');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'hirshabelle-state'), 'hiraan', 'Hiraan', 'SO20', 'SO20', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'hiraan');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'jubaland-state'), 'lower-juba', 'Lower Juba', 'SO28', 'SO28', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'lower-juba');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'south-west-state'), 'lower-shabelle', 'Lower Shabelle', 'SO23', 'SO23', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'lower-shabelle');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'jubaland-state'), 'middle-juba', 'Middle Juba', 'SO27', 'SO27', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'middle-juba');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'hirshabelle-state'), 'middle-shabelle', 'Middle Shabelle', 'SO21', 'SO21', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'middle-shabelle');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'galmudug-state'), 'mudug', 'Mudug', 'SO18', 'SO18', true, 'State administration is genuinely contested in SEMA''s own records: counted here once under Galmudug State by majority, but this region profile reports Mudug''s figures as a single region regardless of state.'
where not exists (select 1 from catalogue_geo_areas where slug = 'mudug');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'puntland-state'), 'sanaag', 'Sanaag', 'SO15', 'SO15', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'sanaag');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'ssc-khatumo-state'), 'sool', 'Sool', 'SO14', 'SO14', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'sool');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'disputed-area'), 'togdheer', 'Togdheer', 'SO13', 'SO13', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'togdheer');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'puntland-state'), 'woqooyi-galbeed', 'Woqooyi Galbeed', 'SO12', 'SO12', true, null
where not exists (select 1 from catalogue_geo_areas where slug = 'woqooyi-galbeed');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', null, 'awdal', 'Awdal', 'SO11', 'SO11', true, 'No records identified in the currently available catalogue for this region in any of the four point datasets or the hazard layer. State administration not available from current IMSMA data.'
where not exists (select 1 from catalogue_geo_areas where slug = 'awdal');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official, data_quality_note)
select 'region', null, 'nugaal', 'Nugaal', 'SO17', 'SO17', true, 'No directly-attributed records under the official spelling "Nugaal" in the current catalogue -- see the separately flagged "nugal" entry, which SEMA''s own data quality notes identify as likely referring to this same region under a misspelled value.'
where not exists (select 1 from catalogue_geo_areas where slug = 'nugaal');

-- Unofficial / flagged region values (kept separate from official regions)
insert into catalogue_geo_areas (level, parent_id, slug, name, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'puntland-state'), 'ayn', 'ayn', false, 'Unofficial region value recorded in IMSMA; does not correspond to any of the 18 OCHA-recognised Somalia regions. Not merged into an official region.'
where not exists (select 1 from catalogue_geo_areas where slug = 'ayn');
insert into catalogue_geo_areas (level, parent_id, slug, name, is_official, data_quality_note)
select 'region', (select id from catalogue_geo_areas where slug = 'puntland-state'), 'nugal', 'nugal', false, 'Unofficial region value recorded in IMSMA; SEMA''s own data quality notes flag this as likely a misspelling of "Nugaal", but it is kept separate here, not silently merged into the official Nugaal region, since that cannot be confirmed from the data alone.'
where not exists (select 1 from catalogue_geo_areas where slug = 'nugal');

-- Districts (admin2), from the bundled Somalia COD-AB boundaries.
-- No availability stats are seeded for these -- see the file header note.
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'awdal'), 'baki', 'Baki', 'SO1102', 'SO1102', true
where not exists (select 1 from catalogue_geo_areas where slug = 'baki');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'awdal'), 'borama', 'Borama', 'SO1101', 'SO1101', true
where not exists (select 1 from catalogue_geo_areas where slug = 'borama');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'awdal'), 'lughaye', 'Lughaye', 'SO1103', 'SO1103', true
where not exists (select 1 from catalogue_geo_areas where slug = 'lughaye');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'awdal'), 'zeylac', 'Zeylac', 'SO1104', 'SO1104', true
where not exists (select 1 from catalogue_geo_areas where slug = 'zeylac');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bakool'), 'ceel-barde', 'Ceel Barde', 'SO2502', 'SO2502', true
where not exists (select 1 from catalogue_geo_areas where slug = 'ceel-barde');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bakool'), 'rab-dhuure', 'Rab Dhuure', 'SO2505', 'SO2505', true
where not exists (select 1 from catalogue_geo_areas where slug = 'rab-dhuure');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bakool'), 'tayeeglow', 'Tayeeglow', 'SO2503', 'SO2503', true
where not exists (select 1 from catalogue_geo_areas where slug = 'tayeeglow');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bakool'), 'waajid', 'Waajid', 'SO2504', 'SO2504', true
where not exists (select 1 from catalogue_geo_areas where slug = 'waajid');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bakool'), 'xudur', 'Xudur', 'SO2501', 'SO2501', true
where not exists (select 1 from catalogue_geo_areas where slug = 'xudur');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'bondhere', 'Bondhere', 'SO2201', 'SO2201', true
where not exists (select 1 from catalogue_geo_areas where slug = 'bondhere');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'cabdulasis', 'Cabdulasis', 'SO2202', 'SO2202', true
where not exists (select 1 from catalogue_geo_areas where slug = 'cabdulasis');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'daynile', 'Daynile', 'SO2203', 'SO2203', true
where not exists (select 1 from catalogue_geo_areas where slug = 'daynile');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'dharkenley', 'Dharkenley', 'SO2204', 'SO2204', true
where not exists (select 1 from catalogue_geo_areas where slug = 'dharkenley');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'hamar-jabjab', 'Hamar Jabjab', 'SO2205', 'SO2205', true
where not exists (select 1 from catalogue_geo_areas where slug = 'hamar-jabjab');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'hamar-weyne', 'Hamar Weyne', 'SO2206', 'SO2206', true
where not exists (select 1 from catalogue_geo_areas where slug = 'hamar-weyne');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'hawl-wadaag', 'Hawl Wadaag', 'SO2207', 'SO2207', true
where not exists (select 1 from catalogue_geo_areas where slug = 'hawl-wadaag');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'heliwa', 'Heliwa', 'SO2208', 'SO2208', true
where not exists (select 1 from catalogue_geo_areas where slug = 'heliwa');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'hodan', 'Hodan', 'SO2209', 'SO2209', true
where not exists (select 1 from catalogue_geo_areas where slug = 'hodan');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'kahda', 'Kahda', 'SO2210', 'SO2210', true
where not exists (select 1 from catalogue_geo_areas where slug = 'kahda');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'karaan', 'Karaan', 'SO2211', 'SO2211', true
where not exists (select 1 from catalogue_geo_areas where slug = 'karaan');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'shangaani', 'Shangaani', 'SO2212', 'SO2212', true
where not exists (select 1 from catalogue_geo_areas where slug = 'shangaani');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'shibis', 'Shibis', 'SO2213', 'SO2213', true
where not exists (select 1 from catalogue_geo_areas where slug = 'shibis');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'unspecified', 'Unspecified', 'Unspecified', 'Unspecified', true
where not exists (select 1 from catalogue_geo_areas where slug = 'unspecified');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'waaberi', 'Waaberi', 'SO2214', 'SO2214', true
where not exists (select 1 from catalogue_geo_areas where slug = 'waaberi');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'wadajir-(medina)', 'Wadajir (Medina)', 'SO2215', 'SO2215', true
where not exists (select 1 from catalogue_geo_areas where slug = 'wadajir-(medina)');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'wardhigley', 'Wardhigley', 'SO2216', 'SO2216', true
where not exists (select 1 from catalogue_geo_areas where slug = 'wardhigley');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'banadir'), 'yaaqshid', 'Yaaqshid', 'SO2217', 'SO2217', true
where not exists (select 1 from catalogue_geo_areas where slug = 'yaaqshid');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bari'), 'bandarbeyla', 'Bandarbeyla', 'SO1602', 'SO1602', true
where not exists (select 1 from catalogue_geo_areas where slug = 'bandarbeyla');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bari'), 'bossaso', 'Bossaso', 'SO1601', 'SO1601', true
where not exists (select 1 from catalogue_geo_areas where slug = 'bossaso');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bari'), 'caluula', 'Caluula', 'SO1603', 'SO1603', true
where not exists (select 1 from catalogue_geo_areas where slug = 'caluula');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bari'), 'iskushuban', 'Iskushuban', 'SO1604', 'SO1604', true
where not exists (select 1 from catalogue_geo_areas where slug = 'iskushuban');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bari'), 'qandala', 'Qandala', 'SO1605', 'SO1605', true
where not exists (select 1 from catalogue_geo_areas where slug = 'qandala');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bari'), 'qardho', 'Qardho', 'SO1606', 'SO1606', true
where not exists (select 1 from catalogue_geo_areas where slug = 'qardho');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bay'), 'baydhaba', 'Baydhaba', 'SO2401', 'SO2401', true
where not exists (select 1 from catalogue_geo_areas where slug = 'baydhaba');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bay'), 'buur-hakaba', 'Buur Hakaba', 'SO2402', 'SO2402', true
where not exists (select 1 from catalogue_geo_areas where slug = 'buur-hakaba');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bay'), 'diinsoor', 'Diinsoor', 'SO2403', 'SO2403', true
where not exists (select 1 from catalogue_geo_areas where slug = 'diinsoor');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'bay'), 'qansax-dheere', 'Qansax Dheere', 'SO2404', 'SO2404', true
where not exists (select 1 from catalogue_geo_areas where slug = 'qansax-dheere');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'galgaduud'), 'cabudwaaq', 'Cabudwaaq', 'SO1902', 'SO1902', true
where not exists (select 1 from catalogue_geo_areas where slug = 'cabudwaaq');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'galgaduud'), 'cadaado', 'Cadaado', 'SO1903', 'SO1903', true
where not exists (select 1 from catalogue_geo_areas where slug = 'cadaado');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'galgaduud'), 'ceel-buur', 'Ceel Buur', 'SO1904', 'SO1904', true
where not exists (select 1 from catalogue_geo_areas where slug = 'ceel-buur');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'galgaduud'), 'ceel-dheer', 'Ceel Dheer', 'SO1905', 'SO1905', true
where not exists (select 1 from catalogue_geo_areas where slug = 'ceel-dheer');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'galgaduud'), 'dhuusamarreeb', 'Dhuusamarreeb', 'SO1901', 'SO1901', true
where not exists (select 1 from catalogue_geo_areas where slug = 'dhuusamarreeb');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'gedo'), 'baardheere', 'Baardheere', 'SO2602', 'SO2602', true
where not exists (select 1 from catalogue_geo_areas where slug = 'baardheere');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'gedo'), 'belet-xaawo', 'Belet Xaawo', 'SO2603', 'SO2603', true
where not exists (select 1 from catalogue_geo_areas where slug = 'belet-xaawo');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'gedo'), 'ceel-waaq', 'Ceel Waaq', 'SO2604', 'SO2604', true
where not exists (select 1 from catalogue_geo_areas where slug = 'ceel-waaq');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'gedo'), 'doolow', 'Doolow', 'SO2605', 'SO2605', true
where not exists (select 1 from catalogue_geo_areas where slug = 'doolow');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'gedo'), 'garbahaarey', 'Garbahaarey', 'SO2601', 'SO2601', true
where not exists (select 1 from catalogue_geo_areas where slug = 'garbahaarey');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'gedo'), 'luuq', 'Luuq', 'SO2606', 'SO2606', true
where not exists (select 1 from catalogue_geo_areas where slug = 'luuq');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'hiraan'), 'belet-weyne', 'Belet Weyne', 'SO2001', 'SO2001', true
where not exists (select 1 from catalogue_geo_areas where slug = 'belet-weyne');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'hiraan'), 'bulo-burto', 'Bulo Burto', 'SO2002', 'SO2002', true
where not exists (select 1 from catalogue_geo_areas where slug = 'bulo-burto');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'hiraan'), 'jalalaqsi', 'Jalalaqsi', 'SO2003', 'SO2003', true
where not exists (select 1 from catalogue_geo_areas where slug = 'jalalaqsi');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-juba'), 'afmadow', 'Afmadow', 'SO2802', 'SO2802', true
where not exists (select 1 from catalogue_geo_areas where slug = 'afmadow');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-juba'), 'badhaadhe', 'Badhaadhe', 'SO2803', 'SO2803', true
where not exists (select 1 from catalogue_geo_areas where slug = 'badhaadhe');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-juba'), 'jamaame', 'Jamaame', 'SO2804', 'SO2804', true
where not exists (select 1 from catalogue_geo_areas where slug = 'jamaame');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-juba'), 'kismaayo', 'Kismaayo', 'SO2801', 'SO2801', true
where not exists (select 1 from catalogue_geo_areas where slug = 'kismaayo');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'afgooye', 'Afgooye', 'SO2302', 'SO2302', true
where not exists (select 1 from catalogue_geo_areas where slug = 'afgooye');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'baraawe', 'Baraawe', 'SO2303', 'SO2303', true
where not exists (select 1 from catalogue_geo_areas where slug = 'baraawe');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'kurtunwaarey', 'Kurtunwaarey', 'SO2304', 'SO2304', true
where not exists (select 1 from catalogue_geo_areas where slug = 'kurtunwaarey');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'marka', 'Marka', 'SO2301', 'SO2301', true
where not exists (select 1 from catalogue_geo_areas where slug = 'marka');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'qoryooley', 'Qoryooley', 'SO2305', 'SO2305', true
where not exists (select 1 from catalogue_geo_areas where slug = 'qoryooley');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'sablaale', 'Sablaale', 'SO2306', 'SO2306', true
where not exists (select 1 from catalogue_geo_areas where slug = 'sablaale');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'wanla-weyn', 'Wanla Weyn', 'SO2307', 'SO2307', true
where not exists (select 1 from catalogue_geo_areas where slug = 'wanla-weyn');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'middle-juba'), 'buaale', 'Bu''aale', 'SO2701', 'SO2701', true
where not exists (select 1 from catalogue_geo_areas where slug = 'buaale');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'middle-juba'), 'jilib', 'Jilib', 'SO2702', 'SO2702', true
where not exists (select 1 from catalogue_geo_areas where slug = 'jilib');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'middle-juba'), 'saakow', 'Saakow', 'SO2703', 'SO2703', true
where not exists (select 1 from catalogue_geo_areas where slug = 'saakow');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 'adan-yabaal', 'Adan Yabaal', 'SO2102', 'SO2102', true
where not exists (select 1 from catalogue_geo_areas where slug = 'adan-yabaal');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 'balcad', 'Balcad', 'SO2103', 'SO2103', true
where not exists (select 1 from catalogue_geo_areas where slug = 'balcad');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 'cadale', 'Cadale', 'SO2104', 'SO2104', true
where not exists (select 1 from catalogue_geo_areas where slug = 'cadale');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 'jowhar', 'Jowhar', 'SO2101', 'SO2101', true
where not exists (select 1 from catalogue_geo_areas where slug = 'jowhar');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'mudug'), 'gaalkacyo', 'Gaalkacyo', 'SO1801', 'SO1801', true
where not exists (select 1 from catalogue_geo_areas where slug = 'gaalkacyo');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'mudug'), 'galdogob', 'Galdogob', 'SO1802', 'SO1802', true
where not exists (select 1 from catalogue_geo_areas where slug = 'galdogob');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'mudug'), 'hobyo', 'Hobyo', 'SO1803', 'SO1803', true
where not exists (select 1 from catalogue_geo_areas where slug = 'hobyo');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'mudug'), 'jariiban', 'Jariiban', 'SO1804', 'SO1804', true
where not exists (select 1 from catalogue_geo_areas where slug = 'jariiban');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'mudug'), 'xarardheere', 'Xarardheere', 'SO1805', 'SO1805', true
where not exists (select 1 from catalogue_geo_areas where slug = 'xarardheere');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'nugaal'), 'burtinle', 'Burtinle', 'SO1702', 'SO1702', true
where not exists (select 1 from catalogue_geo_areas where slug = 'burtinle');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'nugaal'), 'eyl', 'Eyl', 'SO1703', 'SO1703', true
where not exists (select 1 from catalogue_geo_areas where slug = 'eyl');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'nugaal'), 'garoowe', 'Garoowe', 'SO1701', 'SO1701', true
where not exists (select 1 from catalogue_geo_areas where slug = 'garoowe');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'sanaag'), 'ceel-afweyn', 'Ceel Afweyn', 'SO1502', 'SO1502', true
where not exists (select 1 from catalogue_geo_areas where slug = 'ceel-afweyn');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'sanaag'), 'ceerigaabo', 'Ceerigaabo', 'SO1501', 'SO1501', true
where not exists (select 1 from catalogue_geo_areas where slug = 'ceerigaabo');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'sanaag'), 'laasqoray', 'Laasqoray', 'SO1503', 'SO1503', true
where not exists (select 1 from catalogue_geo_areas where slug = 'laasqoray');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'sool'), 'caynabo', 'Caynabo', 'SO1402', 'SO1402', true
where not exists (select 1 from catalogue_geo_areas where slug = 'caynabo');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'sool'), 'laas-caanood', 'Laas Caanood', 'SO1401', 'SO1401', true
where not exists (select 1 from catalogue_geo_areas where slug = 'laas-caanood');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'sool'), 'taleex', 'Taleex', 'SO1403', 'SO1403', true
where not exists (select 1 from catalogue_geo_areas where slug = 'taleex');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'sool'), 'xudun', 'Xudun', 'SO1404', 'SO1404', true
where not exists (select 1 from catalogue_geo_areas where slug = 'xudun');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'togdheer'), 'burco', 'Burco', 'SO1301', 'SO1301', true
where not exists (select 1 from catalogue_geo_areas where slug = 'burco');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'togdheer'), 'buuhoodle', 'Buuhoodle', 'SO1302', 'SO1302', true
where not exists (select 1 from catalogue_geo_areas where slug = 'buuhoodle');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'togdheer'), 'owdweyne', 'Owdweyne', 'SO1303', 'SO1303', true
where not exists (select 1 from catalogue_geo_areas where slug = 'owdweyne');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'togdheer'), 'sheikh', 'Sheikh', 'SO1304', 'SO1304', true
where not exists (select 1 from catalogue_geo_areas where slug = 'sheikh');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'woqooyi-galbeed'), 'berbera', 'Berbera', 'SO1202', 'SO1202', true
where not exists (select 1 from catalogue_geo_areas where slug = 'berbera');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'woqooyi-galbeed'), 'gebiley', 'Gebiley', 'SO1203', 'SO1203', true
where not exists (select 1 from catalogue_geo_areas where slug = 'gebiley');
insert into catalogue_geo_areas (level, parent_id, slug, name, pcode, geojson_feature_id, is_official)
select 'district', (select id from catalogue_geo_areas where slug = 'woqooyi-galbeed'), 'hargeysa', 'Hargeysa', 'SO1201', 'SO1201', true
where not exists (select 1 from catalogue_geo_areas where slug = 'hargeysa');

-- Datasets
insert into catalogue_datasets (slug, name, category, description, status_options, display_order)
select 'nts', 'Non-Technical Survey', 'nts', 'Non-technical survey and contamination evidence information.', '{}'::text[], 0
where not exists (select 1 from catalogue_datasets where slug = 'nts');
insert into catalogue_datasets (slug, name, category, description, status_options, display_order)
select 'hazardous-areas', 'Hazardous Areas (CHA/SHA)', 'hazardous_area', 'Confirmed and suspected hazardous areas, including their clearance/land-release status.', '{cha,sha,open,closed_released_cancelled}'::text[], 1
where not exists (select 1 from catalogue_datasets where slug = 'hazardous-areas');
insert into catalogue_datasets (slug, name, category, description, status_options, display_order)
select 'accidents', 'Mine / ERW Accidents', 'accident', 'Explosive ordnance accident and casualty information.', '{}'::text[], 2
where not exists (select 1 from catalogue_datasets where slug = 'accidents');
insert into catalogue_datasets (slug, name, category, description, status_options, display_order)
select 'eod', 'Explosive Ordnance Disposal (EOD)', 'eod', 'Explosive ordnance disposal task and clearance activity.', '{}'::text[], 3
where not exists (select 1 from catalogue_datasets where slug = 'eod');
insert into catalogue_datasets (slug, name, category, description, status_options, display_order)
select 'eore', 'Explosive Ordnance Risk Education (EORE)', 'eore', 'Explosive ordnance risk education activity and beneficiary reach.', '{}'::text[], 4
where not exists (select 1 from catalogue_datasets where slug = 'eore');
insert into catalogue_datasets (slug, name, category, description, status_options, display_order)
select 'clearance', 'Clearance / Land Release', 'clearance', 'Land release outcomes reported as a distinct dataset from hazardous area status.', '{}'::text[], 5
where not exists (select 1 from catalogue_datasets where slug = 'clearance');

-- Region-level availability stats (nts / accidents / eod / eore)
-- Note: settlements_represented is intentionally left at its default (0, i.e.
-- "unknown") here -- the source docx reports a per-region *district* count with
-- data (not settlements/villages), which is recorded below as context on the
-- region's own data_quality_note instead, since no breakdown of which specific
-- districts it covers is available yet.
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 11 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'bakool' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'bakool'), 437, '1981-01-01', '2024-12-22', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'bakool'), 146, '1981-01-01', '2024-12-22', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'bakool'), 534, '1981-01-01', '2024-12-22', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'bakool'), 2106, '1981-01-01', '2024-12-22', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bakool'), 73, '1981-01-01', '2024-12-22', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bakool'), 'cha', 50
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bakool'), 'sha', 23
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bakool'), 'open', 52
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
    and status = 'open'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bakool'), 'closed_released_cancelled', 20
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bakool')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 30 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'banadir' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'banadir'), 29, '1977-08-25', '2025-09-25', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'banadir'), 417, '1977-08-25', '2025-09-25', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'banadir'), 1694, '1977-08-25', '2025-09-25', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'banadir'), 6715, '1977-08-25', '2025-09-25', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'banadir'), 21, '1977-08-25', '2025-09-25', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'banadir'), 'cha', 16
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'banadir'), 'sha', 5
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'banadir'), 'closed_released_cancelled', 21
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'banadir')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 3 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'bari' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'bari'), 13, '2003-01-01', '2020-02-26', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bari')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'bari'), 2, '2003-01-01', '2020-02-26', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bari')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'bari'), 38, '2003-01-01', '2020-02-26', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bari')
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 7 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'bay' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'bay'), 333, '1995-08-01', '2024-12-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'bay'), 43, '1995-08-01', '2024-12-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'bay'), 946, '1995-08-01', '2024-12-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'bay'), 4340, '1995-08-01', '2024-12-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bay'), 33, '1995-08-01', '2024-12-14', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bay'), 'cha', 2
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bay'), 'sha', 31
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bay'), 'open', 20
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
    and status = 'open'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'bay'), 'closed_released_cancelled', 13
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'bay')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 14 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'galgaduud' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 446, '1982-01-01', '2026-06-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 274, '1982-01-01', '2026-06-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 2521, '1982-01-01', '2026-06-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 5538, '1982-01-01', '2026-06-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 116, '1982-01-01', '2026-06-24', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 'cha', 90
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 'sha', 26
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 'open', 76
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
    and status = 'open'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'galgaduud'), 'closed_released_cancelled', 36
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'galgaduud')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 8 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'gedo' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'gedo'), 419, '2008-09-26', '2024-12-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'gedo'), 33, '2008-09-26', '2024-12-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'gedo'), 1007, '2008-09-26', '2024-12-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'gedo'), 3281, '2008-09-26', '2024-12-24', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'gedo'), 9, '2008-09-26', '2024-12-24', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'gedo'), 'cha', 7
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'gedo'), 'sha', 2
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'gedo'), 'open', 4
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
    and status = 'open'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'gedo'), 'closed_released_cancelled', 5
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'gedo')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 10 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'hiraan' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'hiraan'), 489, '1977-09-10', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'hiraan'), 318, '1977-09-10', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'hiraan'), 1584, '1977-09-10', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'hiraan'), 4168, '1977-09-10', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'hiraan'), 78, '1977-09-10', '2026-02-12', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'hiraan'), 'cha', 72
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'hiraan'), 'sha', 6
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'hiraan'), 'open', 53
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
    and status = 'open'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'hiraan'), 'closed_released_cancelled', 24
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'hiraan')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 7 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'lower-juba' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 297, '2007-01-08', '2024-11-20', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 24, '2007-01-08', '2024-11-20', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 190, '2007-01-08', '2024-11-20', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 2670, '2007-01-08', '2024-11-20', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 4, '2007-01-08', '2024-11-20', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 'cha', 2
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 'sha', 2
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-juba'), 'closed_released_cancelled', 4
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-juba')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 8 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'lower-shabelle' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 243, '1985-01-02', '2024-08-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 69, '1985-01-02', '2024-08-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 122, '1985-01-02', '2024-08-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 2881, '1985-01-02', '2024-08-14', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 9, '1985-01-02', '2024-08-14', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'cha', 7
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'sha', 2
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'lower-shabelle'), 'closed_released_cancelled', 9
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'lower-shabelle')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 5 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'middle-juba' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'middle-juba'), 26, '2009-04-01', '2021-05-10', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-juba')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'middle-juba'), 2, '2009-04-01', '2021-05-10', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-juba')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'middle-juba'), 152, '2009-04-01', '2021-05-10', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-juba')
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 4 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'middle-shabelle' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 192, '1998-06-05', '2024-05-19', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 19, '1998-06-05', '2024-05-19', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 9, '1998-06-05', '2024-05-19', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 1564, '1998-06-05', '2024-05-19', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-shabelle')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 1, '1998-06-05', '2024-05-19', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-shabelle')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 'cha', 1
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-shabelle')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'middle-shabelle'), 'closed_released_cancelled', 1
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'middle-shabelle')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 8 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'mudug' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'mudug'), 357, '1979-01-01', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'mudug'), 152, '1979-01-01', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'mudug'), 1956, '1979-01-01', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'mudug'), 3594, '1979-01-01', '2026-02-12', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'mudug'), 60, '1979-01-01', '2026-02-12', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'mudug'), 'cha', 52
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'mudug'), 'sha', 8
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'mudug'), 'open', 27
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
    and status = 'open'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'mudug'), 'closed_released_cancelled', 33
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'mudug')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 4 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'sanaag' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'sanaag'), 28, '2005-05-01', '2011-09-15', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sanaag')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'sanaag'), 1, '2005-05-01', '2011-09-15', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sanaag')
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 4 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'sool' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'nts'), (select id from catalogue_geo_areas where slug = 'sool'), 73, '2005-04-01', '2026-06-29', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'nts')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'sool'), 34, '2005-04-01', '2026-06-29', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'sool'), 662, '2005-04-01', '2026-06-29', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'sool'), 799, '2005-04-01', '2026-06-29', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source, notes)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'sool'), 73, '2005-04-01', '2026-06-29', 'manual', 'CHA/SHA status history cannot be reconstructed from this account''s IMSMA view -- figures reflect current status counts only.'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'sool'), 'cha', 69
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
    and status = 'cha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'sool'), 'sha', 4
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
    and status = 'sha'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'sool'), 'open', 57
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
    and status = 'open'
);
insert into catalogue_dataset_status_counts (dataset_id, geo_area_id, status, count)
select (select id from catalogue_datasets where slug = 'hazardous-areas'), (select id from catalogue_geo_areas where slug = 'sool'), 'closed_released_cancelled', 14
where not exists (
  select 1 from catalogue_dataset_status_counts
  where dataset_id = (select id from catalogue_datasets where slug = 'hazardous-areas')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'sool')
    and status = 'closed_released_cancelled'
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 1 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'togdheer' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'togdheer'), 9, '2019-06-13', '2019-09-05', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'togdheer')
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 2 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'woqooyi-galbeed' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'woqooyi-galbeed'), 2, '1977-06-15', '2005-05-01', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'woqooyi-galbeed')
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 1 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'ayn' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'ayn'), 40, '2004-12-01', '2012-04-17', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'ayn')
);
update catalogue_geo_areas set data_quality_note = coalesce(data_quality_note || ' ', '') || 'IMSMA attributes records to an estimated 4 of this region''s districts; a district-level breakdown is not yet available in this catalogue.'
where slug = 'nugal' and (data_quality_note is null or data_quality_note not like '%district-level breakdown is not yet available%');
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'accidents'), (select id from catalogue_geo_areas where slug = 'nugal'), 27, '1981-03-01', '2025-10-22', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'accidents')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'nugal')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eod'), (select id from catalogue_geo_areas where slug = 'nugal'), 5, '1981-03-01', '2025-10-22', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eod')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'nugal')
);
insert into catalogue_dataset_geo_stats (dataset_id, geo_area_id, record_count, earliest_date, latest_date, source)
select (select id from catalogue_datasets where slug = 'eore'), (select id from catalogue_geo_areas where slug = 'nugal'), 201, '1981-03-01', '2025-10-22', 'manual'
where not exists (
  select 1 from catalogue_dataset_geo_stats
  where dataset_id = (select id from catalogue_datasets where slug = 'eore')
    and geo_area_id = (select id from catalogue_geo_areas where slug = 'nugal')
);

-- Known visibility limitation, recorded against every populated dataset
-- (not a geo-area-specific row): this sync account cannot see several
-- partner-specific IMSMA folders (HTTP 403). Absence in this catalogue
-- means "not visible to this account", never "confirmed absent".
update catalogue_datasets set description = description || ' Note: this account cannot see some partner-specific IMSMA records (e.g. HALO Trust); absence here means not visible to this sync account, never confirmed absent.' where slug = 'nts' and description not like '%not visible to this sync account%';
update catalogue_datasets set description = description || ' Note: this account cannot see some partner-specific IMSMA records (e.g. HALO Trust); absence here means not visible to this sync account, never confirmed absent.' where slug = 'accidents' and description not like '%not visible to this sync account%';
update catalogue_datasets set description = description || ' Note: this account cannot see some partner-specific IMSMA records (e.g. HALO Trust); absence here means not visible to this sync account, never confirmed absent.' where slug = 'eod' and description not like '%not visible to this sync account%';
update catalogue_datasets set description = description || ' Note: this account cannot see some partner-specific IMSMA records (e.g. HALO Trust); absence here means not visible to this sync account, never confirmed absent.' where slug = 'eore' and description not like '%not visible to this sync account%';
update catalogue_datasets set description = description || ' Note: this account cannot see some partner-specific IMSMA records (e.g. HALO Trust); absence here means not visible to this sync account, never confirmed absent.' where slug = 'hazardous-areas' and description not like '%not visible to this sync account%';

