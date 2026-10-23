KY.ready(function () {
  var app = KY.$("#a-app");
  if (!KY.sb) { KY.notConfigured(app); return; }
  var S = null, tab = "overview", bizFilter = "pending", E = KY.esc;
  var TABS = [["overview", "Overview"], ["biz", "Businesses"], ["snan", "Dates"], ["notices", "Notices"], ["reviews", "Reviews"], ["reports", "Reports"], ["leads", "Leads"], ["prices", "Prices"]];
  var CROWD = ["calm", "moderate", "high", "very_high"];

  function opts(list, sel) { return list.map(function (v) { return '<option value="' + E(v) + '"' + (v === sel ? " selected" : "") + ">" + E(v) + "</option>"; }).join(""); }
  function when(t) { return t ? new Date(t).toLocaleString("en-IN") : ""; }
  function flash(kind, text) {
    var f = KY.$("#a-flash");
    if (f) f.innerHTML = '<div class="msg ' + kind + '">' + E(text) + "</div>";
  }
  async function run(p, okText) {
    var r = await p;
    if (r.error) { flash("err", "Error: " + r.error.message); return false; }
    flash("ok", okText || "Saved.");
    return true;
  }
  function count(table, f) {
    var q = KY.sb.from(table).select("id", { count: "exact", head: true });
    if (f) q = f(q);
    return q.then(function (r) { return r.count || 0; });
  }

  var views = {
    overview: async function () {
      var c = await Promise.all([
        count("businesses", function (q) { return q.eq("status", "pending"); }), count("businesses", function (q) { return q.eq("status", "verified"); }),
        count("reviews", function (q) { return q.eq("approved", false); }), count("reports", function (q) { return q.eq("status", "open"); }),
        count("trip_requests"), count("leads")
      ]);
      var items = [["Businesses waiting for checking", c[0]], ["Verified businesses", c[1]], ["Reviews to approve", c[2]], ["Open reports", c[3]], ["Plans made by visitors", c[4]], ["Enquiries (leads)", c[5]]];
      return '<div class="grid c3">' + items.map(function (i) { return '<div class="card"><p class="muted small">' + i[0] + '</p><p class="price big">' + i[1] + "</p></div>"; }).join("") + "</div>";
    },

    biz: async function () {
      var q = KY.sb.from("businesses").select("*").order("created_at", { ascending: false });
      if (bizFilter !== "all") q = q.eq("status", bizFilter);
      var r = await q, rows = r.data || [];
      var vr = rows.length ? await KY.sb.from("verifications").select("*").in("business_id", rows.map(function (b) { return b.id; })).order("checked_on", { ascending: false }) : { data: [] };
      var ver = {};
      (vr.data || []).forEach(function (v) { (ver[v.business_id] = ver[v.business_id] || []).push(v); });
      var h = '<label for="bf">Show</label><select id="bf" data-filter>' + opts(["pending", "verified", "suspended", "all"], bizFilter) + "</select>";
      if (!rows.length) return h + "<p class=\"muted\">Nothing here.</p>";
      return h + '<div class="stack">' + rows.map(function (b) {
        var v = ver[b.id] || [];
        return '<div class="card"><h3>' + E(b.name) + ' <span class="badge b-' + (b.status === "verified" ? "ok" : b.status === "pending" ? "pending" : "bad") + '">' + E(b.status) + "</span></h3>" +
          '<p class="small">' + E(b.category) + " · " + E(b.area || "no area") + " · phone " + E(b.phone || "-") + " · WhatsApp " + E(b.whatsapp || "-") + " · season " + (b.season_active ? "on" : "off") + "</p>" +
          "<p>" + E(b.description || "") + '</p><p class="muted small">Added ' + when(b.created_at) + "</p>" +
          (v.length ? '<p class="small">Last check: ' + E(v[0].method) + " on " + E(v[0].checked_on) + (v[0].notes ? " (" + E(v[0].notes) + ")" : "") + "</p>" : "") +
          (b.status !== "verified" ? '<form data-form="verify" data-id="' + E(b.id) + '" class="row"><select name="method"><option>call</option><option>visit</option><option>document</option></select><input name="notes" placeholder="notes (what you checked)" maxlength="200"><button class="btn small" type="submit">Verify</button></form>' : "") +
          '<div class="row">' + (b.status === "verified" ? '<button class="btn ghost small" data-act="biz-status" data-s="pending" data-id="' + E(b.id) + '">Send back for re-check</button>' : "") +
          (b.status !== "suspended" ? '<button class="btn ghost small" data-act="biz-status" data-s="suspended" data-id="' + E(b.id) + '">Suspend</button>' : '<button class="btn ghost small" data-act="biz-status" data-s="pending" data-id="' + E(b.id) + '">Reinstate to pending</button>') + "</div></div>";
      }).join("") + "</div>";
    },

    snan: async function () {
      var ev = await KY.sb.from("events").select("*").order("starts_on", { ascending: false }), sn = await KY.sb.from("snan_dates").select("*").order("snan_on");
      var e = (ev.data || [])[0];
      if (!e) return '<div class="msg err">No data yet. Run supabase/seed.sql in the Supabase SQL editor first.</div>';
      var h = '<form class="card" data-form="event" data-id="' + E(e.id) + '"><h3>Event dates</h3><div class="fgrid"><div><label>Starts</label><input name="starts_on" type="date" value="' + E(e.starts_on) + '"></div><div><label>Ends</label><input name="ends_on" type="date" value="' + E(e.ends_on) + '"></div></div>' +
        '<label>Note (Hindi)</label><textarea name="note_hi">' + E(e.note_hi || "") + "</textarea><label>Note (English)</label><textarea name=\"note_en\">" + E(e.note_en || "") + '</textarea><button class="btn small" type="submit">Save event</button></form>';
      h += "<h2>Bath dates</h2>" + (sn.data || []).map(function (s) {
        return '<form class="card" data-form="snan" data-id="' + E(s.id) + '"><h3>' + E(s.snan_on) + " · " + E(s.name_en) + '</h3><div class="fgrid"><div><label>Date</label><input name="snan_on" type="date" value="' + E(s.snan_on) + '"></div><div><label>Crowd</label><select name="crowd">' + opts(CROWD, s.crowd) + "</select></div></div>" +
          '<label>Tip (Hindi)</label><textarea name="tip_hi">' + E(s.tip_hi || "") + '</textarea><label>Tip (English)</label><textarea name="tip_en">' + E(s.tip_en || "") + "</textarea>" +
          '<label class="opt"><input type="checkbox" name="is_confirmed"' + (s.is_confirmed ? " checked" : "") + '> Officially confirmed</label><div class="cta-row"><button class="btn small" type="submit">Save</button></div></form>';
      }).join("");
      return h;
    },

    notices: async function () {
      var r = await KY.sb.from("notices").select("*").order("created_at", { ascending: false });
      var h = '<form class="card" data-form="notice"><h3>New notice</h3><label>Type</label><select name="kind">' + opts(["info", "traffic", "safety", "weather"], "info") + "</select>" +
        '<label>Message (Hindi)</label><textarea name="msg_hi" required></textarea><label>Message (English)</label><textarea name="msg_en" required></textarea>' +
        '<label>Hide after (optional)</label><input name="ends_at" type="datetime-local"><div class="cta-row"><button class="btn small" type="submit">Publish</button></div></form><h2>All notices</h2>';
      return h + '<div class="stack">' + (r.data || []).map(function (n) {
        return '<div class="card"><p><span class="badge ' + (n.is_active ? "b-ok" : "b-pending") + '">' + (n.is_active ? "live" : "hidden") + "</span> " + E(n.kind) + "</p><p>" + E(n.msg_hi) + "</p><p>" + E(n.msg_en) + '</p><p class="muted small">' + when(n.created_at) + (n.ends_at ? " · hides " + when(n.ends_at) : "") + '</p><div class="row"><button class="btn ghost small" data-act="notice-toggle" data-id="' + E(n.id) + '" data-v="' + (n.is_active ? "0" : "1") + '">' + (n.is_active ? "Hide" : "Show") + '</button><button class="btn ghost small" data-act="notice-del" data-id="' + E(n.id) + '">Delete</button></div></div>';
      }).join("") + "</div>";
    },

    reviews: async function () {
      var r = await KY.sb.from("reviews").select("*, businesses(name)").order("created_at", { ascending: false }).limit(100);
      if (!(r.data || []).length) return '<p class="muted">No reviews yet.</p>';
      return '<div class="stack">' + r.data.map(function (v) {
        return '<div class="card"><p><strong>' + E((v.businesses || {}).name || "") + '</strong> · <span class="stars">' + "★".repeat(v.rating) + "</span> · " + E(v.author_name || "anonymous") + ' <span class="badge ' + (v.approved ? "b-ok" : "b-pending") + '">' + (v.approved ? "approved" : "waiting") + "</span></p><p>" + E(v.comment || "") + '</p><div class="row">' + (v.approved ? "" : '<button class="btn small" data-act="rev-ok" data-id="' + E(v.id) + '">Approve</button>') + '<button class="btn ghost small" data-act="rev-del" data-id="' + E(v.id) + '">Delete</button></div></div>';
      }).join("") + "</div>";
    },

    reports: async function () {
      var r = await KY.sb.from("reports").select("*, businesses(name)").order("created_at", { ascending: false }).limit(100);
      if (!(r.data || []).length) return '<p class="muted">No reports.</p>';
      return '<div class="stack">' + r.data.map(function (x) {
        return '<div class="card"><p><strong>' + E(x.reason) + "</strong>" + (x.businesses ? " · about " + E(x.businesses.name) : "") + '</p><p>' + E(x.details || "") + '</p><p class="muted small">' + when(x.created_at) + " · contact: " + E(x.contact || "-") + '</p><select data-act="rep-status" data-id="' + E(x.id) + '">' + opts(["open", "reviewed", "action_taken", "dismissed"], x.status) + "</select></div>";
      }).join("") + "</div>";
    },

    leads: async function () {
      var r = await KY.sb.from("leads").select("*, businesses(name)").order("created_at", { ascending: false }).limit(200);
      var rows = r.data || [], per = {};
      rows.forEach(function (l) { var n = (l.businesses || {}).name || "?"; per[n] = (per[n] || 0) + 1; });
      var h = "<h3>Enquiries per business (latest 200)</h3><ul>" + Object.keys(per).map(function (n) { return "<li>" + E(n) + ": " + per[n] + "</li>"; }).join("") + "</ul>";
      return h + '<div class="tablewrap"><table><thead><tr><th>When</th><th>Business</th><th>Channel</th><th>Status</th></tr></thead><tbody>' + rows.map(function (l) {
        return "<tr><td>" + when(l.created_at) + "</td><td>" + E((l.businesses || {}).name || "") + "</td><td>" + E(l.channel) + '</td><td><select data-act="lead-status" data-id="' + E(l.id) + '">' + opts(["sent", "contacted", "booked", "closed"], l.status) + "</select></td></tr>";
      }).join("") + "</tbody></table></div>";
    },

    prices: async function () {
      var r = await KY.sb.from("price_guides").select("*").order("sort");
      if (!(r.data || []).length) return '<div class="msg err">No data yet. Run supabase/seed.sql first.</div>';
      return r.data.map(function (p) {
        return '<form class="card" data-form="price" data-id="' + E(p.id) + '"><h3>' + E(p.label_en) + '</h3><div class="fgrid"><div><label>Min price (₹)</label><input name="min_price" type="number" min="0" value="' + E(p.min_price == null ? "" : p.min_price) + '"></div><div><label>Max price (₹)</label><input name="max_price" type="number" min="0" value="' + E(p.max_price == null ? "" : p.max_price) + '"></div>' +
          '<div><label>Unit (Hindi)</label><input name="unit_hi" value="' + E(p.unit_hi || "") + '"></div><div><label>Unit (English)</label><input name="unit_en" value="' + E(p.unit_en || "") + '"></div></div><div class="cta-row"><button class="btn small" type="submit">Save</button></div></form>';
      }).join("") + '<p class="hint">Leave prices empty until you have checked them locally. Visitors then see "rates will be updated" instead of a wrong number.</p>';
    }
  };

  async function show(t) {
    tab = t || tab;
    var h = '<div class="tabs" role="tablist">' + TABS.map(function (x) { return '<button class="tab" type="button" data-tab="' + x[0] + '" aria-selected="' + (x[0] === tab) + '">' + x[1] + "</button>"; }).join("") +
      '<button class="btn ghost small" type="button" data-act="logout">Log out</button></div><div id="a-flash"></div><div id="a-view"><p class="muted">Loading…</p></div>';
    app.innerHTML = h;
    var v = KY.$("#a-view");
    try { v.innerHTML = await views[tab](); } catch (e) { v.innerHTML = '<div class="msg err">Could not load: ' + E(e.message) + "</div>"; }
  }

  function num(v) { return v === "" || v == null ? null : parseInt(v, 10); }

  app.addEventListener("click", async function (e) {
    var t = e.target.closest("[data-tab]");
    if (t) { show(t.getAttribute("data-tab")); return; }
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act"), id = b.getAttribute("data-id"), ok = false;
    if (act === "logout") { await KY.auth.logout(); location.reload(); return; }
    if (act === "biz-status") ok = await run(KY.sb.from("businesses").update({ status: b.getAttribute("data-s") }).eq("id", id));
    else if (act === "notice-toggle") ok = await run(KY.sb.from("notices").update({ is_active: b.getAttribute("data-v") === "1" }).eq("id", id));
    else if (act === "notice-del") { if (window.confirm("Delete this notice?")) ok = await run(KY.sb.from("notices").delete().eq("id", id), "Deleted."); }
    else if (act === "rev-ok") ok = await run(KY.sb.from("reviews").update({ approved: true }).eq("id", id), "Approved.");
    else if (act === "rev-del") { if (window.confirm("Delete this review?")) ok = await run(KY.sb.from("reviews").delete().eq("id", id), "Deleted."); }
    if (ok) { var keep = KY.$("#a-flash").innerHTML; await show(); KY.$("#a-flash").innerHTML = keep; }
  });

  app.addEventListener("change", async function (e) {
    var s = e.target;
    if (s.hasAttribute("data-filter")) { bizFilter = s.value; show(); return; }
    var act = s.getAttribute("data-act"), id = s.getAttribute("data-id");
    if (act === "rep-status") run(KY.sb.from("reports").update({ status: s.value }).eq("id", id));
    else if (act === "lead-status") run(KY.sb.from("leads").update({ status: s.value }).eq("id", id));
  });

  app.addEventListener("submit", async function (e) {
    var f = e.target.closest("form[data-form]");
    if (!f) return;
    e.preventDefault();
    var kind = f.getAttribute("data-form"), id = f.getAttribute("data-id"), el = f.elements, ok = false;
    if (kind === "verify") {
      var vr = await KY.sb.from("verifications").insert({ business_id: id, checked_by: S.user.id, method: el.method.value, notes: el.notes.value.trim() || null });
      if (vr.error) { flash("err", "Error: " + vr.error.message); return; }
      ok = await run(KY.sb.from("businesses").update({ status: "verified" }).eq("id", id), "Verified and now public.");
    } else if (kind === "event") {
      ok = await run(KY.sb.from("events").update({ starts_on: el.starts_on.value, ends_on: el.ends_on.value, note_hi: el.note_hi.value, note_en: el.note_en.value }).eq("id", id));
    } else if (kind === "snan") {
      ok = await run(KY.sb.from("snan_dates").update({ snan_on: el.snan_on.value, crowd: el.crowd.value, tip_hi: el.tip_hi.value, tip_en: el.tip_en.value, is_confirmed: el.is_confirmed.checked }).eq("id", id));
    } else if (kind === "notice") {
      var row = { kind: el.kind.value, msg_hi: el.msg_hi.value.trim(), msg_en: el.msg_en.value.trim() };
      if (el.ends_at.value) row.ends_at = new Date(el.ends_at.value).toISOString();
      if (!row.msg_hi || !row.msg_en) { flash("err", "Please write the message in both languages."); return; }
      ok = await run(KY.sb.from("notices").insert(row), "Published.");
    } else if (kind === "price") {
      ok = await run(KY.sb.from("price_guides").update({ min_price: num(el.min_price.value), max_price: num(el.max_price.value), unit_hi: el.unit_hi.value || null, unit_en: el.unit_en.value || null }).eq("id", id));
    }
    if (ok) { var keep = KY.$("#a-flash").innerHTML; await show(); KY.$("#a-flash").innerHTML = keep; }
  });

  KY.auth.session().then(async function (s) {
    if (!s) {
      KY.renderLogin(app);
      KY.auth.onChange(function (ev) { if (ev === "SIGNED_IN") location.reload(); });
      return;
    }
    S = s;
    var me = await KY.sb.from("profiles").select("role").eq("user_id", s.user.id).maybeSingle();
    if (!me.data || me.data.role !== "admin") {
      app.innerHTML = '<div class="msg err">This account is not an admin yet.</div><div class="card"><p>To make yourself admin, open the Supabase SQL editor and run:</p><pre>update public.profiles set role = \'admin\'\nwhere user_id = (select id from auth.users where email = \'' + E(s.user.email || "YOUR_EMAIL") + '\');</pre><p>Then reload this page.</p><button class="btn ghost small" id="lo" type="button">Log out</button></div>';
      KY.$("#lo").addEventListener("click", function () { KY.auth.logout().then(function () { location.reload(); }); });
      return;
    }
    show("overview");
  });
});
