# EliteDevs Project Hub

Unified static portfolio site for projects by DH4410 and Zoande.

## What This Site Does

- Renders homepage project cards from a single data source.
- Provides one detail page per project under `projects/`.
- Shows repository links, stage/status, tech stack, and roadmap items.
- Shows a live app launch button when `liveUrl` is configured.

## Recent Updates (April 2026)

- Fixed oversized tech stack chips by correcting base `.chip` styling in `styles.css`.
- Updated branding behavior:
	- Navbar uses `full_logo_nobg.png`.
	- Browser tab icon uses `small_logo_nobg.png`.
- Improved initial page load scroll behavior in `index.html`:
	- Uses manual scroll restoration.
	- Forces top-of-page load when no hash is present.
- Replaced broken legal footer links with explicit "Coming Soon" labels.
- Updated contact CTA text to "Open in Outlook" while keeping `mailto` behavior.
- Removed confirmed-unused assets and pages:
	- `play/`
	- `styles-new.css`
	- `styles-premium.css`
	- `logo.png`
	- `projects/dh-brokersim.html`

## Current Structure

- `index.html` homepage with hero, stats, and featured project cards.
- `about.html` and `contact.html` supporting pages.
- `projects/*.html` detail pages keyed by `data-project-id`.
- `data/projects.js` canonical metadata source (`window.PROJECTS`).
- `scripts/home.js` homepage renderer (curates featured projects).
- `scripts/project.js` detail-page hydrator and live-link logic.
- `styles-premium-light.css` active theme overrides.
- `styles.css` base design system and shared components.
- `vercel.json` static rewrite config (`/` -> `/index.html`).

## Project Rendering Model

- `scripts/home.js` reads `window.PROJECTS` and shows a curated featured set (currently 8 cards).
- Each card links to `projects/<id>.html` where `<id>` is from `data/projects.js`.
- `scripts/project.js` resolves `document.body.dataset.projectId` against `window.PROJECTS`.
- If `liveUrl` is missing, the detail page shows a disabled "Live App (Soon)" action.

## Local Preview

Any static server works. Example:

```powershell
npx serve .
```

Open the local URL shown in terminal.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Keep static defaults.
4. Deploy.

## Maintenance Workflow

1. Add or edit project metadata in `data/projects.js`.
2. Ensure a matching detail page exists at `projects/<id>.html`.
3. Set `liveUrl` when deployment exists; leave unset to show "Live App (Soon)".
4. Keep asset references consistent with root branding files.

## Known Intentional Placeholders

- Privacy Policy and Terms of Service are marked "Coming Soon".
- Twitter and LinkedIn footer links are marked "Coming Soon".
- Contact submission is client-side `mailto` (no backend form processing).
