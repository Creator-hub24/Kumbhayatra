KY.ready(function () {
  var app = KY.$("#b-app");
  if (!KY.sb) { KY.notConfigured(app); return; }
  var uid = null, biz = null, editing = null, leadCount = 0, flash = "";

  var OFFER_TYPES = { stay: ["room", "tent", "dormitory"], boat: ["boat_ride"], driver: ["taxi", "tempo"] };
  var TYPE_LABEL = { room: ["कमरा", "Room"], tent: ["टेंट", "Tent"], dormitory: ["डॉर्मिटरी", "Dormitory"], boat_ride: ["नाव सवारी", "Boat ride"], taxi: ["टैक्सी", "Taxi"], tempo: ["टेम्पो", "Tempo"] };
  var UNIT_LABEL = { "per night": ["प्रति रात", "per night"], "per ride": ["प्रति सवारी", "per ride"], "per trip": ["प्रति यात्रा", "per trip"], "per day": ["प्रति दिन", "per day"], "per person": ["प्रति व्यक्ति", "per person"] };
  var DEFAULT_UNIT = { stay: "per night", boat: "per ride", driver: "per trip" };
  var CAT_LABEL = { stay: ["ठहरना (होटल/धर्मशाला/टेंट)", "Stay (hotel / dharamshala / tent)"], boat: ["नाव", "Boat"], driver: ["टैक्सी / टेम्पो", "Taxi / tempo"] };

  function opt(v, sel, label) { return '<option value="' + KY.esc(v) + '"' + (v === sel ? " selected" : "") + ">" + label + "</option>"; }

  function bizForm(b) {
    b = b || { category: "stay", season_active: true };
    var creating = !b.id;
    return '<form class="card" id="biz-form" novalidate><h2>' + (creating ? KY.t("अपना व्यवसाय जोड़ें", "Add your business") : KY.t("व्यवसाय की जानकारी", "Business details")) + "</h2>" +
      '<label for="b-cat">' + KY.t("श्रेणी", "Category") + "</label><select id=\"b-cat\"" + (creating ? "" : " disabled") + ">" +
      Object.keys(CAT_LABEL).map(function (k) { return opt(k, b.category, KY.t(CAT_LABEL[k][0], CAT_LABEL[k][1])); }).join("") + "</select>" +
      '<div class="fgrid"><div><label for="b-name">' + KY.t("नाम", "Name") + '</label><input id="b-name" maxlength="80" value="' + KY.esc(b.name || "") + '"></div>' +
      '<div><label for="b-area">' + KY.t("इलाका (जैसे सिविल लाइंस, झूंसी)", "Area (e.g. Civil Lines, Jhunsi)") + '</label><input id="b-area" maxlength="80" value="' + KY.esc(b.area || "") + '"></div>' +
      '<div><label for="b-phone">' + KY.t("फोन नंबर", "Phone number") + '</label><input id="b-phone" inputmode="tel" maxlength="16" value="' + KY.esc(b.phone || "") + '"></div>' +
      '<div><label for="b-wa">WhatsApp</label><input id="b-wa" inputmode="numeric" maxlength="13" value="' + KY.esc(b.whatsapp || "") + '"><p class="hint">' + KY.t("सिर्फ अंक, 10 अंकों का नंबर (91 अपने आप जुड़ेगा)।", "Digits only, a 10-digit number (91 is added automatically).") + "</p></div></div>" +
      '<label for="b-desc">' + KY.t("छोटा विवरण (अधिकतम 600 अक्षर)", "Short description (max 600 characters)") + '</label><textarea id="b-desc" maxlength="600">' + KY.esc(b.description || "") + "</textarea>" +
      (creating ? "" : '<label class="opt"><input type="checkbox" id="b-season"' + (b.season_active ? " checked" : "") + "> " + KY.t("इस मौसम में सूची दिखाएँ", "Show my listing this season") + "</label>") +
      '<div class="cta-row"><button class="btn" type="submit">' + (creating ? KY.t("जमा करें", "Submit") : KY.t("सहेजें", "Save")) + '</button></div><div id="b-msg"></div></form>';
  }

  function statusBanner(b) {
    if (b.status === "verified") return '<div class="msg ok">' + KY.t("✓ सत्यापित। आपकी सूची दिख रही है" + (b.season_active ? "।" : " (अभी छिपी है, ऊपर 'सूची दिखाएँ' चुनें)।"), "✓ Verified. Your listing is live" + (b.season_active ? "." : " (currently hidden; tick 'Show my listing' below).")) + "</div>";
    if (b.status === "suspended") return '<div class="msg err">' + KY.t("आपकी सूची निलंबित है। कृपया हमसे संपर्क करें।", "Your listing is suspended. Please contact us.") + "</div>";
    return '<div class="msg">' + KY.t("जाँच जारी है। सत्यापन के बाद ही सूची सबको दिखेगी। हम आपके फोन पर संपर्क कर सकते हैं।", "Under review. Your listing becomes public only after verification. We may call you.") + "</div>";
  }

  function offerForm(o) {
    o = o || {};
    var types = OFFER_TYPES[biz.category];
    return '<form class="card" id="offer-form" novalidate><h3>' + (o.id ? KY.t("रेट बदलें", "Edit rate") : KY.t("नया रेट / विकल्प जोड़ें", "Add a rate or option")) + "</h3>" +
      '<div class="fgrid"><div><label for="o-type">' + KY.t("प्रकार", "Type") + "</label><select id=\"o-type\">" + types.map(function (t) { return opt(t, o.type || types[0], KY.t(TYPE_LABEL[t][0], TYPE_LABEL[t][1])); }).join("") + "</select></div>" +
      '<div><label for="o-title">' + KY.t("शीर्षक (जैसे 'AC कमरा, 4 लोग')", "Title (e.g. 'AC room, 4 people')") + '</label><input id="o-title" maxlength="80" value="' + KY.esc(o.title || "") + '"></div>' +
      '<div><label for="o-min">' + KY.t("न्यूनतम कीमत (₹)", "Minimum price (₹)") + '</label><input id="o-min" type="number" inputmode="numeric" min="0" value="' + KY.esc(o.price_min != null ? o.price_min : "") + '"></div>' +
      '<div><label for="o-max">' + KY.t("अधिकतम कीमत (₹, वैकल्पिक)", "Maximum price (₹, optional)") + '</label><input id="o-max" type="number" inputmode="numeric" min="0" value="' + KY.esc(o.price_max != null ? o.price_max : "") + '"></div>' +
      '<div><label for="o-unit">' + KY.t("इकाई", "Per") + "</label><select id=\"o-unit\">" + Object.keys(UNIT_LABEL).map(function (u) { return opt(u, o.price_unit || DEFAULT_UNIT[biz.category], KY.t(UNIT_LABEL[u][0], UNIT_LABEL[u][1])); }).join("") + "</select></div>" +
      '<div><label for="o-cap">' + KY.t("कितने लोग", "Capacity (people)") + '</label><input id="o-cap" type="number" inputmode="numeric" min="1" max="200" value="' + KY.esc(o.capacity != null ? o.capacity : "") + '"></div></div>' +
      '<label for="o-det">' + KY.t("विवरण (वैकल्पिक)", "Details (optional)") + '</label><textarea id="o-det" maxlength="400">' + KY.esc(o.details || "") + "</textarea>" +
      '<div class="cta-row"><button class="btn" type="submit">' + (o.id ? KY.t("अपडेट करें", "Update") : KY.t("जोड़ें", "Add")) + "</button>" +
      (o.id ? '<button class="btn ghost" type="button" data-act="cancel-edit">' + KY.t("रद्द करें", "Cancel") + "</button>" : "") + '</div><div id="o-msg"></div></form>';
  }

  function render() {
    var h = '<div class="row noprint"><button class="btn ghost small" type="button" data-act="logout">' + KY.t("लॉग आउट", "Log out") + "</button></div>" + flash;
    flash = "";
    if (!biz) { app.innerHTML = h + bizForm(null); return; }
    h += statusBanner(biz) + '<div class="grid c3"><div class="card"><p class="muted small">' + KY.t("कुल पूछताछ", "Total enquiries") + '</p><p class="price big">' + leadCount + "</p></div></div>";
    h += bizForm(biz) + "<h2>" + KY.t("आपके रेट और विकल्प", "Your rates and options") + "</h2>";
    var offers = (biz.offers || []).slice().sort(function (a, b) { return a.price_min - b.price_min; });
    h += offers.length ? '<div class="stack">' + offers.map(function (o) {
      var t = TYPE_LABEL[o.type] || [o.type, o.type], u = UNIT_LABEL[o.price_unit] || [o.price_unit, o.price_unit];
      return '<div class="card"><strong>' + KY.esc(o.title) + "</strong> · " + KY.t(t[0], t[1]) + '<br><span class="price">₹' + o.price_min + (o.price_max && o.price_max !== o.price_min ? "–" + o.price_max : "") + " " + KY.t(u[0], u[1]) + "</span>" +
        (o.capacity ? " · " + o.capacity : "") + ' · <span class="badge ' + (o.available ? "b-ok" : "b-pending") + '">' + (o.available ? KY.t("उपलब्ध", "Available") : KY.t("उपलब्ध नहीं", "Unavailable")) + "</span>" +
        '<div class="row"><button class="btn ghost small" type="button" data-act="edit" data-id="' + KY.esc(o.id) + '">' + KY.t("बदलें", "Edit") + "</button>" +
        '<button class="btn ghost small" type="button" data-act="toggle" data-id="' + KY.esc(o.id) + '">' + (o.available ? KY.t("अनुपलब्ध करें", "Mark unavailable") : KY.t("उपलब्ध करें", "Mark available")) + "</button>" +
        '<button class="btn ghost small" type="button" data-act="del" data-id="' + KY.esc(o.id) + '">' + KY.t("हटाएँ", "Delete") + "</button></div></div>";
    }).join("") + "</div>" : "<p class=\"muted\">" + KY.t("अभी कोई रेट नहीं जोड़ा।", "No rates added yet.") + "</p>";
    var eo = editing ? offers.filter(function (o) { return o.id === editing; })[0] : null;
    h += offerForm(eo);
    app.innerHTML = h;
  }

  function load() {
    KY.sb.from("businesses").select("*, offers(*)").eq("owner_id", uid).order("created_at").then(function (r) {
      if (r.error) { KY.say(app, "err", "डेटा लोड नहीं हुआ। कृपया पेज दोबारा खोलें।", "Could not load data. Please reload."); return; }
      biz = (r.data || [])[0] || null;
      if (!biz) { render(); return; }
      KY.sb.from("leads").select("id", { count: "exact", head: true }).eq("business_id", biz.id).then(function (c) {
        leadCount = c.count || 0; render();
      }, render);
    });
  }

  function note(id, kind, hi, en) { KY.say(KY.$(id), kind, hi, en); }

  app.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "biz-form") {
      var v = {
        name: KY.$("#b-name").value.trim(), area: KY.$("#b-area").value.trim() || null, phone: KY.$("#b-phone").value.trim() || null,
        whatsapp: KY.$("#b-wa").value.replace(/\D/g, "") || null, description: KY.$("#b-desc").value.trim() || null
      };
      if (v.name.length < 2) { note("#b-msg", "err", "कृपया नाम लिखें।", "Please enter a name."); return; }
      if (!v.phone && !v.whatsapp) { note("#b-msg", "err", "फोन या WhatsApp में से एक जरूर दें।", "Please give a phone or WhatsApp number."); return; }
      if (v.phone && !/^[0-9+ -]{8,16}$/.test(v.phone)) { note("#b-msg", "err", "फोन नंबर सही नहीं है।", "The phone number does not look right."); return; }
      if (v.whatsapp && !/^[0-9]{10,13}$/.test(v.whatsapp)) { note("#b-msg", "err", "WhatsApp नंबर 10 अंकों का होना चाहिए।", "WhatsApp must be a 10-digit number."); return; }
      var p;
      if (!biz) {
        v.category = KY.$("#b-cat").value; v.owner_id = uid;
        p = KY.sb.from("businesses").insert(v);
        flash = '<div class="msg ok">' + KY.t("जमा हो गया। हम जाँच के बाद आपसे संपर्क करेंगे।", "Submitted. We will contact you after checking.") + "</div>";
      } else {
        var changed = biz.status === "verified" && (v.name !== biz.name || (v.phone || null) !== (biz.phone || null) || (v.whatsapp || null) !== (biz.whatsapp || null));
        if (changed && !window.confirm(KY.pick("नाम या फोन बदलने पर सूची दोबारा जाँच में जाएगी। जारी रखें?", "Changing name or phone sends your listing back for re-check. Continue?"))) return;
        v.season_active = KY.$("#b-season").checked;
        p = KY.sb.from("businesses").update(v).eq("id", biz.id);
        flash = '<div class="msg ok">' + KY.t("सहेज लिया।", "Saved.") + "</div>";
      }
      p.then(function (r) {
        if (r.error) { flash = ""; note("#b-msg", "err", "सहेजा नहीं जा सका। कृपया जानकारी जाँचें।", "Could not save. Please check the details."); }
        else load();
      });
    } else if (e.target.id === "offer-form") {
      var o = {
        type: KY.$("#o-type").value, title: KY.$("#o-title").value.trim(), price_min: parseInt(KY.$("#o-min").value, 10),
        price_max: KY.$("#o-max").value === "" ? null : parseInt(KY.$("#o-max").value, 10), price_unit: KY.$("#o-unit").value,
        capacity: KY.$("#o-cap").value === "" ? null : parseInt(KY.$("#o-cap").value, 10), details: KY.$("#o-det").value.trim() || null
      };
      if (o.title.length < 2 || isNaN(o.price_min) || o.price_min < 0) { note("#o-msg", "err", "शीर्षक और न्यूनतम कीमत जरूरी हैं।", "Title and minimum price are required."); return; }
      if (o.price_max != null && o.price_max < o.price_min) { note("#o-msg", "err", "अधिकतम कीमत न्यूनतम से कम नहीं हो सकती।", "Maximum price cannot be below the minimum."); return; }
      var q = editing ? KY.sb.from("offers").update(o).eq("id", editing) : KY.sb.from("offers").insert(Object.assign({ business_id: biz.id }, o));
      q.then(function (r) {
        if (r.error) note("#o-msg", "err", "सहेजा नहीं जा सका।", "Could not save.");
        else { editing = null; load(); }
      });
    }
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act"), id = b.getAttribute("data-id");
    if (act === "logout") KY.auth.logout().then(function () { location.reload(); });
    else if (act === "edit") { editing = id; render(); KY.$("#offer-form").scrollIntoView({ behavior: "smooth" }); }
    else if (act === "cancel-edit") { editing = null; render(); }
    else if (act === "toggle") {
      var o = (biz.offers || []).filter(function (x) { return x.id === id; })[0];
      KY.sb.from("offers").update({ available: !o.available }).eq("id", id).then(load);
    } else if (act === "del") {
      if (window.confirm(KY.pick("यह रेट हटाएँ?", "Delete this rate?"))) KY.sb.from("offers").delete().eq("id", id).then(load);
    }
  });

  KY.auth.session().then(function (s) {
    if (!s) {
      KY.renderLogin(app);
      KY.auth.onChange(function (ev) { if (ev === "SIGNED_IN") location.reload(); });
      return;
    }
    uid = s.user.id;
    load();
  });
});
