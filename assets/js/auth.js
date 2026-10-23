// Email magic-link login shared by business.html and admin.html
(function () {
  var KY = window.KY;
  KY.auth = {
    session: function () { return KY.sb.auth.getSession().then(function (r) { return r.data && r.data.session; }); },
    logout: function () { return KY.sb.auth.signOut(); },
    onChange: function (cb) { KY.sb.auth.onAuthStateChange(function (ev, s) { cb(ev, s); }); }
  };
  KY.renderLogin = function (host, who) {
    host.innerHTML = '<form class="card" id="login-form" novalidate><h2>' + KY.t("ईमेल से लॉगिन", "Log in with email") + "</h2>" +
      "<p class=\"muted\">" + KY.t("हम आपके ईमेल पर एक लॉगिन लिंक भेजेंगे। पासवर्ड की जरूरत नहीं।", "We will email you a login link. No password needed.") + "</p>" +
      '<label for="l-email">Email</label><input id="l-email" type="email" autocomplete="email" required>' +
      '<div class="cta-row"><button class="btn" type="submit">' + KY.t("लिंक भेजें", "Send link") + "</button></div><div id=\"l-msg\"></div></form>";
    KY.$("#login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = KY.$("#l-email").value.trim(), m = KY.$("#l-msg");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { KY.say(m, "err", "सही ईमेल लिखें।", "Please enter a valid email."); return; }
      KY.sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
        if (r.error) KY.say(m, "err", "लिंक भेजा नहीं जा सका। कृपया बाद में कोशिश करें।", "Could not send the link. Please try again later.");
        else KY.say(m, "ok", "अपना ईमेल देखें और लिंक पर दबाएँ।", "Check your email and tap the link.");
      });
    });
  };
  KY.notConfigured = function (host) {
    host.innerHTML = '<div class="msg err">' + KY.t("यह सुविधा अभी चालू नहीं है। साइट के मालिक को Supabase की कुंजियाँ assets/js/config.js में जोड़नी होंगी।", "This feature is not switched on yet. The site owner needs to add the Supabase keys in assets/js/config.js.") + "</div>";
  };
})();
