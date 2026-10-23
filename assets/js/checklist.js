KY.ready(function () {
  var rows = [], done = {};
  var TITLES = {
    winter: ["❄️ सर्दी", "❄️ Cold weather"], bath: ["🌊 स्नान", "🌊 For the bath"], documents: ["📄 दस्तावेज", "📄 Documents"],
    kids: ["🧒 बच्चे", "🧒 Children"], elders: ["👵 बुजुर्ग", "👵 Elders"], money: ["💰 पैसे", "💰 Money"], phone: ["📱 फोन", "📱 Phone"]
  };
  var ORDER = ["winter", "bath", "documents", "kids", "elders", "money", "phone"];
  try { done = JSON.parse(localStorage.getItem("ky.chk") || "{}"); } catch (e) { done = {}; }
  var kids = KY.$("#c-kids"), elders = KY.$("#c-elders");
  var q = new URLSearchParams(location.search);
  if (q.get("kids") === "1") kids.checked = true;
  if (q.get("elders") === "1") elders.checked = true;

  function render() {
    var show = ORDER.filter(function (c) { return (c !== "kids" || kids.checked) && (c !== "elders" || elders.checked); });
    KY.$("#c-body").innerHTML = show.map(function (c) {
      var items = rows.filter(function (r) { return r.category === c; });
      if (!items.length) return "";
      var t = TITLES[c];
      return '<div class="card"><h3>' + KY.t(t[0], t[1]) + '</h3><ul class="checklist">' + items.map(function (r) {
        var key = c + "|" + r.item_en;
        return '<li><label><input type="checkbox" data-k="' + KY.esc(key) + '"' + (done[key] ? " checked" : "") + "> <span>" + KY.bi(r, "item") + "</span></label></li>";
      }).join("") + "</ul></div>";
    }).join("");
  }
  KY.$("#c-body").addEventListener("change", function (e) {
    var k = e.target.getAttribute("data-k");
    if (!k) return;
    if (e.target.checked) done[k] = 1; else delete done[k];
    try { localStorage.setItem("ky.chk", JSON.stringify(done)); } catch (err) {}
  });
  kids.addEventListener("change", render);
  elders.addEventListener("change", render);
  KY.$("#c-print").addEventListener("click", function () { window.print(); });
  document.addEventListener("ky:lang", render);
  KY.get("checklists").then(function (r) { rows = r.rows; render(); });
});
