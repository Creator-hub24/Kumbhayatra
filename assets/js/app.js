(function () {
  "use strict";
  var C = window.KY_CONFIG || {};
  var KY = (window.KY = { config: C });

  /* ---------- language ---------- */
  function getLang() {
    try { var l = localStorage.getItem("ky.lang"); if (l === "hi" || l === "en") return l; } catch (e) {}
    return "hi";
  }
  function setLang(l) {
    document.documentElement.setAttribute("data-lang", l);
    document.documentElement.lang = l;
    try { localStorage.setItem("ky.lang", l); } catch (e) {}
    var b = document.getElementById("langbtn");
    if (b) b.textContent = l === "hi" ? "English" : "हिंदी";
    document.dispatchEvent(new CustomEvent("ky:lang", { detail: l }));
  }
  KY.lang = getLang;
  document.documentElement.setAttribute("data-lang", getLang());

  /* ---------- small helpers ---------- */
  KY.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  KY.t = function (hi, en) { return '<span class="hi">' + KY.esc(hi) + '</span><span class="en">' + KY.esc(en) + "</span>"; };
  KY.bi = function (row, key) { return KY.t(row[key + "_hi"] || row[key + "_en"] || "", row[key + "_en"] || row[key + "_hi"] || ""); };
  KY.txt = function (row, key) { var l = getLang(); return row[key + "_" + l] || row[key + "_hi"] || row[key + "_en"] || ""; };
  KY.pick = function (hi, en) { return getLang() === "hi" ? hi : en; };
  KY.ready = function (fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); };
  KY.$ = function (s, r) { return (r || document).querySelector(s); };
  KY.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  KY.say = function (el, kind, hi, en) {
    if (!el) return;
    el.innerHTML = '<div class="msg ' + (kind || "") + '" role="status">' + KY.t(hi, en) + "</div>";
  };
  KY.waLink = function (number, text) {
    var n = String(number || "").replace(/\D/g, "");
    if (n.length === 10) n = "91" + n;
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(text || "");
  };

  /* ---------- dates (UTC math, so time zones never shift a date) ---------- */
  KY.dayNum = function (ds) {
    var p = String(ds).split("-");
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  };
  KY.fromDayNum = function (n) {
    var d = new Date(n * 86400000);
    return d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2);
  };
  KY.todayStr = function () {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  };
  function fmt(ds, loc, opts) {
    var p = ds.split("-");
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    try { return new Intl.DateTimeFormat(loc, Object.assign({ timeZone: "UTC" }, opts)).format(d); }
    catch (e) { return ds; }
  }
  KY.dateText = function (ds, lang, withWeekday) {
    var o = withWeekday ? { weekday: "short", day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "short", year: "numeric" };
    return fmt(ds, lang === "hi" ? "hi-IN" : "en-IN", o);
  };
  KY.dateHtml = function (ds, withWeekday) {
    return '<span class="hi">' + KY.esc(KY.dateText(ds, "hi", withWeekday)) + '</span><span class="en">' + KY.esc(KY.dateText(ds, "en", withWeekday)) + "</span>";
  };

  /* ---------- crowd model ---------- */
  var NAMES = ["calm", "moderate", "high", "very_high"];
  var RANK = { calm: 0, moderate: 1, high: 2, very_high: 3 };
  var LABEL = {
    calm: ["कम भीड़", "Calm"], moderate: ["मध्यम भीड़", "Moderate"],
    high: ["ज्यादा भीड़", "High"], very_high: ["बहुत ज्यादा भीड़", "Very high"]
  };
  KY.rank = RANK; KY.crowdNames = NAMES;
  KY.badge = function (level) {
    var l = LABEL[level] || LABEL.high;
    return '<span class="badge b-' + KY.esc(level) + '">' + KY.t(l[0], l[1]) + "</span>";
  };
  KY.crowdLabel = function (level) { var l = LABEL[level] || LABEL.high; return l[getLang() === "hi" ? 0 : 1]; };
  // Estimated crowd for any date: bath days use their own rating; the days around a big bath are busier.
  KY.crowdFor = function (ds, snan) {
    var n = KY.dayNum(ds), lvl = 0, exact = null;
    (snan || []).forEach(function (s) {
      var d = Math.abs(KY.dayNum(s.snan_on) - n), r = RANK[s.crowd] || 0;
      if (d === 0) { lvl = Math.max(lvl, r); exact = s; }
      else if (d === 1) lvl = Math.max(lvl, r >= 3 ? 2 : r >= 2 ? 1 : 0);
      else if (d === 2 && r >= 3) lvl = Math.max(lvl, 1);
    });
    return { level: NAMES[lvl], snan: exact };
  };

  /* ---------- data: live Supabase with a built-in fallback ---------- */
  KY.sb = null;
  if (C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient) {
    try { KY.sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY); } catch (e) { KY.sb = null; }
  }
  var seedP = null;
  function seed() {
    if (!seedP) seedP = fetch("data/seed.json").then(function (r) { return r.json(); }).catch(function () { return {}; });
    return seedP;
  }
  KY.seed = seed;
  var SEEDED = { events: 1, snan_dates: "snan", places: 1, itineraries: 1, routes: 1, checklists: 1, price_guides: 1, notices: 1 };
  function seedKey(t) { return SEEDED[t] === "snan" ? "snan" : t; }
  KY.get = function (table, build) {
    var sel = "*";
    var run = KY.sb
      ? Promise.resolve().then(function () {
          var q = KY.sb.from(table).select(sel);
          if (build) q = build(q);
          return q;
        }).then(function (res) { return res && !res.error ? res.data || [] : null; }).catch(function () { return null; })
      : Promise.resolve(null);
    return run.then(function (rows) {
      var useSeed = SEEDED[table] && (rows === null || (rows.length === 0 && table !== "notices"));
      if (!useSeed) return { rows: rows || [], live: rows !== null };
      return seed().then(function (s) { return { rows: (s[seedKey(table)] || []).slice(), live: false }; });
    }).then(function (r) {
      r.rows.sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
      return r;
    });
  };
  KY.recordLead = function (businessId, offerId, channel) {
    if (!KY.sb) return;
    var row = { business_id: businessId, channel: channel || "whatsapp" };
    if (offerId) row.offer_id = offerId;
    KY.sb.from("leads").insert(row).then(function () {}, function () {});
  };

  /* ---------- notices bar ---------- */
  function initNotices() {
    var host = document.getElementById("noticebar");
    if (!host) return;
    KY.get("notices").then(function (r) {
      var now = Date.now();
      var rows = r.rows.filter(function (n) {
        if (n.is_active === false) return false;
        if (n.starts_at && new Date(n.starts_at).getTime() > now) return false;
        if (n.ends_at && new Date(n.ends_at).getTime() < now) return false;
        return true;
      });
      if (!rows.length) { host.hidden = true; return; }
      host.innerHTML = '<div class="wrap">' + rows.slice(0, 3).map(function (n) {
        var icon = { traffic: "🚧 ", safety: "⚠️ ", weather: "🌫️ ", info: "ℹ️ " }[n.kind] || "ℹ️ ";
        return '<p class="k-' + KY.esc(n.kind) + '">' + icon + KY.bi(n, "msg") + "</p>";
      }).join("") + "</div>";
      host.hidden = false;
    });
  }

  /* ---------- chrome: menu, language, footer year ---------- */
  KY.ready(function () {
    var lb = document.getElementById("langbtn");
    if (lb) lb.addEventListener("click", function () { setLang(getLang() === "hi" ? "en" : "hi"); });
    setLang(getLang());
    var mb = document.getElementById("menubtn"), nav = document.getElementById("nav");
    if (mb && nav) mb.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      mb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    var here = location.pathname.split("/").pop() || "index.html";
    KY.$$("#nav a").forEach(function (a) { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
    initNotices();
  });
})();
