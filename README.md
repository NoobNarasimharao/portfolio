# Windows desktop portfolio

The existing Vista/Windows 7 inspired portfolio uses React, TypeScript and Vite. It builds to static HTML, CSS, JavaScript and public assets in `dist/`. Node.js is **only a development/build dependency**: GitHub Pages serves the files without a Node server, database, API or SSR.

## Local development

Install Node.js **24 LTS** (also specified in `.nvmrc`), then run from this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Stop the development server before reinstalling packages on Windows: loaded native build modules can otherwise cause `EPERM` errors.

```sh
npm test
npm audit
npm run build
npm run check:dist
npm run preview
```

`npm run build` checks TypeScript and generates `dist/`. `preview` is only a local verification server. Upload **only `dist/`**, never the source tree or `node_modules`. Keep `package-lock.json` committed and use `npm ci` in CI. Build tools are dev dependencies; React and React DOM are the only direct runtime dependencies. Versions retain the existing audited lockfile versions.

## Personal content

Edit `src/data/portfolio.ts` for the name, introduction, education, projects, profiles, work and resume filenames. Existing content has been preserved. Missing education details remain placeholders; no experience, clients, certifications or links were invented. The page title and description are generated from this data, including social metadata.

- Project `github` and optional work `url`: public HTTPS links.
- Profiles: `{ platform: 'LinkedIn', username: 'Your name', url: 'https://www.linkedin.com/in/YOUR_PROFILE/' }`. Replace the placeholder with your real URL. Email profiles can use a single `mailto:you@example.com` address, without query parameters.
- Invalid URLs render as unavailable. HTTP, JavaScript, data, file, credential-bearing URLs and mail header/query injection are rejected. Text is rendered through React; no HTML or code from portfolio data is executed.
- Work entries accept `title`, `organization`, `period`, `description`, and optional `url`.
- Public resume files belong in `public/resume/`. Create this directory when adding them. Set `resume.pdf` to `resume/Your-Resume.pdf` and/or `resume.docx` to `resume/Your-Resume.docx`. Use simple ASCII filenames with letters, numbers, dots, hyphens and underscores. Rebuild after adding files. A PDF can be opened and downloaded; DOCX can be downloaded. Only files present at build time produce buttons. The output check rejects a configured missing file.

Leave absent values empty. The original project URL was reachable during the audit. No real resume, LinkedIn URL or email address has been supplied. Synthetic browser-test fixtures are ignored and excluded from deployment.

## GitHub Pages deployment

1. Create your GitHub repository. This local directory was not a Git repository when audited; no remote or history was available. Review the content before making it public.
2. Commit the source, `package.json`, **`package-lock.json`**, README and `.github/workflows/deploy.yml` to a branch named `main`. The `.gitignore` excludes dependencies, output, local environment files, credentials and test artifacts. If initializing locally, use `git init -b main`, inspect `git status --short`, then stage only intended files, commit, add your actual remote and push `main`.
3. In the GitHub repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Settings → Environments → github-pages** and restrict deployment branches to `main`. Leave any desired reviewer protection enabled.
5. Push to `main` or run **Actions → Deploy portfolio to GitHub Pages → Run workflow** on `main` after Pages is enabled.
6. Wait for both build and deploy jobs to succeed. Open the URL in the deployment environment or Settings → Pages. Enable **Enforce HTTPS** in Settings → Pages when available.

The complete workflow is `.github/workflows/deploy.yml`. It uses full commit SHA pins for official GitHub Actions, Node 24, `npm ci`, a full dependency audit, security tests, the production build and output checks. It uploads only `dist/`. Build has read-only repository permissions; only the separate deploy job receives `pages: write` and `id-token: write`. No personal access token or repository secret is needed. It never deploys pull-request code and manual runs on other branches are skipped. A future audit advisory deliberately blocks deployment until assessed.

The Pages action supplies the actual site URL and base path. Thus a project site such as `https://USERNAME.github.io/REPOSITORY/` builds with `/REPOSITORY/`; an account site or configured custom domain builds at its configured path. The repository name is not hardcoded. Canonical, `og:url` and sitemap URLs are generated only when a real `SITE_URL` is available.

For a local repository-path check (replace `REPOSITORY`):

```sh
npm run build -- --base=/REPOSITORY/
npm run check:dist
npm run preview -- --base=/REPOSITORY/
```

Visit `http://localhost:4173/REPOSITORY/` (or the port Vite prints). The default build uses relative assets and also works below a directory. Desktop windows use React state and do not change URL paths, so refresh stays at the site's entry point; no history-router fallback or hash-router dependency is necessary. If adding URL routes later, use hash routing or generate real static pages.

To set canonical metadata for a manual build, copy `.env.example` to `.env.local`, set `SITE_URL` to your complete public HTTPS URL including repository path, and build with the matching `--base`. Do not leave an example domain in production. The workflow supplies `SITE_URL` itself, so this file is unnecessary for Actions.

## Security and hosting limits

Everything in a public repository and everything in `public/` or the compiled frontend is public. Frontend environment variables (including all `VITE_*` values) **cannot store secrets**. `SITE_URL` is public metadata, not a credential. Do not put private documents, API keys, passwords, tokens or certificates in the site. `.gitignore` does not remove files already tracked. If a real credential was ever committed, revoke/rotate it and assess history cleanup: deleting the current file is insufficient. No credentials were found in the inspected project, but there was no Git history to inspect.

GitHub Pages supports HTTPS and HTTPS enforcement. It does **not** interpret the former `_headers` file or expose arbitrary custom response-header configuration. That ineffective file was removed. This project does not claim to set server-side `X-Content-Type-Options`, `Permissions-Policy`, HSTS or frame restrictions. Those require hosting/proxy support if you need custom values.

A production-only **HTML meta CSP**, placed before assets, restricts scripts/connections/fonts to this site, disallows plugins and form submissions, and restricts the base URL. Inline styles remain allowed because window positions and React styles need them; inline scripts are not allowed. The policy was tested in the production browser build. Development omits it for Vite hot reload. This meta policy is **not equivalent to a response header**: it cannot set `frame-ancestors`, CSP reporting or sandbox protections, and only takes effect after parsing the tag. The referrer meta policy likewise is not a custom server header. If adding external fonts, images, APIs or embeds, review the policy and retest rather than broadly disabling it.

No analytics, tracking scripts, forms, sensitive information collection or external font/image downloads are included. Appearance uses CSS and system fonts/emoji. See `AUDIT.md` for findings, verification and remaining limits.

## Desktop use and accessibility

Double-click desktop/project icons with a mouse; tap on touchscreens; use Enter or Space from the keyboard. Windows support dragging, close, minimize, maximize and taskbar restoration. On small screens, windows fill the available area above the taskbar; minimized apps remain reachable. Start is keyboard-accessible. Escape dismisses menus/dialogs. The message dialog keeps focus within it and returns focus to Start. Focus indicators and reduced-motion styles are included; OS Alt+Tab is left to the operating system. Large icons is a working session preference; sounds remain off.

## References

- [Vite: static deployment and GitHub Pages base paths](https://vite.dev/guide/static-deploy.html)
- [GitHub: custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub: HTTPS for Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [MDN: CSP and meta policy limitations](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [Node.js release support](https://nodejs.org/en/about/previous-releases)
