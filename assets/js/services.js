KY.ready(function () {
  var CATS = [["stay", "ठहरना", "Stay"], ["boat", "नाव", "Boat"], ["driver", "टैक्सी / टेम्पो", "Taxi / tempo"]];
  var UNIT = { "per night": ["प्रति रात", "per night"], "per ride": ["प्रति सवारी", "per ride"], "per trip": ["प्रति यात्रा", "per trip"], "per day": ["प्रति दिन", "per day"], "per person": ["प्रति व्यक्ति", "per person"] };
  var TYPE = { room: ["कमरा", "Room"], tent: ["टेंट", "Tent"], dormitory: ["डॉर्मिटरी", "Dormitory"], boat_ride: ["नाव सवारी", "Boat ride"], taxi: ["टैक्सी", "Taxi"], tempo: ["टेम्पो", "Tempo"] };
  var cat = (location.hash || "#stay").slice(1), rows = [], rating = {};
  if (!CATS.some(function (c) { return c[0] === cat; })) cat = "stay";
  var tabs = KY.$("#s-tabs"), list = KY.$("#s-list"), area = KY.$("#s-area"), cap = KY.$("#s-cap");

  function money(o) {
    var u = UNIT[o.price_unit] || [o.price_unit, o.price_unit];
    return "₹" + o.price_min + (o.price_max && o.price_max !== o.price_min ? "–" + o.price_max : "") + " " + KY.t(u[0], u[1]);
  }
  function renderTabs() {
    tabs.innerHTML = CATS.map(function (c) {
      return '<button class="tab" role="tab" type="button" data-c="' + c[0] + '" aria-selected="' + (c[0] === cat) + '">' + KY.t(c[1], c[2]) + "</button>";
    }).join("");
    KY.$("#s-cap-wrap").hidden = cat !== "stay";
  }
  function starsHtml(id) {
    var r = rating[id];
    if (!r) return "";
    var avg = r.sum / r.n;
    return '<span class="stars" aria-label="' + avg.toFixed(1) + ' / 5">★ ' + avg.toFixed(1) + "</span> <span class=\"muted small\">(" + r.n + ")</span>";
  }
  function render() {
    renderTabs();
    var a = area.value, c = parseInt(cap.value, 10) || 0;
    var shown = rows.filter(function (b) {
      if (a && b.area !== a) return false;
      if (cat === "stay" && c) return (b.offers || []).some(function (o) { return o.available && (o.capacity == null || o.capacity >= c); });
      return true;
    });
    shown.sort(function (x, y) { return minPrice(x) - minPrice(y); });
    if (!shown.length) {
      list.innerHTML = '<div class="card"><p>' + (KY.sb
        ? KY.t("इस श्रेणी में अभी कोई सत्यापित व्यवसाय नहीं है। मेले से पहले जाँचे हुए विकल्प जोड़े जा रहे हैं।", "No verified businesses in this category yet. Checked options are being added before the Mela.")
        : KY.t("यह सेवा जल्द शुरू हो रही है।", "This service is starting soon.")) + "</p></div>";
      return;
    }
    list.innerHTML = shown.map(card).join("");
  }
  function minPrice(b) {
    var m = (b.offers || []).filter(function (o) { return o.available; }).map(function (o) { return o.price_min; });
    return m.length ? Math.min.apply(null, m) : 1e9;
  }
  function card(b) {
    var offers = (b.offers || []).filter(function (o) { return o.available; });
    var enq = KY.pick("नमस्ते, मैंने आपको कुंभयात्रा पर देखा। माघ मेला के लिए जानकारी चाहिए।", "Hello, I found you on Kumbhayatra. I would like details for Magh Mela.");
    return '<article class="card"><h3>' + KY.esc(b.name) + ' <span class="badge b-ok">✓ ' + KY.t("सत्यापित", "Verified") + "</span></h3>" +
      '<p class="muted small">' + KY.esc(b.area || "") + " " + starsHtml(b.id) + "</p>" +
      (b.description ? "<p>" + KY.esc(b.description) + "</p>" : "") +
      offers.map(function (o) {
        var t = TYPE[o.type] || [o.type, o.type];
        return '<div class="offer"><strong>' + KY.esc(o.title) + "</strong> · " + KY.t(t[0], t[1]) + '<br><span class="price">' + money(o) + "</span>" + (o.capacity ? " · " + o.capacity + " " + KY.t("लोग", "people") : "") +
          (o.details ? '<br><span class="small muted">' + KY.esc(o.details) + "</span>" : "") +
          (b.whatsapp ? '<br><a class="btn small" target="_blank" rel="noopener" data-lead="' + KY.esc(b.id) + '" data-offer="' + KY.esc(o.id) + '" href="' + KY.esc(KY.waLink(b.whatsapp, enq + " (" + o.title + ")")) + '">' + KY.t("WhatsApp पर पूछें", "Ask on WhatsApp") + "</a>" : "") + "</div>";
      }).join("") +
      '<div class="row">' + (!offers.length && b.whatsapp ? '<a class="btn small" target="_blank" rel="noopener" data-lead="' + KY.esc(b.id) + '" href="' + KY.esc(KY.waLink(b.whatsapp, enq)) + '">' + KY.t("WhatsApp पर पूछें", "Ask on WhatsApp") + "</a>" : "") +
      (b.phone ? '<a class="btn ghost small" data-call="' + KY.esc(b.id) + '" href="tel:' + KY.esc(b.phone.replace(/[^0-9+]/g, "")) + '">' + KY.t("फोन करें", "Call") + "</a>" : "") +
      '<a class="small" href="safety.html?biz=' + KY.esc(b.id) + '#report-form">' + KY.t("शिकायत करें", "Report") + "</a></div>" +
      '<details class="noprint"><summary>' + KY.t("समीक्षा लिखें", "Write a review") + '</summary><form data-review="' + KY.esc(b.id) + '" novalidate>' +
      '<label>' + KY.t("रेटिंग", "Rating") + '<select name="rating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>' +
      '<label>' + KY.t("आपका नाम (वैकल्पिक)", "Your name (optional)") + '<input name="name" maxlength="40" autocomplete="off"></label>' +
      '<label>' + KY.t("अनुभव", "Your experience") + '<textarea name="comment" maxlength="500"></textarea></label>' +
      '<button class="btn small" type="submit">' + KY.t("भेजें", "Submit") + '</button><div class="rv-msg"></div></form></details></article>';
  }

  function load() {
    if (!KY.sb) { rows = []; render(); return; }
    Promise.all([
      KY.sb.from("businesses").select("*, offers(*)").eq("category", cat).eq("status", "verified").eq("season_active", true),
      KY.sb.from("reviews").select("business_id,rating,approved")
    ]).then(function (r) {
      rows = r[0].error ? [] : r[0].data || [];
      rating = {};
      (r[1].error ? [] : r[1].data || []).forEach(function (x) {
        if (x.approved === false) return;
        var o = (rating[x.business_id] = rating[x.business_id] || { sum: 0, n: 0 });
        o.sum += x.rating; o.n++;
      });
      var areas = {};
      rows.forEach(function (b) { if (b.area) areas[b.area] = 1; });
      area.innerHTML = '<option value="">' + KY.t("सभी", "All").replace(/<[^>]+>/g, "") + "</option>";
      area.innerHTML = '<option value="">' + KY.pick("सभी", "All") + "</option>" + Object.keys(areas).sort().map(function (a) { return '<option value="' + KY.esc(a) + '">' + KY.esc(a) + "</option>"; }).join("");
      render();
    }, function () { rows = []; render(); });
  }

  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-c]");
    if (b) { cat = b.getAttribute("data-c"); history.replaceState(null, "", "#" + cat); load(); }
  });
  area.addEventListener("change", render);
  cap.addEventListener("input", render);
  list.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-lead],a[data-call]");
    if (!a) return;
    if (a.hasAttribute("data-lead")) KY.recordLead(a.getAttribute("data-lead"), a.getAttribute("data-offer"), "whatsapp");
    else KY.recordLead(a.getAttribute("data-call"), null, "call");
  });
  list.addEventListener("submit", function (e) {
    var f = e.target.closest("form[data-review]");
    if (!f) return;
    e.preventDefault();
    var m = KY.$(".rv-msg", f), comment = f.elements.comment.value.trim();
    if (comment.length < 5) { KY.say(m, "err", "कृपया अपना अनुभव थोड़ा लिखें।", "Please write a little about your experience."); return; }
    KY.sb.from("reviews").insert({ business_id: f.getAttribute("data-review"), rating: parseInt(f.elements.rating.value, 10), comment: comment, author_name: f.elements.name.value.trim() || null }).then(function (r) {
      if (r.error) KY.say(m, "err", "भेजा नहीं जा सका। कृपया बाद में कोशिश करें।", "Could not send. Please try again later.");
      else { KY.say(m, "ok", "धन्यवाद। जाँच के बाद समीक्षा दिखेगी।", "Thank you. Your review will appear after a check."); f.reset(); }
    });
  });
  document.addEventListener("ky:lang", function () { if (area.options.length) { var v = area.value; render(); area.value = v; } });
  load();
});
