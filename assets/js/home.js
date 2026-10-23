KY.ready(function () {
  var box = KY.$("#next");
  if (!box) return;
  function render(ev, snan) {
    var tn = KY.dayNum(KY.todayStr());
    snan = snan.slice().sort(function (a, b) { return KY.dayNum(a.snan_on) - KY.dayNum(b.snan_on); });
    var head = "";
    if (ev) {
      var s = KY.dayNum(ev.starts_on), e = KY.dayNum(ev.ends_on);
      if (tn < s) {
        var n = s - tn;
        head = "<h2>" + KY.t("मेला शुरू होने में " + n + " दिन", n + " days until the Mela begins") + "</h2><p class=\"muted\">" +
          KY.bi(ev, "name") + " · " + KY.dateHtml(ev.starts_on) + " – " + KY.dateHtml(ev.ends_on) + "</p>";
      } else if (tn <= e) {
        head = "<h2>" + KY.t("मेला चल रहा है", "The Mela is on") + "</h2><p class=\"muted\">" + KY.bi(ev, "name") + "</p>";
      } else {
        head = "<h2>" + KY.t("इस वर्ष का मेला समाप्त हो चुका है", "This year's Mela has ended") + "</h2>";
      }
    }
    var up = snan.filter(function (s) { return KY.dayNum(s.snan_on) >= tn; }).slice(0, 3);
    var list = up.length ? '<div class="grid c3">' + up.map(function (s) {
      return '<div class="card"><p class="muted small">' + KY.dateHtml(s.snan_on, true) + "</p><h3>" + KY.bi(s, "name") + "</h3><p>" + KY.badge(s.crowd) + "</p><p class=\"small\">" + KY.bi(s, "tip") + "</p></div>";
    }).join("") + "</div>" : "";
    box.innerHTML = head + list + (ev && ev.note_hi ? '<p class="hint">' + KY.bi(ev, "note") + "</p>" : "");
  }
  Promise.all([KY.get("events"), KY.get("snan_dates")]).then(function (r) {
    render(r[0].rows[0], r[1].rows);
  });
});
