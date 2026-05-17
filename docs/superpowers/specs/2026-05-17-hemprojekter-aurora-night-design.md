# Hemprojekter — Aurora Night Theme Design

**Date:** 2026-05-17
**Repo:** `shopify-hemprojekter/`
**Base:** Dawn 15.2.0 (Shopify reference theme)
**Storefront:** [hemprojekter.se](https://hemprojekter.se/)
**Locale:** Swedish (sv) only
**Currency:** SEK

## 1. Goal

Rebuild the storefront for a single-SKU Swedish mini-projector store as a **modern, unique, conversion-focused long-scroll landing page**. The homepage *is* the product page. The aesthetic is "Aurora Night" — dreamy, cosmic, editorial, premium. Built as a polished extension of Dawn (no SPA/headless), shippable as a Shopify theme.

## 2. Scope decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| Catalog scope | **Single hero product** (one SKU, possibly variants) |
| Audience / vibe | **Dreamy / cosmic** — teens & young adults, TikTok-aesthetic |
| Site shape | **Long-scroll landing page** (home = product) |
| Conversion mechanics | **Light/calm-premium** — trust badges, real reviews, FAQ |
| Tech ambition | **Polished Dawn+** (no WebGL/3D/AR) |
| Brand name | "Hemprojekter" |
| Language | Swedish only |
| Visual direction | **Aurora Night** (midnight blue + aurora gradient accents) |
| Sticky add-to-cart bar | Included (`hemprojekter-sticky-buy-bar`) |

## 3. Architecture

- Fork the existing Dawn 15.2.0 already present in this repo. Do **not** replace Dawn — extend it.
- Keep Dawn's section system, schema validation, accessibility patterns, performance baseline, and CSS reset.
- All new sections are namespaced `hemprojekter-*.liquid` so they coexist with Dawn sections and stay easy to identify and remove.
- The homepage (`templates/index.json`) is rewritten to wire up the new sections in order.
- The product page (`templates/product.json`) keeps Dawn's stock product section, restyled via the new color scheme. PDP exists for direct links and SEO; home does the heavy lifting.
- All Swedish copy lives as **section defaults in schema** so the merchant can edit in Shopify admin without touching code.
- Aurora design tokens are emitted as CSS custom properties on `:root` from a new asset file (`hemprojekter-aurora.css`), loaded once from `theme.liquid`.

## 4. Design tokens

### 4.1 Color palette

| Token | Value | Purpose |
|---|---|---|
| `--color-bg` | `#0B1026` | Page background (midnight) |
| `--color-surface` | `#11173A` | Card / elevated surfaces |
| `--color-aurora-1` | `#7CFFCB` | Mint-green aurora glow |
| `--color-aurora-2` | `#A78BFA` | Violet glow |
| `--color-aurora-3` | `#F0ABFC` | Pink highlight |
| `--color-text` | `#F6F7FB` | Primary text |
| `--color-text-muted` | `#9AA3C7` | Secondary text |
| `--color-border` | `rgba(255,255,255,.08)` | Hairlines |

All foreground/background combinations must hit **WCAG AA contrast (4.5:1 for body, 3:1 for large text)**. `--color-text-muted` is the lowest contrast pair and must be verified.

### 4.2 Typography

- Display: **Fraunces** (variable serif, optical sizing). Used for H1/H2 + brand wordmark.
- Body: **Inter** (variable sans). Used for paragraphs, buttons, navigation.
- Micro labels: **JetBrains Mono** (only for kicker labels and trust-bar micro-copy).
- Loaded via Shopify `font_picker` so merchant can swap. Defaults set via `font_face` helper.

### 4.3 Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- All non-essential animation gated behind `@media (prefers-reduced-motion: no-preference)`.
- A theme-settings toggle (`reduce_decorative_motion`) hard-disables decorative animation even when the OS doesn't request it.

## 5. Section inventory

All sections are schema-driven (configurable from the theme editor). Block-based where it makes sense so the merchant can add/remove items.

| # | File | Purpose |
|---|---|---|
| 1 | `sections/hemprojekter-hero-aurora.liquid` | Full-bleed video/poster hero, dual-line serif headline, subhead, primary CTA, Klarna line, secondary "Se demo" anchor, animated aurora gradient overlay (pure CSS, no canvas). |
| 2 | `sections/hemprojekter-trust-bar.liquid` | Thin strip: rating · free shipping · 30-day returns · ships from Sweden. Block-based so merchant can edit individual items. |
| 3 | `sections/hemprojekter-demo-showcase.liquid` | Looping muted autoplay video OR before/after slider (merchant-toggleable in schema). |
| 4 | `sections/hemprojekter-feature-triptych.liquid` | 3 cards (icon + heading + body). Repeating block schema. Icons are inline SVG references. |
| 5 | `sections/hemprojekter-story-block.liquid` | Split image + emotional copy. Two-column desktop, stacked mobile. |
| 6 | `sections/hemprojekter-how-it-works.liquid` | 3 numbered steps with a thin scroll-revealed connector line. |
| 7 | `sections/hemprojekter-reviews-wall.liquid` | Masonry of customer quotes. Static blocks now; emits Product JSON-LD for SEO; designed to swap for Judge.me/Loox later. |
| 8 | `sections/hemprojekter-faq.liquid` | Semantic `<details>` accordion — opens/closes without JavaScript. |
| 9 | `sections/hemprojekter-final-cta.liquid` | Closing aurora-gradient panel, single CTA. |
| 10 | `snippets/hemprojekter-sticky-buy-bar.liquid` | Sticky add-to-cart bar. Bottom-right card on desktop, full-width bottom bar on mobile. Activated via `IntersectionObserver` watching the hero CTA — no scroll listeners. Included from `layout/theme.liquid` so it's available across pages. |

### 5.1 Default section order on `templates/index.json`

```
hemprojekter-hero-aurora
hemprojekter-trust-bar
hemprojekter-demo-showcase
hemprojekter-feature-triptych
hemprojekter-story-block
hemprojekter-how-it-works
hemprojekter-reviews-wall
hemprojekter-faq
hemprojekter-final-cta
```

## 6. Header, footer, PDP

- **Header** (`sections/header.liquid`, modified): minimal — wordmark "Hemprojekter" (Fraunces) on the left, cart icon on the right. No mega-menu, no main nav. Translucent over the hero, becomes solid with `backdrop-filter: blur(12px)` after the hero is scrolled past.
- **Footer** (`sections/footer.liquid`, modified): 3 compact columns — **Hjälp** (Kontakt, Frakt & retur, Spåra order), **Om oss** (Vår historia, Hållbarhet), **Rättsligt** (Integritet, Villkor) — plus a payment-icons row and an inline email signup field. No newsletter popup.
- **PDP**: keep Dawn's stock product section. Restyled by the Aurora color scheme. Exists primarily for direct-link landings and SEO; home is the conversion surface.

## 7. Performance, accessibility, SEO

- Aurora gradient is pure CSS (`conic-gradient`, `radial-gradient`, `filter: blur()`) — no canvas, no Three.js, no extra JS bundle.
- Hero video uses `<video poster preload="metadata" muted autoplay playsinline loop>`. A shorter mobile-specific source is provided. On `prefers-reduced-motion: reduce`, the poster image is shown and the video is not loaded.
- All Dawn lazy-loading and responsive `image_url` filters are retained.
- All text combinations verified at **WCAG AA**.
- Sticky bar uses `IntersectionObserver`, never `scroll` event handlers.
- `<details>`-based FAQ works without JS.
- Product JSON-LD emitted on PDP and inline within the homepage reviews-wall section.
- Open Graph + Twitter Card meta on home; canonical URLs preserved.
- **Lighthouse targets after build: Performance ≥ 90, Accessibility ≥ 95 on mobile.**

## 8. Theme settings & merchant ergonomics

- Add a color scheme preset called **"Aurora Night"** to `config/settings_schema.json` and set as default in `config/settings_data.json`.
- Add a **"Reduce decorative motion"** toggle in the theme settings (overrides the OS media query when on).
- Every new section ships rich schema with sensible Swedish defaults so the merchant can edit copy and swap images in the theme editor without dev help.

## 9. Out of scope (YAGNI)

Explicitly **not** building:

- WebGL / Three.js / AR / 3D model viewer.
- Multi-language i18n beyond Swedish (locales scaffolding remains but only `sv.json` is authored).
- Reviews app integration (Judge.me, Loox, etc.) — static markup now with a clear extension point.
- Heavy conversion mechanics: countdown timers, exit-intent popups, "X people viewing now", post-purchase upsells.
- A redesigned PDP — Dawn's default product section is retained, only restyled.
- Pushing to GitHub. Local commits only; the user pushes.
- Real product photography, video, or copywriting beyond placeholder Swedish defaults.

## 10. Validation strategy

The Shopify Dev MCP is used **during** implementation, not after:

- `mcp__shopify-dev-mcp__validate_theme` — run on the theme folder after each section is added.
- `mcp__shopify-dev-mcp__validate_component_codeblocks` — verify Liquid component snippets.
- `mcp__shopify-dev-mcp__search_docs_chunks` — look up current Liquid filter signatures, schema settings, accessibility patterns when uncertain.

After all sections are built, run a final `validate_theme` pass and resolve any reported issues before committing.

## 11. File-touch summary

**New files**
- `sections/hemprojekter-hero-aurora.liquid`
- `sections/hemprojekter-trust-bar.liquid`
- `sections/hemprojekter-demo-showcase.liquid`
- `sections/hemprojekter-feature-triptych.liquid`
- `sections/hemprojekter-story-block.liquid`
- `sections/hemprojekter-how-it-works.liquid`
- `sections/hemprojekter-reviews-wall.liquid`
- `sections/hemprojekter-faq.liquid`
- `sections/hemprojekter-final-cta.liquid`
- `snippets/hemprojekter-sticky-buy-bar.liquid`
- `assets/hemprojekter-aurora.css`
- `assets/hemprojekter-sticky-bar.js`

**Modified files**
- `templates/index.json` — rewire homepage section order.
- `sections/header.liquid` — minimal layout, translucent-over-hero behaviour.
- `sections/footer.liquid` — 3-column compact footer.
- `layout/theme.liquid` — include Aurora CSS, sticky-bar snippet, font preloads.
- `config/settings_schema.json` — add Aurora color scheme + motion toggle.
- `config/settings_data.json` — set Aurora as default.
- `locales/sv.json` — Swedish copy keys used by new sections.

**Untouched**
- Dawn's existing sections, snippets, assets, and locales — left in place for future use.

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Dawn's CSS cascade fights dramatic redesign | Scope new section CSS to `.hemprojekter-*` class roots; override Dawn tokens at section scope, not globally. |
| Hero video weight on mobile | Mobile-specific shorter source; `preload="metadata"`; poster-only fallback under `prefers-reduced-motion`. |
| Reviews authenticity (static placeholder) | Mark schema clearly; document the swap path to Judge.me/Loox in section comments. |
| Brand-name confusion (domain says "home projects", product is a projector) | Out of scope for this design — brand strategy left to merchant. Theme uses "Hemprojekter" as wordmark only. |
| Long-scroll page weight | All non-hero images lazy; CSS-only animations; no canvas; no parallax JS libraries. |
