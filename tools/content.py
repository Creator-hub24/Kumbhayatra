# Single source of truth for guide content (Hindi + English).
# build.py turns this into data/seed.json (site fallback) and supabase/seed.sql.
# Facts here are general and verified against public sources in Oct 2026; dates stay "tentative"
# until the Mela Pradhikaran / UP government publishes the official schedule.

EVENT = {
    "slug": "magh-mela-2027",
    "name_hi": "माघ मेला 2027, प्रयागराज",
    "name_en": "Magh Mela 2027, Prayagraj",
    "starts_on": "2027-01-15",
    "ends_on": "2027-03-06",
    "is_current": True,
    "note_hi": "तिथियाँ पंचांग और प्रकाशित स्रोतों पर आधारित हैं। यात्रा तय करने से पहले मेला प्राधिकरण की आधिकारिक घोषणा जरूर देखें।",
    "note_en": "Dates are based on the panchang and published sources. Check the official Mela Pradhikaran announcement before you finalise travel.",
}

# crowd: calm | moderate | high | very_high  (our planning estimate, editable in admin)
SNAN = [
    dict(snan_on="2027-01-15", name_hi="मकर संक्रांति", name_en="Makar Sankranti", crowd="very_high", sort=1,
         tip_hi="मेले का पहला बड़ा स्नान। सुबह सबसे ज्यादा भीड़। बच्चों और बुजुर्गों के साथ न जाएँ।",
         tip_en="First major bath of the Mela. Heaviest crowds at dawn. Avoid with small children and elders."),
    dict(snan_on="2027-01-22", name_hi="पौष पूर्णिमा", name_en="Paush Purnima", crowd="high", sort=2,
         tip_hi="कल्पवास की शुरुआत। भीड़ ज्यादा, पर मौनी अमावस्या से कम।",
         tip_en="Kalpvas begins. Crowded, but less than Mauni Amavasya."),
    dict(snan_on="2027-02-06", name_hi="मौनी अमावस्या", name_en="Mauni Amavasya", crowd="very_high", sort=3,
         tip_hi="मेले का सबसे बड़ा स्नान। सड़कें बंद और डायवर्जन सख्त रहते हैं। पहली बार वालों के लिए सबसे कठिन दिन।",
         tip_en="The biggest bath of the Mela. Roads closed and diversions strict. The hardest day for first-timers."),
    dict(snan_on="2027-02-11", name_hi="वसंत पंचमी", name_en="Basant Panchami", crowd="high", sort=4,
         tip_hi="पीले वस्त्र पहनने का चलन। भीड़ ज्यादा, सुबह जल्दी पहुँचें।",
         tip_en="Devotees wear yellow. Crowded, so go very early."),
    dict(snan_on="2027-02-20", name_hi="माघी पूर्णिमा", name_en="Maghi Purnima", crowd="high", sort=5,
         tip_hi="कल्पवास का समापन स्नान। शाम तक भीड़ रहती है।",
         tip_en="Closing bath of Kalpvas. Crowds last into the evening."),
    dict(snan_on="2027-03-06", name_hi="महाशिवरात्रि", name_en="Mahashivratri", crowd="moderate", sort=6,
         tip_hi="मेले का अंतिम स्नान। मेला समेटने लगता है, पर मंदिरों में भीड़ रहती है।",
         tip_en="Last bath of the Mela. The Mela winds down, but temples stay busy."),
]

PLACES = [
    dict(slug="sangam", name_hi="त्रिवेणी संगम", name_en="Triveni Sangam", type="ghat", area="Sangam",
         desc_hi="गंगा-यमुना (और अदृश्य सरस्वती) का संगम। स्नान और नाव यात्रा का मुख्य स्थान।",
         desc_en="Where the Ganga and Yamuna (and the unseen Saraswati) meet. Main place for the holy dip and boat rides.", sort=1),
    dict(slug="hanuman-mandir", name_hi="बड़े हनुमान जी (लेटे हनुमान)", name_en="Bade Hanuman Ji (Reclining Hanuman)", type="temple", area="Sangam",
         desc_hi="संगम के पास प्रसिद्ध मंदिर, जहाँ हनुमान जी लेटी मुद्रा में हैं। स्नान के बाद दर्शन का चलन है।",
         desc_en="Famous temple near the Sangam with Hanuman in a reclining pose. Visiting after the bath is customary.", sort=2),
    dict(slug="akshayavat", name_hi="अक्षयवट और पातालपुरी (किले में)", name_en="Akshayavat and Patalpuri (inside the Fort)", type="temple", area="Fort",
         desc_hi="किले के भीतर पवित्र वट वृक्ष और भूमिगत मंदिर। प्रवेश के नियम बदलते रहते हैं, इसलिए पहले पता कर लें।",
         desc_en="Sacred banyan and an underground shrine inside the Fort. Entry rules change, so confirm before you go.", sort=3),
    dict(slug="alopi-devi", name_hi="अलोपी देवी मंदिर", name_en="Alopi Devi Temple", type="temple", area="Alopibagh",
         desc_hi="शक्तिपीठ परंपरा से जुड़ा मंदिर, जिसमें प्रतिमा नहीं बल्कि एक झूला (डोली) पूजित है।",
         desc_en="Temple linked with the Shakti Peeth tradition, where a palanquin is worshipped instead of an idol.", sort=4),
    dict(slug="mankameshwar", name_hi="मनकामेश्वर मंदिर", name_en="Mankameshwar Temple", type="temple", area="Yamuna bank",
         desc_hi="यमुना किनारे प्राचीन शिव मंदिर, किले के पास।",
         desc_en="Ancient Shiva temple on the Yamuna bank, near the Fort.", sort=5),
    dict(slug="anand-bhawan", name_hi="आनंद भवन और स्वराज भवन", name_en="Anand Bhawan and Swaraj Bhawan", type="heritage", area="Civil Lines",
         desc_hi="नेहरू परिवार से जुड़े ऐतिहासिक भवन, स्वतंत्रता आंदोलन का इतिहास समेटे।",
         desc_en="Historic houses of the Nehru family, with exhibits from the freedom movement.", sort=6),
    dict(slug="allahabad-museum", name_hi="इलाहाबाद संग्रहालय", name_en="Allahabad Museum", type="heritage", area="Civil Lines",
         desc_hi="चंद्रशेखर आज़ाद पार्क के पास संग्रहालय, मूर्तियाँ, चित्र और ऐतिहासिक वस्तुएँ।",
         desc_en="Museum beside Chandrashekhar Azad Park with sculpture, paintings and historical objects.", sort=7),
    dict(slug="khusro-bagh", name_hi="खुसरो बाग", name_en="Khusro Bagh", type="heritage", area="Near railway station",
         desc_hi="मुगलकालीन उद्यान और मकबरे, स्टेशन के पास शांत जगह।",
         desc_en="Mughal-era garden and tombs, a quiet spot near the railway station.", sort=8),
    dict(slug="medical-camps", name_hi="मेला क्षेत्र में चिकित्सा शिविर", name_en="Medical camps in the Mela area", type="medical", area="Mela area",
         desc_hi="मेले में अस्थायी अस्पताल और प्राथमिक उपचार केंद्र बनते हैं। स्थान हर साल मेला नक्शे में दिए जाते हैं।",
         desc_en="Temporary hospitals and first-aid centres are set up in the Mela. Locations are published each year on the Mela map.", sort=9),
    dict(slug="khoya-paya", name_hi="खोया-पाया केंद्र", name_en="Lost-and-found centres (Khoya-Paya)", type="facility", area="Mela area",
         desc_hi="बिछड़े लोगों के लिए मेले में केंद्र बनते हैं। परिवार के साथ पहले से एक मिलने की जगह तय रखें।",
         desc_en="Centres for separated visitors are set up in the Mela. Fix a meeting spot with your family in advance.", sort=10),
]

# stops: time label + text. place = slug above (optional)
ITINERARIES = [
    dict(slug="1-day", days=1, title_hi="1 दिन: संगम और हनुमान जी", title_en="1 day: Sangam and Hanuman Ji", sort=1,
         summary_hi="जल्दी पहुँचकर स्नान और मुख्य दर्शन, शाम तक वापसी या रात रुकना।",
         summary_en="Reach early, bathe, see the main shrines, return by evening or stay the night.",
         stops=[
             dict(t_hi="सुबह (सूर्योदय के आसपास)", t_en="Morning (around sunrise)", hi="संगम पर स्नान या नाव से संगम बिंदु", en="Holy dip at the Sangam or boat to the Sangam point", place="sangam"),
             dict(t_hi="स्नान के बाद", t_en="After the bath", hi="बड़े हनुमान जी के दर्शन", en="Darshan at Bade Hanuman Ji", place="hanuman-mandir"),
             dict(t_hi="दोपहर", t_en="Midday", hi="किले में अक्षयवट-पातालपुरी (खुला हो तो) और भोजन", en="Akshayavat and Patalpuri in the Fort (if open) and lunch", place="akshayavat"),
             dict(t_hi="दोपहर बाद", t_en="Afternoon", hi="अलोपी देवी मंदिर", en="Alopi Devi Temple", place="alopi-devi"),
         ]),
    dict(slug="2-day", days=2, title_hi="2 दिन: तीर्थ और शहर", title_en="2 days: Pilgrimage and the city", sort=2,
         summary_hi="पहला दिन तीर्थ, दूसरा दिन आराम से शहर और इतिहास।",
         summary_en="Day 1 for the shrines, day 2 for a relaxed look at the city and its history.",
         stops=[
             dict(day=1, t_hi="दिन 1: सुबह", t_en="Day 1: Morning", hi="संगम स्नान और बड़े हनुमान जी", en="Sangam bath and Bade Hanuman Ji", place="sangam"),
             dict(day=1, t_hi="दिन 1: दोपहर", t_en="Day 1: Afternoon", hi="अक्षयवट (खुला हो तो) और अलोपी देवी", en="Akshayavat (if open) and Alopi Devi", place="akshayavat"),
             dict(day=2, t_hi="दिन 2: सुबह", t_en="Day 2: Morning", hi="मनकामेश्वर मंदिर और यमुना किनारा", en="Mankameshwar Temple and the Yamuna bank", place="mankameshwar"),
             dict(day=2, t_hi="दिन 2: दोपहर", t_en="Day 2: Afternoon", hi="आनंद भवन, स्वराज भवन और इलाहाबाद संग्रहालय", en="Anand Bhawan, Swaraj Bhawan and Allahabad Museum", place="anand-bhawan"),
             dict(day=2, t_hi="दिन 2: शाम", t_en="Day 2: Evening", hi="सिविल लाइंस में खान-पान और खरीदारी", en="Food and shopping in Civil Lines", place=""),
         ]),
    dict(slug="3-day", days=3, title_hi="3 दिन: प्रयागराज के साथ काशी", title_en="3 days: Prayagraj plus Kashi", sort=3,
         summary_hi="दो दिन प्रयागराज, तीसरा दिन वाराणसी (सड़क से लगभग 120 किमी, 2.5 से 3 घंटे)।",
         summary_en="Two days in Prayagraj, day 3 in Varanasi (about 120 km by road, roughly 2.5 to 3 hours).",
         stops=[
             dict(day=1, t_hi="दिन 1", t_en="Day 1", hi="संगम स्नान, बड़े हनुमान जी, अक्षयवट (खुला हो तो)", en="Sangam bath, Bade Hanuman Ji, Akshayavat (if open)", place="sangam"),
             dict(day=2, t_hi="दिन 2", t_en="Day 2", hi="अलोपी देवी, मनकामेश्वर, आनंद भवन और संग्रहालय", en="Alopi Devi, Mankameshwar, Anand Bhawan and the museum", place="alopi-devi"),
             dict(day=3, t_hi="दिन 3", t_en="Day 3", hi="वाराणसी: काशी विश्वनाथ दर्शन और गंगा आरती", en="Varanasi: Kashi Vishwanath darshan and the Ganga aarti", place=""),
         ]),
]

ADDONS = [
    dict(hi="वाराणसी: लगभग 120 किमी", en="Varanasi: about 120 km"),
    dict(hi="विंध्याचल (मिर्जापुर): लगभग 85 किमी", en="Vindhyachal (Mirzapur): about 85 km"),
    dict(hi="अयोध्या: लगभग 160 किमी", en="Ayodhya: about 160 km"),
]

# routes: how to reach. Kept general on purpose; train numbers/times change, so we point to IRCTC and station codes.
STATIONS_HI = "प्रयागराज जं. (PRYJ), छिवकी (PCOI), रामबाग (PRRB), संगम (PYGS)"
STATIONS_EN = "Prayagraj Jn (PRYJ), Chheoki (PCOI), Rambagh (PRRB), Sangam (PYGS)"

def _modes(train_hi, train_en, air_hi, air_en, road_hi, road_en):
    return [
        dict(mode="train", hi=train_hi, en=train_en),
        dict(mode="flight", hi=air_hi, en=air_en),
        dict(mode="road", hi=road_hi, en=road_en),
    ]

ROUTES = [
    dict(city_key="indore", city_hi="इंदौर", city_en="Indore", sort=1,
         summary_hi="दूरी ज्यादा है, इसलिए ट्रेन या फ्लाइट बेहतर। परिवार के साथ रात की ट्रेन पहले से बुक करें।",
         summary_en="It is a long way, so train or flight works best. Book an overnight train early if you travel with family.",
         modes=_modes("IRCTC पर इंदौर से प्रयागराज (PRYJ) सीधी या भोपाल/जबलपुर होकर ट्रेनें देखें। मेले के दिनों में सीटें जल्दी भर जाती हैं।",
                      "On IRCTC look for Indore to Prayagraj (PRYJ), direct or via Bhopal/Jabalpur. Seats fill fast around Mela dates.",
                      "प्रयागराज हवाई अड्डा (IXD) बमरौली में है। सीधी उड़ानें सीमित हैं, इसलिए वाराणसी या लखनऊ विकल्प रखें।",
                      "Prayagraj Airport (IXD) is at Bamrauli. Direct flights are limited, so keep Varanasi or Lucknow as a backup.",
                      "लंबी दूरी है। परिवार के साथ सड़क से जाना थकाने वाला होगा और मेला क्षेत्र के पास वाहन रोके जाते हैं।",
                      "A long drive. Tiring with family, and vehicles are stopped well before the Mela area.")),
    dict(city_key="bhopal", city_hi="भोपाल", city_en="Bhopal", sort=2,
         summary_hi="ट्रेन सबसे आसान। कई लोग जबलपुर/कटनी होकर आते हैं।",
         summary_en="Train is easiest. Many travellers come via Jabalpur or Katni.",
         modes=_modes("IRCTC पर भोपाल से PRYJ की ट्रेनें देखें।", "Search IRCTC for Bhopal to PRYJ trains.",
                      "सीधी उड़ान कम हैं, ट्रेन ज्यादा भरोसेमंद।", "Direct flights are few; trains are more dependable.",
                      "सड़क यात्रा लंबी है, ट्रेन बेहतर।", "The road trip is long; train is better.")),
    dict(city_key="nagpur", city_hi="नागपुर", city_en="Nagpur", sort=3,
         summary_hi="ट्रेन या फ्लाइट। सतना/कटनी होकर कई ट्रेनें मिलती हैं।",
         summary_en="Train or flight. Several trains run via Satna or Katni.",
         modes=_modes("IRCTC पर नागपुर से प्रयागराज की ट्रेनें देखें।", "Search IRCTC for Nagpur to Prayagraj trains.",
                      "फ्लाइट के लिए कीमतें और उपलब्धता पहले जाँचें।", "Check fares and availability early for flights.",
                      "सड़क से दूरी बहुत है।", "Very long by road.")),
    dict(city_key="delhi", city_hi="दिल्ली / NCR", city_en="Delhi / NCR", sort=4,
         summary_hi="ट्रेन और फ्लाइट दोनों के कई विकल्प। मेले के दिनों में टिकट पहले से लें।",
         summary_en="Plenty of train and flight options. Book ahead around Mela dates.",
         modes=_modes("दिल्ली से PRYJ की कई ट्रेनें चलती हैं, IRCTC पर देखें।", "Many Delhi to PRYJ trains run; check IRCTC.",
                      "दिल्ली से प्रयागराज की उड़ानें उपलब्ध रहती हैं, पर बड़े स्नानों के आसपास महँगी और फुल।",
                      "Flights from Delhi are available but get expensive and full around big baths.",
                      "लगभग 600+ किमी; कार संभव है, पर स्नान के दिनों में डायवर्जन से देरी होती है।",
                      "Roughly 600+ km; a car is possible, but diversions cause delays on bath days.")),
    dict(city_key="lucknow", city_hi="लखनऊ", city_en="Lucknow", sort=5,
         summary_hi="सड़क और ट्रेन दोनों आसान, लगभग 200 किमी।",
         summary_en="Road and train both work, about 200 km.",
         modes=_modes("लखनऊ से प्रयागराज की ट्रेनें कई हैं।", "Plenty of trains from Lucknow to Prayagraj.",
                      "फ्लाइट की जरूरत कम, ट्रेन/सड़क बेहतर।", "A flight is rarely needed; train or road is better.",
                      "एक्सप्रेसवे/हाईवे से 3.5 से 4.5 घंटे सामान्य दिनों में; स्नान के दिन ज्यादा।",
                      "About 3.5 to 4.5 hours on normal days; more on bath days.")),
    dict(city_key="varanasi", city_hi="वाराणसी", city_en="Varanasi", sort=6,
         summary_hi="सबसे नजदीकी बड़ा शहर, लगभग 120 किमी। सड़क और ट्रेन दोनों।",
         summary_en="The nearest big city, about 120 km. Road and train both work.",
         modes=_modes("वाराणसी से प्रयागराज के लिए रोज कई ट्रेनें और बसें।", "Many daily trains and buses from Varanasi.",
                      "फ्लाइट की जरूरत नहीं।", "No flight needed.",
                      "लगभग 2.5 से 3 घंटे, स्नान के दिन ज्यादा।", "About 2.5 to 3 hours, more on bath days.")),
    dict(city_key="kolkata", city_hi="कोलकाता", city_en="Kolkata", sort=7,
         summary_hi="ट्रेन से सीधी कनेक्टिविटी अच्छी है। फ्लाइट भी विकल्प।",
         summary_en="Good direct train connectivity. A flight is also an option.",
         modes=_modes("हावड़ा/सियालदह से PRYJ की ट्रेनें IRCTC पर देखें।", "Look for Howrah/Sealdah to PRYJ on IRCTC.",
                      "उड़ानें सीमित, पहले कीमत जाँचें।", "Flights are limited; check fares first.",
                      "सड़क से बहुत दूर।", "Very far by road.")),
    dict(city_key="mumbai", city_hi="मुंबई", city_en="Mumbai", sort=8,
         summary_hi="ट्रेन लंबी है; फ्लाइट समय बचाती है।", summary_en="The train is long; a flight saves time.",
         modes=_modes("मुंबई से PRYJ की ट्रेनें लंबी यात्रा हैं, पहले बुक करें।", "Mumbai to PRYJ trains are a long journey; book early.",
                      "सीधी उड़ानें हैं, पर बड़े स्नानों के पास भरी रहती हैं।", "Direct flights exist but fill up near big baths.",
                      "सड़क से व्यावहारिक नहीं।", "Not practical by road.")),
    dict(city_key="patna", city_hi="पटना", city_en="Patna", sort=9,
         summary_hi="ट्रेन और सड़क दोनों संभव।", summary_en="Train and road are both possible.",
         modes=_modes("पटना से PRYJ की ट्रेनें IRCTC पर देखें।", "Look for Patna to PRYJ on IRCTC.",
                      "फ्लाइट की जरूरत कम।", "A flight is rarely needed.",
                      "हाईवे से सड़क यात्रा संभव, पर मेले के दिनों में डायवर्जन।", "Possible by highway, but expect diversions on Mela days.")),
    dict(city_key="other", city_hi="कोई और शहर", city_en="Another city", sort=99,
         summary_hi="अपने शहर से IRCTC पर प्रयागराज की ट्रेनें देखें। नजदीकी बड़े हवाई अड्डे: प्रयागराज (IXD), वाराणसी, लखनऊ।",
         summary_en="Search IRCTC from your city. Nearby airports: Prayagraj (IXD), Varanasi, Lucknow.",
         modes=_modes("IRCTC पर अपने शहर से प्रयागराज के स्टेशन चुनें: " + STATIONS_HI,
                      "On IRCTC pick Prayagraj stations: " + STATIONS_EN,
                      "प्रयागराज (IXD), वाराणसी (VNS) या लखनऊ (LKO) देखें।", "Check Prayagraj (IXD), Varanasi (VNS) or Lucknow (LKO).",
                      "मेला क्षेत्र से पहले वाहन रोके जाते हैं; पार्किंग और शटल की जानकारी आधिकारिक नोटिस में देखें।",
                      "Vehicles are stopped before the Mela area; see official notices for parking and shuttles.")),
]

# checklists: category -> items (hi, en)
CHECKLISTS = {
    "winter": [
        ("थर्मल/गर्म अंदरूनी कपड़े", "Thermals or warm innerwear"), ("ऊनी स्वेटर, जैकेट और टोपी", "Sweater, jacket and a cap"),
        ("गर्म मोज़े और शॉल/कंबल", "Warm socks and a shawl or blanket"), ("ऐसे जूते-चप्पल जो भीगने पर भी चलें", "Footwear that is fine when wet")],
    "bath": [
        ("तौलिया और बदलने के कपड़े", "Towel and a change of clothes"), ("गीले कपड़ों के लिए प्लास्टिक थैली", "Plastic bag for wet clothes"),
        ("छोटा वॉटरप्रूफ बैग", "A small waterproof bag"), ("कीमती सामान और गहने घर पर छोड़ें", "Leave valuables and jewellery at home")],
    "documents": [
        ("पहचान पत्र (आधार आदि) की कॉपी", "ID copy (Aadhaar or similar)"), ("टिकट और होटल/ठहरने की पुष्टि", "Tickets and stay confirmation"),
        ("जरूरी दवाइयाँ और पर्चा", "Regular medicines and prescriptions")],
    "kids": [
        ("बच्चे की जेब में पर्ची: नाम और माता-पिता का नंबर", "A slip in the child's pocket with name and parent's number"),
        ("गर्म कपड़े और अतिरिक्त जोड़ी", "Warm clothes and a spare set"), ("स्नैक्स, पानी और ORS", "Snacks, water and ORS")],
    "elders": [
        ("दवाइयाँ पर्स में रखें, सामान में नहीं", "Keep medicines on you, not in luggage"), ("छड़ी या सहारे का इंतजाम", "A walking stick or support"),
        ("लंबी पैदल दूरी की जगह रिक्शा/शटल की योजना", "Plan rickshaw or shuttle for long walks")],
    "money": [
        ("UPI के साथ छोटे नोट भी रखें", "Carry small notes along with UPI"), ("कोई भी रेट पहले तय करें", "Fix every rate before you start")],
    "phone": [
        ("पावर बैंक", "Power bank"), ("ऑफलाइन नक्शा डाउनलोड करें", "Download an offline map"),
        ("परिवार के साथ मिलने की जगह तय करें और सबको बताएँ", "Agree a meeting spot with the family and tell everyone")],
}

# Price guide: numbers intentionally empty until verified locally before the season.
PRICE_GUIDES = [
    dict(service="boat", label_hi="संगम नाव (प्रति नाव)", label_en="Sangam boat (per boat)", sort=1,
         note_hi="बैठने से पहले रेट तय करें। आधिकारिक रेट बोर्ड हो तो उसी को मानें।",
         note_en="Fix the rate before you board. Follow the official rate board where one is displayed."),
    dict(service="auto", label_hi="ऑटो / ई-रिक्शा", label_en="Auto / e-rickshaw", sort=2,
         note_hi="मेले के दिनों में किराया बढ़ता है। बैठने से पहले तय कर लें।",
         note_en="Fares rise on Mela days. Settle before you sit."),
    dict(service="guide", label_hi="स्थानीय गाइड", label_en="Local guide", sort=3,
         note_hi="सिर्फ पहचान वाले या सत्यापित गाइड लें। पूरा पैकेज तय करके चलें।",
         note_en="Use only known or verified guides. Agree the whole package up front."),
]

NOTICES = [
    dict(kind="info",
         msg_hi="माघ मेला 2027 की तिथियाँ प्रकाशित स्रोतों पर आधारित हैं। आधिकारिक घोषणा आने पर यहाँ अपडेट होंगी।",
         msg_en="Magh Mela 2027 dates are based on published sources. This page updates when the official announcement is out."),
]

SCAM_TIPS = [
    ("रेट पहले तय करें", "Fix the rate first", "नाव, ऑटो, गाइड या ठहरने से पहले साफ दाम और समय पूछें।", "Ask for a clear price and duration before any boat, auto, guide or stay."),
    ("सड़क पर बुलाने वालों से बचें", "Avoid touts who call you over", "स्टेशन या घाट पर 'सस्ता कमरा' या 'सीधा दर्शन' दिलाने वालों के साथ न जाएँ।", "Do not follow people at stations or ghats offering 'cheap rooms' or 'quick darshan'."),
    ("पैकेज में क्या शामिल है, पूछें", "Ask what the package includes", "खाना, परिवहन, समय और वापसी, सब पहले लिखित या मैसेज में तय करें।", "Settle food, transport, timing and return in writing or by message."),
    ("एडवांस सोच-समझकर दें", "Think before paying in advance", "छोटा एडवांस दें और रसीद या मैसेज रखें। पूरी रकम पहले न दें।", "Pay a small advance only and keep a receipt or message. Never pay in full upfront."),
    ("दान-पुण्य के नाम पर दबाव", "Pressure in the name of donations", "दान स्वेच्छा से करें। किसी के दबाव में न आएँ।", "Donate on your own terms. Do not give in to pressure."),
    ("जेब और सामान", "Pockets and belongings", "भीड़ में पर्स और फोन आगे की जेब में रखें।", "In crowds keep your wallet and phone in front pockets."),
]

FAQ = [
    ("क्या माघ मेले में प्रवेश शुल्क है?", "Is there an entry fee for the Mela?",
     "मेले में प्रवेश और संगम पर स्नान के लिए प्रवेश शुल्क नहीं है। नाव, ठहरने और खाने का खर्च अलग होता है।",
     "There is no entry fee for the Mela or for bathing at the Sangam. Boats, stay and food cost extra."),
    ("पहली बार जाने वालों के लिए सबसे अच्छा समय?", "Best time for a first visit?",
     "बड़े स्नान के दिनों के बीच कोई सामान्य कार्यदिवस। इससे भीड़ कम मिलती है।",
     "An ordinary weekday between the big bath days. Crowds are much lighter."),
    ("क्या बच्चों और बुजुर्गों के साथ जा सकते हैं?", "Can we go with children and elders?",
     "हाँ, पर बड़े स्नान के दिन न जाएँ। आराम की योजना बनाएँ: ठहरने की जगह पहले से तय, कम पैदल दूरी, गर्म कपड़े और दवाइयाँ साथ।",
     "Yes, but avoid the big bath days. Plan for comfort: stay booked in advance, short walks, warm clothes and medicines."),
    ("भीड़ में बिछड़ जाएँ तो?", "What if someone gets separated?",
     "खोया-पाया केंद्र पर जाएँ, या 112 पर कॉल करें। पहले से मिलने की जगह तय रखें और बच्चों की जेब में नंबर की पर्ची रखें।",
     "Go to a Khoya-Paya (lost-and-found) centre or call 112. Agree a meeting spot beforehand and put a number slip in children's pockets."),
    ("आपातकालीन नंबर", "Emergency numbers",
     "पुलिस और सामान्य आपातकाल: 112। एम्बुलेंस: 108। मेला क्षेत्र के स्थानीय हेल्पलाइन नंबर हर साल आधिकारिक नोटिस में जारी होते हैं।",
     "Police and general emergency: 112. Ambulance: 108. Local Mela helpline numbers are published in the official notices each year."),
]
