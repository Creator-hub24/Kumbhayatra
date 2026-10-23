KY.ready(function () {
  var D = {};
  var sel = null;

  function legend() {
    KY.$("#legend").innerHTML = KY.crowdNames.map(function (n) { return KY.badge(n); }).join("");
  }

  function calmWindows() {
    var start = KY.dayNum(D.ev.starts_on), end = KY.dayNum(D.ev.ends_on), runs = [], cur = null;
    for (var n = start; n <= end; n++) {
      var lvl = KY.crowdFor(KY.fromDayNum(n), D.snan).level;
      if (lvl === "calm") { if (!cur) cur = { a: n, b: n }; else cur.b = n; }
      else if (cur) { runs.push(cur); cur = null; }
    }
    if (cur) runs.push(cur);
    return runs.filter(function (r) { return r.b - r.a >= 2; }).sort(function (x, y) { return (y.b - y.a) - (x.b - x.a); }).slice(0, 3).sort(function (x, y) { return x.a - y.a; });
  }

  function renderCalm() {
    var w = calmWindows(), h = "<h2>" + KY.t("पहली बार वालों के लिए सबसे शांत दिन", "Calmest days for first-timers") + "</h2>";
    if (!w.length) { KY.$("#calm-box").innerHTML = h; return; }
    h += "<ul>" + w.map(function (r) {
      return "<li>" + KY.dateHtml(KY.fromDayNum(r.a)) + " – " + KY.dateHtml(KY.fromDayNum(r.b)) + "</li>";
    }).join("") + "</ul><p class=\"small muted\">" + KY.t("बच्चों और बुजुर्गों के साथ इन्हीं दिनों में जाएँ।", "Choose these days when travelling with children and elders.") + "</p>";
    KY.$("#calm-box").innerHTML = h;
  }

  function renderCal() {
    var start = KY.dayNum(D.ev.starts_on), end = KY.dayNum(D.ev.ends_on), host = KY.$("#cal"), html = "", lastMonth = "";
    var wd = KY.lang() === "hi" ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var n = start;
    while (n <= end) {
      var ym = KY.fromDayNum(n).slice(0, 7);
      var monthEnd = Math.min(end, KY.dayNum(ym + "-28") + 4);
      while (monthEnd >= n && KY.fromDayNum(monthEnd).slice(0, 7) !== ym) monthEnd--;
      html += '<div class="month">' + KY.dateHtml(ym + "-01").replace(/\d+\s/g, "") + "</div>";
      html += '<div class="cal-head" aria-hidden="true">' + wd.map(function (d) { return "<div>" + d + "</div>"; }).join("") + "</div><div class=\"cal-grid\">";
      var lead = new Date(n * 86400000).getUTCDay();
      for (var i = 0; i < lead; i++) html += '<span class="cell off"></span>';
      for (var d = n; d <= monthEnd; d++) {
        var ds = KY.fromDayNum(d), c = KY.crowdFor(ds, D.snan), day = +ds.slice(8);
        html += '<button type="button" class="cell ' + c.level + (c.snan ? " snan" : "") + '" data-ds="' + ds + '" aria-pressed="' + (sel === ds ? "true" : "false") + '">' +
          '<span class="d">' + day + "</span>" + (c.snan ? '<span class="n">' + KY.bi(c.snan, "name") + "</span>" : "") + "</button>";
      }
      html += "</div>";
      n = monthEnd + 1;
    }
    host.innerHTML = html;
  }

  function detail(ds) {
    var c = KY.crowdFor(ds, D.snan), h = "<h3>" + KY.dateHtml(ds, true) + "</h3><p>" + KY.badge(c.level) + "</p>";
    if (c.snan) h += "<p><strong>" + KY.bi(c.snan, "name") + "</strong></p><p>" + KY.bi(c.snan, "tip") + "</p>";
    else {
      var msgs = {
        calm: ["सामान्य दिन, भीड़ अपेक्षाकृत कम। परिवार, बच्चों और बुजुर्गों के लिए अच्छा।", "An ordinary day with lighter crowds. Good for families, children and elders."],
        moderate: ["बड़े स्नान के पास का दिन, भीड़ मध्यम। सुबह जल्दी निकलें।", "A day near a bath; moderate crowds. Start early."],
        high: ["बड़े स्नान के ठीक पहले या बाद का दिन, भीड़ और डायवर्जन ज्यादा।", "Right before or after a big bath; heavy crowds and diversions."]
      }[c.level] || ["", ""];
      h += "<p>" + KY.t(msgs[0], msgs[1]) + "</p>";
    }
    h += '<p><a class="btn small" href="plan.html?date=' + ds + '">' + KY.t("इस दिन की योजना बनाएँ", "Plan for this day") + "</a></p>";
    KY.$("#cal-detail").innerHTML = h;
  }

  function renderList() {
    KY.$("#snan-list").innerHTML = D.snan.slice().sort(function (a, b) { return KY.dayNum(a.snan_on) - KY.dayNum(b.snan_on); }).map(function (s) {
      return '<div class="card"><p class="muted small">' + KY.dateHtml(s.snan_on, true) + (s.is_confirmed ? " · " + KY.t("पुष्ट", "confirmed") : " · " + KY.t("अनुमानित", "tentative")) + "</p><h3>" + KY.bi(s, "name") + "</h3><p>" + KY.badge(s.crowd) + "</p><p class=\"small\">" + KY.bi(s, "tip") + "</p></div>";
    }).join("");
  }

  function renderAll() {
    KY.$("#snan-note").innerHTML = D.ev ? KY.bi(D.ev, "name") + " · " + KY.dateHtml(D.ev.starts_on) + " – " + KY.dateHtml(D.ev.ends_on) + "<br>" + KY.bi(D.ev, "note") : "";
    legend(); renderCalm(); renderCal(); renderList();
    if (sel) detail(sel);
  }

  KY.$("#cal").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-ds]");
    if (!b) return;
    sel = b.getAttribute("data-ds");
    KY.$$("#cal .cell").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    detail(sel);
  });
  document.addEventListener("ky:lang", function () { if (D.ev) renderAll(); });

  Promise.all([KY.get("events"), KY.get("snan_dates")]).then(function (r) {
    D.ev = r[0].rows[0]; D.snan = r[1].rows;
    renderAll();
  });
});
