KY.ready(function () {
  var D = {};
  var sel = KY.$("#r-city"), body = KY.$("#r-body");
  var ICON = { train: "🚆", flight: "✈️", road: "🚗" };
  var NAME = { train: ["ट्रेन", "Train"], flight: ["फ्लाइट", "Flight"], road: ["सड़क", "Road"] };

  function fill() {
    var keep = sel.value || new URLSearchParams(location.search).get("city") || "";
    sel.innerHTML = D.routes.map(function (r) { return '<option value="' + KY.esc(r.city_key) + '">' + KY.esc(KY.txt(r, "city")) + "</option>"; }).join("");
    if (keep) sel.value = keep;
  }
  function render() {
    var r = D.routes.filter(function (x) { return x.city_key === sel.value; })[0] || D.routes[0];
    if (!r) return;
    body.innerHTML = "<p>" + KY.bi(r, "summary") + '</p><div class="grid c3">' + (r.modes || []).map(function (m) {
      var n = NAME[m.mode] || ["", ""];
      return '<div class="card"><h3>' + (ICON[m.mode] || "") + " " + KY.t(n[0], n[1]) + "</h3><p>" + KY.t(m.hi, m.en) + "</p></div>";
    }).join("") + "</div>";
    KY.$("#stations").innerHTML = D.st ? KY.t("प्रयागराज के स्टेशन: " + D.st.hi, "Prayagraj stations: " + D.st.en) : "";
  }
  sel.addEventListener("change", render);
  document.addEventListener("ky:lang", function () { if (D.routes) { fill(); render(); } });
  Promise.all([KY.get("routes"), KY.seed()]).then(function (r) {
    D.routes = r[0].rows; D.st = r[1].stations;
    fill(); render();
  });
});
