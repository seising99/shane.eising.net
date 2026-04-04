# shane.eising.net

Personal portfolio site for Shane Eising, built with Astro and Tailwind CSS v4. The current build leans into a late-90s / early-2000s personal-web aesthetic: animated background, marquee messaging, bright panel chrome, and expandable "folder" UI for portfolio samples.

## Stack

- Astro 6
- Tailwind CSS v4 via `@tailwindcss/vite`
- Static pages with a small amount of inline client-side JavaScript for the portfolio folder interactions

## Local Development

```bash
npm install
npm run dev
```

Other available commands:

- `npm run build` builds the site for production
- `npm run preview` serves the production build locally

## Project Structure

- `src/layouts/Layout.astro`: shared page shell, site header/footer, global font includes, and global stylesheet import
- `src/pages/index.astro`: landing page with marquee, featured sections, and retro callouts
- `src/pages/about.astro`: personal bio / creative background
- `src/pages/portfolio.astro`: portfolio overview and project data passed into the folder UI
- `src/pages/contact.astro`: contact links
- `src/components/PortfolioFolders.astro`: expandable folder stack behavior and panel animation logic
- `src/components/PortfolioFolder.astro`: individual folder card and embedded media panel
- `src/styles/globals.css`: Tailwind v4 theme tokens and shared global/component styles
- `src/styles/portfolio-folder.css`: folder card styling
- `src/styles/portfolio-folders.css`: folder stack layout styling
- `assets/`: background and decorative image assets used by the site

## Styling Notes

- Tailwind is configured through Astro's Vite pipeline in `astro.config.mjs`; there is no separate `tailwind.config.*` file in this project.
- Global theme tokens are defined with Tailwind v4 `@theme` in `src/styles/globals.css`.
- Reusable component styles rely on `@layer` and `@apply`.
- Workspace VS Code settings in `.vscode/settings.json` are included to avoid false CSS lint errors on Tailwind-specific directives.

## Deployment Notes

- `public/CNAME` is present for custom-domain hosting.
- `site` is set in `astro.config.mjs` to `https://shane.eising.net`.
