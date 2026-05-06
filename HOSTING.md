# Hosting Recommendations

Two solid free paths for a personal site (portfolio + blog) with the Origin Myth Map as a linked project.

---

## Option A: GitHub Pages

**Live URL:** `username.github.io` (or custom domain)
**Cost:** Free for public repos. Private repos require GitHub Pro ($4/mo).

### How it works
Your site is served directly from a GitHub repository. Push to a branch → site updates. No separate hosting account needed.

### Setup (Astro example)
1. Create a repo named `username.github.io`
2. Add a GitHub Actions workflow to build Astro and deploy to the `gh-pages` branch
3. Enable Pages in repo Settings → Pages → Branch: `gh-pages`
4. (Optional) Add a custom domain in the same settings page

For the Origin Myth Map, create a second repo and deploy it to `username.github.io/origin-map` via its own workflow. Set `base: '/origin-map/'` in `vite.config.js`.

### Pros
- Completely free, no credit card ever
- Git-native — deploying is just a `git push`
- Custom domain + free HTTPS (Let's Encrypt) included
- No vendor lock-in — your site is just files in a repo
- Rock-solid reliability (GitHub infrastructure)
- Widely used by ML practitioners and researchers

### Cons
- Static files only — no server-side code (not a problem for your use case)
- Build times can be slow on shared GitHub Actions runners
- Only one root domain per account (`username.github.io`); additional projects go on subpaths
- Requires a GitHub Actions workflow file if not using Jekyll (slight setup overhead)
- No built-in analytics — need a third-party tool (Plausible, GoatCounter, both have free tiers)

---

## Option B: Vercel

**Live URL:** `username.vercel.app` (or custom domain)
**Cost:** Free tier is generous. Paid plans start at $20/mo (not needed for a personal site).

### How it works
Connect your GitHub repo to Vercel. It detects your framework (Astro, Vite, Next.js), builds it automatically, and deploys. Every push to `main` triggers a new deployment. Pull requests get preview URLs.

### Setup
1. Push your personal site repo to GitHub
2. Go to vercel.com → New Project → import repo
3. Vercel auto-detects Astro/Vite — click Deploy
4. For the Origin Myth Map: repeat with its repo, set a custom subdomain (`map.yourdomain.com`) in project settings

### Pros
- Fastest setup — zero config for Astro and Vite projects
- Preview deployments for every PR (great for testing before going live)
- Better build performance than GitHub Actions
- Excellent dashboard — deployment logs, analytics (limited on free tier), domain management
- Subdomain support — `map.yourdomain.com` alongside `yourdomain.com` cleanly
- Custom domain + free HTTPS included

### Cons
- Free tier has a soft limit of 100GB bandwidth/mo (more than enough for a personal site)
- Slight vendor dependency — migrating away requires reconfiguring CI/CD
- Commercial platform — free tier terms can change (GitHub Pages has been free for a decade+)
- Overkill feature-wise for a simple static site

---

## Side-by-side comparison

| | GitHub Pages | Vercel |
|---|---|---|
| Cost | Free (public repos) | Free tier |
| Custom domain | ✓ | ✓ |
| HTTPS | ✓ | ✓ |
| Auto-deploy on push | ✓ (via Actions) | ✓ (native) |
| Preview deployments | ✗ | ✓ |
| Setup complexity | Low (needs workflow file) | Very low (zero config) |
| Build speed | Moderate | Fast |
| Vendor lock-in | Minimal | Moderate |
| Longevity/stability | Very high | High |
| Used by ML community | Very common | Less common |

---

## Recommendation

**Start with GitHub Pages** if you want the simplest, most stable, zero-cost setup with no dependencies beyond GitHub — which you're already using. It's the standard choice for ML practitioners and researchers.

**Choose Vercel** if you want a smoother developer experience, faster builds, and the preview-URL workflow (useful if you iterate on the site frequently).

Either way:
- Buy a domain (~$12/yr on Namecheap or Cloudflare Registrar)
- Host the personal site at the root domain
- Host the Origin Myth Map as a subpath or subdomain
- Use Markdown files in the repo for blog posts (no CMS needed to start)
