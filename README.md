# Lawn care master template

One shared, responsive website; a JSON file for each business. Two fictional examples are included: **Green Acres** (green / lime) and **Juniper Yard Co.** (slate / peach). The root homepage uses Green Acres; each business also has its own directory URL. All previews are clearly labeled unofficial demonstrations, with `noindex, nofollow, noarchive`. They are publicly accessible, not private.

## Preview and test

Use Node.js 24 (Node 22+ supported).

```sh
npm ci --ignore-scripts
npm run dev
```

The server listens on port 4173 and serves the project under `/lawn-care-templates/`, including `/lawn-care-templates/green-acres/` and `/lawn-care-templates/juniper-yard/`. It builds at startup; restart it after changing source or configuration. Generated files go to ignored `dist/`.

```sh
npm test
npx playwright install --with-deps chromium
npm run test:browser
npm run build
```

If Chromium is already installed, use `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`. Browser tests start and stop their own server on port 4173, so stop the development server first. Screenshots are saved in ignored `.test-output/`. The production site has no runtime npm dependencies, external fonts, tracking, or database.

## Rebrand in five minutes

1. Copy `businesses/green-acres.json` to `businesses/your-business.json`.
2. Give it a unique lowercase, hyphenated `slug` (this becomes its URL directory).
3. Edit `name`, `descriptor`, `tagline`, `description`, `primaryColor` and `secondaryColor`. Colors require six-digit hex values. Choose readable brand colors; verify contrast before delivery. `\n` in the tagline creates a deliberate line break.
4. Set phone, email, hours and service areas. Missing phone/email/logo/hours/socials are hidden. Both samples deliberately omit invented contact details.
5. Edit services, benefits, gallery and booking. Run the checks, then open a pull request. No layout edits are needed.

Add your logo and properly licensed photography under `assets/`. Configuration paths start with `assets/`, **without a leading slash**, so they work inside GitHub Pages project directories. Set `logo` to `""` for the default botanical mark. Change `heroImage`, `heroAlt`, and gallery image paths/alt text. See [asset provenance](assets/LICENSE.md): the included generated garden illustration is a placeholder, not an actual project photograph. It appears with different crops; replace it with a varied licensed portfolio for commercial delivery. The hero and gallery labels deliberately disclose demonstration imagery.

Arrays may be empty. No gallery/comparisons, services, FAQs, or verified testimonials means that section and its relevant navigation links are hidden. `trustIndicators` accepts operator-supplied, truthful strings; do not invent credentials. `socials` contains `{ "label": "Instagram", "url": "https://..." }` objects. Reviews require `{ "name": "Consenting customer", "quote": "Verified words", "verified": true }`; use only verified, authorized testimonials. The two sample businesses have none.

For before/after sliders, add a `comparisons` entry:

```json
{
  "title": "Garden refresh",
  "before": "assets/before.webp",
  "after": "assets/after.webp",
  "beforeAlt": "Garden before the work",
  "afterAlt": "Garden after the work",
  "caption": "Licensed demonstration pair; not a customer project"
}
```

Use images from the same viewpoint. The slider supports keyboard arrows and a labeled range control. Only represent images as actual work when authorized and accurate.

## Booking modes

Change the `booking` object in a business JSON file:

- **Demo** (default): `{ "mode": "demo", "url": "", "endpoint": "" }`. Use fictional details. Validation runs locally; submission resets the form and explicitly says nothing was sent or booked. No request, cookie, local storage or session storage is created by the form. No customer data is collected by this application. Visitor browser behavior and hosting access logs are outside application control.
- **External**: `{ "mode": "external", "url": "https://your-scheduler.example/booking" }`. All booking/quote CTAs link to that provider; the form is hidden. The provider owns scheduling, availability and confirmation. Demo labeling still applies to this prospect preview.
- **Request**, **only after sale and provider setup**: `{ "mode": "request", "endpoint": "https://your-form-provider.example/form-id" }`. Configure an HTTPS service such as Formspree to accept cross-origin `FormData` POST requests and return a JSON-compatible success HTTP response. Activate and verify the provider’s recipient address, CORS, domain restrictions, spam protection, limits and delivery. The website handles pending, failure and success states, but an HTTP success establishes provider acceptance only, not email delivery or an appointment confirmation. Manually confirm every appointment. Never put API secrets in this public configuration.

Before enabling real requests, establish the business’s consent, publish an appropriate privacy notice and retention policy, review the provider agreement, use authorized contact information, and test delivery end to end with that business. This project intentionally remains an unofficial prospect demonstration; an approved production launch and removal/adaptation of demo labels/no-index is a separate deliberate change. No live provider has been configured or tested in the supplied examples.

## GitHub review and automatic publication

`.github/workflows/pages.yml` validates pull requests. Pushes to `main` and manual workflow runs validate and then deploy `dist/` with the official Pages actions. It uses GitHub’s short-lived deployment token; no repository secrets are needed. It does **not** deploy unapproved pull requests.

One-time repository administrator action, if not already configured:

1. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as Source.
2. Ensure Actions are enabled and repository/organization policy permits the workflow’s `pages: write` and `id-token: write` permissions. Check any protection rules for the `github-pages` environment. Pages availability for private repositories depends on the GitHub plan.
3. Review and merge the implementation pull request into `main`.
4. Inspect **Actions → Validate and deploy previews**, confirm validation and deployment succeed, then open the URL emitted by `actions/deploy-pages` and check both brand directories and images. Report a public URL only after this check.

Every subsequent approved merge republishes all configurations. The same shared assets are used by each business directory; no source-code duplication. All internal assets are relative, so no fixed GitHub account or domain is built into the output. `dist/` is an artifact, not committed source. The local server intentionally emulates this repository’s project prefix.

## Verified locally

Build/config tests cover generated routes, no-index, relative assets, required booking endpoints, colors, local image paths and verified-only reviews. Chromium tests exercise desktop and mobile layouts for both brands, navigation, loaded images, optional content, form validation, demo submission without network/storage, external booking, mocked provider success/failure, the before/after control, and reduced motion. Mocked provider tests do not prove real delivery. CI runs the same checks before deployment.
