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

## Favicon
`favicon.svg`, `favicon-32.png`, `favicon-48.png`, `apple-touch-icon.png` live in the site root and are linked in the `<head>` of every HTML page. A new page needs the same four `<link>` tags.

## Forms (Contact + Invest)
Both forms are plain HTML that submit with `fetch()` (URL-encoded POST) to a Google Apps Script web app, which appends a row to a Google Sheet. There is no other backend.
- Contact: `contact/index.html` (`formType=contact`) → sheet tab `ContactSubmissions`
- Invest: `invest/index.html` (`formType=invest`) → sheet tab `InvestSubmissions`
- The Apps Script `/exec` URL is hard-coded in the `<script>` of both pages. Changing it breaks both forms.
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
