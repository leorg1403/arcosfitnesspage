<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Security standards — non-negotiable

These rules exist because real vulnerabilities have shipped in this repo (client-controlled prices, an open email endpoint). They are hard requirements, not advice. Any code that touches **money, email/external sends, auth, or a public endpoint** must satisfy all of this.

## Threat model: assume every endpoint is hostile
- Every Route Handler (`app/api/**/route.ts`) and every Server Action (`"use server"`) is a **public, unauthenticated HTTP endpoint**. Anyone can hit it with `curl`/Postman — not just your UI. Design for that, not for the happy path.
- Built-in protections are narrow: a Server Action's Origin-vs-Host check stops **browser CSRF only** — it's trivially spoofed by a non-browser client and is **not** auth, validation, or rate limiting.

## Never trust the client (this caused the worst bugs here)
- **NEVER** take a price, amount, total, discount, name, or any financial/identity value from the request body. The client sends an **id**; the server looks it up in the source of truth and derives everything else.
  - Sources of truth: `CLASSES` (`lib/classes.ts`), `PLANS` / `PRE_PAYMENTS` (`lib/memberships.ts`).
  - Past bug: `/api/checkout` used `classMeta.price` from the body → anyone could pay $1 for any class.
- Verify the looked-up entity exists; reject (`404`) if not.

## Validate all input with zod
- Parse the body with a zod schema before use. Give **every** string an explicit `.max()` — no unbounded fields (oversized payloads → DoS, giant emails).
- Keep `serverActions.bodySizeLimit` in `next.config.ts` as small as real payloads allow.

## Rate-limit anything expensive or abusable
- Sending email, creating Stripe sessions, or writing data **must** go through `checkRateLimit()` (`lib/rate-limit.ts`), keyed by IP (`x-forwarded-for` / `x-real-ip`).
- **Know the limit:** the in-memory limiter is defense-in-depth only — on Vercel serverless it resets per instance/cold-start and is **not** a global guarantee. The durable layer is the **Vercel Firewall** (edge rate-limit rules). Code-level limiting does not replace it.

## Email / external sends are amplification vectors
- The recipient (`to`) and the content are attacker-influenced → an open send-endpoint becomes a spam/bombing relay and burns Postmark reputation + quota.
- Mitigations: constrain content to **server-derived** values, rate-limit, and put a honeypot field on public forms (see `ReservaForm`).

## Mutations from the UI → prefer a Server Action over a public Route Handler
- A `"use server"` action gets the built-in Origin/CSRF check for free; a public route does not. Use Route Handlers for third-party callbacks (webhooks) and truly public APIs.

## Webhooks
- Always verify the provider signature before acting (Stripe: `stripe.webhooks.constructEvent`). Never email or mutate on an unverified event.

## Secrets & logs
- Never return secrets or full internal records in responses. Keep sensitive values out of logs.

## Read these before writing security-relevant code
- `node_modules/next/dist/docs/01-app/02-guides/data-security.md`
- `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md` (§Security, §Rate limiting)

## Definition of done (money / email / auth / public endpoint)
1. Input parsed by zod, every string capped with `.max()`.
2. No price/amount/identity from the client — derived server-side from the catalog.
3. Looked-up entity existence checked.
4. Rate-limited; state explicitly whether the durable Firewall layer is still needed.
5. UI mutation uses a Server Action unless there's a documented reason not to.
6. Webhook signatures verified.
7. **Tell the human, explicitly, every endpoint or attack surface you added or exposed** — never expand the public surface silently.
