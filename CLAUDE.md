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
- Thumbnails are referenced in both `projects/index.html` and `projects/details.js`. Search the whole repo (html, css, js) for the old path before renaming any image.

## Favicon
`favicon.svg`, `favicon-32.png`, `favicon-48.png`, `apple-touch-icon.png` live in the site root and are linked in the `<head>` of every HTML page. A new page needs the same four `<link>` tags.

## Workflow for changes
1. Edit, then preview locally.
2. Search for stale references (as a separate step, not chained with the push).
3. Ask the owner before committing/pushing — it updates the live site.
4. Stage specific files (`git add <files>`), not `git add .`.
5. After pushing, verify production with curl: changed files return 200 and pages contain the expected tags/paths.
6. Commit messages end with the Co-Authored-By line for Claude.
