-- ============================================================
-- V7: Seed dummy data for local development
-- Statutes, Sections, Judgments, SROs, Demo User
-- ============================================================

-- ─── STATUTES ───────────────────────────────────────────────

INSERT INTO statutes (act_number, title_en, title_bn, year, category, status, effective_date, source_url) VALUES
('Act No. IV of 1860',
 'The Penal Code, 1860',
 'দণ্ডবিধি, ১৮৬০',
 1860, 'Criminal Law', 'ACTIVE', '1860-10-06',
 'http://bdlaws.minlaw.gov.bd/act-11.html'),

('Act No. I of 1872',
 'The Evidence Act, 1872',
 'সাক্ষ্য আইন, ১৮৭২',
 1872, 'Evidence Law', 'ACTIVE', '1872-03-01',
 'http://bdlaws.minlaw.gov.bd/act-24.html'),

('Act No. IX of 1872',
 'The Contract Act, 1872',
 'চুক্তি আইন, ১৮৭২',
 1872, 'Civil Law', 'ACTIVE', '1872-09-01',
 'http://bdlaws.minlaw.gov.bd/act-26.html'),

('Act No. VIII of 1984',
 'The Muslim Family Laws Ordinance, 1961 (as amended)',
 'মুসলিম পারিবারিক আইন অধ্যাদেশ, ১৯৬১',
 1961, 'Family Law', 'ACTIVE', '1961-07-15',
 'http://bdlaws.minlaw.gov.bd/act-329.html'),

('Act No. XVIII of 2000',
 'The Money Loan Court Act, 2003',
 'অর্থঋণ আদালত আইন, ২০০৩',
 2003, 'Commercial Law', 'ACTIVE', '2003-05-01',
 'http://bdlaws.minlaw.gov.bd/act-896.html'),

('Act No. X of 1908',
 'The Code of Civil Procedure, 1908',
 'দেওয়ানী কার্যবিধি, ১৯০৮',
 1908, 'Civil Procedure', 'ACTIVE', '1908-01-01',
 'http://bdlaws.minlaw.gov.bd/act-86.html'),

('Act No. V of 1898',
 'The Code of Criminal Procedure, 1898',
 'ফৌজদারি কার্যবিধি, ১৮৯৮',
 1898, 'Criminal Procedure', 'ACTIVE', '1898-03-22',
 'http://bdlaws.minlaw.gov.bd/act-75.html');


-- ─── SECTIONS (Penal Code — statute id = 1) ─────────────────

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '299',
  'Culpable homicide',
  'অপরাধজনক নরহত্যা',
  'Whoever causes death by doing an act with the intention of causing death, or with the intention of causing such bodily injury as is likely to cause death, or with the knowledge that he is likely by such act to cause death, commits the offence of culpable homicide.',
  'যে ব্যক্তি মৃত্যু ঘটাইবার ইচ্ছায়, অথবা এমন শারীরিক আঘাত করিবার ইচ্ছায় যাহাতে মৃত্যু হইতে পারে, অথবা এই জ্ঞানে যে তাহার কার্য মৃত্যু ঘটাইতে পারে, কোনো কার্য করিয়া মৃত্যু ঘটায়, সে অপরাধজনক নরহত্যার অপরাধ করে।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. IV of 1860';

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '300',
  'Murder',
  'খুন',
  'Except in the cases hereinafter excepted, culpable homicide is murder, if the act by which the death is caused is done with the intention of causing death, or if it is done with the intention of causing such bodily injury as the offender knows to be likely to cause the death of the person to whom the harm is caused.',
  'নিম্নোক্ত ব্যতিক্রমগুলি ছাড়া, অপরাধজনক নরহত্যা খুন হয়, যদি মৃত্যু ঘটানোর কার্যটি মৃত্যু ঘটাইবার ইচ্ছায় করা হয়, অথবা এমন শারীরিক আঘাত করিবার ইচ্ছায় করা হয় যাহা অপরাধী জানে যে সংশ্লিষ্ট ব্যক্তির মৃত্যু ঘটাইতে পারে।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. IV of 1860';

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '302',
  'Punishment for murder',
  'খুনের শাস্তি',
  'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
  'যে ব্যক্তি খুন করে সে মৃত্যুদণ্ড বা যাবজ্জীবন কারাদণ্ডে দণ্ডিত হইবে এবং অর্থদণ্ডেও দণ্ডনীয় হইবে।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. IV of 1860';

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '375',
  'Rape',
  'ধর্ষণ',
  'A man is said to commit "rape" who, except in the case hereinafter excepted, has sexual intercourse with a woman under circumstances falling under any of the five following descriptions: First — Against her will. Secondly — Without her consent. Thirdly — With her consent, when her consent has been obtained by putting her in fear of death, or of hurt. Fourthly — With her consent, when the man knows that he is not her husband, and that her consent is given because she believes that he is another man to whom she is or believes herself to be lawfully married. Fifthly — With or without her consent, when she is under sixteen years of age.',
  'একজন পুরুষ "ধর্ষণ" করিয়াছে বলা হয় যদি সে নিচের পাঁচটি পরিস্থিতির যেকোনো একটিতে একজন নারীর সাথে যৌন সম্পর্ক স্থাপন করে: প্রথমত — তার ইচ্ছার বিরুদ্ধে। দ্বিতীয়ত — তার সম্মতি ছাড়া। তৃতীয়ত — তার সম্মতিতে, যখন সম্মতি মৃত্যুর ভয় বা আঘাতের ভয় দেখিয়ে আদায় করা হইয়াছে।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. IV of 1860';

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '420',
  'Cheating and dishonestly inducing delivery of property',
  'প্রতারণা ও সম্পত্তি হস্তান্তরে প্রবঞ্চনা',
  'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
  'যে ব্যক্তি প্রতারণা করিয়া প্রতারিত ব্যক্তিকে কোনো সম্পত্তি হস্তান্তর করিতে বা কোনো মূল্যবান দলিল তৈরি, পরিবর্তন বা ধ্বংস করিতে প্রলুব্ধ করে, সে সাত বৎসর পর্যন্ত কারাদণ্ড এবং অর্থদণ্ডে দণ্ডনীয় হইবে।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. IV of 1860';


-- ─── SECTIONS (Evidence Act — statute id = 2) ───────────────

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '3',
  'Interpretation clause',
  'ব্যাখ্যা ধারা',
  'In this Act the following words and expressions are used in the following senses, unless a contrary intention appears from the context: "Court" includes all Judges and Magistrates, and all persons, except arbitrators, legally authorised to take evidence. "Fact" means and includes — (1) any thing, state of things, or relation of things, capable of being perceived by the senses; (2) any mental condition of which any person is conscious.',
  'এই আইনে নিম্নোক্ত শব্দ ও বাক্যাংশ নিম্নরূপ অর্থে ব্যবহৃত হইবে, যদি না প্রসঙ্গ থেকে ভিন্ন অভিপ্রায় স্পষ্ট হয়: "আদালত" বলিতে সমস্ত বিচারক, ম্যাজিস্ট্রেট এবং সালিশদার ব্যতীত সমস্ত ব্যক্তি যাহারা আইনগতভাবে সাক্ষ্য গ্রহণের ক্ষমতাপ্রাপ্ত।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. I of 1872';

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '101',
  'Burden of proof',
  'প্রমাণের ভার',
  'Whoever desires any Court to give judgment as to any legal right or liability dependent on the existence of facts which he asserts, must prove that those facts exist. When a person is bound to prove the existence of any fact, it is said that the burden of proof lies on that person.',
  'যে ব্যক্তি কোনো আদালতকে এমন কোনো আইনি অধিকার বা দায়িত্ব সম্পর্কে রায় দিতে বলে যা তার দাবিকৃত তথ্যের উপর নির্ভরশীল, তাকে সেই তথ্যগুলির অস্তিত্ব প্রমাণ করতে হবে। যখন কোনো ব্যক্তি কোনো তথ্যের অস্তিত্ব প্রমাণ করতে বাধ্য, তখন বলা হয় যে প্রমাণের ভার সেই ব্যক্তির উপর নিহিত।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. I of 1872';

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '118',
  'Who may testify',
  'কে সাক্ষ্য দিতে পারে',
  'All persons shall be competent to testify unless the Court considers that they are prevented from understanding the questions put to them, or from giving rational answers to those questions, by tender years, extreme old age, disease, whether of body or mind, or any other cause of the same kind.',
  'সকল ব্যক্তি সাক্ষ্য দিতে সক্ষম বলে গণ্য হইবে, যদি না আদালত বিবেচনা করে যে তাহারা অল্প বয়স, অত্যধিক বার্ধক্য, শারীরিক বা মানসিক রোগ বা অন্য কোনো কারণে প্রশ্ন বুঝিতে বা যুক্তিসঙ্গত উত্তর দিতে অক্ষম।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. I of 1872';


-- ─── SECTIONS (Contract Act — statute id = 3) ───────────────

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '2',
  'Interpretation clause',
  'ব্যাখ্যা ধারা',
  'In this Act the following words and expressions are used in the following senses, unless a contrary intention appears from the context: (a) When one person signifies to another his willingness to do or to abstain from doing anything, with a view to obtaining the assent of that other to such act or abstinence, he is said to make a proposal. (b) When the person to whom the proposal is made signifies his assent thereto, the proposal is said to be accepted. A proposal, when accepted, becomes a promise.',
  'এই আইনে নিম্নোক্ত শব্দ ও বাক্যাংশ নিম্নরূপ অর্থে ব্যবহৃত হইবে: (ক) যখন একজন ব্যক্তি অপর ব্যক্তিকে কিছু করিতে বা না করিতে তাহার ইচ্ছা জানায়, তখন সে প্রস্তাব করিয়াছে বলা হয়। (খ) যখন প্রস্তাবিত ব্যক্তি তাহার সম্মতি জানায়, তখন প্রস্তাব গৃহীত হইয়াছে বলা হয়। গৃহীত প্রস্তাব প্রতিশ্রুতিতে পরিণত হয়।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. IX of 1872';

INSERT INTO sections (statute_id, section_number, title_en, title_bn, content_en, content_bn, status)
SELECT s.id, '10',
  'What agreements are contracts',
  'কোন চুক্তিগুলি সংবিদা',
  'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.',
  'সকল চুক্তি সংবিদা হয় যদি সেগুলি চুক্তি করার যোগ্য পক্ষগণের স্বাধীন সম্মতিতে, বৈধ বিবেচনার জন্য এবং বৈধ উদ্দেশ্যে করা হয়, এবং এই আইন দ্বারা অকার্যকর ঘোষিত না হয়।',
  'ACTIVE'
FROM statutes s WHERE s.act_number = 'Act No. IX of 1872';


-- ─── JUDGMENTS ──────────────────────────────────────────────

INSERT INTO judgments (case_name, citation, court, bench, judgment_date, headnotes_en, headnotes_bn, full_text, source_url, status) VALUES

('BLAST and others v. Bangladesh and others',
 '55 DLR (AD) 363 (2003)',
 'Appellate Division, Supreme Court of Bangladesh',
 'Md. Ruhul Amin J, M.M. Ruhul Amin J, Amirul Kabir Chowdhury J',
 '2003-04-07',
 'The right to life under Article 32 of the Constitution encompasses a right to a dignified life and livelihood. Extra-judicial killings by law enforcement agencies violate fundamental rights. The State is obligated to investigate and prosecute members of its security forces who commit human rights violations. Custodial death is a grave violation of the fundamental right to life guaranteed under the Constitution of Bangladesh.',
 'সংবিধানের ৩২ অনুচ্ছেদের অধীনে জীবনের অধিকার মানসম্পন্ন জীবন ও জীবিকার অধিকার অন্তর্ভুক্ত করে। আইন প্রয়োগকারী সংস্থার বিচারবহির্ভূত হত্যা মৌলিক অধিকার লঙ্ঘন করে। রাষ্ট্র তার নিরাপত্তা বাহিনীর সদস্যদের যারা মানবাধিকার লঙ্ঘন করে তাদের তদন্ত ও বিচার করতে বাধ্য।',
 'This landmark case established that the right to life under Article 32 of the Constitution of Bangladesh encompasses more than mere animal existence. The court held that custodial deaths are violations of the fundamental right to life. The Appellate Division directed the government to take immediate steps to prevent such violations and to ensure accountability of law enforcement personnel. The court further held that the state has a positive obligation to protect citizens from violations of their fundamental rights, not merely to abstain from violating those rights itself. The petitioners had filed a writ petition following numerous reported incidents of deaths in police custody, commonly referred to as "crossfire" killings.',
 'http://supremecourt.gov.bd',
 'ACTIVE'),

('State v. Md. Idris Ali and others',
 '2019 BLD (HCD) 145',
 'High Court Division, Supreme Court of Bangladesh',
 'Justice Md. Abu Zafor Siddique, Justice Md. Shahinur Islam',
 '2019-06-12',
 'In a criminal case, the prosecution bears the burden of proving guilt beyond reasonable doubt. Circumstantial evidence alone may suffice for conviction provided the chain of circumstances is complete and consistent only with the hypothesis of guilt. Dying declaration made to a magistrate under Section 32 of the Evidence Act is admissible as substantive evidence. Medical evidence corroborating the dying declaration strengthens the prosecution case.',
 'ফৌজদারি মামলায় অভিযোগকারী পক্ষকে যুক্তিসঙ্গত সন্দেহের বাইরে দোষ প্রমাণ করতে হবে। মৃত্যুকালীন জবানবন্দি সাক্ষ্য আইনের ৩২ ধারায় স্বীকার্য প্রমাণ। চিকিৎসা সাক্ষ্য মৃত্যুকালীন জবানবন্দিকে সমর্থন করলে অভিযোগকারী পক্ষের মামলা শক্তিশালী হয়।',
 'The accused were charged with the murder of one Rahima Begum. The prosecution case rested primarily on the dying declaration made by the deceased before a Magistrate. The High Court Division examined the admissibility and evidentiary value of dying declarations under Section 32 of the Evidence Act, 1872. The court held that a dying declaration made before a Magistrate is entitled to great weight, especially when corroborated by medical evidence. The accused failed to rebut the prosecution evidence and were accordingly convicted under Section 302 of the Penal Code.',
 'http://supremecourt.gov.bd',
 'ACTIVE'),

('Rana Plaza Owners v. Garments Workers Federation and others',
 '2014 BLD (HCD) 89',
 'High Court Division, Supreme Court of Bangladesh',
 'Justice Naima Haider, Justice Zafar Ahmed',
 '2014-11-20',
 'Factory owners have a statutory duty under the Factories Act to ensure structural safety of premises. Negligence resulting in mass casualties gives rise to both criminal liability and civil claims for compensation. The Labour Court has jurisdiction to entertain compensation claims by injured workers and legal representatives of deceased workers. Employers cannot contractually waive statutory duties imposed for the protection of workers.',
 'কারখানা মালিকদের কারখানা আইনের অধীনে কর্মক্ষেত্রের কাঠামোগত নিরাপত্তা নিশ্চিত করার বৈধ দায়িত্ব রয়েছে। গণহতাহতিতে পরিণত অবহেলা ফৌজদারি দায় এবং ক্ষতিপূরণের দাবি উভয়ের জন্ম দেয়।',
 'This case arose from the catastrophic collapse of the Rana Plaza building in Savar in 2013, which resulted in over 1100 deaths and thousands of injuries among garment workers. The petitioners sought compensation and criminal accountability. The High Court Division held that the factory owners had violated multiple provisions of the Factories Act, 1965, and the Bangladesh Labour Act, 2006. The court ordered the formation of a compensation fund and directed the government to establish a permanent monitoring body for industrial safety. The judgment significantly expanded the scope of employer liability in workplace accident cases in Bangladesh.',
 'http://supremecourt.gov.bd',
 'ACTIVE'),

('Halima Khatun v. Md. Rafiqul Islam',
 '2020 BLD (HCD) 201',
 'High Court Division, Supreme Court of Bangladesh',
 'Justice Md. Mozibur Rahman Miah, Justice Md. Kamrul Hossain Mollah',
 '2020-03-15',
 'Dower (Mahr) is an essential element of Muslim marriage and is a debt owed by the husband to the wife. Prompt dower becomes due on demand and deferred dower becomes due on dissolution of marriage or death of husband. A wife may refuse to cohabit with her husband until prompt dower is paid. The Family Court has jurisdiction to decree dower even where the nikah-nama (marriage contract) is silent on the mode of payment.',
 'দেনমোহর (মহর) মুসলিম বিবাহের একটি অপরিহার্য উপাদান এবং এটি স্বামীর পক্ষ থেকে স্ত্রীর প্রতি একটি ঋণ। তাৎক্ষণিক দেনমোহর দাবির সাথে সাথে পরিশোধযোগ্য। পারিবারিক আদালতের বিবাহবিচ্ছেদের ক্ষেত্রে দেনমোহর ডিক্রি দেওয়ার এখতিয়ার রয়েছে।',
 'The petitioner, Halima Khatun, filed a suit for recovery of dower (mahr) following the breakdown of her marriage. The husband had refused to pay the agreed dower amount of Tk. 2,00,000, claiming the nikah-nama was forged. The High Court Division examined the legal nature of dower under Muslim personal law and the Muslim Family Laws Ordinance, 1961. The court reaffirmed that mahr is a fundamental right of a Muslim wife and its non-payment constitutes a breach of the marriage contract. The court upheld the Family Court decree and directed the husband to pay the full dower amount with interest.',
 'http://supremecourt.gov.bd',
 'ACTIVE'),

('Bangladesh Environmental Lawyers Association (BELA) v. Bangladesh and others',
 '2010 BLD (HCD) 230',
 'High Court Division, Supreme Court of Bangladesh',
 'Justice Syed Mahmud Hossain, Justice Md. Emdadul Haque',
 '2010-08-25',
 'Every citizen has a constitutional right to a healthy environment under Articles 18A and 32 of the Constitution of Bangladesh. The Environment Court has exclusive jurisdiction over matters relating to environment pollution. Industrial units operating without valid Environmental Clearance Certificate commit offences under the Environment Conservation Act, 1995. The Polluter Pays Principle is applicable in Bangladesh environmental law.',
 'প্রতিটি নাগরিকের সংবিধানের ১৮ক এবং ৩২ অনুচ্ছেদের অধীনে স্বাস্থ্যকর পরিবেশে বসবাসের সাংবিধানিক অধিকার রয়েছে। বৈধ পরিবেশ ছাড়পত্র সার্টিফিকেট ছাড়া পরিচালিত শিল্প প্রতিষ্ঠান পরিবেশ সংরক্ষণ আইন, ১৯৯৫ লঙ্ঘন করে।',
 'BELA filed a public interest litigation challenging the illegal establishment of brick kilns and industrial units on agricultural land along the Buriganga River, causing severe pollution. The High Court Division recognised the constitutional right to a clean environment as flowing from the right to life under Article 32. The court directed the closure of all brick kilns and industrial units operating without valid Environmental Clearance Certificates. The judgment firmly established the Polluter Pays Principle in Bangladesh environmental jurisprudence and directed the Department of Environment to undertake regular monitoring of industrial areas.',
 'http://supremecourt.gov.bd',
 'ACTIVE'),

('Writ Petition No. 13 of 2019 — Digital Security Act Challenge',
 '2022 BLD (HCD) 89',
 'High Court Division, Supreme Court of Bangladesh',
 'Justice Md. Mozibur Rahman Miah, Justice Khandaker Diliruzzaman',
 '2022-02-14',
 'Section 57 of the Information and Communication Technology Act, 2006 (as amended in 2013) was constitutionally challenged as overly broad and inconsistent with the freedom of expression guaranteed under Article 39 of the Constitution. The court held that reasonable restrictions on freedom of expression must be proportionate to the harm sought to be prevented. Vague and overbroad penal provisions that chill legitimate speech are unconstitutional.',
 'তথ্য ও যোগাযোগ প্রযুক্তি আইন ২০০৬ এর ৫৭ ধারা সংবিধানের ৩৯ অনুচ্ছেদ প্রদত্ত মতপ্রকাশের স্বাধীনতার সাথে অসামঞ্জস্যপূর্ণ হিসেবে চ্যালেঞ্জ করা হয়েছে। বৈধ বাকস্বাধীনতাকে সংকুচিত করে এমন অস্পষ্ট দণ্ডমূলক বিধান অসাংবিধানিক।',
 'This petition challenged the constitutional validity of Section 57 of the Information and Communication Technology Act, 2006. Journalists, bloggers and civil society organisations argued that the provision was vague, overbroad, and disproportionately restricted freedom of expression and freedom of the press under Articles 39 and 41 of the Constitution. The High Court Division, while acknowledging the legitimate aim of preventing online defamation and harmful content, held that Section 57 as worded was disproportionately broad. The court issued a rule directing the government to show cause why the provision should not be declared inconsistent with the Constitution.',
 'http://supremecourt.gov.bd',
 'ACTIVE');


-- ─── SROs ───────────────────────────────────────────────────

INSERT INTO sros (sro_number, title_en, title_bn, gazette_date, issuing_ministry, full_text, source_url, status) VALUES

('SRO No. 198-Law/2022',
 'The Digital Security (Amendment) Rules, 2022',
 'ডিজিটাল নিরাপত্তা (সংশোধন) বিধিমালা, ২০২২',
 '2022-07-15',
 'Ministry of Posts, Telecommunications and Information Technology',
 'In exercise of the powers conferred by section 60 of the Digital Security Act, 2018, the Government of Bangladesh hereby makes the following rules to amend the Digital Security Rules, 2020. Rule 3 is amended to include provisions for prior judicial approval before arrest under sections 25, 28, 29 and 31 of the Act in cases involving journalists and media personnel. Rule 7 is amended to provide for a maximum of 30 days investigation period before formal charges must be filed.',
 'http://gazette.gov.bd',
 'ACTIVE'),

('SRO No. 114-Law/2023',
 'The Labour (Amendment) Rules, 2023 — Maternity Benefit',
 'শ্রম (সংশোধন) বিধিমালা, ২০২৩ — মাতৃত্ব সুবিধা',
 '2023-03-08',
 'Ministry of Labour and Employment',
 'In exercise of the powers conferred by section 350 of the Bangladesh Labour Act, 2006, the Government hereby amends Schedule IV of the Labour Rules, 2015, to extend the period of maternity leave from 16 weeks to 24 weeks for all female workers in registered factories and establishments. The amendment further provides that the employer shall bear the full cost of maternity benefit. This amendment shall come into force on the date of its publication in the Official Gazette.',
 'http://gazette.gov.bd',
 'ACTIVE'),

('SRO No. 45-Tax/2024',
 'Income Tax (Exemption for Start-up Companies) Rules, 2024',
 'আয়কর (স্টার্ট-আপ কোম্পানির জন্য অব্যাহতি) বিধিমালা, ২০২৪',
 '2024-01-01',
 'Internal Resources Division, Ministry of Finance',
 'In exercise of the powers conferred by section 76 of the Income Tax Act, 2023, the Government of Bangladesh hereby makes the following rules relating to income tax exemption for eligible start-up companies. An eligible start-up company shall mean a company incorporated in Bangladesh after 1 January 2022 with a paid-up capital not exceeding Tk. 5,00,00,000 and engaged in technology, software, e-commerce, or other innovation-driven sectors. Such companies shall be eligible for a tax holiday of 5 years from the date of incorporation, subject to compliance with conditions specified in these rules.',
 'http://gazette.gov.bd',
 'ACTIVE');


-- ─── DEMO USER ──────────────────────────────────────────────
-- Password: demo1234 (bcrypt hash — for dev use only)

INSERT INTO users (email, password_hash, name, role, bar_council_id, status)
VALUES (
  'demo@dhara.law',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMBKNKqBSO0OZ.8Ck.HxECQHQm',
  'Demo Lawyer',
  'USER',
  'BD-BAR-2024-001',
  'ACTIVE'
);
