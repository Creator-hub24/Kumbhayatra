KY.ready(function () {
  var D = {}, cur = null;
  var tabs = KY.$("#it-tabs"), body = KY.$("#it-body");

  function placeName(slug) {
    var p = (D.places || []).filter(function (x) { return x.slug === slug; })[0];
    return p ? p : null;
  }
  function render() {
    if (!D.its) return;
    tabs.innerHTML = D.its.map(function (it) {
      return '<button class="tab" role="tab" type="button" data-slug="' + KY.esc(it.slug) + '" aria-selected="' + (it.slug === cur ? "true" : "false") + '">' + KY.bi(it, "title") + "</button>";
    }).join("");
    var it = D.its.filter(function (x) { return x.slug === cur; })[0] || D.its[0];
    var byDay = {};
    (it.stops || []).forEach(function (s) { var d = s.day || 1; (byDay[d] = byDay[d] || []).push(s); });
    var h = "<p>" + KY.bi(it, "summary") + "</p>";
    Object.keys(byDay).forEach(function (d) {
      if (it.days > 1) h += "<h3>" + KY.t("दिन " + d, "Day " + d) + "</h3>";
      h += '<ol class="timeline">' + byDay[d].map(function (s) {
        var pl = s.place ? placeName(s.place) : null;
        var link = pl ? ' <a class="small" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((pl.name_en || "") + " Prayagraj") + '">' + KY.t("नक्शा", "map") + "</a>" : "";
        return '<li><span class="when">' + KY.t(s.t_hi, s.t_en) + "</span><br>" + KY.t(s.hi, s.en) + link + "</li>";
      }).join("") + "</ol>";
    });
    body.innerHTML = h;
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-slug]");
    if (b) { cur = b.getAttribute("data-slug"); render(); }
  });
  document.addEventListener("ky:lang", render);

  Promise.all([KY.get("itineraries"), KY.get("places"), KY.seed()]).then(function (r) {
    D.its = r[0].rows; D.places = r[1].rows;
    cur = (D.its[1] || D.its[0] || {}).slug;
    render();
    KY.$("#addons").innerHTML = (r[2].addons || []).map(function (a) { return "<li>" + KY.t(a.hi, a.en) + "</li>"; }).join("");
  });
});
