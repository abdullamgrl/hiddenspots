-- -------------------------------------------------------------
-- SEED ALL INDIAN STATES AND DISTRICTS
-- -------------------------------------------------------------

insert into public.states (name, slug, code) values
  ('Andhra Pradesh', 'andhra-pradesh', 'AP'),
  ('Arunachal Pradesh', 'arunachal-pradesh', 'AR'),
  ('Assam', 'assam', 'AS'),
  ('Bihar', 'bihar', 'BR'),
  ('Chandigarh', 'chandigarh', 'CH'),
  ('Chhattisgarh', 'chhattisgarh', 'CG'),
  ('Dadra and Nagar Haveli', 'dadra-and-nagar-haveli', 'DN'),
  ('Daman and Diu', 'daman-and-diu', 'DD'),
  ('Delhi', 'delhi', 'DL'),
  ('Goa', 'goa', 'GA'),
  ('Gujarat', 'gujarat', 'GJ'),
  ('Haryana', 'haryana', 'HR'),
  ('Himachal Pradesh', 'himachal-pradesh', 'HP'),
  ('Jammu and Kashmir', 'jammu-and-kashmir', 'JK'),
  ('Jharkhand', 'jharkhand', 'JH'),
  ('Karnataka', 'karnataka', 'KA'),
  ('Kerala', 'kerala', 'KL'),
  ('Lakshadweep', 'lakshadweep', 'LD'),
  ('Madhya Pradesh', 'madhya-pradesh', 'MP'),
  ('Maharashtra', 'maharashtra', 'MH'),
  ('Manipur', 'manipur', 'MN'),
  ('Meghalaya', 'meghalaya', 'ML'),
  ('Mizoram', 'mizoram', 'MZ'),
  ('Nagaland', 'nagaland', 'NL'),
  ('Odisha', 'odisha', 'OD'),
  ('Puducherry', 'puducherry', 'PY'),
  ('Punjab', 'punjab', 'PB'),
  ('Rajasthan', 'rajasthan', 'RJ'),
  ('Sikkim', 'sikkim', 'SK'),
  ('Tamil Nadu', 'tamil-nadu', 'TN'),
  ('Telangana', 'telangana', 'TG'),
  ('Tripura', 'tripura', 'TR'),
  ('Uttarakhand', 'uttarakhand', 'UK'),
  ('Uttar Pradesh', 'uttar-pradesh', 'UP'),
  ('West Bengal', 'west-bengal', 'WB')
on conflict (slug) do nothing;

do $$
declare
  v_state_0 uuid;
  v_state_1 uuid;
  v_state_2 uuid;
  v_state_3 uuid;
  v_state_4 uuid;
  v_state_5 uuid;
  v_state_6 uuid;
  v_state_7 uuid;
  v_state_8 uuid;
  v_state_9 uuid;
  v_state_10 uuid;
  v_state_11 uuid;
  v_state_12 uuid;
  v_state_13 uuid;
  v_state_14 uuid;
  v_state_15 uuid;
  v_state_16 uuid;
  v_state_17 uuid;
  v_state_18 uuid;
  v_state_19 uuid;
  v_state_20 uuid;
  v_state_21 uuid;
  v_state_22 uuid;
  v_state_23 uuid;
  v_state_24 uuid;
  v_state_25 uuid;
  v_state_26 uuid;
  v_state_27 uuid;
  v_state_28 uuid;
  v_state_29 uuid;
  v_state_30 uuid;
  v_state_31 uuid;
  v_state_32 uuid;
  v_state_33 uuid;
  v_state_34 uuid;
begin
  select id into v_state_0 from public.states where slug = 'andhra-pradesh';
  select id into v_state_1 from public.states where slug = 'arunachal-pradesh';
  select id into v_state_2 from public.states where slug = 'assam';
  select id into v_state_3 from public.states where slug = 'bihar';
  select id into v_state_4 from public.states where slug = 'chandigarh';
  select id into v_state_5 from public.states where slug = 'chhattisgarh';
  select id into v_state_6 from public.states where slug = 'dadra-and-nagar-haveli';
  select id into v_state_7 from public.states where slug = 'daman-and-diu';
  select id into v_state_8 from public.states where slug = 'delhi';
  select id into v_state_9 from public.states where slug = 'goa';
  select id into v_state_10 from public.states where slug = 'gujarat';
  select id into v_state_11 from public.states where slug = 'haryana';
  select id into v_state_12 from public.states where slug = 'himachal-pradesh';
  select id into v_state_13 from public.states where slug = 'jammu-and-kashmir';
  select id into v_state_14 from public.states where slug = 'jharkhand';
  select id into v_state_15 from public.states where slug = 'karnataka';
  select id into v_state_16 from public.states where slug = 'kerala';
  select id into v_state_17 from public.states where slug = 'lakshadweep';
  select id into v_state_18 from public.states where slug = 'madhya-pradesh';
  select id into v_state_19 from public.states where slug = 'maharashtra';
  select id into v_state_20 from public.states where slug = 'manipur';
  select id into v_state_21 from public.states where slug = 'meghalaya';
  select id into v_state_22 from public.states where slug = 'mizoram';
  select id into v_state_23 from public.states where slug = 'nagaland';
  select id into v_state_24 from public.states where slug = 'odisha';
  select id into v_state_25 from public.states where slug = 'puducherry';
  select id into v_state_26 from public.states where slug = 'punjab';
  select id into v_state_27 from public.states where slug = 'rajasthan';
  select id into v_state_28 from public.states where slug = 'sikkim';
  select id into v_state_29 from public.states where slug = 'tamil-nadu';
  select id into v_state_30 from public.states where slug = 'telangana';
  select id into v_state_31 from public.states where slug = 'tripura';
  select id into v_state_32 from public.states where slug = 'uttarakhand';
  select id into v_state_33 from public.states where slug = 'uttar-pradesh';
  select id into v_state_34 from public.states where slug = 'west-bengal';

  -- Districts for Andhra Pradesh
  if v_state_0 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_0, 'Anantapur', 'anantapur'),
      (v_state_0, 'Chittoor', 'chittoor'),
      (v_state_0, 'East Godavari', 'east-godavari'),
      (v_state_0, 'Guntur', 'guntur'),
      (v_state_0, 'Krishna', 'krishna'),
      (v_state_0, 'Kurnool', 'kurnool'),
      (v_state_0, 'Nellore', 'nellore'),
      (v_state_0, 'Prakasam', 'prakasam'),
      (v_state_0, 'Srikakulam', 'srikakulam'),
      (v_state_0, 'Visakhapatnam', 'visakhapatnam'),
      (v_state_0, 'Vizianagaram', 'vizianagaram'),
      (v_state_0, 'West Godavari', 'west-godavari'),
      (v_state_0, 'YSR Kadapa', 'ysr-kadapa')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Arunachal Pradesh
  if v_state_1 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_1, 'Tawang', 'tawang'),
      (v_state_1, 'West Kameng', 'west-kameng'),
      (v_state_1, 'East Kameng', 'east-kameng'),
      (v_state_1, 'Papum Pare', 'papum-pare'),
      (v_state_1, 'Kurung Kumey', 'kurung-kumey'),
      (v_state_1, 'Kra Daadi', 'kra-daadi'),
      (v_state_1, 'Lower Subansiri', 'lower-subansiri'),
      (v_state_1, 'Upper Subansiri', 'upper-subansiri'),
      (v_state_1, 'West Siang', 'west-siang'),
      (v_state_1, 'East Siang', 'east-siang'),
      (v_state_1, 'Siang', 'siang'),
      (v_state_1, 'Upper Siang', 'upper-siang'),
      (v_state_1, 'Lower Siang', 'lower-siang'),
      (v_state_1, 'Lower Dibang Valley', 'lower-dibang-valley'),
      (v_state_1, 'Dibang Valley', 'dibang-valley'),
      (v_state_1, 'Anjaw', 'anjaw'),
      (v_state_1, 'Lohit', 'lohit'),
      (v_state_1, 'Namsai', 'namsai'),
      (v_state_1, 'Changlang', 'changlang'),
      (v_state_1, 'Tirap', 'tirap'),
      (v_state_1, 'Longding', 'longding')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Assam
  if v_state_2 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_2, 'Baksa', 'baksa'),
      (v_state_2, 'Barpeta', 'barpeta'),
      (v_state_2, 'Biswanath', 'biswanath'),
      (v_state_2, 'Bongaigaon', 'bongaigaon'),
      (v_state_2, 'Cachar', 'cachar'),
      (v_state_2, 'Charaideo', 'charaideo'),
      (v_state_2, 'Chirang', 'chirang'),
      (v_state_2, 'Darrang', 'darrang'),
      (v_state_2, 'Dhemaji', 'dhemaji'),
      (v_state_2, 'Dhubri', 'dhubri'),
      (v_state_2, 'Dibrugarh', 'dibrugarh'),
      (v_state_2, 'Goalpara', 'goalpara'),
      (v_state_2, 'Golaghat', 'golaghat'),
      (v_state_2, 'Hailakandi', 'hailakandi'),
      (v_state_2, 'Hojai', 'hojai'),
      (v_state_2, 'Jorhat', 'jorhat'),
      (v_state_2, 'Kamrup Metropolitan', 'kamrup-metropolitan'),
      (v_state_2, 'Kamrup', 'kamrup'),
      (v_state_2, 'Karbi Anglong', 'karbi-anglong'),
      (v_state_2, 'Karimganj', 'karimganj'),
      (v_state_2, 'Kokrajhar', 'kokrajhar'),
      (v_state_2, 'Lakhimpur', 'lakhimpur'),
      (v_state_2, 'Majuli', 'majuli'),
      (v_state_2, 'Morigaon', 'morigaon'),
      (v_state_2, 'Nagaon', 'nagaon'),
      (v_state_2, 'Nalbari', 'nalbari'),
      (v_state_2, 'Dima Hasao', 'dima-hasao'),
      (v_state_2, 'Sivasagar', 'sivasagar'),
      (v_state_2, 'Sonitpur', 'sonitpur'),
      (v_state_2, 'South Salmara-Mankachar', 'south-salmara-mankachar'),
      (v_state_2, 'Tinsukia', 'tinsukia'),
      (v_state_2, 'Udalguri', 'udalguri'),
      (v_state_2, 'West Karbi Anglong', 'west-karbi-anglong')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Bihar
  if v_state_3 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_3, 'Araria', 'araria'),
      (v_state_3, 'Arwal', 'arwal'),
      (v_state_3, 'Aurangabad', 'aurangabad'),
      (v_state_3, 'Banka', 'banka'),
      (v_state_3, 'Begusarai', 'begusarai'),
      (v_state_3, 'Bhagalpur', 'bhagalpur'),
      (v_state_3, 'Bhojpur', 'bhojpur'),
      (v_state_3, 'Buxar', 'buxar'),
      (v_state_3, 'Darbhanga', 'darbhanga'),
      (v_state_3, 'East Champaran (Motihari)', 'east-champaran-motihari'),
      (v_state_3, 'Gaya', 'gaya'),
      (v_state_3, 'Gopalganj', 'gopalganj'),
      (v_state_3, 'Jamui', 'jamui'),
      (v_state_3, 'Jehanabad', 'jehanabad'),
      (v_state_3, 'Kaimur (Bhabua)', 'kaimur-bhabua'),
      (v_state_3, 'Katihar', 'katihar'),
      (v_state_3, 'Khagaria', 'khagaria'),
      (v_state_3, 'Kishanganj', 'kishanganj'),
      (v_state_3, 'Lakhisarai', 'lakhisarai'),
      (v_state_3, 'Madhepura', 'madhepura'),
      (v_state_3, 'Madhubani', 'madhubani'),
      (v_state_3, 'Munger (Monghyr)', 'munger-monghyr'),
      (v_state_3, 'Muzaffarpur', 'muzaffarpur'),
      (v_state_3, 'Nalanda', 'nalanda'),
      (v_state_3, 'Nawada', 'nawada'),
      (v_state_3, 'Patna', 'patna'),
      (v_state_3, 'Purnia (Purnea)', 'purnia-purnea'),
      (v_state_3, 'Rohtas', 'rohtas'),
      (v_state_3, 'Saharsa', 'saharsa'),
      (v_state_3, 'Samastipur', 'samastipur'),
      (v_state_3, 'Saran', 'saran'),
      (v_state_3, 'Sheikhpura', 'sheikhpura'),
      (v_state_3, 'Sheohar', 'sheohar'),
      (v_state_3, 'Sitamarhi', 'sitamarhi'),
      (v_state_3, 'Siwan', 'siwan'),
      (v_state_3, 'Supaul', 'supaul'),
      (v_state_3, 'Vaishali', 'vaishali'),
      (v_state_3, 'West Champaran', 'west-champaran')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Chandigarh
  if v_state_4 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_4, 'Chandigarh', 'chandigarh')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Chhattisgarh
  if v_state_5 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_5, 'Balod', 'balod'),
      (v_state_5, 'Baloda Bazar', 'baloda-bazar'),
      (v_state_5, 'Balrampur', 'balrampur'),
      (v_state_5, 'Bastar', 'bastar'),
      (v_state_5, 'Bemetara', 'bemetara'),
      (v_state_5, 'Bijapur', 'bijapur'),
      (v_state_5, 'Bilaspur', 'bilaspur'),
      (v_state_5, 'Dantewada (South Bastar)', 'dantewada-south-bastar'),
      (v_state_5, 'Dhamtari', 'dhamtari'),
      (v_state_5, 'Durg', 'durg'),
      (v_state_5, 'Gariyaband', 'gariyaband'),
      (v_state_5, 'Janjgir-Champa', 'janjgir-champa'),
      (v_state_5, 'Jashpur', 'jashpur'),
      (v_state_5, 'Kabirdham (Kawardha)', 'kabirdham-kawardha'),
      (v_state_5, 'Kanker (North Bastar)', 'kanker-north-bastar'),
      (v_state_5, 'Kondagaon', 'kondagaon'),
      (v_state_5, 'Korba', 'korba'),
      (v_state_5, 'Korea (Koriya)', 'korea-koriya'),
      (v_state_5, 'Mahasamund', 'mahasamund'),
      (v_state_5, 'Mungeli', 'mungeli'),
      (v_state_5, 'Narayanpur', 'narayanpur'),
      (v_state_5, 'Raigarh', 'raigarh'),
      (v_state_5, 'Raipur', 'raipur'),
      (v_state_5, 'Rajnandgaon', 'rajnandgaon'),
      (v_state_5, 'Sukma', 'sukma'),
      (v_state_5, 'Surajpur  ', 'surajpur'),
      (v_state_5, 'Surguja', 'surguja')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Dadra and Nagar Haveli
  if v_state_6 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_6, 'Dadra & Nagar Haveli', 'dadra-nagar-haveli')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Daman and Diu
  if v_state_7 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_7, 'Daman', 'daman'),
      (v_state_7, 'Diu', 'diu')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Delhi
  if v_state_8 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_8, 'Central Delhi', 'central-delhi'),
      (v_state_8, 'East Delhi', 'east-delhi'),
      (v_state_8, 'New Delhi', 'new-delhi'),
      (v_state_8, 'North Delhi', 'north-delhi'),
      (v_state_8, 'North East  Delhi', 'north-east-delhi'),
      (v_state_8, 'North West  Delhi', 'north-west-delhi'),
      (v_state_8, 'Shahdara', 'shahdara'),
      (v_state_8, 'South Delhi', 'south-delhi'),
      (v_state_8, 'South East Delhi', 'south-east-delhi'),
      (v_state_8, 'South West  Delhi', 'south-west-delhi'),
      (v_state_8, 'West Delhi', 'west-delhi')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Goa
  if v_state_9 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_9, 'North Goa', 'north-goa'),
      (v_state_9, 'South Goa', 'south-goa')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Gujarat
  if v_state_10 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_10, 'Ahmedabad', 'ahmedabad'),
      (v_state_10, 'Amreli', 'amreli'),
      (v_state_10, 'Anand', 'anand'),
      (v_state_10, 'Aravalli', 'aravalli'),
      (v_state_10, 'Banaskantha (Palanpur)', 'banaskantha-palanpur'),
      (v_state_10, 'Bharuch', 'bharuch'),
      (v_state_10, 'Bhavnagar', 'bhavnagar'),
      (v_state_10, 'Botad', 'botad'),
      (v_state_10, 'Chhota Udepur', 'chhota-udepur'),
      (v_state_10, 'Dahod', 'dahod'),
      (v_state_10, 'Dangs (Ahwa)', 'dangs-ahwa'),
      (v_state_10, 'Devbhoomi Dwarka', 'devbhoomi-dwarka'),
      (v_state_10, 'Gandhinagar', 'gandhinagar'),
      (v_state_10, 'Gir Somnath', 'gir-somnath'),
      (v_state_10, 'Jamnagar', 'jamnagar'),
      (v_state_10, 'Junagadh', 'junagadh'),
      (v_state_10, 'Kachchh', 'kachchh'),
      (v_state_10, 'Kheda (Nadiad)', 'kheda-nadiad'),
      (v_state_10, 'Mahisagar', 'mahisagar'),
      (v_state_10, 'Mehsana', 'mehsana'),
      (v_state_10, 'Morbi', 'morbi'),
      (v_state_10, 'Narmada (Rajpipla)', 'narmada-rajpipla'),
      (v_state_10, 'Navsari', 'navsari'),
      (v_state_10, 'Panchmahal (Godhra)', 'panchmahal-godhra'),
      (v_state_10, 'Patan', 'patan'),
      (v_state_10, 'Porbandar', 'porbandar'),
      (v_state_10, 'Rajkot', 'rajkot'),
      (v_state_10, 'Sabarkantha (Himmatnagar)', 'sabarkantha-himmatnagar'),
      (v_state_10, 'Surat', 'surat'),
      (v_state_10, 'Surendranagar', 'surendranagar'),
      (v_state_10, 'Tapi (Vyara)', 'tapi-vyara'),
      (v_state_10, 'Vadodara', 'vadodara'),
      (v_state_10, 'Valsad', 'valsad')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Haryana
  if v_state_11 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_11, 'Ambala', 'ambala'),
      (v_state_11, 'Bhiwani', 'bhiwani'),
      (v_state_11, 'Charkhi Dadri', 'charkhi-dadri'),
      (v_state_11, 'Faridabad', 'faridabad'),
      (v_state_11, 'Fatehabad', 'fatehabad'),
      (v_state_11, 'Gurgaon', 'gurgaon'),
      (v_state_11, 'Hisar', 'hisar'),
      (v_state_11, 'Jhajjar', 'jhajjar'),
      (v_state_11, 'Jind', 'jind'),
      (v_state_11, 'Kaithal', 'kaithal'),
      (v_state_11, 'Karnal', 'karnal'),
      (v_state_11, 'Kurukshetra', 'kurukshetra'),
      (v_state_11, 'Mahendragarh', 'mahendragarh'),
      (v_state_11, 'Mewat', 'mewat'),
      (v_state_11, 'Palwal', 'palwal'),
      (v_state_11, 'Panchkula', 'panchkula'),
      (v_state_11, 'Panipat', 'panipat'),
      (v_state_11, 'Rewari', 'rewari'),
      (v_state_11, 'Rohtak', 'rohtak'),
      (v_state_11, 'Sirsa', 'sirsa'),
      (v_state_11, 'Sonipat', 'sonipat'),
      (v_state_11, 'Yamunanagar', 'yamunanagar')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Himachal Pradesh
  if v_state_12 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_12, 'Bilaspur', 'bilaspur'),
      (v_state_12, 'Chamba', 'chamba'),
      (v_state_12, 'Hamirpur', 'hamirpur'),
      (v_state_12, 'Kangra', 'kangra'),
      (v_state_12, 'Kinnaur', 'kinnaur'),
      (v_state_12, 'Kullu', 'kullu'),
      (v_state_12, 'Lahaul &amp; Spiti', 'lahaul-amp-spiti'),
      (v_state_12, 'Mandi', 'mandi'),
      (v_state_12, 'Shimla', 'shimla'),
      (v_state_12, 'Sirmaur (Sirmour)', 'sirmaur-sirmour'),
      (v_state_12, 'Solan', 'solan'),
      (v_state_12, 'Una', 'una')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Jammu and Kashmir
  if v_state_13 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_13, 'Anantnag', 'anantnag'),
      (v_state_13, 'Bandipore', 'bandipore'),
      (v_state_13, 'Baramulla', 'baramulla'),
      (v_state_13, 'Budgam', 'budgam'),
      (v_state_13, 'Doda', 'doda'),
      (v_state_13, 'Ganderbal', 'ganderbal'),
      (v_state_13, 'Jammu', 'jammu'),
      (v_state_13, 'Kargil', 'kargil'),
      (v_state_13, 'Kathua', 'kathua'),
      (v_state_13, 'Kishtwar', 'kishtwar'),
      (v_state_13, 'Kulgam', 'kulgam'),
      (v_state_13, 'Kupwara', 'kupwara'),
      (v_state_13, 'Leh', 'leh'),
      (v_state_13, 'Poonch', 'poonch'),
      (v_state_13, 'Pulwama', 'pulwama'),
      (v_state_13, 'Rajouri', 'rajouri'),
      (v_state_13, 'Ramban', 'ramban'),
      (v_state_13, 'Reasi', 'reasi'),
      (v_state_13, 'Samba', 'samba'),
      (v_state_13, 'Shopian', 'shopian'),
      (v_state_13, 'Srinagar', 'srinagar'),
      (v_state_13, 'Udhampur', 'udhampur')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Jharkhand
  if v_state_14 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_14, 'Bokaro', 'bokaro'),
      (v_state_14, 'Chatra', 'chatra'),
      (v_state_14, 'Deoghar', 'deoghar'),
      (v_state_14, 'Dhanbad', 'dhanbad'),
      (v_state_14, 'Dumka', 'dumka'),
      (v_state_14, 'East Singhbhum', 'east-singhbhum'),
      (v_state_14, 'Garhwa', 'garhwa'),
      (v_state_14, 'Giridih', 'giridih'),
      (v_state_14, 'Godda', 'godda'),
      (v_state_14, 'Gumla', 'gumla'),
      (v_state_14, 'Hazaribag', 'hazaribag'),
      (v_state_14, 'Jamtara', 'jamtara'),
      (v_state_14, 'Khunti', 'khunti'),
      (v_state_14, 'Koderma', 'koderma'),
      (v_state_14, 'Latehar', 'latehar'),
      (v_state_14, 'Lohardaga', 'lohardaga'),
      (v_state_14, 'Pakur', 'pakur'),
      (v_state_14, 'Palamu', 'palamu'),
      (v_state_14, 'Ramgarh', 'ramgarh'),
      (v_state_14, 'Ranchi', 'ranchi'),
      (v_state_14, 'Sahibganj', 'sahibganj'),
      (v_state_14, 'Seraikela-Kharsawan', 'seraikela-kharsawan'),
      (v_state_14, 'Simdega', 'simdega'),
      (v_state_14, 'West Singhbhum', 'west-singhbhum')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Karnataka
  if v_state_15 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_15, 'Bagalkot', 'bagalkot'),
      (v_state_15, 'Ballari (Bellary)', 'ballari-bellary'),
      (v_state_15, 'Belagavi (Belgaum)', 'belagavi-belgaum'),
      (v_state_15, 'Bengaluru (Bangalore) Rural', 'bengaluru-bangalore-rural'),
      (v_state_15, 'Bengaluru (Bangalore) Urban', 'bengaluru-bangalore-urban'),
      (v_state_15, 'Bidar', 'bidar'),
      (v_state_15, 'Chamarajanagar', 'chamarajanagar'),
      (v_state_15, 'Chikballapur', 'chikballapur'),
      (v_state_15, 'Chikkamagaluru (Chikmagalur)', 'chikkamagaluru-chikmagalur'),
      (v_state_15, 'Chitradurga', 'chitradurga'),
      (v_state_15, 'Dakshina Kannada', 'dakshina-kannada'),
      (v_state_15, 'Davangere', 'davangere'),
      (v_state_15, 'Dharwad', 'dharwad'),
      (v_state_15, 'Gadag', 'gadag'),
      (v_state_15, 'Hassan', 'hassan'),
      (v_state_15, 'Haveri', 'haveri'),
      (v_state_15, 'Kalaburagi (Gulbarga)', 'kalaburagi-gulbarga'),
      (v_state_15, 'Kodagu', 'kodagu'),
      (v_state_15, 'Kolar', 'kolar'),
      (v_state_15, 'Koppal', 'koppal'),
      (v_state_15, 'Mandya', 'mandya'),
      (v_state_15, 'Mysuru (Mysore)', 'mysuru-mysore'),
      (v_state_15, 'Raichur', 'raichur'),
      (v_state_15, 'Ramanagara', 'ramanagara'),
      (v_state_15, 'Shivamogga (Shimoga)', 'shivamogga-shimoga'),
      (v_state_15, 'Tumakuru (Tumkur)', 'tumakuru-tumkur'),
      (v_state_15, 'Udupi', 'udupi'),
      (v_state_15, 'Uttara Kannada (Karwar)', 'uttara-kannada-karwar'),
      (v_state_15, 'Vijayapura (Bijapur)', 'vijayapura-bijapur'),
      (v_state_15, 'Yadgir', 'yadgir')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Kerala
  if v_state_16 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_16, 'Alappuzha', 'alappuzha'),
      (v_state_16, 'Ernakulam', 'ernakulam'),
      (v_state_16, 'Idukki', 'idukki'),
      (v_state_16, 'Kannur', 'kannur'),
      (v_state_16, 'Kasaragod', 'kasaragod'),
      (v_state_16, 'Kollam', 'kollam'),
      (v_state_16, 'Kottayam', 'kottayam'),
      (v_state_16, 'Kozhikode', 'kozhikode'),
      (v_state_16, 'Malappuram', 'malappuram'),
      (v_state_16, 'Palakkad', 'palakkad'),
      (v_state_16, 'Pathanamthitta', 'pathanamthitta'),
      (v_state_16, 'Thiruvananthapuram', 'thiruvananthapuram'),
      (v_state_16, 'Thrissur', 'thrissur'),
      (v_state_16, 'Wayanad', 'wayanad')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Lakshadweep
  if v_state_17 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_17, 'Agatti', 'agatti'),
      (v_state_17, 'Amini', 'amini'),
      (v_state_17, 'Androth', 'androth'),
      (v_state_17, 'Bithra', 'bithra'),
      (v_state_17, 'Chethlath', 'chethlath'),
      (v_state_17, 'Kavaratti', 'kavaratti'),
      (v_state_17, 'Kadmath', 'kadmath'),
      (v_state_17, 'Kalpeni', 'kalpeni'),
      (v_state_17, 'Kilthan', 'kilthan'),
      (v_state_17, 'Minicoy', 'minicoy')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Madhya Pradesh
  if v_state_18 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_18, 'Agar Malwa', 'agar-malwa'),
      (v_state_18, 'Alirajpur', 'alirajpur'),
      (v_state_18, 'Anuppur', 'anuppur'),
      (v_state_18, 'Ashoknagar', 'ashoknagar'),
      (v_state_18, 'Balaghat', 'balaghat'),
      (v_state_18, 'Barwani', 'barwani'),
      (v_state_18, 'Betul', 'betul'),
      (v_state_18, 'Bhind', 'bhind'),
      (v_state_18, 'Bhopal', 'bhopal'),
      (v_state_18, 'Burhanpur', 'burhanpur'),
      (v_state_18, 'Chhatarpur', 'chhatarpur'),
      (v_state_18, 'Chhindwara', 'chhindwara'),
      (v_state_18, 'Damoh', 'damoh'),
      (v_state_18, 'Datia', 'datia'),
      (v_state_18, 'Dewas', 'dewas'),
      (v_state_18, 'Dhar', 'dhar'),
      (v_state_18, 'Dindori', 'dindori'),
      (v_state_18, 'Guna', 'guna'),
      (v_state_18, 'Gwalior', 'gwalior'),
      (v_state_18, 'Harda', 'harda'),
      (v_state_18, 'Hoshangabad', 'hoshangabad'),
      (v_state_18, 'Indore', 'indore'),
      (v_state_18, 'Jabalpur', 'jabalpur'),
      (v_state_18, 'Jhabua', 'jhabua'),
      (v_state_18, 'Katni', 'katni'),
      (v_state_18, 'Khandwa', 'khandwa'),
      (v_state_18, 'Khargone', 'khargone'),
      (v_state_18, 'Mandla', 'mandla'),
      (v_state_18, 'Mandsaur', 'mandsaur'),
      (v_state_18, 'Morena', 'morena'),
      (v_state_18, 'Narsinghpur', 'narsinghpur'),
      (v_state_18, 'Neemuch', 'neemuch'),
      (v_state_18, 'Panna', 'panna'),
      (v_state_18, 'Raisen', 'raisen'),
      (v_state_18, 'Rajgarh', 'rajgarh'),
      (v_state_18, 'Ratlam', 'ratlam'),
      (v_state_18, 'Rewa', 'rewa'),
      (v_state_18, 'Sagar', 'sagar'),
      (v_state_18, 'Satna', 'satna'),
      (v_state_18, 'Sehore', 'sehore'),
      (v_state_18, 'Seoni', 'seoni'),
      (v_state_18, 'Shahdol', 'shahdol'),
      (v_state_18, 'Shajapur', 'shajapur'),
      (v_state_18, 'Sheopur', 'sheopur'),
      (v_state_18, 'Shivpuri', 'shivpuri'),
      (v_state_18, 'Sidhi', 'sidhi'),
      (v_state_18, 'Singrauli', 'singrauli'),
      (v_state_18, 'Tikamgarh', 'tikamgarh'),
      (v_state_18, 'Ujjain', 'ujjain'),
      (v_state_18, 'Umaria', 'umaria'),
      (v_state_18, 'Vidisha', 'vidisha')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Maharashtra
  if v_state_19 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_19, 'Ahmednagar', 'ahmednagar'),
      (v_state_19, 'Akola', 'akola'),
      (v_state_19, 'Amravati', 'amravati'),
      (v_state_19, 'Aurangabad', 'aurangabad'),
      (v_state_19, 'Beed', 'beed'),
      (v_state_19, 'Bhandara', 'bhandara'),
      (v_state_19, 'Buldhana', 'buldhana'),
      (v_state_19, 'Chandrapur', 'chandrapur'),
      (v_state_19, 'Dhule', 'dhule'),
      (v_state_19, 'Gadchiroli', 'gadchiroli'),
      (v_state_19, 'Gondia', 'gondia'),
      (v_state_19, 'Hingoli', 'hingoli'),
      (v_state_19, 'Jalgaon', 'jalgaon'),
      (v_state_19, 'Jalna', 'jalna'),
      (v_state_19, 'Kolhapur', 'kolhapur'),
      (v_state_19, 'Latur', 'latur'),
      (v_state_19, 'Mumbai City', 'mumbai-city'),
      (v_state_19, 'Mumbai Suburban', 'mumbai-suburban'),
      (v_state_19, 'Nagpur', 'nagpur'),
      (v_state_19, 'Nanded', 'nanded'),
      (v_state_19, 'Nandurbar', 'nandurbar'),
      (v_state_19, 'Nashik', 'nashik'),
      (v_state_19, 'Osmanabad', 'osmanabad'),
      (v_state_19, 'Palghar', 'palghar'),
      (v_state_19, 'Parbhani', 'parbhani'),
      (v_state_19, 'Pune', 'pune'),
      (v_state_19, 'Raigad', 'raigad'),
      (v_state_19, 'Ratnagiri', 'ratnagiri'),
      (v_state_19, 'Sangli', 'sangli'),
      (v_state_19, 'Satara', 'satara'),
      (v_state_19, 'Sindhudurg', 'sindhudurg'),
      (v_state_19, 'Solapur', 'solapur'),
      (v_state_19, 'Thane', 'thane'),
      (v_state_19, 'Wardha', 'wardha'),
      (v_state_19, 'Washim', 'washim'),
      (v_state_19, 'Yavatmal', 'yavatmal')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Manipur
  if v_state_20 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_20, 'Bishnupur', 'bishnupur'),
      (v_state_20, 'Chandel', 'chandel'),
      (v_state_20, 'Churachandpur', 'churachandpur'),
      (v_state_20, 'Imphal East', 'imphal-east'),
      (v_state_20, 'Imphal West', 'imphal-west'),
      (v_state_20, 'Jiribam', 'jiribam'),
      (v_state_20, 'Kakching', 'kakching'),
      (v_state_20, 'Kamjong', 'kamjong'),
      (v_state_20, 'Kangpokpi', 'kangpokpi'),
      (v_state_20, 'Noney', 'noney'),
      (v_state_20, 'Pherzawl', 'pherzawl'),
      (v_state_20, 'Senapati', 'senapati'),
      (v_state_20, 'Tamenglong', 'tamenglong'),
      (v_state_20, 'Tengnoupal', 'tengnoupal'),
      (v_state_20, 'Thoubal', 'thoubal'),
      (v_state_20, 'Ukhrul', 'ukhrul')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Meghalaya
  if v_state_21 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_21, 'East Garo Hills', 'east-garo-hills'),
      (v_state_21, 'East Jaintia Hills', 'east-jaintia-hills'),
      (v_state_21, 'East Khasi Hills', 'east-khasi-hills'),
      (v_state_21, 'North Garo Hills', 'north-garo-hills'),
      (v_state_21, 'Ri Bhoi', 'ri-bhoi'),
      (v_state_21, 'South Garo Hills', 'south-garo-hills'),
      (v_state_21, 'South West Garo Hills ', 'south-west-garo-hills'),
      (v_state_21, 'South West Khasi Hills', 'south-west-khasi-hills'),
      (v_state_21, 'West Garo Hills', 'west-garo-hills'),
      (v_state_21, 'West Jaintia Hills', 'west-jaintia-hills'),
      (v_state_21, 'West Khasi Hills', 'west-khasi-hills')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Mizoram
  if v_state_22 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_22, 'Aizawl', 'aizawl'),
      (v_state_22, 'Champhai', 'champhai'),
      (v_state_22, 'Kolasib', 'kolasib'),
      (v_state_22, 'Lawngtlai', 'lawngtlai'),
      (v_state_22, 'Lunglei', 'lunglei'),
      (v_state_22, 'Mamit', 'mamit'),
      (v_state_22, 'Saiha', 'saiha'),
      (v_state_22, 'Serchhip', 'serchhip')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Nagaland
  if v_state_23 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_23, 'Dimapur', 'dimapur'),
      (v_state_23, 'Kiphire', 'kiphire'),
      (v_state_23, 'Kohima', 'kohima'),
      (v_state_23, 'Longleng', 'longleng'),
      (v_state_23, 'Mokokchung', 'mokokchung'),
      (v_state_23, 'Mon', 'mon'),
      (v_state_23, 'Peren', 'peren'),
      (v_state_23, 'Phek', 'phek'),
      (v_state_23, 'Tuensang', 'tuensang'),
      (v_state_23, 'Wokha', 'wokha'),
      (v_state_23, 'Zunheboto', 'zunheboto')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Odisha
  if v_state_24 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_24, 'Angul', 'angul'),
      (v_state_24, 'Balangir', 'balangir'),
      (v_state_24, 'Balasore', 'balasore'),
      (v_state_24, 'Bargarh', 'bargarh'),
      (v_state_24, 'Bhadrak', 'bhadrak'),
      (v_state_24, 'Boudh', 'boudh'),
      (v_state_24, 'Cuttack', 'cuttack'),
      (v_state_24, 'Deogarh', 'deogarh'),
      (v_state_24, 'Dhenkanal', 'dhenkanal'),
      (v_state_24, 'Gajapati', 'gajapati'),
      (v_state_24, 'Ganjam', 'ganjam'),
      (v_state_24, 'Jagatsinghapur', 'jagatsinghapur'),
      (v_state_24, 'Jajpur', 'jajpur'),
      (v_state_24, 'Jharsuguda', 'jharsuguda'),
      (v_state_24, 'Kalahandi', 'kalahandi'),
      (v_state_24, 'Kandhamal', 'kandhamal'),
      (v_state_24, 'Kendrapara', 'kendrapara'),
      (v_state_24, 'Kendujhar (Keonjhar)', 'kendujhar-keonjhar'),
      (v_state_24, 'Khordha', 'khordha'),
      (v_state_24, 'Koraput', 'koraput'),
      (v_state_24, 'Malkangiri', 'malkangiri'),
      (v_state_24, 'Mayurbhanj', 'mayurbhanj'),
      (v_state_24, 'Nabarangpur', 'nabarangpur'),
      (v_state_24, 'Nayagarh', 'nayagarh'),
      (v_state_24, 'Nuapada', 'nuapada'),
      (v_state_24, 'Puri', 'puri'),
      (v_state_24, 'Rayagada', 'rayagada'),
      (v_state_24, 'Sambalpur', 'sambalpur'),
      (v_state_24, 'Sonepur', 'sonepur'),
      (v_state_24, 'Sundargarh', 'sundargarh')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Puducherry
  if v_state_25 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_25, 'Karaikal', 'karaikal'),
      (v_state_25, 'Mahe', 'mahe'),
      (v_state_25, 'Pondicherry', 'pondicherry'),
      (v_state_25, 'Yanam', 'yanam')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Punjab
  if v_state_26 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_26, 'Amritsar', 'amritsar'),
      (v_state_26, 'Barnala', 'barnala'),
      (v_state_26, 'Bathinda', 'bathinda'),
      (v_state_26, 'Faridkot', 'faridkot'),
      (v_state_26, 'Fatehgarh Sahib', 'fatehgarh-sahib'),
      (v_state_26, 'Fazilka', 'fazilka'),
      (v_state_26, 'Ferozepur', 'ferozepur'),
      (v_state_26, 'Gurdaspur', 'gurdaspur'),
      (v_state_26, 'Hoshiarpur', 'hoshiarpur'),
      (v_state_26, 'Jalandhar', 'jalandhar'),
      (v_state_26, 'Kapurthala', 'kapurthala'),
      (v_state_26, 'Ludhiana', 'ludhiana'),
      (v_state_26, 'Mansa', 'mansa'),
      (v_state_26, 'Moga', 'moga'),
      (v_state_26, 'Muktsar', 'muktsar'),
      (v_state_26, 'Nawanshahr (Shahid Bhagat Singh Nagar)', 'nawanshahr-shahid-bhagat-singh-nagar'),
      (v_state_26, 'Pathankot', 'pathankot'),
      (v_state_26, 'Patiala', 'patiala'),
      (v_state_26, 'Rupnagar', 'rupnagar'),
      (v_state_26, 'Sahibzada Ajit Singh Nagar (Mohali)', 'sahibzada-ajit-singh-nagar-mohali'),
      (v_state_26, 'Sangrur', 'sangrur'),
      (v_state_26, 'Tarn Taran', 'tarn-taran')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Rajasthan
  if v_state_27 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_27, 'Ajmer', 'ajmer'),
      (v_state_27, 'Alwar', 'alwar'),
      (v_state_27, 'Banswara', 'banswara'),
      (v_state_27, 'Baran', 'baran'),
      (v_state_27, 'Barmer', 'barmer'),
      (v_state_27, 'Bharatpur', 'bharatpur'),
      (v_state_27, 'Bhilwara', 'bhilwara'),
      (v_state_27, 'Bikaner', 'bikaner'),
      (v_state_27, 'Bundi', 'bundi'),
      (v_state_27, 'Chittorgarh', 'chittorgarh'),
      (v_state_27, 'Churu', 'churu'),
      (v_state_27, 'Dausa', 'dausa'),
      (v_state_27, 'Dholpur', 'dholpur'),
      (v_state_27, 'Dungarpur', 'dungarpur'),
      (v_state_27, 'Hanumangarh', 'hanumangarh'),
      (v_state_27, 'Jaipur', 'jaipur'),
      (v_state_27, 'Jaisalmer', 'jaisalmer'),
      (v_state_27, 'Jalore', 'jalore'),
      (v_state_27, 'Jhalawar', 'jhalawar'),
      (v_state_27, 'Jhunjhunu', 'jhunjhunu'),
      (v_state_27, 'Jodhpur', 'jodhpur'),
      (v_state_27, 'Karauli', 'karauli'),
      (v_state_27, 'Kota', 'kota'),
      (v_state_27, 'Nagaur', 'nagaur'),
      (v_state_27, 'Pali', 'pali'),
      (v_state_27, 'Pratapgarh', 'pratapgarh'),
      (v_state_27, 'Rajsamand', 'rajsamand'),
      (v_state_27, 'Sawai Madhopur', 'sawai-madhopur'),
      (v_state_27, 'Sikar', 'sikar'),
      (v_state_27, 'Sirohi', 'sirohi'),
      (v_state_27, 'Sri Ganganagar', 'sri-ganganagar'),
      (v_state_27, 'Tonk', 'tonk'),
      (v_state_27, 'Udaipur', 'udaipur')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Sikkim
  if v_state_28 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_28, 'East Sikkim', 'east-sikkim'),
      (v_state_28, 'North Sikkim', 'north-sikkim'),
      (v_state_28, 'South Sikkim', 'south-sikkim'),
      (v_state_28, 'West Sikkim', 'west-sikkim')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Tamil Nadu
  if v_state_29 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_29, 'Ariyalur', 'ariyalur'),
      (v_state_29, 'Chennai', 'chennai'),
      (v_state_29, 'Coimbatore', 'coimbatore'),
      (v_state_29, 'Cuddalore', 'cuddalore'),
      (v_state_29, 'Dharmapuri', 'dharmapuri'),
      (v_state_29, 'Dindigul', 'dindigul'),
      (v_state_29, 'Erode', 'erode'),
      (v_state_29, 'Kanchipuram', 'kanchipuram'),
      (v_state_29, 'Kanyakumari', 'kanyakumari'),
      (v_state_29, 'Karur', 'karur'),
      (v_state_29, 'Krishnagiri', 'krishnagiri'),
      (v_state_29, 'Madurai', 'madurai'),
      (v_state_29, 'Nagapattinam', 'nagapattinam'),
      (v_state_29, 'Namakkal', 'namakkal'),
      (v_state_29, 'Nilgiris', 'nilgiris'),
      (v_state_29, 'Perambalur', 'perambalur'),
      (v_state_29, 'Pudukkottai', 'pudukkottai'),
      (v_state_29, 'Ramanathapuram', 'ramanathapuram'),
      (v_state_29, 'Salem', 'salem'),
      (v_state_29, 'Sivaganga', 'sivaganga'),
      (v_state_29, 'Thanjavur', 'thanjavur'),
      (v_state_29, 'Theni', 'theni'),
      (v_state_29, 'Thoothukudi (Tuticorin)', 'thoothukudi-tuticorin'),
      (v_state_29, 'Tiruchirappalli', 'tiruchirappalli'),
      (v_state_29, 'Tirunelveli', 'tirunelveli'),
      (v_state_29, 'Tiruppur', 'tiruppur'),
      (v_state_29, 'Tiruvallur', 'tiruvallur'),
      (v_state_29, 'Tiruvannamalai', 'tiruvannamalai'),
      (v_state_29, 'Tiruvarur', 'tiruvarur'),
      (v_state_29, 'Vellore', 'vellore'),
      (v_state_29, 'Viluppuram', 'viluppuram'),
      (v_state_29, 'Virudhunagar', 'virudhunagar')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Telangana
  if v_state_30 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_30, 'Adilabad', 'adilabad'),
      (v_state_30, 'Bhadradri Kothagudem', 'bhadradri-kothagudem'),
      (v_state_30, 'Hyderabad', 'hyderabad'),
      (v_state_30, 'Jagtial', 'jagtial'),
      (v_state_30, 'Jangaon', 'jangaon'),
      (v_state_30, 'Jayashankar Bhoopalpally', 'jayashankar-bhoopalpally'),
      (v_state_30, 'Jogulamba Gadwal', 'jogulamba-gadwal'),
      (v_state_30, 'Kamareddy', 'kamareddy'),
      (v_state_30, 'Karimnagar', 'karimnagar'),
      (v_state_30, 'Khammam', 'khammam'),
      (v_state_30, 'Komaram Bheem Asifabad', 'komaram-bheem-asifabad'),
      (v_state_30, 'Mahabubabad', 'mahabubabad'),
      (v_state_30, 'Mahabubnagar', 'mahabubnagar'),
      (v_state_30, 'Mancherial', 'mancherial'),
      (v_state_30, 'Medak', 'medak'),
      (v_state_30, 'Medchal', 'medchal'),
      (v_state_30, 'Nagarkurnool', 'nagarkurnool'),
      (v_state_30, 'Nalgonda', 'nalgonda'),
      (v_state_30, 'Nirmal', 'nirmal'),
      (v_state_30, 'Nizamabad', 'nizamabad'),
      (v_state_30, 'Peddapalli', 'peddapalli'),
      (v_state_30, 'Rajanna Sircilla', 'rajanna-sircilla'),
      (v_state_30, 'Rangareddy', 'rangareddy'),
      (v_state_30, 'Sangareddy', 'sangareddy'),
      (v_state_30, 'Siddipet', 'siddipet'),
      (v_state_30, 'Suryapet', 'suryapet'),
      (v_state_30, 'Vikarabad', 'vikarabad'),
      (v_state_30, 'Wanaparthy', 'wanaparthy'),
      (v_state_30, 'Warangal (Rural)', 'warangal-rural'),
      (v_state_30, 'Warangal (Urban)', 'warangal-urban'),
      (v_state_30, 'Yadadri Bhuvanagiri', 'yadadri-bhuvanagiri')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Tripura
  if v_state_31 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_31, 'Dhalai', 'dhalai'),
      (v_state_31, 'Gomati', 'gomati'),
      (v_state_31, 'Khowai', 'khowai'),
      (v_state_31, 'North Tripura', 'north-tripura'),
      (v_state_31, 'Sepahijala', 'sepahijala'),
      (v_state_31, 'South Tripura', 'south-tripura'),
      (v_state_31, 'Unakoti', 'unakoti'),
      (v_state_31, 'West Tripura', 'west-tripura')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Uttarakhand
  if v_state_32 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_32, 'Almora', 'almora'),
      (v_state_32, 'Bageshwar', 'bageshwar'),
      (v_state_32, 'Chamoli', 'chamoli'),
      (v_state_32, 'Champawat', 'champawat'),
      (v_state_32, 'Dehradun', 'dehradun'),
      (v_state_32, 'Haridwar', 'haridwar'),
      (v_state_32, 'Nainital', 'nainital'),
      (v_state_32, 'Pauri Garhwal', 'pauri-garhwal'),
      (v_state_32, 'Pithoragarh', 'pithoragarh'),
      (v_state_32, 'Rudraprayag', 'rudraprayag'),
      (v_state_32, 'Tehri Garhwal', 'tehri-garhwal'),
      (v_state_32, 'Udham Singh Nagar', 'udham-singh-nagar'),
      (v_state_32, 'Uttarkashi', 'uttarkashi')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for Uttar Pradesh
  if v_state_33 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_33, 'Agra', 'agra'),
      (v_state_33, 'Aligarh', 'aligarh'),
      (v_state_33, 'Allahabad', 'allahabad'),
      (v_state_33, 'Ambedkar Nagar', 'ambedkar-nagar'),
      (v_state_33, 'Amethi (Chatrapati Sahuji Mahraj Nagar)', 'amethi-chatrapati-sahuji-mahraj-nagar'),
      (v_state_33, 'Amroha (J.P. Nagar)', 'amroha-jp-nagar'),
      (v_state_33, 'Auraiya', 'auraiya'),
      (v_state_33, 'Azamgarh', 'azamgarh'),
      (v_state_33, 'Baghpat', 'baghpat'),
      (v_state_33, 'Bahraich', 'bahraich'),
      (v_state_33, 'Ballia', 'ballia'),
      (v_state_33, 'Balrampur', 'balrampur'),
      (v_state_33, 'Banda', 'banda'),
      (v_state_33, 'Barabanki', 'barabanki'),
      (v_state_33, 'Bareilly', 'bareilly'),
      (v_state_33, 'Basti', 'basti'),
      (v_state_33, 'Bhadohi', 'bhadohi'),
      (v_state_33, 'Bijnor', 'bijnor'),
      (v_state_33, 'Budaun', 'budaun'),
      (v_state_33, 'Bulandshahr', 'bulandshahr'),
      (v_state_33, 'Chandauli', 'chandauli'),
      (v_state_33, 'Chitrakoot', 'chitrakoot'),
      (v_state_33, 'Deoria', 'deoria'),
      (v_state_33, 'Etah', 'etah'),
      (v_state_33, 'Etawah', 'etawah'),
      (v_state_33, 'Faizabad', 'faizabad'),
      (v_state_33, 'Farrukhabad', 'farrukhabad'),
      (v_state_33, 'Fatehpur', 'fatehpur'),
      (v_state_33, 'Firozabad', 'firozabad'),
      (v_state_33, 'Gautam Buddha Nagar', 'gautam-buddha-nagar'),
      (v_state_33, 'Ghaziabad', 'ghaziabad'),
      (v_state_33, 'Ghazipur', 'ghazipur'),
      (v_state_33, 'Gonda', 'gonda'),
      (v_state_33, 'Gorakhpur', 'gorakhpur'),
      (v_state_33, 'Hamirpur', 'hamirpur'),
      (v_state_33, 'Hapur (Panchsheel Nagar)', 'hapur-panchsheel-nagar'),
      (v_state_33, 'Hardoi', 'hardoi'),
      (v_state_33, 'Hathras', 'hathras'),
      (v_state_33, 'Jalaun', 'jalaun'),
      (v_state_33, 'Jaunpur', 'jaunpur'),
      (v_state_33, 'Jhansi', 'jhansi'),
      (v_state_33, 'Kannauj', 'kannauj'),
      (v_state_33, 'Kanpur Dehat', 'kanpur-dehat'),
      (v_state_33, 'Kanpur Nagar', 'kanpur-nagar'),
      (v_state_33, 'Kanshiram Nagar (Kasganj)', 'kanshiram-nagar-kasganj'),
      (v_state_33, 'Kaushambi', 'kaushambi'),
      (v_state_33, 'Kushinagar (Padrauna)', 'kushinagar-padrauna'),
      (v_state_33, 'Lakhimpur - Kheri', 'lakhimpur-kheri'),
      (v_state_33, 'Lalitpur', 'lalitpur'),
      (v_state_33, 'Lucknow', 'lucknow'),
      (v_state_33, 'Maharajganj', 'maharajganj'),
      (v_state_33, 'Mahoba', 'mahoba'),
      (v_state_33, 'Mainpuri', 'mainpuri'),
      (v_state_33, 'Mathura', 'mathura'),
      (v_state_33, 'Mau', 'mau'),
      (v_state_33, 'Meerut', 'meerut'),
      (v_state_33, 'Mirzapur', 'mirzapur'),
      (v_state_33, 'Moradabad', 'moradabad'),
      (v_state_33, 'Muzaffarnagar', 'muzaffarnagar'),
      (v_state_33, 'Pilibhit', 'pilibhit'),
      (v_state_33, 'Pratapgarh', 'pratapgarh'),
      (v_state_33, 'RaeBareli', 'raebareli'),
      (v_state_33, 'Rampur', 'rampur'),
      (v_state_33, 'Saharanpur', 'saharanpur'),
      (v_state_33, 'Sambhal (Bhim Nagar)', 'sambhal-bhim-nagar'),
      (v_state_33, 'Sant Kabir Nagar', 'sant-kabir-nagar'),
      (v_state_33, 'Shahjahanpur', 'shahjahanpur'),
      (v_state_33, 'Shamali (Prabuddh Nagar)', 'shamali-prabuddh-nagar'),
      (v_state_33, 'Shravasti', 'shravasti'),
      (v_state_33, 'Siddharth Nagar', 'siddharth-nagar'),
      (v_state_33, 'Sitapur', 'sitapur'),
      (v_state_33, 'Sonbhadra', 'sonbhadra'),
      (v_state_33, 'Sultanpur', 'sultanpur'),
      (v_state_33, 'Unnao', 'unnao'),
      (v_state_33, 'Varanasi', 'varanasi')
    on conflict (state_id, slug) do nothing;
  end if;

  -- Districts for West Bengal
  if v_state_34 is not null then
    insert into public.districts (state_id, name, slug) values
      (v_state_34, 'Alipurduar', 'alipurduar'),
      (v_state_34, 'Bankura', 'bankura'),
      (v_state_34, 'Birbhum', 'birbhum'),
      (v_state_34, 'Burdwan (Bardhaman)', 'burdwan-bardhaman'),
      (v_state_34, 'Cooch Behar', 'cooch-behar'),
      (v_state_34, 'Dakshin Dinajpur (South Dinajpur)', 'dakshin-dinajpur-south-dinajpur'),
      (v_state_34, 'Darjeeling', 'darjeeling'),
      (v_state_34, 'Hooghly', 'hooghly'),
      (v_state_34, 'Howrah', 'howrah'),
      (v_state_34, 'Jalpaiguri', 'jalpaiguri'),
      (v_state_34, 'Kalimpong', 'kalimpong'),
      (v_state_34, 'Kolkata', 'kolkata'),
      (v_state_34, 'Malda', 'malda'),
      (v_state_34, 'Murshidabad', 'murshidabad'),
      (v_state_34, 'Nadia', 'nadia'),
      (v_state_34, 'North 24 Parganas', 'north-24-parganas'),
      (v_state_34, 'Paschim Medinipur (West Medinipur)', 'paschim-medinipur-west-medinipur'),
      (v_state_34, 'Purba Medinipur (East Medinipur)', 'purba-medinipur-east-medinipur'),
      (v_state_34, 'Purulia', 'purulia'),
      (v_state_34, 'South 24 Parganas', 'south-24-parganas'),
      (v_state_34, 'Uttar Dinajpur (North Dinajpur)', 'uttar-dinajpur-north-dinajpur')
    on conflict (state_id, slug) do nothing;
  end if;

end $$;