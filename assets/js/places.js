KY.ready(function () {
  var D = {}, filter = "all";
  var TYPES = [
    ["all", "सभी", "All"], ["ghat", "घाट", "Ghats"], ["temple", "मंदिर", "Temples"], ["heritage", "इतिहास", "Heritage"],
    ["medical", "चिकित्सा", "Medical"], ["facility", "सुविधाएँ", "Facilities"], ["parking", "पार्किंग", "Parking"], ["market", "बाजार", "Markets"]
  ];
  var chips = KY.$("#p-chips"), list = KY.$("#p-list");
  function render() {
    var present = {};
    D.places.forEach(function (p) { present[p.type] = 1; });
    chips.innerHTML = TYPES.filter(function (t) { return t[0] === "all" || present[t[0]]; }).map(function (t) {
      return '<button class="chip" type="button" data-t="' + t[0] + '" aria-pressed="' + (filter === t[0]) + '">' + KY.t(t[1], t[2]) + "</button>";
    }).join("");
    list.innerHTML = D.places.filter(function (p) { return filter === "all" || p.type === filter; }).map(function (p) {
      var map = (p.lat && p.lng)
        ? "https://www.google.com/maps/search/?api=1&query=" + p.lat + "," + p.lng
        : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((p.name_en || "") + " Prayagraj");
      return '<div class="card"><h3>' + KY.bi(p, "name") + '</h3><p class="muted small">' + KY.esc(p.area || "") + (p.timings ? " · " + KY.esc(p.timings) : "") + "</p><p>" + KY.bi(p, "desc") +
        '</p><a class="btn ghost small" target="_blank" rel="noopener" href="' + KY.esc(map) + '">' + KY.t("नक्शे में देखें", "Open in maps") + "</a></div>";
    }).join("");
  }
  chips.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-t]");
    if (b) { filter = b.getAttribute("data-t"); render(); }
  });
  document.addEventListener("ky:lang", function () { if (D.places) render(); });
  KY.get("places").then(function (r) {
    D.places = r.rows.filter(function (p) { return p.is_published !== false; });
    render();
  });
});
