// Kumbhayatra configuration. Only PUBLIC values go here.
// The Supabase "anon" key is designed to be public; security comes from the row-level-security rules in supabase/schema.sql.
// NEVER put the service_role key in this file.
window.KY_CONFIG = {
  SITE_URL: "https://kumbhayatra.com",
  SUPABASE_URL: "",        // e.g. https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: "",   // Project Settings > API > anon public key
  WHATSAPP_NUMBER: "",     // site help number with country code, digits only, e.g. 919876543210 (optional)
  CONTACT_EMAIL: ""        // optional
};
