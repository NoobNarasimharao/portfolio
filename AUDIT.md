# Portfolio audit — 10 October 2026

## Scope and findings

Inspected the complete application source, public assets, package manifest and lockfile, TypeScript/Vite settings, entry HTML and dependency tree before editing. The existing framework is React 19 + TypeScript 7 + Vite 8. It is a client-only app with no backend, SSR, API, database, client-side path router or production Node requirement.

| Finding | Resolution |
| --- | --- |
| Vite default root base would break project-site assets | Relative default plus actual Pages base path supplied by the workflow; production tested below `/Portfolio/`. |
| Configurable project/profile URLs were rendered directly | Central URL allowlist, safe same-site resume paths, text-only React rendering, explicit noopener/noreferrer on new tabs. |
| No secret ignore rules | Added environment/credential/dependency/build/cache exclusions, keeping example environment files available. |
| Dependencies specified as `latest`, build tools in runtime dependencies | Pinned the already installed versions, moved build tools to dev dependencies and updated existing lockfile metadata without upgrading packages. |
| `_headers` suggested unsupported GitHub Pages security configuration | Removed it; documented hosting limits and added tested production meta CSP with explicit limitations. |
| Canonical and sitemap pointed to `example.com` | Generated only from a configured public site URL. Personal name/description now feed metadata centrally. |
| DOCX unused; resume paths could break under repository URL | File existence gating, validated base-aware PDF preview and PDF/DOCX downloads; isolated fixture verified file delivery. |
| Untyped empty profile/work arrays and work renderer stub | Added useful data types and rendered supplied work entries; preserved missing-content placeholders. |
| Space-key activation missing; modal focus could leave dialog; OS shortcut intercepted | Native keyboard activation, inert modal background and focus restoration, visible outlines; removed Alt+Tab interception. |
| Drag positions lost on state changes; windows could leave screen | Store bounded coordinates in React state, handle pointer cancellation and resizing. |
| Mobile taskbar could be below viewport; minimized apps inaccessible | Dynamic viewport layout, scrolling task buttons, short-screen menu/content scrolling. |
| Nonfunctional personalization switches | Large icons now works; absent sound implementation is represented honestly as off. |
| Missing favicon caused browser 404 | Added a local SVG monitor icon with base-aware URL. |

No `eval`, `new Function`, raw HTML insertion or credentials were found in application source. No sanitizer is needed because user content is never treated as HTML. Initial and final `npm audit` reported **0 vulnerabilities** across the full dependency graph, including build dependencies; no vulnerability-driven upgrade was necessary. This is an advisory database result on the audit date, not a guarantee against future findings.

## Verification

- Node v24.12.0 / npm 11.6.2 used locally; CI selects Node 24 LTS.
- `npm ci`: passed after stopping the pre-existing project Vite process that held a native dependency open on Windows.
- `npm test`: four passing tests covering allowed HTTPS/mail links, malicious schemes/control characters/credentials, repository resume paths, traversal and wrong file formats.
- `npm run build`: TypeScript and static Vite build passed.
- `npm run build -- --base=/Portfolio/`: passed, including generated canonical/social/sitemap metadata with an isolated test URL.
- Final default build tested at both `/` and `/Portfolio/`; relative assets passed at both locations. The final `dist/` contains no synthetic canonical URL or fixture data.
- `npm run check:dist`: verified generated JS/CSS/favicon references, configured link schemes, resume existence, output hygiene and common credential signatures.
- Source security checks: inspected app navigation sinks and scanned source/public files for unsafe execution, raw HTML and common credential patterns.
- Official action tag revisions checked with `git ls-remote`; full SHA pins stored in workflow.
- Existing project GitHub URL: HTTP 200. Actual email/LinkedIn destinations are absent, so no real account links could be tested.
- Headless Microsoft Edge through temporary Playwright: tested a strict static server mounted only at `/Portfolio/`, with no SPA fallback. Refresh, six desktop apps, project folders, Enter/Space, drag/maximize/restore, minimize/taskbar, close, Start, preferences, modal focus, touch and responsive bounds passed. Desktop 1280×800, phones 375×667 and 320×568, and short landscape 740×360 were exercised. Reduced-motion emulation enabled. No console/page errors, failed resources or CSP violations in the verified production build.
- Synthetic resume/profile build in ignored `test-results/`: PDF URL/file delivery and PDF/DOCX downloads succeeded below the subdirectory; HTTPS and email links rendered; a JavaScript URL rendered as unavailable. Real source data was not changed, and fixtures were not published. Synthetic file delivery does not validate a future real resume document's contents or PDF viewer rendering.
- Desktop and mobile screenshots were visually inspected. The blue Windows desktop, title bars, taskbar, folder windows and compact layout remain.
- Context-menu bounds/dismissal, visible keyboard outline and absence of animation under reduced-motion emulation were also checked. The local Vite development server was restored after testing.

Temporary Playwright, screenshots and fixture scripts are local verification artifacts, not portfolio dependencies or deployment output. The built-in browser runtime failed, so these checks used installed Edge instead.

## Remaining limits / user configuration

- This directory had no `.git`, remote, or committed history. History-level secret scanning and repository settings could not be verified. No credentials were found in current files; rotate any previously exposed real secret.
- No repository URL was supplied. No repository was created, pushed or deployed. The workflow is prepared and locally reviewed; its Ubuntu jobs, GitHub permission/environment configuration and live Pages deployment have not run here.
- Add real resume files/profile URLs and replace education placeholders before publication. Existing personal/project information was retained as provided by the codebase, not independently fact-checked.
- The Pages workflow requires `main` and Pages Source set to GitHub Actions. Configure the environment's branch restriction as described in README.
- No custom security response headers or header-level framing policy are claimed. The production meta CSP permits inline styles and has the documented meta-policy limitations.
- Browser checks cover Chromium/Edge. Firefox, Safari, physical devices and a screen reader audit were not run.

## File inventory

Modified: `package.json`, `package-lock.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/styles.css`, `src/data/portfolio.ts`.

Added: `.gitignore`, `.nvmrc`, `.env.example`, `.github/workflows/deploy.yml`, `src/lib/urls.ts`, `tests/urls.test.mjs`, `scripts/check-dist.mjs`, `public/.nojekyll`, `public/favicon.svg`, `README.md`, `AUDIT.md`.

Removed: `public/_headers`, `public/sitemap.xml` (replaced by conditional build output).

Regenerated ignored build output in `dist/`; local ignored verification artifacts in `test-results/`. No `node_modules`, test fixtures or build artifacts belong in the Git repository.
