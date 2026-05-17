# Hemprojekter — Aurora Night Shopify theme

A Dawn 15.2.0 fork redesigned as a single-product long-scroll storefront for
[hemprojekter.se](https://hemprojekter.se/), built around the "Aurora Night"
design language: midnight-blue background, aurora gradient accents, editorial
serif typography, calm-premium conversion mechanics.

## Local development

    shopify theme dev --store=<your-store>.myshopify.com

## Structure

- `assets/hemprojekter-aurora.css` — design tokens, fonts, base utilities
- `assets/hemprojekter-sticky-bar.js` — sticky-bar IntersectionObserver
- `sections/hemprojekter-*.liquid` — Aurora sections (hero, trust bar, demo,
  features, story, how-it-works, reviews, FAQ, final CTA)
- `snippets/hemprojekter-sticky-buy-bar.liquid` — floating add-to-cart bar
- `templates/index.json` — homepage wired to use the Aurora sections
- `docs/superpowers/specs/` — design spec
- `docs/superpowers/plans/` — implementation plan

Unchanged Dawn sections, snippets, and assets are retained so the theme remains
a valid Dawn fork that can pull upstream updates with manageable conflicts.

## Theme settings

In the Shopify admin, **Customize → Theme settings → Hemprojekter — Aurora**:

- *Reducera dekorativa animationer* — force-off all decorative motion.
- *Produkt för sticky-knappen* — the product shown in the floating CTA bar.

## Deployment

This repo is intended to be pushed via Shopify CLI or
GitHub-integrated theme deployment. The theme has been verified with
`shopify theme check` (via the Shopify Dev MCP `validate_theme` tool); any
remaining warnings on `layout/theme.liquid` are pre-existing Dawn / jsdelivr
asset references unrelated to the Aurora redesign.
