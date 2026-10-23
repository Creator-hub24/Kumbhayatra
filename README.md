# Kumbhayatra (कुंभयात्रा)

Hindi-first (with English toggle) guide for first-time visitors to the Magh Mela, Prayagraj, plus a verified directory of local seasonal businesses (stays, boats, taxis).

Static site (plain HTML/CSS/JS, no build step to serve) with a **Supabase** backend for the dynamic parts. Same pattern as AptiSetu. Works on GitHub Pages.

**It works even before Supabase is connected:** dates, calendar, plan builder, itineraries, routes, places, checklists and safety pages use built-in data (`data/seed.json`). Business listings, reviews, reports, logins, the admin panel and live notices switch on when you add the Supabase keys.

## Pages
| Page | What it does |
|---|---|
| `index.html` | Home, countdown to the next bath date |
| `plan.html` | Plan my trip: crowd check, calmer dates, darshan order, how to reach, stay options, packing list, WhatsApp share, print/PDF |
| `snan.html` | Day-by-day crowd calendar and bath dates |
| `itineraries.html`, `reach.html`, `places.html` | 1/2/3 day plans, routes by city, places |
| `services.html` | Verified stays, boats, taxis: filters, WhatsApp enquiry (logged as a lead), reviews |
| `safety.html` | Scam rules, price guide, emergency numbers, printable family safety card, report form |
| `checklist.html`, `help.html` | Packing lists (saved on device), FAQ, correction form |
| `list-business.html`, `business.html` | Business landing page and owner dashboard (login by email link) |
| `admin.html` | Admin panel (not indexed, not in the menu) |

## Go live: one-time setup (about 20 minutes)
1. **Create a Supabase project** (free tier is enough) at supabase.com.
2. **SQL Editor:** run `supabase/schema.sql`, then `supabase/seed.sql`. (Both are safe to re-run.)
3. **Auth settings:** Authentication > URL Configuration. Set *Site URL* to your site (for example `https://kumbhayatra.com`) and add the same URL under *Redirect URLs*. Email login ("magic link") is on by default.
4. **Keys:** Project Settings > API. Copy the *Project URL* and the **anon public** key into `assets/js/config.js`. Never use the `service_role` key anywhere in this repo.
5. **Make yourself admin:** open `admin.html` on the live site, log in with your email, then run the SQL it shows you (an `update public.profiles set role = 'admin' ...` statement) in the SQL editor. Reload `admin.html`.
6. **Optional:** put your help WhatsApp number (digits with country code) in `config.js` as `WHATSAPP_NUMBER`.
7. **Publish:** GitHub repo Settings > Pages > deploy from branch `main` (root). For `kumbhayatra.com`, add a `CNAME` file containing the domain and point your DNS at GitHub Pages.

## Running the season
- **Dates:** when the official Mela schedule is announced, update them in Admin > Dates and tick "Officially confirmed" for each. Also update `tools/content.py` and re-run the build so the offline fallback matches.
- **Crowd levels** are our planning estimate. Edit them per date in Admin > Dates.
- **Notices:** Admin > Notices. A notice shows as a banner on every page (traffic closures, weather). Set "hide after" so old notices expire.
- **Verify businesses:** Admin > Businesses. Call or visit, write what you checked, press Verify. The listing goes public. If an owner changes name or phone, it returns to "pending" automatically.
- **Prices:** Admin > Prices. Leave empty until you have checked local rates; visitors then see "rates will be updated".
- **Reviews and reports:** approve reviews (they stay hidden until you do), act on reports, suspend repeat offenders.
- **Leads:** Admin > Leads shows enquiries per business, useful when you talk to businesses about paid featured spots.

## Editing the guide content
Guide text (places, itineraries, routes, checklists, FAQ, scam tips) lives in `tools/content.py`, in Hindi and English.

```
python3 tools/build.py      # regenerates HTML pages, data/seed.json, supabase/seed.sql, sitemap.xml, robots.txt
python3 -m http.server 8765 # preview at http://localhost:8765 (the site fetches JSON, so file:// will not work)
```
Content already in Supabase is not overwritten by re-running `seed.sql`; edit live content in the admin panel instead.

## Security model (summary)
- Row-level security is on for every table (`supabase/schema.sql`).
- Visitors can read public guide content and verified listings, and can submit reports, reviews (held for approval), anonymous trip plans and enquiry logs. They cannot read reports, plans or leads.
- Business owners can read and edit only their own business, offers and leads. They cannot verify themselves or change ownership; changing name or phone sends a verified listing back for re-check.
- Only admins (`profiles.role = 'admin'`) can verify, approve, publish notices and edit guide content.
- A strict Content-Security-Policy is set on every page (scripts only from this site; connections only to this site and Supabase). Pages must not use inline scripts or inline styles.

## Before the Mela: checklist
- [ ] Confirm bath dates from the official announcement and update them
- [ ] Verify the first 10 to 20 businesses personally (stays, boats, taxis)
- [ ] Fill local price ranges for boats, autos and guides
- [ ] Add real help phone/WhatsApp in `config.js`
- [ ] Re-check the "How to reach" and places pages against the year's official notices (parking, shuttles, Akshayavat entry)
- [ ] Add spam protection (for example Cloudflare Turnstile) if report or review spam appears

## Not included yet (ideas for later)
Business photos (Supabase Storage), online payments (deliberately left out), paid featured listings, user accounts for pilgrims, automatic WhatsApp messaging.
