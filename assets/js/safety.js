KY.ready(function () {
  var biz = new URLSearchParams(location.search).get("biz");
  if (biz && !/^[0-9a-fA-F-]{36}$/.test(biz)) biz = null;

  KY.seed().then(function (s) {
    KY.$("#scams").innerHTML = (s.scam_tips || []).map(function (t, i) {
      return '<div class="card"><h3>' + (i + 1) + ". " + KY.t(t.h_hi, t.h_en) + "</h3><p>" + KY.t(t.p_hi, t.p_en) + "</p></div>";
    }).join("");
  });

  function renderPrices(rows) {
    KY.$("#prices").innerHTML = rows.filter(function (r) { return r.is_published !== false; }).map(function (r) {
      var has = r.min_price != null || r.max_price != null;
      var price = has ? '<p class="price">₹' + (r.min_price != null ? r.min_price : "") + (r.max_price != null && r.max_price !== r.min_price ? "–" + r.max_price : "") + (r.unit_hi || r.unit_en ? " " + KY.bi(r, "unit") : "") + "</p>"
        : '<p class="muted">' + KY.t("रेट मेले से पहले अपडेट होंगे", "Rates will be updated before the Mela") + "</p>";
      return '<div class="card"><h3>' + KY.bi(r, "label") + "</h3>" + price + '<p class="small">' + KY.bi(r, "note") + "</p></div>";
    }).join("");
  }
  var priceRows = [];
  KY.get("price_guides").then(function (r) { priceRows = r.rows; renderPrices(priceRows); });
  document.addEventListener("ky:lang", function () { renderPrices(priceRows); });

  /* family safety card (kept on this device only) */
  var fam = KY.$("#fam-form"), card = KY.$("#fam-card");
  var FIELDS = ["name", "phone", "phone2", "stay", "meet"];
  function load() { try { return JSON.parse(localStorage.getItem("ky.fam") || "{}"); } catch (e) { return {}; } }
  function show(v) {
    var any = FIELDS.some(function (k) { return v[k]; });
    if (!any) { card.innerHTML = ""; return; }
    card.innerHTML = '<div class="card"><h3>' + KY.t("परिवार सुरक्षा कार्ड", "Family safety card") + "</h3><table><tbody>" +
      "<tr><th>" + KY.t("समूह प्रमुख", "Group leader") + "</th><td>" + KY.esc(v.name) + "</td></tr>" +
      "<tr><th>" + KY.t("फोन", "Phone") + "</th><td>" + KY.esc(v.phone) + (v.phone2 ? " / " + KY.esc(v.phone2) : "") + "</td></tr>" +
      "<tr><th>" + KY.t("ठहरने की जगह", "Staying at") + "</th><td>" + KY.esc(v.stay) + "</td></tr>" +
      "<tr><th>" + KY.t("मिलने की जगह", "Meeting spot") + "</th><td>" + KY.esc(v.meet) + "</td></tr>" +
      "<tr><th>112</th><td>" + KY.t("पुलिस / आपातकाल", "Police / emergency") + "</td></tr></tbody></table>" +
      '<p class="noprint"><button class="btn small" id="fam-print" type="button">' + KY.t("प्रिंट / PDF", "Print / PDF") + "</button></p></div>";
  }
  var saved = load();
  FIELDS.forEach(function (k) { var el = KY.$("#f-" + k); if (el && saved[k]) el.value = saved[k]; });
  show(saved);
  fam.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = {};
    FIELDS.forEach(function (k) { v[k] = KY.$("#f-" + k).value.trim().slice(0, 120); });
    try { localStorage.setItem("ky.fam", JSON.stringify(v)); } catch (err) {}
    show(v);
  });
  card.addEventListener("click", function (e) { if (e.target.id === "fam-print") window.print(); });

  /* report form */
  var rf = KY.$("#report-form"), rm = KY.$("#rp-msg");
  rf.addEventListener("submit", function (e) {
    e.preventDefault();
    var details = KY.$("#rp-details").value.trim();
    if (details.length < 10) { KY.say(rm, "err", "कृपया थोड़ा विस्तार से लिखें।", "Please add a little more detail."); return; }
    if (!KY.sb) { KY.say(rm, "err", "यह सुविधा अभी चालू नहीं है।", "This feature is not switched on yet."); return; }
    var row = { reason: KY.$("#rp-reason").value, details: details, contact: KY.$("#rp-contact").value.trim() || null };
    if (biz) row.business_id = biz;
    KY.sb.from("reports").insert(row).then(function (r) {
      if (r.error) KY.say(rm, "err", "भेजा नहीं जा सका। कृपया बाद में कोशिश करें।", "Could not send. Please try again later.");
      else { KY.say(rm, "ok", "धन्यवाद। हम इसकी जाँच करेंगे।", "Thank you. We will look into it."); rf.reset(); }
    });
  });
});
