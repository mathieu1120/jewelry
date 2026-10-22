# Repository Guidelines

## Agent Operating Rules

- Investigate the request and relevant existing code before proposing changes.
- For non-trivial development tasks, present an implementation plan before changing files. Where meaningful design or implementation tradeoffs exist, present 2–3 options, explain their tradeoffs, and recommend one.
- Stop and explicitly ask the user to approve the plan or choose an option. Do not modify implementation files until the user explicitly approves; the initial task request alone is not plan approval.
- After approval, implement the chosen plan autonomously, run appropriate verification, and fix problems caused by the implementation. Seek renewed approval if meaningful changes to the approved scope or design become necessary.
- Review the resulting diff for correctness, security, and unintended changes before reporting completion.
- Trivial changes where planning adds no meaningful value do not require a formal plan or approval step.
- Make the smallest change necessary for the requested task; do not refactor unrelated code.
- Add dependencies only when necessary to complete the task.
- After an approved implementation is complete, verification has finished, and the resulting diff has been reviewed, if the change is ready, explicitly ask the user whether you may commit and push it.
- Do not commit or push until the user explicitly approves those actions. Approval of an implementation plan does not authorize committing or pushing.
- Do not modify production data or external services unless explicitly requested.

## Project Structure & Module Organization

This is a Next.js 14 App Router storefront using TypeScript, Firebase, Stripe, and Shippo.

- `src/app/`: storefront, product details, checkout success, and admin pages; `api/` contains checkout, Stripe webhook, and shipping-label handlers.
- `src/components/shop/` and `src/components/admin/`: reusable customer and admin UI.
- `src/lib/`: Firebase client/Admin initialization, database helpers, storage uploads, Stripe setup, and utilities.
- `src/hooks/`: admin authentication hook; `src/types/index.ts`: shared domain types.
- `src/app/globals.css` and `tailwind.config.ts`: global styling and theme configuration. Product images use Firebase Storage.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: start development at `http://localhost:3000`; admin lives at `/admin`.
- `npm run build`: compile the production application and check types.
- `npm start`: serve the production build.
- `npm run lint`: invoke Next.js ESLint; no ESLint configuration is currently checked in, so initial setup may be required.
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe`: forward development payment events; configure the emitted signing secret locally.

## Manual Production Deployment

- Work directly on `main`; committing and pushing to GitHub must not automatically deploy production. Keep the Vercel project's Git integration disconnected. Do not reconnect it or add automatic deployment triggers without explicit approval.
- Commit/push approval does not authorize deployment. Deploy only when the user explicitly requests deployment or says "sync production"; that request authorizes the deployment without another routine confirmation.
- "Sync production" means deploy the latest committed and pushed GitHub `main`, resolved to a specific commit SHA. Use a clean temporary checkout of that SHA; exclude uncommitted changes, local environment files, and local data. Do not implicitly commit or push outstanding work.
- Review changes since the last production deployment and run appropriate verification with isolated test configuration. Stop and report material failures or missing required production configuration before deploying.
- Authenticate the Vercel CLI and link the clean checkout to the existing `jewelry` project in the verified `mathieu1120s-projects` scope. Confirm project identity before any deployment; do not create a replacement project.
- Run `vercel deploy --prod` from that checkout, using the existing project's Production environment variables and remote build. Do not copy `.env.local`, promote a preview build, or sync production data.
- Wait for deployment completion, verify production domain assignment and safe storefront pages, and report the deployed SHA, URL, verification results, and remaining risks. Do not purchase labels or perform real checkouts as smoke tests.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, double quotes, and semicolons, matching existing files. Use PascalCase for components and types, camelCase for functions and variables, and `use` prefixes for hooks. Follow App Router filenames (`page.tsx`, `layout.tsx`, `route.ts`) and use `@/` imports for modules under `src/`. Keep shared types in `src/types/` and monetary amounts in integer cents. Use Tailwind utilities and existing global styles. Keep server credentials and Firebase Admin imports out of client components.

## Verification

No automated test framework, test script, or coverage threshold is configured.

- Run the narrowest relevant checks first. Run `npm run build` before considering implementation work complete when practical; report if skipped and why.
- Run lint when configured and relevant. Do not treat the existing lint script as evidence that ESLint is configured.
- For UI changes, verify affected responsive states and storefront/admin flows.
- For payment, webhook, authentication, Firebase, or shipping changes, explicitly report what was and was not tested. Cover affected stock availability, checkout, webhook order creation, and shipping-label behavior using development credentials, subject to the external-service restriction above.
- Never claim a check passed unless you actually ran it.

## Change Reporting

At the end of implementation tasks, summarize what changed, the files changed, commands/checks run and their results, and remaining risks or unverified behavior.

## Commit & Pull Request Guidelines

History uses short, lowercase descriptions such as `fix empty description in stripe checkout`; follow this concise, action-oriented style. Pull requests should describe behavior changes, link relevant issues, list validation performed, and include screenshots for UI changes. Call out environment or service configuration changes.

## Security Invariants & Configuration

- Client-side admin route protection (`src/hooks/useAdminAuth.ts`) is not server authorization.
- Privileged API routes must independently authenticate and authorize callers; do not rely on client redirects or hidden UI.
- Firebase Admin bypasses Firestore client security rules; server code must enforce access controls.
- Never expose server credentials or Firebase Admin imports to client components.
- Never log secrets, credentials, payment information, or customer personal data.

Configure ignored `.env.local` using variables referenced in `src/lib/`, API handlers, and the README. No environment template is checked in. Never commit service-account credentials, secret API keys, or customer data. Reserve `NEXT_PUBLIC_` variables for browser-visible configuration.
