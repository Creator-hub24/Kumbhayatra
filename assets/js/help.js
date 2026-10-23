KY.ready(function () {
  KY.seed().then(function (s) {
    KY.$("#faq").innerHTML = (s.faq || []).map(function (f) {
      return '<details class="card"><summary>' + KY.t(f.q_hi, f.q_en) + "</summary><p>" + KY.t(f.a_hi, f.a_en) + "</p></details>";
    }).join("");
  });

  var C = KY.config, parts = [];
  if (C.WHATSAPP_NUMBER) parts.push('<p><a class="btn" target="_blank" rel="noopener" href="' + KY.esc(KY.waLink(C.WHATSAPP_NUMBER, KY.pick("नमस्ते, मुझे माघ मेला यात्रा में मदद चाहिए।", "Hello, I need help planning my Magh Mela trip."))) + '">WhatsApp</a></p>');
  if (C.CONTACT_EMAIL) parts.push('<p><a href="mailto:' + KY.esc(C.CONTACT_EMAIL) + '">' + KY.esc(C.CONTACT_EMAIL) + "</a></p>");
  if (!parts.length) parts.push("<p>" + KY.t("सवाल या सुझाव के लिए नीचे का फॉर्म इस्तेमाल करें।", "For questions or suggestions use the form below.") + "</p>");
  KY.$("#contact").innerHTML = parts.join("");

  var f = KY.$("#fix-form"), m = KY.$("#fx-msg");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = KY.$("#fx-text").value.trim();
    if (text.length < 10) { KY.say(m, "err", "कृपया थोड़ा विस्तार से लिखें।", "Please add a little more detail."); return; }
    if (!KY.sb) { KY.say(m, "err", "यह सुविधा अभी चालू नहीं है।", "This feature is not switched on yet."); return; }
    KY.sb.from("reports").insert({ reason: "other", details: "[correction] " + text, contact: KY.$("#fx-contact").value.trim() || null }).then(function (r) {
      if (r.error) KY.say(m, "err", "भेजा नहीं जा सका। कृपया बाद में कोशिश करें।", "Could not send. Please try again later.");
      else { KY.say(m, "ok", "धन्यवाद, हम इसे देखेंगे।", "Thank you, we will look at it."); f.reset(); }
    });
  });
});
