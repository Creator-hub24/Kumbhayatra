KY.ready(function () {
  var form = KY.$("#plan-form"), res = KY.$("#plan-result"), msg = KY.$("#plan-msg");
  var D = {}, P = null;
  var STAY_TYPES = { any: ["room", "dormitory", "tent"], hotel: ["room"], dharamshala: ["dormitory"], tent: ["tent"] };
  var MODE_ICON = { train: "🚆", flight: "✈️", road: "🚗" };
  var UNIT = { "per night": ["प्रति रात", "per night"], "per ride": ["प्रति सवारी", "per ride"], "per trip": ["प्रति यात्रा", "per trip"], "per day": ["प्रति दिन", "per day"], "per person": ["प्रति व्यक्ति", "per person"] };
  var MODE_NAME = { train: ["ट्रेन", "Train"], flight: ["फ्लाइट", "Flight"], road: ["सड़क", "Road"] };

  function int(id, min, max, def) {
    var v = parseInt(KY.$(id).value, 10);
    if (isNaN(v)) v = def;
    return Math.max(min, Math.min(max, v));
  }

  function fillCities() {
    var sel = KY.$("#p-city"), keep = sel.value || new URLSearchParams(location.search).get("city") || "";
    sel.innerHTML = D.routes.map(function (r) {
      return '<option value="' + KY.esc(r.city_key) + '">' + KY.esc(KY.txt(r, "city")) + "</option>";
    }).join("");
    if (keep) sel.value = keep;
  }
  function fillDateHint() {
    var d = KY.$("#p-date");
    d.min = D.ev.starts_on; d.max = D.ev.ends_on;
    var pre = new URLSearchParams(location.search).get("date");
    if (pre && /^\d{4}-\d{2}-\d{2}$/.test(pre) && !d.value && KY.dayNum(pre) >= KY.dayNum(D.ev.starts_on) && KY.dayNum(pre) <= KY.dayNum(D.ev.ends_on)) d.value = pre;
    KY.$("#p-date-hint").textContent = KY.pick("मेले की अवधि: ", "Mela period: ") + KY.dateText(D.ev.starts_on, KY.lang()) + " – " + KY.dateText(D.ev.ends_on, KY.lang());
  }

  function windows(n) {
    var start = KY.dayNum(D.ev.starts_on), end = KY.dayNum(D.ev.ends_on) - (n - 1), cands = [];
    for (var s = start; s <= end; s++) {
      var sum = 0, worst = 0;
      for (var i = 0; i < n; i++) {
        var ds = KY.fromDayNum(s + i);
        var r = KY.rank[KY.crowdFor(ds, D.snan).level];
        var wd = new Date((s + i) * 86400000).getUTCDay();
        sum += r + (wd === 0 || wd === 6 ? 0.5 : 0);
        worst = Math.max(worst, r);
      }
      if (worst <= 1) cands.push({ ds: KY.fromDayNum(s), n: s, worst: worst, sum: sum });
    }
    cands.sort(function (a, b) { return a.worst - b.worst || a.sum - b.sum || a.n - b.n; });
    var picked = [];
    cands.forEach(function (c) {
      if (picked.length < 3 && picked.every(function (p) { return Math.abs(p.n - c.n) >= 3; })) picked.push(c);
    });
    return picked.sort(function (a, b) { return a.n - b.n; });
  }

  function crowdSection(p) {
    var h = "<section><h2>" + KY.t("1. भीड़ और सही दिन", "1. Crowd and the right days") + "</h2>", worst = "calm";
    if (p.date) {
      var rows = [];
      for (var i = 0; i < p.days; i++) {
        var ds = KY.fromDayNum(KY.dayNum(p.date) + i), c = KY.crowdFor(ds, D.snan);
        if (KY.rank[c.level] > KY.rank[worst]) worst = c.level;
        rows.push("<tr><td>" + KY.dateHtml(ds, true) + "</td><td>" + KY.badge(c.level) + "</td><td class=\"small\">" +
          (c.snan ? KY.bi(c.snan, "name") : "") + "</td></tr>");
      }
      p.worst = worst;
      var easy = p.kids > 0 || p.elders > 0;
      var text = {
        calm: ["आपके चुने दिन अपेक्षाकृत शांत हैं। यह पहली बार वालों के लिए अच्छा समय है।", "Your chosen days look calm. A good time for first-timers."],
        moderate: ["भीड़ मध्यम रहेगी। सुबह जल्दी निकलें और ठहरना पहले से तय रखें।", "Expect moderate crowds. Start early and book your stay in advance."],
        high: ["भीड़ ज्यादा रहेगी। सुबह बहुत जल्दी स्नान करें और पैदल चलना ज्यादा होगा।", "Expect heavy crowds. Bathe very early and expect a lot of walking."],
        very_high: ["यह मेले के सबसे भीड़ वाले दिनों में है। सड़कें बंद और डायवर्जन सख्त रहते हैं।", "These are among the most crowded days. Roads close and diversions are strict."]
      }[worst];
      h += '<div class="verdict v-' + worst + '"><p><strong>' + KY.t(text[0], text[1]) + "</strong></p>" +
        (easy && KY.rank[worst] >= 2 ? "<p>" + KY.t("बच्चों या बुजुर्गों के साथ इन दिनों की सलाह हम नहीं देते। कृपया नीचे सुझाई तारीखें देखें।", "With children or elders we do not recommend these days. Please see the suggested dates below.") + "</p>" : "") + "</div>";
      h += '<div class="tablewrap"><table><tbody>' + rows.join("") + "</tbody></table></div>";
    }
    if (!p.date || KY.rank[worst] >= 2) {
      var w = windows(p.days);
      if (w.length) {
        h += "<h3>" + KY.t("शांत तारीखें (सुझाव)", "Calmer dates (suggestions)") + "</h3><div class=\"row\">" + w.map(function (c) {
          var last = KY.fromDayNum(c.n + p.days - 1);
          var span = p.days > 1 ? KY.dateHtml(c.ds) + " – " + KY.dateHtml(last) : KY.dateHtml(c.ds, true);
          return '<button class="btn ghost small noprint" type="button" data-date="' + KY.esc(c.ds) + '">' + span + "</button>";
        }).join("") + "</div>";
      }
    }
    return h + "</section>";
  }

  function itinerarySection(p) {
    var it = D.its.filter(function (x) { return x.days === p.days; })[0] || D.its[0];
    var easy = p.kids > 0 || p.elders > 0, byDay = {}, h = "<section><h2>" + KY.t("2. दर्शन-क्रम", "2. Darshan order") + "</h2>";
    (it.stops || []).forEach(function (s) { var d = s.day || 1; (byDay[d] = byDay[d] || []).push(s); });
    h += "<p class=\"muted\">" + KY.bi(it, "title") + "</p>";
    Object.keys(byDay).forEach(function (d) {
      if (p.days > 1) h += "<h3>" + KY.t("दिन " + d, "Day " + d) + "</h3>";
      h += '<ol class="timeline">' + byDay[d].map(function (s, i) {
        var optional = easy && i >= 2;
        return '<li class="' + (optional ? "optional" : "") + '"><span class="when">' + KY.t(s.t_hi, s.t_en) + (optional ? " · " + KY.t("वैकल्पिक", "optional") : "") + "</span><br>" + KY.t(s.hi, s.en) + "</li>";
      }).join("") + "</ol>";
    });
    if (easy) {
      h += '<div class="card"><h3>' + KY.t("बच्चों और बुजुर्गों के लिए आसान तरीका", "The easy way with children and elders") + "</h3><ul>" +
        "<li>" + KY.t("हर दिन सिर्फ दो मुख्य पड़ाव रखें, बाकी वैकल्पिक हैं।", "Keep just two main stops a day; the rest are optional.") + "</li>" +
        "<li>" + KY.t("सुबह की कड़ाके की ठंड में सूर्योदय के बाद स्नान कराएँ।", "In the bitter morning cold, bathe after sunrise.") + "</li>" +
        "<li>" + KY.t("लंबी दूरी के लिए रिक्शा या शटल की योजना रखें और वापसी का समय खुला रखें।", "Plan a rickshaw or shuttle for long stretches and keep your return time flexible.") + "</li>" +
        "<li>" + KY.t("पहले दिन आराम से पहुँचें और ठहरने की जगह तय रखें।", "Arrive a day early, settle into your stay, and keep it booked in advance.") + "</li></ul></div>";
    }
    return h + "</section>";
  }

  function reachSection(p) {
    var r = D.routes.filter(function (x) { return x.city_key === p.city; })[0] || D.routes[D.routes.length - 1];
    var h = "<section><h2>" + KY.t("3. कैसे पहुँचें", "3. How to reach") + " (" + KY.esc(KY.txt(r, "city")) + ")</h2><p>" + KY.bi(r, "summary") + "</p>";
    h += '<div class="grid c3">' + (r.modes || []).map(function (m) {
      var n = MODE_NAME[m.mode] || ["", ""];
      return '<div class="card"><h3>' + (MODE_ICON[m.mode] || "") + " " + KY.t(n[0], n[1]) + "</h3><p class=\"small\">" + KY.t(m.hi, m.en) + "</p></div>";
    }).join("") + "</div>";
    h += '<p class="small muted">' + KY.t("मेला क्षेत्र के पास वाहन रोके जाते हैं। आधिकारिक पार्किंग/शटल नोटिस यात्रा से पहले देखें।", "Vehicles are stopped near the Mela area. Check the official parking and shuttle notice before you travel.") + "</p>";
    if (p.worst && KY.rank[p.worst] >= 2) h += '<p class="verdict v-high">' + KY.t("इन दिनों एक दिन पहले पहुँचें और वापसी का टिकट पहले ही पक्का रखें।", "On these days arrive a day early and keep your return ticket confirmed.") + "</p>";
    return h + "</section>";
  }

  function stayHtml(offers, p) {
    var h = "<section id=\"stay-sec\"><h2>" + KY.t("4. ठहरने के विकल्प", "4. Stay options") + "</h2>";
    if (!offers.length) {
      return h + '<div class="card"><p>' + KY.t("सत्यापित ठहरने की सूची मेले से पहले जोड़ी जा रही है। तब तक अपने ठहरने की बुकिंग पहले करें और सीधे रेट पूछें।", "Verified stay listings are being added before the Mela. Until then book your stay early and ask for the rate directly.") + "</p><a class=\"btn small noprint\" href=\"services.html\">" + KY.t("सेवाएँ देखें", "See services") + "</a></div></section>";
    }
    h += '<div class="stack">' + offers.map(function (o) {
      var b = o.businesses || {};
      var price = "₹" + o.price_min + (o.price_max && o.price_max !== o.price_min ? "–" + o.price_max : "");
      var txt = KY.pick("नमस्ते, मैं कुंभयात्रा से आपका नंबर ले रहा/रही हूँ। माघ मेला के लिए " + (p.adults + p.kids + p.elders) + " लोगों के लिए '" + o.title + "' उपलब्ध है?",
        "Hello, I found you on Kumbhayatra. Is '" + o.title + "' available for " + (p.adults + p.kids + p.elders) + " people during Magh Mela?");
      return '<div class="card"><h3>' + KY.esc(b.name || "") + '</h3><p class="muted small">' + KY.esc(b.area || "") + "</p><p>" + KY.esc(o.title) + ' · <span class="price">' + price + " " + KY.t((UNIT[o.price_unit] || [o.price_unit, o.price_unit])[0], (UNIT[o.price_unit] || [o.price_unit, o.price_unit])[1]) + "</span>" + (o.capacity ? " · " + o.capacity + " " + KY.t("लोग", "people") : "") + "</p>" +
        (b.whatsapp ? '<a class="btn small noprint" data-lead="' + KY.esc(o.business_id) + '" data-offer="' + KY.esc(o.id) + '" target="_blank" rel="noopener" href="' + KY.esc(KY.waLink(b.whatsapp, txt)) + '">WhatsApp</a>' : "") + "</div>";
    }).join("") + "</div>";
    return h + "</section>";
  }

  function packSection(p) {
    var cats = ["winter", "bath", "documents", "money", "phone"];
    if (p.kids > 0) cats.push("kids");
    if (p.elders > 0) cats.push("elders");
    var items = D.chk.filter(function (c) { return cats.indexOf(c.category) >= 0; });
    return "<section><h2>" + KY.t("5. साथ क्या ले जाएँ", "5. What to pack") + "</h2><ul class=\"checklist\">" + items.map(function (c) { return "<li>☐ " + KY.bi(c, "item") + "</li>"; }).join("") + "</ul><p class=\"noprint\"><a href=\"checklist.html\">" + KY.t("पूरी सूची", "Full checklist") + "</a></p></section>";
  }

  function shareText(p) {
    var city = (D.routes.filter(function (x) { return x.city_key === p.city; })[0]) || {};
    var it = D.its.filter(function (x) { return x.days === p.days; })[0] || D.its[0];
    var L = [KY.pick("*कुंभयात्रा: माघ मेला योजना*", "*Kumbhayatra: Magh Mela plan*"),
      KY.pick("शहर: ", "From: ") + (KY.txt(city, "city") || ""),
      KY.pick("लोग: ", "Group: ") + (p.adults + p.kids + p.elders) + " (" + KY.pick("बच्चे ", "kids ") + p.kids + ", " + KY.pick("बुजुर्ग ", "elders ") + p.elders + ")",
      KY.pick("दिन: ", "Days: ") + p.days + (p.date ? " | " + KY.dateText(p.date, KY.lang()) : ""),
      p.worst ? KY.pick("भीड़: ", "Crowd: ") + KY.crowdLabel(p.worst) : "",
      KY.pick("दर्शन-क्रम: ", "Plan: ") + KY.txt(it, "title")];
    (it.stops || []).forEach(function (s) { L.push("- " + KY.pick(s.hi, s.en)); });
    L.push((KY.config.SITE_URL || "") + "/plan.html");
    return L.filter(Boolean).join("\n");
  }

  function build(p) {
    P = p;
    var types = STAY_TYPES[p.stay] || STAY_TYPES.any;
    var offersP = KY.sb
      ? KY.sb.from("offers").select("*, businesses(name,area,whatsapp,phone,category)").in("type", types).eq("available", true).order("price_min").limit(6)
          .then(function (r) { return r.error ? [] : r.data || []; }, function () { return []; })
      : Promise.resolve([]);
    var crowd = crowdSection(p);
    var head = '<div class="printonly"><h2>कुंभयात्रा · Kumbhayatra</h2><p>' + KY.esc(shareText(p).split("\n").slice(1, 5).join(" | ")) + "</p></div>";
    offersP.then(function (offers) {
      res.innerHTML = head + crowd + itinerarySection(p) + reachSection(p) + stayHtml(offers, p) + packSection(p) +
        '<div class="cta-row noprint"><a class="btn" id="wa-share" target="_blank" rel="noopener" href="' + KY.esc("https://wa.me/?text=" + encodeURIComponent(shareText(p))) + '">' + KY.t("WhatsApp पर भेजें", "Send on WhatsApp") + '</a><button class="btn ghost" id="pl-print" type="button">' + KY.t("प्रिंट / PDF", "Print / PDF") + "</button></div>";
      res.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (KY.sb) {
      KY.sb.from("trip_requests").insert({ city: p.city, adults: p.adults, kids: p.kids, elders: p.elders, days: p.days, arrive_on: p.date || null, stay_pref: p.stay, lang: KY.lang() }).then(function () {}, function () {});
    }
  }

  function submit(e) {
    if (e) e.preventDefault();
    msg.innerHTML = "";
    var p = {
      city: KY.$("#p-city").value, days: int("#p-days", 1, 3, 2), adults: int("#p-adults", 0, 30, 2),
      kids: int("#p-kids", 0, 30, 0), elders: int("#p-elders", 0, 30, 0), stay: KY.$("#p-stay").value, date: KY.$("#p-date").value || ""
    };
    if (p.adults + p.elders < 1) { KY.say(msg, "err", "कृपया कम से कम एक वयस्क या बुजुर्ग जोड़ें।", "Please add at least one adult or elder."); return; }
    if (p.date && (KY.dayNum(p.date) < KY.dayNum(D.ev.starts_on) || KY.dayNum(p.date) > KY.dayNum(D.ev.ends_on))) {
      KY.say(msg, "err", "कृपया मेले की अवधि के भीतर की तारीख चुनें।", "Please pick a date within the Mela period."); return;
    }
    build(p);
  }

  res.addEventListener("click", function (e) {
    var t = e.target.closest("button,a");
    if (!t) return;
    if (t.hasAttribute("data-date")) { KY.$("#p-date").value = t.getAttribute("data-date"); submit(); }
    else if (t.id === "pl-print") window.print();
    else if (t.hasAttribute("data-lead")) KY.recordLead(t.getAttribute("data-lead"), t.getAttribute("data-offer"), "whatsapp");
  });
  form.addEventListener("submit", submit);
  document.addEventListener("ky:lang", function () { if (D.routes) { fillCities(); fillDateHint(); if (P) build(P); } });

  Promise.all([KY.get("events"), KY.get("snan_dates"), KY.get("itineraries"), KY.get("routes"), KY.get("checklists")]).then(function (r) {
    D.ev = r[0].rows[0]; D.snan = r[1].rows; D.its = r[2].rows; D.routes = r[3].rows; D.chk = r[4].rows;
    fillCities(); fillDateHint();
  });
});
