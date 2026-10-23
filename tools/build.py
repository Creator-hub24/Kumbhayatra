#!/usr/bin/env python3
"""Builds the Kumbhayatra site: HTML pages, data/seed.json, supabase/seed.sql, sitemap.xml, robots.txt.
Run from the repo root:  python3 tools/build.py
Edit guide content in tools/content.py (dates, places, itineraries, routes, checklists), then re-run.
"""
import json, os, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import content as C  # noqa: E402

SITE = "https://kumbhayatra.com"
E = html.escape


def T(hi, en):
    return '<span class="hi">%s</span><span class="en">%s</span>' % (hi, en)


def write(rel, text):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; "
       "connect-src 'self' https://*.supabase.co; base-uri 'none'; form-action 'self'")

NAV = [
    ("plan.html", "योजना बनाएँ", "Plan my trip"),
    ("snan.html", "स्नान तिथियाँ", "Bath dates"),
    ("reach.html", "कैसे पहुँचें", "How to reach"),
    ("places.html", "स्थान", "Places"),
    ("services.html", "ठहरना और सेवाएँ", "Stay and services"),
    ("safety.html", "सुरक्षा", "Safety"),
    ("help.html", "मदद", "Help"),
]

FOOT = [
    ("itineraries.html", "यात्रा योजनाएँ", "Itineraries"),
    ("checklist.html", "तैयारी सूची", "Checklist"),
    ("list-business.html", "अपना व्यवसाय जोड़ें", "List your business"),
    ("business.html", "व्यवसाय लॉगिन", "Business login"),
    ("privacy.html", "गोपनीयता", "Privacy"),
    ("terms.html", "शर्तें", "Terms"),
]

PAGES = []  # (filename, indexable)


def page(fname, title_hi, title_en, desc_hi, desc_en, body, scripts=(), vendor=True, index=True):
    nav = "".join('<a href="%s">%s</a>' % (h, T(hi, en)) for h, hi, en in NAV)
    foot = "".join('<a href="%s">%s</a>' % (h, T(hi, en)) for h, hi, en in FOOT)
    vend = '<script src="assets/js/vendor/supabase.js" defer></script>\n' if vendor else ""
    js = "".join('<script src="assets/js/%s" defer></script>\n' % s for s in scripts)
    robots = '<meta name="robots" content="noindex">\n' if not index else ""
    title = "%s | %s | Kumbhayatra" % (title_hi, title_en) if fname != "index.html" else "कुंभयात्रा | Kumbhayatra: Magh Mela Prayagraj guide"
    out = f"""<!doctype html>
<html lang="hi" data-lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc_hi)} {E(desc_en)}">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="theme-color" content="#b84e08">
{robots}<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/style.css">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc_en)}">
<meta property="og:type" content="website">
<script src="assets/js/config.js" defer></script>
{vend}<script src="assets/js/app.js" defer></script>
{js}</head>
<body>
<a class="skip" href="#main">{T("मुख्य सामग्री पर जाएँ", "Skip to content")}</a>
<header class="top"><div class="wrap">
  <a class="brand" href="index.html"><img src="assets/favicon.svg" alt="" width="34" height="34"><span>कुंभयात्रा<small>Kumbhayatra</small></span></a>
  <nav class="nav" id="nav" aria-label="Main">{nav}</nav>
  <button class="iconbtn" id="langbtn" type="button" aria-label="Change language">English</button>
  <button class="iconbtn menubtn" id="menubtn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu">☰</button>
</div></header>
<div class="noticebar" id="noticebar" hidden></div>
<main id="main">
{body}
</main>
<footer><div class="wrap">
  <div class="links">{foot}</div>
  <p>{T("कुंभयात्रा एक स्वतंत्र यात्रा-मार्गदर्शिका है। यह मेला प्राधिकरण या उत्तर प्रदेश सरकार से संबद्ध नहीं है। यात्रा से पहले आधिकारिक सूचनाएँ जरूर देखें।",
        "Kumbhayatra is an independent travel guide. It is not affiliated with the Mela Pradhikaran or the Government of Uttar Pradesh. Always check official notices before you travel.")}</p>
  <p>© <span id="year">2026</span> Kumbhayatra · <a href="admin.html" rel="nofollow">Admin</a></p>
</div></footer>
</body>
</html>
"""
    write(fname, out)
    if index:
        PAGES.append(fname)


# ------------------------------------------------------------------ data files
def seed_rows():
    ev = dict(C.EVENT)
    snan = [dict(r) for r in C.SNAN]
    checklists = []
    n = 0
    for cat, items in C.CHECKLISTS.items():
        for hi, en in items:
            n += 1
            checklists.append(dict(category=cat, item_hi=hi, item_en=en, sort=n))
    return {
        "events": [ev],
        "snan": snan,
        "places": C.PLACES,
        "itineraries": C.ITINERARIES,
        "routes": C.ROUTES,
        "checklists": checklists,
        "price_guides": C.PRICE_GUIDES,
        "notices": [dict(n, is_active=True) for n in C.NOTICES],
        "addons": C.ADDONS,
        "faq": [dict(q_hi=a, q_en=b, a_hi=c, a_en=d) for a, b, c, d in C.FAQ],
        "scam_tips": [dict(h_hi=a, h_en=b, p_hi=c, p_en=d) for a, b, c, d in C.SCAM_TIPS],
        "stations": dict(hi=C.STATIONS_HI, en=C.STATIONS_EN),
    }


def q(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def jq(v):
    return q(json.dumps(v, ensure_ascii=False)) + "::jsonb"


def build_seed_sql(s):
    L = ["-- Generated by tools/build.py from tools/content.py. Safe to re-run: every insert is guarded.", ""]
    e = s["events"][0]
    L.append("insert into public.events (slug,name_hi,name_en,starts_on,ends_on,is_current,note_hi,note_en) values (%s) on conflict (slug) do nothing;" %
             ",".join(q(e[k]) for k in ["slug", "name_hi", "name_en", "starts_on", "ends_on", "is_current", "note_hi", "note_en"]))
    for r in s["snan"]:
        L.append("insert into public.snan_dates (event_id,snan_on,name_hi,name_en,crowd,tip_hi,tip_en,sort) select (select id from public.events where slug=%s),%s,%s,%s,%s,%s,%s,%s where not exists (select 1 from public.snan_dates where snan_on=%s);" %
                 (q(e["slug"]), q(r["snan_on"]), q(r["name_hi"]), q(r["name_en"]), q(r["crowd"]), q(r["tip_hi"]), q(r["tip_en"]), r["sort"], q(r["snan_on"])))
    for r in s["places"]:
        L.append("insert into public.places (slug,name_hi,name_en,type,area,desc_hi,desc_en,sort) values (%s) on conflict (slug) do nothing;" %
                 ",".join(q(r.get(k)) for k in ["slug", "name_hi", "name_en", "type", "area", "desc_hi", "desc_en", "sort"]))
    for r in s["itineraries"]:
        L.append("insert into public.itineraries (slug,days,title_hi,title_en,summary_hi,summary_en,stops,sort) values (%s,%s,%s,%s,%s,%s,%s,%s) on conflict (slug) do nothing;" %
                 (q(r["slug"]), r["days"], q(r["title_hi"]), q(r["title_en"]), q(r["summary_hi"]), q(r["summary_en"]), jq(r["stops"]), r["sort"]))
    for r in s["routes"]:
        L.append("insert into public.routes (city_key,city_hi,city_en,summary_hi,summary_en,modes,sort) values (%s,%s,%s,%s,%s,%s,%s) on conflict (city_key) do nothing;" %
                 (q(r["city_key"]), q(r["city_hi"]), q(r["city_en"]), q(r["summary_hi"]), q(r["summary_en"]), jq(r["modes"]), r["sort"]))
    for r in s["checklists"]:
        L.append("insert into public.checklists (category,item_hi,item_en,sort) select %s,%s,%s,%s where not exists (select 1 from public.checklists where item_en=%s);" %
                 (q(r["category"]), q(r["item_hi"]), q(r["item_en"]), r["sort"], q(r["item_en"])))
    for r in s["price_guides"]:
        L.append("insert into public.price_guides (service,label_hi,label_en,note_hi,note_en,sort) select %s,%s,%s,%s,%s,%s where not exists (select 1 from public.price_guides where service=%s);" %
                 (q(r["service"]), q(r["label_hi"]), q(r["label_en"]), q(r["note_hi"]), q(r["note_en"]), r["sort"], q(r["service"])))
    for r in s["notices"]:
        L.append("insert into public.notices (kind,msg_hi,msg_en) select %s,%s,%s where not exists (select 1 from public.notices where msg_en=%s);" %
                 (q(r["kind"]), q(r["msg_hi"]), q(r["msg_en"]), q(r["msg_en"])))
    return "\n".join(L) + "\n"


# ------------------------------------------------------------------ pages
def build_pages():
    # ---------- home ----------
    page("index.html", "कुंभयात्रा", "Kumbhayatra",
         "माघ मेला प्रयागराज के लिए मुफ्त, भरोसेमंद यात्रा-मार्गदर्शिका।",
         "A free, trustworthy travel guide for Magh Mela, Prayagraj.",
         f"""
<section class="hero"><div class="wrap">
  <h1>{T("माघ मेला जाना है? पूरा प्लान हम बना देंगे।", "Going to Magh Mela? We will plan the whole trip.")}</h1>
  <p class="lead">{T("पहली बार प्रयागराज आ रहे हैं? तिथि, भीड़, रास्ता, ठहरना और सुरक्षा, सब एक जगह और बिना झंझट।",
                    "First time in Prayagraj? Dates, crowds, routes, stay and safety, all in one place and without the hassle.")}</p>
  <div class="cta-row">
    <a class="btn" href="plan.html">{T("अपनी यात्रा की योजना बनाएँ", "Plan my trip")}</a>
    <a class="btn ghost" href="snan.html">{T("स्नान तिथियाँ और भीड़", "Bath dates and crowds")}</a>
  </div>
  <img class="hero-img" src="assets/img/mela-hero.svg" alt="" width="1200" height="420">
</div></section>
<div class="wrap">
  <section class="card" id="next" aria-live="polite"><p class="muted">{T("अगली स्नान तिथि लोड हो रही है…", "Loading the next bath date…")}</p></section>

  <h2>{T("तीन आसान कदम", "Three easy steps")}</h2>
  <div class="grid c3">
    <div class="card"><span class="ico" aria-hidden="true">1️⃣</span><h3>{T("अपनी जानकारी भरें", "Tell us about your group")}</h3><p>{T("कौन से शहर से, कितने लोग, बच्चे या बुजुर्ग हैं या नहीं, कितने दिन।", "Which city, how many people, whether kids or elders are coming, how many days.")}</p></div>
    <div class="card"><span class="ico" aria-hidden="true">2️⃣</span><h3>{T("सही दिन चुनें", "Pick the right days")}</h3><p>{T("हम भीड़ का अनुमान बताते हैं और शांत दिन सुझाते हैं।", "We show the expected crowd and suggest calmer days.")}</p></div>
    <div class="card"><span class="ico" aria-hidden="true">3️⃣</span><h3>{T("योजना WhatsApp पर पाएँ", "Get the plan on WhatsApp")}</h3><p>{T("रास्ता, दर्शन-क्रम, ठहरने के विकल्प और सामान की सूची, परिवार को भेजें या प्रिंट करें।", "Route, darshan order, stay options and packing list. Share with family or print.")}</p></div>
  </div>

  <h2>{T("आप हम पर भरोसा क्यों कर सकते हैं", "Why you can trust this guide")}</h2>
  <div class="grid c3">
    <div class="card"><h3>{T("पूरी तरह मुफ्त", "Completely free")}</h3><p>{T("तीर्थयात्रियों से कोई शुल्क नहीं। हम सिर्फ सत्यापित स्थानीय सेवाओं को जोड़ते हैं।", "No charge to pilgrims. We only connect you with verified local services.")}</p></div>
    <div class="card"><h3>{T("फर्जी गाइड से बचाव", "Protection from fake guides")}</h3><p>{T("रेट पहले तय करने की सलाह, ठगी के तरीके और शिकायत का रास्ता।", "Advice to fix rates first, common scams and a way to report.")}</p></div>
    <div class="card"><h3>{T("सिर्फ सत्यापित सूची", "Verified listings only")}</h3><p>{T("जिन ठहरने, नाव और टैक्सी वालों की हमने जाँच की है, वही दिखते हैं।", "Only stays, boats and taxis we have checked are shown.")}</p></div>
  </div>

  <h2>{T("और जानें", "Explore")}</h2>
  <div class="grid c4">
    <a class="card" href="itineraries.html"><span class="ico" aria-hidden="true">🗺️</span><h3>{T("1, 2, 3 दिन की योजनाएँ", "1, 2, 3 day plans")}</h3></a>
    <a class="card" href="reach.html"><span class="ico" aria-hidden="true">🚆</span><h3>{T("आपके शहर से कैसे पहुँचें", "How to reach from your city")}</h3></a>
    <a class="card" href="services.html"><span class="ico" aria-hidden="true">🏨</span><h3>{T("ठहरना, नाव, टैक्सी", "Stay, boat, taxi")}</h3></a>
    <a class="card" href="checklist.html"><span class="ico" aria-hidden="true">🎒</span><h3>{T("क्या साथ ले जाएँ", "What to pack")}</h3></a>
  </div>

  <section class="card" id="biz-cta">
    <h3>{T("प्रयागराज में ठहरने, नाव या टैक्सी की सेवा देते हैं?", "Run a stay, boat or taxi service in Prayagraj?")}</h3>
    <p>{T("मेले के मौसम में सत्यापित सूची में जुड़ें और सीधे तीर्थयात्रियों की पूछताछ पाएँ।", "Join the verified list for the Mela season and get enquiries from pilgrims directly.")}</p>
    <a class="btn small" href="list-business.html">{T("अपना व्यवसाय जोड़ें", "List your business")}</a>
  </section>
</div>
""".replace('', ""), scripts=["home.js"])

    # ---------- plan ----------
    page("plan.html", "यात्रा योजना", "Plan my trip",
         "अपने शहर, लोगों और दिनों के हिसाब से माघ मेला यात्रा की योजना बनाएँ।",
         "Plan your Magh Mela trip by city, group and days.",
         f"""
<div class="wrap">
  <h1>{T("अपनी यात्रा की योजना बनाएँ", "Plan my trip")}</h1>
  <p class="muted">{T("एक मिनट में भरें। हमारी योजना भीड़ का अनुमान, रास्ता, दर्शन-क्रम और तैयारी सूची देगी।", "Fill this in under a minute. Your plan includes expected crowds, the route, a darshan order and a packing list.")}</p>
  <form id="plan-form" class="card noprint" novalidate>
    <div class="fgrid">
      <div><label for="p-city">{T("आप किस शहर से आ रहे हैं?", "Which city are you coming from?")}</label><select id="p-city"></select></div>
      <div><label for="p-days">{T("कितने दिन?", "How many days?")}</label>
        <select id="p-days"><option value="1">{T("1 दिन", "1 day")}</option><option value="2" selected>{T("2 दिन", "2 days")}</option><option value="3">{T("3 दिन", "3 days")}</option></select></div>
      <div><label for="p-adults">{T("वयस्क", "Adults")}</label><input id="p-adults" type="number" inputmode="numeric" min="1" max="30" value="2"></div>
      <div><label for="p-kids">{T("बच्चे (12 साल से कम)", "Children (under 12)")}</label><input id="p-kids" type="number" inputmode="numeric" min="0" max="30" value="0"></div>
      <div><label for="p-elders">{T("बुजुर्ग (60+)", "Elders (60+)")}</label><input id="p-elders" type="number" inputmode="numeric" min="0" max="30" value="0"></div>
      <div><label for="p-stay">{T("ठहरना कहाँ पसंद करेंगे?", "Preferred stay")}</label>
        <select id="p-stay"><option value="any">{T("कोई भी", "Any")}</option><option value="hotel">{T("होटल / गेस्ट हाउस", "Hotel / guest house")}</option><option value="dharamshala">{T("धर्मशाला / डॉर्मिटरी", "Dharamshala / dormitory")}</option><option value="tent">{T("मेला टेंट", "Mela tent")}</option></select></div>
    </div>
    <label for="p-date">{T("आने की तारीख (पता न हो तो खाली छोड़ें)", "Arrival date (leave blank if not sure)")}</label>
    <input id="p-date" type="date">
    <p class="hint" id="p-date-hint"></p>
    <div class="cta-row"><button class="btn" type="submit">{T("मेरी योजना बनाएँ", "Build my plan")}</button></div>
  </form>
  <div id="plan-msg"></div>
  <div id="plan-result" class="result" aria-live="polite"></div>
  <p class="hint noprint">{T("हम आपकी योजना के विकल्प (शहर, दिन, लोगों की संख्या) गुमनाम रूप से सहेजते हैं ताकि गाइड बेहतर हो सके। कोई नाम या फोन नंबर नहीं लिया जाता।",
                           "We save the plan options (city, days, group size) anonymously to improve the guide. No name or phone number is collected.")}</p>
</div>
""", scripts=["plan.js"])

    # ---------- snan ----------
    page("snan.html", "स्नान तिथियाँ और भीड़", "Bath dates and crowds",
         "माघ मेला 2027 की स्नान तिथियाँ और हर दिन की भीड़ का अनुमान।",
         "Magh Mela 2027 bath dates with a day-by-day crowd estimate.",
         f"""
<div class="wrap">
  <h1>{T("स्नान तिथियाँ और भीड़ का अनुमान", "Bath dates and crowd estimate")}</h1>
  <p id="snan-note" class="muted"></p>
  <div class="card verdict" id="calm-box"></div>
  <h2>{T("दिन-दर-दिन कैलेंडर", "Day-by-day calendar")}</h2>
  <div class="legend" id="legend"></div>
  <div id="cal"></div>
  <div class="card" id="cal-detail" aria-live="polite"><p class="muted">{T("किसी तारीख पर दबाएँ।", "Tap a date to see details.")}</p></div>
  <h2>{T("मुख्य स्नान पर्व", "Main bath days")}</h2>
  <div id="snan-list" class="grid c2"></div>
  <p class="hint">{T("भीड़ का अनुमान हमारा नियोजन-अनुमान है, आधिकारिक आँकड़ा नहीं। बड़े स्नान के आसपास के दिन भी व्यस्त रहते हैं।",
                    "Crowd levels are our planning estimate, not an official figure. The days around a big bath are busy too.")}</p>
</div>
""", scripts=["snan.js"])

    # ---------- itineraries ----------
    page("itineraries.html", "यात्रा योजनाएँ", "Itineraries",
         "प्रयागराज के लिए 1, 2 और 3 दिन की तैयार यात्रा योजनाएँ।",
         "Ready-made 1, 2 and 3 day itineraries for Prayagraj.",
         f"""
<div class="wrap">
  <h1>{T("यात्रा योजनाएँ", "Itineraries")}</h1>
  <p class="muted">{T("समय सूर्योदय और भीड़ के हिसाब से बदलें। बच्चों और बुजुर्गों के साथ कम पड़ाव रखें।", "Adjust timings for sunrise and crowds. Keep fewer stops with children and elders.")}</p>
  <div class="tabs" id="it-tabs" role="tablist"></div>
  <div id="it-body"></div>
  <h2>{T("आसपास घूमने के विकल्प", "Nearby add-ons")}</h2>
  <ul id="addons"></ul>
  <p><a class="btn" href="plan.html">{T("अपनी योजना बनाएँ", "Build my own plan")}</a></p>
</div>
""", scripts=["itineraries.js"])

    # ---------- reach ----------
    page("reach.html", "कैसे पहुँचें", "How to reach",
         "इंदौर, भोपाल, दिल्ली और अन्य शहरों से प्रयागराज कैसे पहुँचें।",
         "How to reach Prayagraj from Indore, Bhopal, Delhi and other cities.",
         f"""
<div class="wrap">
  <h1>{T("प्रयागराज कैसे पहुँचें", "How to reach Prayagraj")}</h1>
  <label for="r-city">{T("आप किस शहर से आ रहे हैं?", "Which city are you coming from?")}</label>
  <select id="r-city"></select>
  <div id="r-body" class="stack"></div>
  <h2>{T("मेला क्षेत्र तक आखिरी हिस्सा", "The last stretch to the Mela")}</h2>
  <div class="card stack">
    <p>{T("मेला क्षेत्र के पास वाहन रोक दिए जाते हैं और अंतिम हिस्सा पैदल तय करना पड़ता है। बड़े स्नान के दिन डायवर्जन और बंद सड़कें आम हैं।", "Vehicles are stopped before the Mela area and the last stretch is on foot. Diversions and closed roads are common on big bath days.")}</p>
    <p>{T("पार्किंग, शटल और बंद रास्तों की सही जानकारी हर साल मेला प्राधिकरण और पुलिस के आधिकारिक नोटिस में आती है। यात्रा से एक-दो दिन पहले देखें।", "Exact parking, shuttle and road-closure details come in the official notices from the Mela Pradhikaran and police each year. Check them a day or two before you travel.")}</p>
    <p class="muted small" id="stations"></p>
  </div>
</div>
""", scripts=["reach.js"])

    # ---------- places ----------
    page("places.html", "स्थान", "Places",
         "संगम, हनुमान मंदिर, अक्षयवट और प्रयागराज के प्रमुख दर्शनीय स्थल।",
         "Sangam, Hanuman Mandir, Akshayavat and the main places to see in Prayagraj.",
         f"""
<div class="wrap">
  <h1>{T("प्रयागराज के प्रमुख स्थान", "Main places in Prayagraj")}</h1>
  <div class="chips" id="p-chips" role="group" aria-label="Filter"></div>
  <div id="p-list" class="grid c2"></div>
  <p class="hint">{T("प्रवेश के नियम और समय बदल सकते हैं। जाने से पहले आधिकारिक सूचना देखें।", "Entry rules and timings can change. Check official notices before you go.")}</p>
</div>
""", scripts=["places.js"])

    # ---------- services ----------
    page("services.html", "ठहरना और सेवाएँ", "Stay and services",
         "प्रयागराज में सत्यापित ठहरने, नाव और टैक्सी की सूची।",
         "Verified stays, boats and taxis in Prayagraj.",
         f"""
<div class="wrap">
  <h1>{T("ठहरना और स्थानीय सेवाएँ", "Stay and local services")}</h1>
  <p class="muted">{T("सिर्फ वही व्यवसाय दिखते हैं जिनकी पहचान और फोन हमने जाँचे हैं। रेट हमेशा बात करके पहले पक्का करें।", "Only businesses whose identity and phone we have checked are shown. Always confirm the rate before you commit.")}</p>
  <div class="tabs" id="s-tabs" role="tablist"></div>
  <div class="fgrid noprint" id="s-filters">
    <div><label for="s-area">{T("इलाका", "Area")}</label><select id="s-area"><option value="">{T("सभी", "All")}</option></select></div>
    <div id="s-cap-wrap"><label for="s-cap">{T("कम से कम कितने लोग", "Minimum group size")}</label><input id="s-cap" type="number" inputmode="numeric" min="1" max="100" placeholder="4"></div>
  </div>
  <div id="s-list" class="stack"></div>
  <div class="card"><h3>{T("आप सेवा देते हैं?", "Do you offer a service?")}</h3>
    <p>{T("अपना ठहरने, नाव या टैक्सी का व्यवसाय सत्यापन के लिए जोड़ें।", "Add your stay, boat or taxi business for verification.")}</p>
    <a class="btn small" href="list-business.html">{T("व्यवसाय जोड़ें", "List your business")}</a></div>
  <p class="hint">{T("कुंभयात्रा केवल एक डायरेक्टरी है। सेवा, रेट और बुकिंग की जिम्मेदारी संबंधित व्यवसाय की है। 'सत्यापित' का मतलब है कि हमने पहचान और संपर्क जाँचा है, सेवा की गुणवत्ता की गारंटी नहीं।",
                    "Kumbhayatra is only a directory. Service, rates and bookings are the business's responsibility. 'Verified' means we checked identity and contact details, not a guarantee of service quality.")}</p>
</div>
""", scripts=["services.js"])

    # ---------- safety ----------
    page("safety.html", "सुरक्षा और ठगी से बचाव", "Safety and scam protection",
         "माघ मेला में ठगी से बचाव, रेट गाइड, आपातकालीन नंबर और परिवार सुरक्षा कार्ड।",
         "Scam protection, price guide, emergency numbers and a family safety card for Magh Mela.",
         f"""
<div class="wrap">
  <h1>{T("सुरक्षा और ठगी से बचाव", "Safety and scam protection")}</h1>
  <h2>{T("ठगी से बचने के छह नियम", "Six rules against scams")}</h2>
  <div class="grid c2" id="scams"></div>
  <h2>{T("रेट गाइड", "Price guide")}</h2>
  <div id="prices" class="grid c3"></div>
  <h2>{T("आपातकालीन नंबर", "Emergency numbers")}</h2>
  <div class="card"><p><strong>112</strong> {T("पुलिस / सामान्य आपातकाल", "Police / general emergency")} · <strong>108</strong> {T("एम्बुलेंस", "Ambulance")}</p>
  <p class="muted small">{T("मेला क्षेत्र के स्थानीय हेल्पलाइन नंबर हर साल आधिकारिक नोटिस में जारी होते हैं। बिछड़ने पर खोया-पाया केंद्र पर जाएँ।", "Local Mela helpline numbers are published in official notices each year. If separated, go to a Khoya-Paya (lost-and-found) centre.")}</p></div>

  <h2>{T("परिवार सुरक्षा कार्ड", "Family safety card")}</h2>
  <form id="fam-form" class="card noprint" novalidate>
    <p class="muted small">{T("यह जानकारी सिर्फ आपके फोन में रहती है, कहीं भेजी नहीं जाती। भरकर प्रिंट करें या स्क्रीनशॉट रखें।", "This stays on your phone and is never sent anywhere. Fill it in, then print or screenshot.")}</p>
    <div class="fgrid">
      <div><label for="f-name">{T("समूह प्रमुख का नाम", "Group leader name")}</label><input id="f-name" autocomplete="off"></div>
      <div><label for="f-phone">{T("फोन नंबर", "Phone number")}</label><input id="f-phone" inputmode="tel" autocomplete="off"></div>
      <div><label for="f-phone2">{T("दूसरा संपर्क नंबर", "Second contact number")}</label><input id="f-phone2" inputmode="tel" autocomplete="off"></div>
      <div><label for="f-stay">{T("ठहरने की जगह और पता", "Where you are staying")}</label><input id="f-stay" autocomplete="off"></div>
    </div>
    <label for="f-meet">{T("बिछड़ने पर मिलने की जगह", "Meeting spot if separated")}</label><input id="f-meet" autocomplete="off">
    <div class="cta-row"><button class="btn" type="submit">{T("कार्ड बनाएँ", "Create card")}</button></div>
  </form>
  <div id="fam-card"></div>

  <h2>{T("शिकायत या ठगी की सूचना", "Report an issue or scam")}</h2>
  <form id="report-form" class="card noprint" novalidate>
    <label for="rp-reason">{T("समस्या का प्रकार", "Type of problem")}</label>
    <select id="rp-reason"><option value="overcharging">{T("ज्यादा पैसे माँगे", "Overcharging")}</option><option value="fake">{T("फर्जी / झूठा दावा", "Fake or false claim")}</option><option value="rude">{T("बदसलूकी", "Rude behaviour")}</option><option value="unsafe">{T("असुरक्षित", "Unsafe")}</option><option value="other">{T("अन्य", "Other")}</option></select>
    <label for="rp-details">{T("क्या हुआ? (नाम, जगह, किराया आदि)", "What happened? (name, place, amount, etc.)")}</label>
    <textarea id="rp-details" maxlength="800"></textarea>
    <label for="rp-contact">{T("आपका संपर्क (वैकल्पिक)", "Your contact (optional)")}</label><input id="rp-contact" maxlength="80" autocomplete="off">
    <div class="cta-row"><button class="btn" type="submit">{T("सूचना भेजें", "Send report")}</button></div>
    <div id="rp-msg"></div>
  </form>
</div>
""", scripts=["safety.js"])

    # ---------- checklist ----------
    page("checklist.html", "तैयारी सूची", "Packing checklist",
         "माघ मेला के लिए क्या साथ ले जाएँ: सर्दी, स्नान, दस्तावेज, बच्चे और बुजुर्ग।",
         "What to pack for Magh Mela: winter, bath, documents, kids and elders.",
         f"""
<div class="wrap">
  <h1>{T("तैयारी सूची", "Packing checklist")}</h1>
  <div class="opts noprint">
    <label class="opt"><input type="checkbox" id="c-kids"> {T("बच्चे साथ हैं", "Children coming")}</label>
    <label class="opt"><input type="checkbox" id="c-elders"> {T("बुजुर्ग साथ हैं", "Elders coming")}</label>
  </div>
  <div id="c-body" class="grid c2"></div>
  <div class="cta-row noprint"><button class="btn" id="c-print" type="button">{T("प्रिंट / PDF", "Print / PDF")}</button></div>
</div>
""", scripts=["checklist.js"])

    # ---------- help ----------
    page("help.html", "मदद और सवाल", "Help and FAQ",
         "माघ मेला यात्रा से जुड़े आम सवाल और संपर्क।",
         "Common questions about visiting Magh Mela, and how to contact us.",
         f"""
<div class="wrap">
  <h1>{T("मदद और अक्सर पूछे जाने वाले सवाल", "Help and frequently asked questions")}</h1>
  <div id="faq" class="stack"></div>
  <h2>{T("हमसे संपर्क करें", "Contact us")}</h2>
  <div class="card" id="contact"></div>
  <h2>{T("सुधार सुझाएँ", "Suggest a correction")}</h2>
  <form id="fix-form" class="card" novalidate>
    <label for="fx-text">{T("कौन सी जानकारी गलत या पुरानी लगी?", "What looks wrong or out of date?")}</label>
    <textarea id="fx-text" maxlength="800"></textarea>
    <label for="fx-contact">{T("आपका संपर्क (वैकल्पिक)", "Your contact (optional)")}</label><input id="fx-contact" maxlength="80" autocomplete="off">
    <div class="cta-row"><button class="btn" type="submit">{T("भेजें", "Send")}</button></div>
    <div id="fx-msg"></div>
  </form>
</div>
""", scripts=["help.js"])

    # ---------- list business (landing) ----------
    page("list-business.html", "अपना व्यवसाय जोड़ें", "List your business",
         "प्रयागराज के ठहरने, नाव और टैक्सी वालों के लिए मेला सीज़न की सत्यापित सूची।",
         "A verified Mela-season listing for Prayagraj stays, boats and taxis.",
         f"""
<div class="wrap">
  <h1>{T("मेले के मौसम में तीर्थयात्रियों तक पहुँचें", "Reach pilgrims this Mela season")}</h1>
  <p class="lead muted">{T("ठहरने, नाव और टैक्सी की सेवा देने वाले स्थानीय व्यवसायों के लिए।", "For local stays, boat operators and taxi or tempo drivers.")}</p>
  <div class="grid c3">
    <div class="card"><h3>{T("1. जानकारी भरें", "1. Fill in your details")}</h3><p>{T("नाम, इलाका, फोन/WhatsApp और रेट। हिंदी या अंग्रेजी में।", "Name, area, phone or WhatsApp and rates, in Hindi or English.")}</p></div>
    <div class="card"><h3>{T("2. हम जाँच करते हैं", "2. We verify")}</h3><p>{T("हम फोन या मुलाकात से पहचान और संपर्क जाँचते हैं।", "We check your identity and contact by phone or visit.")}</p></div>
    <div class="card"><h3>{T("3. पूछताछ पाएँ", "3. Receive enquiries")}</h3><p>{T("सत्यापन के बाद आपका नाम सूची में दिखता है और पूछताछ सीधे आपके WhatsApp पर आती है।", "Once verified you appear in the list and enquiries come straight to your WhatsApp.")}</p></div>
  </div>
  <h2>{T("हमारे नियम", "Our rules")}</h2>
  <ul>
    <li>{T("रेट साफ और स्थिर रखें। ज्यादा पैसे माँगने की बार-बार शिकायत पर सूची से हटाया जाएगा।", "Keep rates clear and stable. Repeated overcharging complaints lead to removal.")}</li>
    <li>{T("नाम या फोन बदलने पर सूची दोबारा जाँच में जाती है।", "Changing name or phone sends your listing back for re-check.")}</li>
    <li>{T("शुरुआत में सूची मुफ्त है। भविष्य में विशेष स्थान सशुल्क हो सकते हैं, पहले बताकर।", "The basic listing is free for now. Featured spots may become paid later, announced in advance.")}</li>
    <li>{T("हम ऑनलाइन भुगतान नहीं लेते। बुकिंग और भुगतान आप सीधे ग्राहक से तय करें।", "We do not take online payments. You agree bookings and payment directly with the customer.")}</li>
  </ul>
  <p><a class="btn" href="business.html">{T("लॉगिन करें और जोड़ें", "Log in and add your business")}</a></p>
</div>
""", vendor=False)

    # ---------- business dashboard ----------
    page("business.html", "व्यवसाय डैशबोर्ड", "Business dashboard",
         "अपनी सूची, रेट और पूछताछ संभालें।", "Manage your listing, rates and enquiries.",
         f"""
<div class="wrap">
  <h1>{T("व्यवसाय डैशबोर्ड", "Business dashboard")}</h1>
  <div id="b-app"><p class="muted">{T("लोड हो रहा है…", "Loading…")}</p></div>
</div>
""", scripts=["auth.js", "business.js"], index=False)

    # ---------- admin ----------
    page("admin.html", "एडमिन", "Admin",
         "प्रबंधन पैनल।", "Management panel.",
         f"""
<div class="wrap">
  <h1>Admin</h1>
  <div id="a-app"><p class="muted">Loading…</p></div>
</div>
""", scripts=["auth.js", "admin.js"], index=False)

    # ---------- privacy ----------
    page("privacy.html", "गोपनीयता", "Privacy",
         "कुंभयात्रा कौन सी जानकारी रखता है।", "What data Kumbhayatra keeps.",
         f"""
<div class="wrap prose">
  <h1>{T("गोपनीयता", "Privacy")}</h1>
  <p>{T("हम कम से कम जानकारी रखते हैं।", "We keep as little data as possible.")}</p>
  <h2>{T("आम तीर्थयात्री", "Visitors")}</h2>
  <ul>
    <li>{T("आपको खाता बनाने की जरूरत नहीं।", "You do not need an account.")}</li>
    <li>{T("योजना बनाते समय शहर, दिन, लोगों की संख्या और तारीख गुमनाम रूप से सहेजी जाती है। नाम या फोन नहीं।", "When you build a plan, the city, days, group size and date are saved anonymously. No name or phone.")}</li>
    <li>{T("किसी व्यवसाय को WhatsApp करने पर हम सिर्फ यह दर्ज करते हैं कि पूछताछ हुई, ताकि व्यवसाय को गिनती दिखा सकें। आपका नंबर या संदेश नहीं।", "When you tap WhatsApp for a business we only record that an enquiry happened, so the business can see a count. Not your number or message.")}</li>
    <li>{T("समीक्षा और शिकायत में आप जो लिखते हैं, वही सहेजा जाता है। संपर्क देना वैकल्पिक है।", "Reviews and reports store only what you type. Giving a contact is optional.")}</li>
    <li>{T("भाषा की पसंद और चेकलिस्ट के निशान सिर्फ आपके ब्राउज़र में रहते हैं।", "Your language choice and checklist ticks stay only in your browser.")}</li>
    <li>{T("परिवार सुरक्षा कार्ड की जानकारी सिर्फ आपके फोन में रहती है।", "Family safety card details stay on your device.")}</li>
  </ul>
  <h2>{T("व्यवसाय", "Businesses")}</h2>
  <p>{T("ईमेल (लॉगिन के लिए), व्यवसाय का नाम, इलाका, फोन/WhatsApp, विवरण और रेट सहेजे जाते हैं। सत्यापित होने पर नाम, इलाका, फोन/WhatsApp, विवरण और रेट सार्वजनिक दिखते हैं। ईमेल कभी सार्वजनिक नहीं होता।", "Email (for login), business name, area, phone or WhatsApp, description and rates are stored. Once verified the name, area, phone or WhatsApp, description and rates are public. Your email is never public.")}</p>
  <h2>{T("विज्ञापन और ट्रैकिंग", "Ads and tracking")}</h2>
  <p>{T("कोई विज्ञापन या तीसरे पक्ष का ट्रैकिंग नहीं। डेटा Supabase पर सुरक्षित रखा जाता है।", "No ads and no third-party tracking. Data is stored securely on Supabase.")}</p>
</div>
""", vendor=False)

    # ---------- terms ----------
    page("terms.html", "शर्तें", "Terms",
         "कुंभयात्रा की उपयोग की शर्तें।", "Terms of use for Kumbhayatra.",
         f"""
<div class="wrap prose">
  <h1>{T("शर्तें", "Terms")}</h1>
  <ul>
    <li>{T("कुंभयात्रा एक स्वतंत्र मार्गदर्शिका और डायरेक्टरी है। यह मेला प्राधिकरण या सरकार से संबद्ध नहीं है।", "Kumbhayatra is an independent guide and directory. It is not affiliated with the Mela Pradhikaran or the government.")}</li>
    <li>{T("तिथियाँ, भीड़ के अनुमान और जानकारी बदल सकती हैं। यात्रा से पहले आधिकारिक सूचनाएँ देखें।", "Dates, crowd estimates and information can change. Check official notices before travelling.")}</li>
    <li>{T("सूचीबद्ध व्यवसाय स्वतंत्र हैं। सेवा, रेट, बुकिंग और भुगतान की जिम्मेदारी व्यवसाय और ग्राहक के बीच है।", "Listed businesses are independent. Service, rates, bookings and payments are between the business and the customer.")}</li>
    <li>{T("'सत्यापित' का मतलब पहचान और संपर्क की जाँच है, गुणवत्ता की गारंटी नहीं।", "'Verified' means identity and contact were checked, not a quality guarantee.")}</li>
    <li>{T("हम किसी भी सूचीबद्ध व्यवसाय को शिकायतों के आधार पर हटा सकते हैं।", "We may remove any listed business following complaints.")}</li>
    <li>{T("दुरुपयोग, झूठी समीक्षा या फर्जी जानकारी देने पर खाता बंद किया जा सकता है।", "Abuse, fake reviews or false information may lead to account closure.")}</li>
  </ul>
</div>
""", vendor=False)

    # ---------- 404 ----------
    page("404.html", "पेज नहीं मिला", "Page not found",
         "यह पेज उपलब्ध नहीं है।", "This page is not available.",
         f"""
<div class="wrap"><h1>{T("यह पेज नहीं मिला", "Page not found")}</h1>
<p><a class="btn" href="index.html">{T("मुख्य पृष्ठ पर जाएँ", "Go to the home page")}</a></p></div>
""", vendor=False, index=False)


def main():
    seed = seed_rows()
    write("data/seed.json", json.dumps(seed, ensure_ascii=False, indent=1))
    write("supabase/seed.sql", build_seed_sql(seed))
    build_pages()
    urls = "".join("<url><loc>%s/%s</loc></url>\n" % (SITE, "" if p == "index.html" else p) for p in PAGES)
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n")
    write("robots.txt", "User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /business.html\nSitemap: %s/sitemap.xml\n" % SITE)
    print("built %d pages" % len(PAGES))


if __name__ == "__main__":
    main()
