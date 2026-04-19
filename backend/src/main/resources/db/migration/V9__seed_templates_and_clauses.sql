-- ──────────────────────────────────────────────
-- Legal Clauses (12 standard clauses)
-- ──────────────────────────────────────────────
INSERT INTO legal_clauses (title, category, content) VALUES
('Confidentiality', 'general',
'<h3>CONFIDENTIALITY</h3><p>Each party agrees to keep confidential all information received from the other party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure ("Confidential Information"). Neither party shall disclose any Confidential Information to any third party without the prior written consent of the disclosing party, and shall use Confidential Information solely for the purposes of performing obligations under this Agreement. This obligation shall survive termination of this Agreement for a period of five (5) years.</p>'),

('Indemnification', 'general',
'<h3>INDEMNIFICATION</h3><p>Each party ("Indemnifying Party") agrees to indemnify, defend, and hold harmless the other party and its officers, directors, employees, and agents ("Indemnified Party") from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys'' fees) arising out of or relating to (a) any breach of this Agreement by the Indemnifying Party; (b) any negligent or wrongful act or omission of the Indemnifying Party; or (c) any violation of applicable law by the Indemnifying Party.</p>'),

('Force Majeure', 'general',
'<h3>FORCE MAJEURE</h3><p>Neither party shall be liable for any failure or delay in performance under this Agreement to the extent such failure or delay is caused by circumstances beyond such party''s reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labour, or materials ("Force Majeure Event"). The party affected by a Force Majeure Event shall give prompt written notice to the other party and shall use commercially reasonable efforts to mitigate the effects of the Force Majeure Event.</p>'),

('Termination', 'general',
'<h3>TERMINATION</h3><p>Either party may terminate this Agreement upon thirty (30) days'' written notice to the other party. Either party may terminate this Agreement immediately upon written notice if the other party (a) materially breaches this Agreement and fails to cure such breach within fifteen (15) days after receiving written notice of the breach; (b) becomes insolvent or makes a general assignment for the benefit of creditors; or (c) has a receiver appointed for all or substantially all of its assets. Upon termination, all rights and obligations under this Agreement shall cease, except those that by their nature are intended to survive termination.</p>'),

('Governing Law', 'general',
'<h3>GOVERNING LAW AND JURISDICTION</h3><p>This Agreement shall be governed by and construed in accordance with the laws of the People''s Republic of Bangladesh, without regard to its conflict of law provisions. Any disputes arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the courts of Bangladesh. The parties consent to personal jurisdiction in such courts and waive any objection to the laying of venue of any such proceeding in Bangladesh.</p>'),

('Non-Compete', 'employment',
'<h3>NON-COMPETE</h3><p>During the term of employment and for a period of one (1) year following the termination of employment for any reason, the Employee agrees not to directly or indirectly engage in, own, manage, operate, control, be employed by, provide services to, participate in, or be connected with any business or enterprise that competes with the Employer''s business within Bangladesh. This restriction shall apply to any business that offers products or services substantially similar to those offered by the Employer at the time of termination.</p>'),

('Intellectual Property', 'general',
'<h3>INTELLECTUAL PROPERTY</h3><p>All work product, inventions, designs, processes, software, and other intellectual property created by either party in connection with this Agreement ("Work Product") shall be the exclusive property of the party commissioning such work. Each party hereby assigns to the other party all right, title, and interest in and to any Work Product created pursuant to this Agreement. Each party shall execute all documents and take all actions reasonably necessary to perfect the other party''s ownership of such Work Product.</p>'),

('Limitation of Liability', 'general',
'<h3>LIMITATION OF LIABILITY</h3><p>IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, LOSS OF GOODWILL, OR BUSINESS INTERRUPTION, EVEN IF SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. EACH PARTY''S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNTS PAID OR PAYABLE UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</p>'),

('Payment Terms', 'contract',
'<h3>PAYMENT TERMS</h3><p>All invoices shall be due and payable within thirty (30) days of the invoice date. Payments shall be made in Bangladeshi Taka (BDT) by bank transfer to the account designated by the payee. Any amounts not paid when due shall accrue interest at the rate of 2% per month or the maximum rate permitted by applicable law, whichever is less. The paying party shall be responsible for all bank charges and transfer fees. In the event of a dispute regarding any invoice, the disputing party shall notify the other party in writing within ten (10) days of receipt of the invoice.</p>'),

('Warranty Disclaimer', 'contract',
'<h3>WARRANTY DISCLAIMER</h3><p>EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, NEITHER PARTY MAKES ANY WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. EACH PARTY EXPRESSLY DISCLAIMS ALL LIABILITY FOR ANY REPRESENTATIONS OR WARRANTIES NOT EXPRESSLY MADE IN THIS AGREEMENT. THE PARTIES ACKNOWLEDGE THAT THEY ARE ENTERING INTO THIS AGREEMENT BASED ON THEIR OWN INDEPENDENT EVALUATION AND NOT IN RELIANCE ON ANY REPRESENTATION OR WARRANTY NOT EXPRESSLY STATED HEREIN.</p>'),

('Dispute Resolution', 'general',
'<h3>DISPUTE RESOLUTION</h3><p>Any dispute, controversy, or claim arising out of or relating to this Agreement, or the breach, termination, or invalidity thereof, shall first be attempted to be resolved through good-faith negotiations between the parties. If such negotiations fail within thirty (30) days, the dispute shall be submitted to mediation under the rules of the Bangladesh Mediation Centre. If mediation fails, the dispute shall be finally resolved by arbitration under the Arbitration Act 2001 of Bangladesh. The arbitration shall be conducted in Dhaka, Bangladesh, in the English language, by a single arbitrator agreed upon by the parties.</p>'),

('Entire Agreement', 'general',
'<h3>ENTIRE AGREEMENT</h3><p>This Agreement, together with all schedules, exhibits, and addenda attached hereto, constitutes the entire agreement between the parties with respect to the subject matter hereof, and supersedes all prior and contemporaneous agreements, negotiations, representations, and understandings of the parties, whether oral or written, relating to the subject matter of this Agreement. No amendment, modification, or waiver of any provision of this Agreement shall be effective unless in writing and signed by both parties. No waiver of any breach or default shall be deemed a waiver of any subsequent breach or default.</p>');

-- ──────────────────────────────────────────────
-- Document Templates (20 templates across categories)
-- ──────────────────────────────────────────────
INSERT INTO document_templates (title, category, description, popularity, content, preview) VALUES

-- Employment
('Standard Employment Contract', 'employment',
'Comprehensive employment agreement compliant with Bangladesh Labour Act 2006.', 95,
'<h1>EMPLOYMENT CONTRACT</h1>
<p>This Employment Contract ("Agreement") is entered into as of <strong>[DATE]</strong>, by and between:</p>
<p><strong>EMPLOYER:</strong> [EMPLOYER NAME], a company incorporated under the laws of Bangladesh, having its registered office at [EMPLOYER ADDRESS] ("Employer");</p>
<p>AND</p>
<p><strong>EMPLOYEE:</strong> [EMPLOYEE NAME], holder of National ID No. [NID NUMBER], residing at [EMPLOYEE ADDRESS] ("Employee").</p>
<h2>1. POSITION AND DUTIES</h2>
<p>The Employer hereby employs the Employee in the capacity of <strong>[JOB TITLE]</strong>. The Employee shall perform all duties and responsibilities associated with this position as assigned by the Employer.</p>
<h2>2. COMMENCEMENT DATE</h2>
<p>The Employee''s employment shall commence on <strong>[START DATE]</strong>.</p>
<h2>3. REMUNERATION</h2>
<p>The Employee shall receive a monthly salary of BDT <strong>[SALARY AMOUNT]</strong>, payable on or before the 7th day of each following month.</p>
<h2>4. WORKING HOURS</h2>
<p>The Employee shall work 8 hours per day, 6 days per week, in accordance with Section 100 of the Bangladesh Labour Act 2006.</p>
<h2>5. LEAVE</h2>
<p>The Employee shall be entitled to leave as prescribed under the Bangladesh Labour Act 2006, including annual leave, sick leave, and festival holidays.</p>
<h2>6. TERMINATION</h2>
<p>Either party may terminate this Agreement by giving 120 days'' written notice as required under Section 20 of the Bangladesh Labour Act 2006.</p>
<h2>7. GOVERNING LAW</h2>
<p>This Agreement shall be governed by the laws of Bangladesh, including the Bangladesh Labour Act 2006.</p>',
'<h1>EMPLOYMENT CONTRACT</h1><p>This Employment Contract is entered into between [EMPLOYER NAME] and [EMPLOYEE NAME]...</p>'),

('Probationary Employment Agreement', 'employment',
'Employment contract with 6-month probationary period.', 72,
'<h1>PROBATIONARY EMPLOYMENT AGREEMENT</h1>
<p>This Agreement is entered into as of <strong>[DATE]</strong>, between:</p>
<p><strong>EMPLOYER:</strong> [EMPLOYER NAME] ("Employer")</p>
<p><strong>EMPLOYEE:</strong> [EMPLOYEE NAME] ("Employee")</p>
<h2>1. PROBATIONARY PERIOD</h2>
<p>The Employee is employed on a probationary basis for a period of six (6) months commencing <strong>[START DATE]</strong>. The Employer may extend the probationary period by an additional 3 months at its discretion.</p>
<h2>2. POSITION</h2>
<p>Position: <strong>[JOB TITLE]</strong><br>Department: <strong>[DEPARTMENT]</strong></p>
<h2>3. REMUNERATION</h2>
<p>Monthly salary: BDT <strong>[AMOUNT]</strong></p>
<h2>4. CONFIRMATION</h2>
<p>Upon satisfactory completion of the probationary period, the Employee shall be confirmed as a permanent employee.</p>',
'<h1>PROBATIONARY EMPLOYMENT AGREEMENT</h1><p>Six-month probationary employment between [EMPLOYER] and [EMPLOYEE]...</p>'),

('Appointment Letter', 'employment',
'Formal appointment letter for new employees.', 88,
'<h1>APPOINTMENT LETTER</h1>
<p>Date: <strong>[DATE]</strong></p>
<p>To,<br><strong>[EMPLOYEE NAME]</strong><br>[EMPLOYEE ADDRESS]</p>
<p>Dear [EMPLOYEE NAME],</p>
<p>We are pleased to inform you that you have been selected for the position of <strong>[JOB TITLE]</strong> in our organization. Your appointment is subject to the following terms and conditions:</p>
<ol>
<li><strong>Date of Joining:</strong> [START DATE]</li>
<li><strong>Department:</strong> [DEPARTMENT]</li>
<li><strong>Reporting To:</strong> [SUPERVISOR NAME]</li>
<li><strong>Salary:</strong> BDT [AMOUNT] per month</li>
<li><strong>Working Hours:</strong> As per company policy</li>
<li><strong>Leave:</strong> As per Bangladesh Labour Act 2006</li>
</ol>
<p>Kindly sign and return a copy of this letter as acceptance of the appointment.</p>
<p>Yours sincerely,<br>[AUTHORIZED SIGNATORY]<br>[DESIGNATION]</p>',
'<h1>APPOINTMENT LETTER</h1><p>Dear [EMPLOYEE NAME], We are pleased to inform you of your appointment...</p>'),

-- Contracts
('Service Agreement', 'contract',
'General service agreement between a service provider and client.', 82,
'<h1>SERVICE AGREEMENT</h1>
<p>This Service Agreement ("Agreement") is entered into as of <strong>[DATE]</strong>, by and between:</p>
<p><strong>SERVICE PROVIDER:</strong> [PROVIDER NAME], [ADDRESS] ("Provider")</p>
<p><strong>CLIENT:</strong> [CLIENT NAME], [ADDRESS] ("Client")</p>
<h2>1. SERVICES</h2>
<p>The Provider agrees to provide the following services ("Services"): <strong>[DESCRIPTION OF SERVICES]</strong></p>
<h2>2. TERM</h2>
<p>This Agreement shall commence on <strong>[START DATE]</strong> and continue until <strong>[END DATE]</strong>, unless terminated earlier in accordance with this Agreement.</p>
<h2>3. COMPENSATION</h2>
<p>The Client shall pay the Provider BDT <strong>[AMOUNT]</strong> for the Services, payable as follows: <strong>[PAYMENT SCHEDULE]</strong></p>
<h2>4. INDEPENDENT CONTRACTOR</h2>
<p>The Provider is an independent contractor and not an employee of the Client.</p>
<h2>5. CONFIDENTIALITY</h2>
<p>Both parties agree to maintain the confidentiality of each other''s proprietary information.</p>
<h2>6. GOVERNING LAW</h2>
<p>This Agreement shall be governed by the laws of Bangladesh.</p>',
'<h1>SERVICE AGREEMENT</h1><p>This Agreement is between [PROVIDER NAME] and [CLIENT NAME] for [SERVICES]...</p>'),

('Vendor Agreement', 'contract',
'Contract for goods/services supply between vendor and buyer.', 65,
'<h1>VENDOR AGREEMENT</h1>
<p>This Vendor Agreement ("Agreement") is made on <strong>[DATE]</strong> between:</p>
<p><strong>BUYER:</strong> [BUYER NAME], [ADDRESS]</p>
<p><strong>VENDOR:</strong> [VENDOR NAME], [ADDRESS]</p>
<h2>1. SUPPLY OF GOODS/SERVICES</h2>
<p>The Vendor agrees to supply: <strong>[DESCRIPTION]</strong></p>
<h2>2. PRICE AND PAYMENT</h2>
<p>Total contract value: BDT <strong>[AMOUNT]</strong><br>Payment terms: <strong>[PAYMENT TERMS]</strong></p>
<h2>3. DELIVERY</h2>
<p>Delivery location: <strong>[LOCATION]</strong><br>Delivery date: <strong>[DATE]</strong></p>
<h2>4. WARRANTIES</h2>
<p>The Vendor warrants that all goods/services supplied shall conform to agreed specifications.</p>',
'<h1>VENDOR AGREEMENT</h1><p>Supply agreement between [BUYER] and [VENDOR] for [GOODS/SERVICES]...</p>'),

('Freelance Contract', 'contract',
'Contract for freelance or project-based work.', 78,
'<h1>FREELANCE CONTRACT</h1>
<p>This Freelance Contract is made on <strong>[DATE]</strong> between:</p>
<p><strong>CLIENT:</strong> [CLIENT NAME]</p>
<p><strong>FREELANCER:</strong> [FREELANCER NAME]</p>
<h2>1. PROJECT SCOPE</h2>
<p>The Freelancer shall complete the following project: <strong>[PROJECT DESCRIPTION]</strong></p>
<h2>2. TIMELINE</h2>
<p>Project start: <strong>[DATE]</strong><br>Project completion: <strong>[DATE]</strong></p>
<h2>3. PAYMENT</h2>
<p>Total fee: BDT <strong>[AMOUNT]</strong><br>Payment schedule: 50% upfront, 50% on completion.</p>
<h2>4. INTELLECTUAL PROPERTY</h2>
<p>Upon full payment, all intellectual property rights in the deliverables shall vest in the Client.</p>
<h2>5. REVISIONS</h2>
<p>The Freelancer shall provide up to <strong>[NUMBER]</strong> rounds of revisions.</p>',
'<h1>FREELANCE CONTRACT</h1><p>Project contract between [CLIENT] and [FREELANCER]...</p>'),

-- NDA
('Non-Disclosure Agreement (Mutual)', 'nda',
'Mutual NDA protecting confidential information of both parties.', 91,
'<h1>MUTUAL NON-DISCLOSURE AGREEMENT</h1>
<p>This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of <strong>[DATE]</strong>, between:</p>
<p><strong>Party A:</strong> [PARTY A NAME], [ADDRESS]</p>
<p><strong>Party B:</strong> [PARTY B NAME], [ADDRESS]</p>
<h2>1. PURPOSE</h2>
<p>The parties wish to explore a potential business relationship (the "Purpose") and may disclose to each other certain confidential and proprietary information.</p>
<h2>2. CONFIDENTIAL INFORMATION</h2>
<p>"Confidential Information" means any information disclosed by either party that is designated as confidential or that reasonably should be understood to be confidential.</p>
<h2>3. OBLIGATIONS</h2>
<p>Each party agrees to: (a) keep all Confidential Information strictly confidential; (b) not disclose Confidential Information to third parties; (c) use Confidential Information solely for the Purpose.</p>
<h2>4. TERM</h2>
<p>This Agreement shall remain in effect for <strong>[DURATION]</strong> years from the date hereof.</p>
<h2>5. GOVERNING LAW</h2>
<p>This Agreement shall be governed by the laws of Bangladesh.</p>',
'<h1>MUTUAL NON-DISCLOSURE AGREEMENT</h1><p>Confidentiality agreement between [PARTY A] and [PARTY B]...</p>'),

('One-Way NDA', 'nda',
'Unilateral NDA where only one party discloses confidential information.', 76,
'<h1>NON-DISCLOSURE AGREEMENT</h1>
<p>This Non-Disclosure Agreement is entered into on <strong>[DATE]</strong> between:</p>
<p><strong>DISCLOSING PARTY:</strong> [NAME], [ADDRESS]</p>
<p><strong>RECEIVING PARTY:</strong> [NAME], [ADDRESS]</p>
<h2>1. CONFIDENTIAL INFORMATION</h2>
<p>The Receiving Party agrees to keep confidential all information disclosed by the Disclosing Party marked as "Confidential."</p>
<h2>2. RESTRICTIONS</h2>
<p>The Receiving Party shall not disclose or use the Confidential Information for any purpose other than evaluating the proposed business relationship.</p>
<h2>3. DURATION</h2>
<p>This obligation shall continue for <strong>[NUMBER]</strong> years from the date of disclosure.</p>',
'<h1>NON-DISCLOSURE AGREEMENT</h1><p>Confidentiality agreement protecting information of [DISCLOSING PARTY]...</p>'),

-- Real Estate
('Residential Lease Agreement', 'real-estate',
'Standard residential tenancy agreement compliant with Bangladesh law.', 89,
'<h1>RESIDENTIAL LEASE AGREEMENT</h1>
<p>This Lease Agreement is made on <strong>[DATE]</strong> between:</p>
<p><strong>LANDLORD:</strong> [LANDLORD NAME], [ADDRESS] ("Landlord")</p>
<p><strong>TENANT:</strong> [TENANT NAME], [ADDRESS] ("Tenant")</p>
<h2>1. PROPERTY</h2>
<p>The Landlord hereby leases to the Tenant the residential premises located at: <strong>[PROPERTY ADDRESS]</strong> ("Property").</p>
<h2>2. TERM</h2>
<p>The lease shall commence on <strong>[START DATE]</strong> and end on <strong>[END DATE]</strong>.</p>
<h2>3. RENT</h2>
<p>Monthly rent: BDT <strong>[AMOUNT]</strong>, payable on the <strong>[DAY]</strong> of each month.</p>
<h2>4. SECURITY DEPOSIT</h2>
<p>The Tenant shall pay a security deposit of BDT <strong>[AMOUNT]</strong>, refundable upon termination subject to deductions for damages.</p>
<h2>5. UTILITIES</h2>
<p>The Tenant shall be responsible for: <strong>[UTILITIES LIST]</strong></p>
<h2>6. MAINTENANCE</h2>
<p>The Tenant shall keep the Property in clean condition. Major repairs are the Landlord''s responsibility.</p>
<h2>7. TERMINATION</h2>
<p>Either party may terminate with 2 months'' written notice.</p>',
'<h1>RESIDENTIAL LEASE AGREEMENT</h1><p>Lease between [LANDLORD] and [TENANT] for property at [ADDRESS]...</p>'),

('Commercial Lease Agreement', 'real-estate',
'Commercial property lease for office/retail space.', 71,
'<h1>COMMERCIAL LEASE AGREEMENT</h1>
<p>This Commercial Lease is made on <strong>[DATE]</strong> between:</p>
<p><strong>LANDLORD:</strong> [LANDLORD NAME]</p>
<p><strong>TENANT:</strong> [TENANT NAME]</p>
<h2>1. PREMISES</h2>
<p>Commercial space at: <strong>[ADDRESS]</strong>, comprising approximately <strong>[AREA]</strong> square feet.</p>
<h2>2. PERMITTED USE</h2>
<p>The Tenant shall use the premises solely for: <strong>[BUSINESS PURPOSE]</strong></p>
<h2>3. TERM AND RENT</h2>
<p>Term: <strong>[START DATE]</strong> to <strong>[END DATE]</strong><br>Monthly rent: BDT <strong>[AMOUNT]</strong></p>
<h2>4. ADVANCE</h2>
<p>Advance amount: BDT <strong>[AMOUNT]</strong>, adjustable in final months.</p>
<h2>5. MAINTENANCE</h2>
<p>The Tenant shall maintain the premises and return them in their original condition.</p>',
'<h1>COMMERCIAL LEASE AGREEMENT</h1><p>Commercial property lease between [LANDLORD] and [TENANT]...</p>'),

('Property Sale Agreement', 'real-estate',
'Agreement for sale of immovable property under Transfer of Property Act.', 83,
'<h1>AGREEMENT FOR SALE OF PROPERTY</h1>
<p>This Agreement is made on <strong>[DATE]</strong> between:</p>
<p><strong>SELLER:</strong> [SELLER NAME], S/O [FATHER NAME], residing at [ADDRESS] ("Seller")</p>
<p><strong>BUYER:</strong> [BUYER NAME], S/O [FATHER NAME], residing at [ADDRESS] ("Buyer")</p>
<h2>1. PROPERTY DETAILS</h2>
<p>Property: <strong>[DESCRIPTION AND LOCATION]</strong><br>Mouza: <strong>[MOUZA]</strong>, Upazila: <strong>[UPAZILA]</strong>, District: <strong>[DISTRICT]</strong><br>Area: <strong>[AREA]</strong></p>
<h2>2. SALE CONSIDERATION</h2>
<p>Total sale price: BDT <strong>[AMOUNT]</strong><br>Advance paid: BDT <strong>[ADVANCE]</strong><br>Balance due: BDT <strong>[BALANCE]</strong></p>
<h2>3. COMPLETION DATE</h2>
<p>The sale shall be completed by <strong>[DATE]</strong> through execution of a registered sale deed.</p>
<h2>4. TITLE</h2>
<p>The Seller warrants clear and marketable title, free from encumbrances.</p>
<h2>5. STAMP DUTY AND REGISTRATION</h2>
<p>All stamp duty and registration charges shall be borne by the Buyer.</p>',
'<h1>AGREEMENT FOR SALE OF PROPERTY</h1><p>Property sale agreement between [SELLER] and [BUYER]...</p>'),

-- Business
('Partnership Agreement', 'business',
'Business partnership agreement outlining rights and responsibilities.', 74,
'<h1>PARTNERSHIP AGREEMENT</h1>
<p>This Partnership Agreement is made on <strong>[DATE]</strong> between:</p>
<p><strong>Partner 1:</strong> [NAME], [ADDRESS]</p>
<p><strong>Partner 2:</strong> [NAME], [ADDRESS]</p>
<h2>1. BUSINESS NAME AND PURPOSE</h2>
<p>Business name: <strong>[FIRM NAME]</strong><br>Purpose: <strong>[BUSINESS DESCRIPTION]</strong></p>
<h2>2. CAPITAL CONTRIBUTION</h2>
<p>Partner 1: BDT <strong>[AMOUNT]</strong> (<strong>[%]</strong>%)<br>Partner 2: BDT <strong>[AMOUNT]</strong> (<strong>[%]</strong>%)</p>
<h2>3. PROFIT AND LOSS SHARING</h2>
<p>Profits and losses shall be shared in proportion to capital contribution, unless otherwise agreed in writing.</p>
<h2>4. MANAGEMENT</h2>
<p>All partners shall have equal rights in the management of the business.</p>
<h2>5. DISSOLUTION</h2>
<p>The partnership may be dissolved by unanimous written agreement of all partners.</p>',
'<h1>PARTNERSHIP AGREEMENT</h1><p>Business partnership between [PARTNER 1] and [PARTNER 2]...</p>'),

('Shareholders Agreement', 'business',
'Agreement governing shareholder rights and company management.', 68,
'<h1>SHAREHOLDERS AGREEMENT</h1>
<p>This Agreement is made on <strong>[DATE]</strong> among the shareholders of <strong>[COMPANY NAME]</strong>, a company incorporated under the Companies Act 1994 of Bangladesh.</p>
<h2>1. SHAREHOLDING</h2>
<p>Shareholding structure as of the date hereof:<br><strong>[SHAREHOLDER NAME]</strong>: <strong>[SHARES]</strong> shares (<strong>[%]</strong>%)</p>
<h2>2. MANAGEMENT AND BOARD</h2>
<p>The Company shall be managed by a Board of Directors. Each shareholder holding more than 20% shall have the right to nominate one Director.</p>
<h2>3. TRANSFER OF SHARES</h2>
<p>No shareholder shall transfer shares without first offering them to existing shareholders (right of first refusal).</p>
<h2>4. DIVIDENDS</h2>
<p>Dividends shall be declared and paid as determined by the Board, subject to applicable law.</p>',
'<h1>SHAREHOLDERS AGREEMENT</h1><p>Governing agreement for shareholders of [COMPANY NAME]...</p>'),

('Memorandum of Understanding', 'business',
'MOU outlining intentions and terms between parties before formal agreement.', 86,
'<h1>MEMORANDUM OF UNDERSTANDING</h1>
<p>This Memorandum of Understanding ("MOU") is made on <strong>[DATE]</strong> between:</p>
<p><strong>Party A:</strong> [NAME/ORGANIZATION]</p>
<p><strong>Party B:</strong> [NAME/ORGANIZATION]</p>
<h2>1. PURPOSE</h2>
<p>The parties intend to collaborate on: <strong>[PURPOSE/PROJECT]</strong></p>
<h2>2. SCOPE OF COOPERATION</h2>
<p>The parties agree to cooperate in the following areas:<br><strong>[AREAS OF COOPERATION]</strong></p>
<h2>3. DURATION</h2>
<p>This MOU shall be effective from <strong>[DATE]</strong> and shall remain in force for <strong>[DURATION]</strong>.</p>
<h2>4. NON-BINDING NATURE</h2>
<p>This MOU is a statement of intent and does not create legally binding obligations unless incorporated into a formal agreement.</p>',
'<h1>MEMORANDUM OF UNDERSTANDING</h1><p>Cooperation MOU between [PARTY A] and [PARTY B]...</p>'),

-- Personal
('Power of Attorney', 'personal',
'General power of attorney granting authority to act on behalf.', 79,
'<h1>POWER OF ATTORNEY</h1>
<p>I, <strong>[PRINCIPAL NAME]</strong>, son/daughter of <strong>[FATHER NAME]</strong>, residing at <strong>[ADDRESS]</strong>, National ID No. <strong>[NID]</strong>, do hereby appoint <strong>[ATTORNEY NAME]</strong>, residing at <strong>[ATTORNEY ADDRESS]</strong>, as my lawful Attorney.</p>
<h2>POWERS GRANTED</h2>
<p>I authorize my Attorney to act on my behalf in the following matters:</p>
<ol>
<li><strong>[SPECIFIC POWER 1]</strong></li>
<li><strong>[SPECIFIC POWER 2]</strong></li>
<li><strong>[SPECIFIC POWER 3]</strong></li>
</ol>
<h2>VALIDITY</h2>
<p>This Power of Attorney shall remain valid until revoked in writing or until <strong>[EXPIRY DATE]</strong>.</p>
<p>Executed at <strong>[PLACE]</strong> on <strong>[DATE]</strong>.</p>
<p>Signature of Principal: ___________________<br>Witnesses: 1. _______________ 2. _______________</p>',
'<h1>POWER OF ATTORNEY</h1><p>Authorization granted by [PRINCIPAL] to [ATTORNEY]...</p>'),

('Affidavit', 'personal',
'Sworn statement for legal or official purposes.', 81,
'<h1>AFFIDAVIT</h1>
<p>I, <strong>[NAME]</strong>, son/daughter of <strong>[FATHER NAME]</strong>, residing at <strong>[ADDRESS]</strong>, aged <strong>[AGE]</strong> years, do hereby solemnly affirm and declare as follows:</p>
<ol>
<li>That I am a citizen of Bangladesh and reside at the above address.</li>
<li>That <strong>[STATEMENT 1]</strong></li>
<li>That <strong>[STATEMENT 2]</strong></li>
<li>That the above statements are true and correct to the best of my knowledge and belief.</li>
</ol>
<p>I make this solemn declaration conscientiously believing the same to be true.</p>
<p>Deponent: ___________________<br>Date: <strong>[DATE]</strong><br>Place: <strong>[PLACE]</strong></p>
<p>Sworn before me:<br>Notary Public / Magistrate</p>',
'<h1>AFFIDAVIT</h1><p>Sworn statement by [NAME] regarding [SUBJECT]...</p>'),

('Deed of Gift', 'personal',
'Deed for voluntary transfer of property as a gift.', 62,
'<h1>DEED OF GIFT</h1>
<p>This Deed of Gift is executed on <strong>[DATE]</strong> by:</p>
<p><strong>DONOR:</strong> [DONOR NAME], residing at [ADDRESS]</p>
<p>IN FAVOUR OF:</p>
<p><strong>DONEE:</strong> [DONEE NAME], [RELATIONSHIP], residing at [ADDRESS]</p>
<h2>1. GIFT</h2>
<p>The Donor, out of natural love and affection, hereby gifts the following property to the Donee free of all charges:</p>
<p><strong>[DESCRIPTION OF PROPERTY]</strong></p>
<h2>2. ACCEPTANCE</h2>
<p>The Donee hereby accepts the gift unconditionally.</p>
<h2>3. POSSESSION</h2>
<p>Possession of the gifted property is hereby delivered to the Donee.</p>
<p>Donor''s Signature: ___________________<br>Donee''s Signature: ___________________<br>Witnesses: 1. _______________ 2. _______________</p>',
'<h1>DEED OF GIFT</h1><p>Gift deed from [DONOR] to [DONEE] for [PROPERTY]...</p>'),

('Loan Agreement', 'personal',
'Personal or business loan agreement with repayment terms.', 77,
'<h1>LOAN AGREEMENT</h1>
<p>This Loan Agreement is made on <strong>[DATE]</strong> between:</p>
<p><strong>LENDER:</strong> [LENDER NAME], [ADDRESS]</p>
<p><strong>BORROWER:</strong> [BORROWER NAME], [ADDRESS]</p>
<h2>1. LOAN AMOUNT</h2>
<p>The Lender agrees to lend the Borrower the sum of BDT <strong>[AMOUNT]</strong> ("Loan").</p>
<h2>2. INTEREST</h2>
<p>The Loan shall bear interest at <strong>[RATE]</strong>% per annum, calculated on the outstanding principal.</p>
<h2>3. REPAYMENT</h2>
<p>The Borrower shall repay the Loan in <strong>[NUMBER]</strong> monthly installments of BDT <strong>[INSTALLMENT AMOUNT]</strong> each, commencing from <strong>[DATE]</strong>.</p>
<h2>4. DEFAULT</h2>
<p>In the event of default, the entire outstanding amount shall become immediately due and payable.</p>
<h2>5. GOVERNING LAW</h2>
<p>This Agreement is governed by the Contract Act 1872 of Bangladesh.</p>',
'<h1>LOAN AGREEMENT</h1><p>Loan agreement between [LENDER] and [BORROWER] for BDT [AMOUNT]...</p>'),

('Divorce Agreement', 'personal',
'Mutual divorce settlement agreement (Talaq/Khula related documentation).', 55,
'<h1>DIVORCE SETTLEMENT AGREEMENT</h1>
<p>This Settlement Agreement is entered into on <strong>[DATE]</strong> between:</p>
<p><strong>HUSBAND:</strong> [NAME], residing at [ADDRESS]</p>
<p><strong>WIFE:</strong> [NAME], residing at [ADDRESS]</p>
<h2>1. DIVORCE</h2>
<p>The parties mutually agree to dissolve their marriage in accordance with the Muslim Family Laws Ordinance 1961 / applicable personal law.</p>
<h2>2. DOWER (MEHR)</h2>
<p>Outstanding dower amount: BDT <strong>[AMOUNT]</strong>, to be paid by the Husband to the Wife within <strong>[TIMEFRAME]</strong>.</p>
<h2>3. CHILD CUSTODY</h2>
<p>Custody arrangement: <strong>[CUSTODY TERMS]</strong></p>
<h2>4. MAINTENANCE</h2>
<p>Maintenance payable to Wife/children: BDT <strong>[AMOUNT]</strong> per month for <strong>[DURATION]</strong>.</p>
<h2>5. PROPERTY</h2>
<p>Joint property division: <strong>[TERMS]</strong></p>',
'<h1>DIVORCE SETTLEMENT AGREEMENT</h1><p>Mutual divorce settlement between [HUSBAND] and [WIFE]...</p>');
