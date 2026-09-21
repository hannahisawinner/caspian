# Caspian Capital website

Static site: plain HTML/CSS/JS, no build step. Hosted on GitHub Pages (repo `hannahisawinner/caspian`, branch `main`).
Production: https://www.caspiancapitaltx.com — pushing to `main` deploys in about a minute.
Local preview: VS Code "Live Server" (http://127.0.0.1:5500).

The owner is still learning git/ops: explain steps plainly.

## Do not touch
- `CNAME` — sets the custom domain; editing or deleting it can take the site offline.

## Images
- Property card thumbnails: `images/properties/<name>-card.jpg` (lowercase, no spaces).
- Gallery photos: `images/properties/<name>/` (folders).
- Why the `-card.jpg` suffix: a thumbnail named `CastleHills` collided with the folder `castlehills/` on case-insensitive macOS (files vanished locally, git showed phantom deletions). Never name a file the same as a folder apart from case.
- All images are JPEGs named with a `.jpg` extension (extensionless files get served with the wrong content type).
- **Adding or replacing photos:** drop the new `.jpg` into `images/`, then run `python3 tools/optimize_images.py <file or folder>` (no arguments = everything under `images/`). It resizes (hero/backgrounds 1920px, cards + galleries 1200px), recompresses to ~200-350KB, and strips hidden metadata such as GPS location. It overwrites in place and is safe to re-run; `--dry-run` previews. Keep full-size originals outside the repo. Needs `pip3 install pillow` once.
- Never commit unoptimized photos: phone/camera originals are 2-10MB and slow the site (the images folder went from 37MB to ~7MB in Sept 2026).
- Lazy loading: below-the-fold `<img>` tags get `loading="lazy" decoding="async"`; the first/top images (first carousel slide, first row of project cards, main detail-page photo) load normally. CSS `background-image` images can't be lazy-loaded, so keep those small.
- Thumbnails are referenced in both `projects/index.html` and `projects/details.js`. Search the whole repo (html, css, js) for the old path before renaming any image.

## Navigation conventions
- Internal links open in the same tab (no `target="_blank"`). Only truly external links should open a new tab (with `rel="noopener noreferrer"`).
- **Contact and Invest open as a modal** on top of whatever page the visitor is on. `modal.js` (loaded with `<script src="/modal.js" defer>` at the end of every page except the two form pages) catches clicks on any link to `/contact/` or `/invest/` and shows that page inside an `<iframe>` in a native `<dialog>` (styles: `.site-modal*` at the bottom of `style.css`). Close = X button, Esc, or clicking outside. The forms and their Apps Script logic stay in `contact/index.html` and `invest/index.html` — edit them there, nowhere else.
- The two form pages still work standalone (direct link, Cmd/Ctrl-click, JS off, search results). A tiny `<head>` script adds `class="embedded"` when a form page is inside the modal iframe; `html.embedded ...` CSS then hides the "← Back to Caspian Capital" link and removes the card chrome. Keep that `<head>` script and the back link when restyling.
- `modal.js` fires `site-modal:open` / `site-modal:close` events on `document`; the homepage carousel (`index.html`) listens to pause/resume its auto-advance. Any future auto-playing element should listen to the same events.
- **Thank-you state (both forms):** after a successful submit, `showThankYou(form)` (shared file `thank-you.js`, loaded by both form pages) hides the form and heading and shows `#confirmation` — logo `images/logo-wordmark.svg` plus a message in the wordmark navy `#10385C`. Each page keeps its own message text in its `#confirmation` markup (Invest: "...information has been submitted to the team"; Contact: "...message has been sent to the team"). In the modal it stays full height (`html.embedded .form-wrapper.is-thankyou { min-height: 100vh }` — don't add extra height/padding there or the iframe will grow in a loop) and after 4.5s posts `site-modal:request-close` to the parent, which fades and closes the modal. Standalone it stays put and shows a back link. Errors show inline under the button (see Forms) and keep what the visitor typed.
- New page checklist addition: include `<script src="/modal.js" defer></script>` before `</body>` on any page that links to Contact/Invest.
- Adding a third modal form: add its path to `FORMS` in `modal.js` and give that page the same `<head>` script.
- Testing note: the desktop-app browser pane reports itself as hidden, so `<dialog>` `close` events, animations and lazy loading don't run there. Verify with real interaction/JS state checks and headless Chrome screenshots.

## Open to-dos
- **Legal disclaimer + privacy notice (needed):** the Invest form collects investor information (name, contact details, accreditation status, budget) and the Contact form collects contact details. Add a privacy notice/disclaimer, linked from the footer and near the forms (and mention any anti-spam service such as Cloudflare Turnstile if adopted). This wording should be reviewed by someone qualified (attorney/compliance) before publishing — do not draft final legal text without that review.
- **Return-related wording to include in that review:** About page ("...deliver solid returns while adding value...") and Markets page ("Leveraging industry migration for long-term returns."). The homepage meta/Open Graph/JSON-LD description was deliberately made neutral (Sept 2026) — keep public descriptions (site, LinkedIn tagline) free of return claims until reviewed.
- Public generic contact email (not a personal one) and social links (add to the `Organization` JSON-LD `sameAs`).
- Google Search Console: verify and submit `https://www.caspiancapitaltx.com/sitemap.xml` (owner: domain is on the family GoDaddy account).
- Domain/HTTPS: remove the two non-GitHub A records (`76.223.105.230`, `13.248.243.5`) at GoDaddy so the bare domain stops showing a certificate warning, then turn on "Enforce HTTPS" in GitHub Pages settings.
- Optional stronger spam protection ("stage B"): Cloudflare Turnstile (free CAPTCHA alternative) on both forms, verified inside the Apps Script.
- Page copy (SEO phase 2), mobile-friendly before/after images, shared nav across pages, CSS cleanup.

## Favicon
`favicon.svg`, `favicon-32.png`, `favicon-48.png`, `apple-touch-icon.png` live in the site root and are linked in the `<head>` of every HTML page. A new page needs the same four `<link>` tags.

## SEO
Every page's `<head>` has a unique `<title>` (`<Page> | Caspian Capital`, under ~60 chars), a `meta description` (under ~155 chars, only claims the site actually supports), a `canonical` link (always `https://www.caspiancapitaltx.com/...`), Open Graph tags and `twitter:card` (share image: `images/og-image.jpg`, 1200x630, wordmark logo). The homepage also has Organization JSON-LD (logo: `logo-512.png`).
- **New page checklist:** add the tags above (copy from a sibling page), add the URL to `sitemap.xml`, add the four favicon `<link>` tags, use a real `<h1>`.
- **Property detail pages** all share `projects/details.html`; `updateSeoTags()` in `projects/details.js` sets each property's title/description/canonical from its data. A new property in `details.js` also needs a line in `sitemap.xml` (`/projects/details.html?id=<id>`).
- Root files: `robots.txt` (blocks `/CLAUDE.md` and `/tools/`), `sitemap.xml`, `404.html` (uses absolute paths because it is served from any depth; `noindex`; GitHub Pages serves it automatically for missing URLs — Live Server does not).
- Not done yet: public contact email, LinkedIn/social links (`sameAs` in the JSON-LD), Google Search Console submission (owner task; DNS already has a Google verification TXT record), richer page copy.

## Forms (Contact + Invest)
Both forms are plain HTML that submit with `fetch()` (URL-encoded POST) to a Google Apps Script web app, which appends a row to a Google Sheet. There is no other backend.
- Contact: `contact/index.html` (`formType=contact`) → sheet tab `ContactSubmissions`
- Invest: `invest/index.html` (`formType=invest`) → sheet tab `InvestSubmissions`
- Both pages send through the shared `form-submit.js` (`sendForm()`), which is the ONLY place the Apps Script `/exec` URL lives (`SHEET_URL`). Changing it breaks both forms. It also classifies failures and shows an inline `.form-error` message: a JSON `error` reply → "Something went wrong on our end"; no reply / unreadable HTML reply (a rare Google hiccup — the row may still have been saved) → "We couldn't confirm that your submission went through…". Google's reply step is flaky (~1 in 5 replies came back as an HTML error page in a Sept 2026 test even though the row was saved), so `submitToSheet()` **retries once** (after 1.5s, 20s timeout per attempt) when there is no reply or it is unreadable — never when Google answers `error`. **The retry is only safe because `apps-script/Code.gs` ignores an identical submission seen within 10 minutes; if that check is ever removed, remove the retry too or every flaky reply will create a duplicate row.** The button shows "Sending…", is muted and disabled while in flight (extra clicks/Enter are ignored) — deliberately no spinner or busy cursor, typed data is kept on error, and technical details go to the browser console only.
- **Spam protection** (added Sept 2026; the Apps Script `/exec` URL is public, so bots can POST to it directly and skip the website — the real checks therefore live in the Apps Script, source in the git-ignored `apps-script/Code.gs`, see `PRIVATE-NOTES.md`): the site sends two extra fields with every submission — `website` (a hidden honeypot input, `.hp-field`, off-screen and not tabbable; only bots fill it) and `elapsed` (seconds between page load and click). The script scores each submission (honeypot, too fast, gibberish name/message, many-dot Gmail, invalid email, bursts) and diverts suspicious ones to a `Flagged` tab instead of deleting them; exact repeats within 10 minutes are ignored; the sender always gets `success`. Do not remove the honeypot markup or rename `website`/`elapsed`.
- Each form needs `<p class="form-error" role="alert" hidden></p>` inside the `<form>` after the `.submit-button`, plus `<script src="/thank-you.js">` and `<script src="/form-submit.js">` before its inline script.
- The script writes columns **by position**, not header name. Payload keys the script reads: Invest `fullName, email, phone, investorType, timeline, budget, accredited, message`; Contact `name, email, phone, message`.
- The JS reads fields by their HTML `name="..."`. If you rename a field in the HTML, update the JS payload too (a mismatch — `form.accreditedStatus` vs `name="accredited"` — silently broke the Invest form).
- Editing the Apps Script does NOT update the live site: you must Deploy → Manage deployments → edit existing → **New version**. Never "New deployment" (new URL).
- Safe endpoint test that writes no row: POST `formType=probe` and expect `{"result":"success"}`.
- Do not submit test entries to the real forms without telling the owner (they land in the real sheet).
- Sheet link, the Apps Script source, the sheet ID and troubleshooting steps are in `PRIVATE-NOTES.md`. That file is gitignored (local only) — never commit it, and never put the sheet link/ID in public files like this one (this file is served publicly).

## Workflow for changes
1. Edit, then preview locally.
2. Search for stale references (as a separate step, not chained with the push).
3. Ask the owner before committing/pushing — it updates the live site.
4. Stage specific files (`git add <files>`), not `git add .`.
5. After pushing, verify production with curl: changed files return 200 and pages contain the expected tags/paths.
6. Commit messages end with the Co-Authored-By line for Claude.
