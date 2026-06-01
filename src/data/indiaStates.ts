// ============================================
// JANKAM — INDIAN STATES & DISTRICTS DATABASE
// ============================================

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
  'Ladakh', 'Puducherry', 'Andaman and Nicobar', 'Lakshadweep'
].sort();

export const STATE_DISTRICTS: Record<string, string[]> = {
  'Maharashtra': [
    'Pune', 'Mumbai City', 'Mumbai Suburban', 'Thane', 'Nashik', 'Nagpur',
    'Kolhapur', 'Chhatrapati Sambhajinagar', 'Jalgaon', 'Ahmednagar', 'Satara',
    'Sangli', 'Solapur', 'Amravati', 'Akola', 'Buldhana', 'Wardha', 'Yavatmal',
    'Washim', 'Chandrapur', 'Gadchiroli', 'Bhandara', 'Gondia', 'Raigad',
    'Ratnagiri', 'Sindhudurg', 'Palghar', 'Dhule', 'Nandurbar', 'Latur',
    'Beed', 'Nanded', 'Dharashiv', 'Parbhani', 'Hingoli', 'Jalna'
  ].sort(),
  
  'Bihar': [
    'Patna', 'Gaya', 'Muzaffarpur', 'Darbhanga', 'Bhagalpur', 'Nalanda', 'Saran',
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhabua', 'Bhojpur',
    'Buxar', 'East Champaran', 'Gopalganj', 'Jamui', 'Jehanabad', 'Khagaria',
    'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Nawada',
    'Rohtas', 'Samastipur', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
    'Supaul', 'Vaishali', 'West Champaran'
  ].sort(),
  
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur Nagar', 'Ghaziabad', 'Gautam Buddha Nagar', 'Varanasi',
    'Prayagraj', 'Agra', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur',
    'Gorakhpur', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Ayodhya', 'Azamgarh',
    'Firozabad', 'Jaunpur', 'Mirzapur', 'Raebareli', 'Sultanpur', 'Unnao',
    'Amethi', 'Baghpat', 'Bijnor', 'Bulandshahr', 'Hapur', 'Lakhimpur Kheri'
  ].sort(),
  
  'Jharkhand': [
    'Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro', 'Deoghar',
    'Hazaribagh', 'Giridih', 'Ramgarh', 'Dumka', 'Palamu', 'Sahibganj', 'Garhwa',
    'Chatra', 'Koderma', 'Latehar', 'Lohardaga', 'Gumla', 'Khunti', 'Simdega',
    'West Singhbhum', 'Saraikela Kharsawan', 'Jamtara', 'Pakur', 'Godda'
  ].sort(),
  
  'West Bengal': [
    'Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Purba Bardhaman',
    'Paschim Bardhaman', 'Hooghly', 'Howrah', 'Darjeeling', 'Kalimpong',
    'Murshidabad', 'Nadia', 'Purulia', 'Bankura', 'Birbhum', 'Malda',
    'Jalpaiguri', 'Cooch Behar', 'Purba Medinipur', 'Paschim Medinipur',
    'Uttar Dinajpur', 'Dakshin Dinajpur', 'Alipurduar', 'Jhargram'
  ].sort(),
  
  'Delhi': [
    'New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi',
    'West Delhi', 'North West Delhi', 'South West Delhi', 'North East Delhi',
    'Shahdara', 'South East Delhi'
  ].sort(),
  
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar',
    'Jamnagar', 'Junagadh', 'Anand', 'Navsari', 'Valsad', 'Bharuch', 'Mehsana',
    'Morbi', 'Kutch', 'Porbandar', 'Amreli', 'Banaskantha', 'Dahod', 'Narmada',
    'Panchmahal', 'Sabarkantha', 'Surendranagar', 'Tapi', 'Dang'
  ].sort(),
  
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar',
    'Bhilwara', 'Sikar', 'Bharatpur', 'Sri Ganganagar', 'Jaisalmer', 'Barmer',
    'Chittorgarh', 'Churu', 'Hanumangarh', 'Jhunjhunu', 'Nagaur', 'Pali',
    'Tonk', 'Sawai Madhopur', 'Rajsamand', 'Pratapgarh', 'Jhalawar', 'Dungarpur'
  ].sort(),
  
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas',
    'Satna', 'Rewa', 'Ratlam', 'Katni', 'Singrauli', 'Chhindwara', 'Khandwa',
    'Khargone', 'Hoshangabad', 'Vidisha', 'Morena', 'Bhind', 'Shivpuri',
    'Guna', 'Mandsaur', 'Neemuch', 'Dhar', 'Sehore', 'Betul', 'Balaghat'
  ].sort(),
  
  'Odisha': [
    'Khurda (Bhubaneswar)', 'Cuttack', 'Sundargarh (Rourkela)', 'Puri',
    'Sambalpur', 'Ganjam (Berhampur)', 'Balasore', 'Bhadrak', 'Angul',
    'Balangir', 'Bargarh', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Jajpur',
    'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Keonjhar',
    'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh',
    'Nuapada', 'Rayagada', 'Subarnapur'
  ].sort(),
  
  'Karnataka': [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Dharwad (Hubli)',
    'Dakshina Kannada (Mangalore)', 'Belagavi', 'Davanagere', 'Ballari',
    'Kalaburagi', 'Udupi', 'Kolar', 'Bagalkot', 'Bidar', 'Chamarajanagar',
    'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Gadag', 'Hassan',
    'Haveri', 'Kodagu', 'Koppal', 'Mandya', 'Raichur', 'Ramanagara',
    'Shivamogga', 'Tumakuru', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
  ].sort(),
  
  'Telangana': [
    'Hyderabad', 'Warangal Urban', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Peddapalli (Ramagundam)', 'Medchal-Malkajgiri', 'Rangareddy', 'Adilabad',
    'Bhadradri Kothagudem', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally',
    'Jogulamba Gadwal', 'Kamareddy', 'Kumuram Bheem Asifabad', 'Mahabubabad',
    'Mahabubnagar', 'Mancherial', 'Medak', 'Mulugu', 'Nagarkurnool',
    'Nalgonda', 'Narayanpet', 'Nirmal', 'Rajanna Sircilla', 'Sangareddy',
    'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Yadadri Bhuvanagiri'
  ].sort(),
  
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur',
    'Erode', 'Vellore', 'Thoothukudi', 'Kanyakumari', 'Ariyalur', 'Chengalpattu',
    'Cuddalore', 'Dharmapuri', 'Dindigul', 'Kallakurichi', 'Kancheepuram',
    'Karur', 'Krishnagiri', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur',
    'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Tirunelveli', 'Tirupathur', 'Tiruvallur',
    'Tiruvannamalai', 'Tiruvarur', 'Villupuram', 'Virudhunagar'
  ].sort(),
  
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak',
    'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Charkhi Dadri',
    'Fatehabad', 'Jhajjar', 'Jind', 'Kaithal', 'Mahendragarh', 'Nuh',
    'Palwal', 'Rewari', 'Sirsa'
  ].sort(),
  
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'S.A.S. Nagar (Mohali)',
    'Pathankot', 'Hoshiarpur', 'Moga', 'Barnala', 'Faridkot', 'Fatehgarh Sahib',
    'Fazilka', 'Ferozepur', 'Gurdaspur', 'Kapurthala', 'Mansa', 'Muktsar',
    'Rupnagar', 'Sangrur', 'Tarn Taran'
  ].sort(),
  
  'Chhattisgarh': [
    'Raipur', 'Bilaspur', 'Durg', 'Korba', 'Rajnandgaon', 'Bastar (Jagdalpur)',
    'Surguja (Ambikapur)', 'Dhamtari', 'Mahasamund', 'Kanker', 'Kondagaon',
    'Narayanpur', 'Dantewada', 'Sukma', 'Bijapur', 'Kabirdham', 'Bemetara',
    'Mungeli', 'Jashpur', 'Raigarh', 'Baloda Bazar', 'Gariaband'
  ].sort(),
  
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Anantapur'].sort(),
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Changlang', 'Papum Pare', 'West Kameng'].sort(),
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'].sort(),
  'Goa': ['North Goa', 'South Goa'].sort(),
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Hamirpur', 'Kangra', 'Kullu'].sort(),
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Samba', 'Pulwama'].sort(),
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad'].sort(),
  'Manipur': ['Imphal East', 'Imphal West', 'Thoubal', 'Churachandpur', 'Senapati'].sort(),
  'Meghalaya': ['East Khasi Hills (Shillong)', 'West Garo Hills', 'Jaintia Hills', 'Ri Bhoi'].sort(),
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'].sort(),
  'Nagaland': ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha'].sort(),
  'Sikkim': ['East Sikkim (Gangtok)', 'West Sikkim', 'North Sikkim', 'South Sikkim'].sort(),
  'Tripura': ['West Tripura (Agartala)', 'South Tripura', 'North Tripura', 'Dhalai'].sort(),
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital (Haldwani)', 'Udham Singh Nagar (Rudrapur)', 'Roorkee'].sort(),
  'Chandigarh': ['Chandigarh'].sort(),
  'Ladakh': ['Leh', 'Kargil'].sort(),
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'].sort(),
  'Andaman and Nicobar': ['Port Blair', 'North Andaman', 'South Andaman'].sort(),
  'Lakshadweep': ['Kavaratti', 'Minicoy', 'Amini'].sort()
};

// Fallback helper to get districts
export const getDistrictsForState = (state: string): string[] => {
  return STATE_DISTRICTS[state] || ['Other'];
};
