# Hemprojekter Aurora Night Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Frontend polish:** When writing Liquid markup and section CSS, executing agents/subagents should invoke `frontend-design:frontend-design` so the visual output meets the Aurora Night design quality bar (no generic AI aesthetics).
>
> **Validation:** Shopify themes have no traditional unit-test framework. The plan substitutes `mcp__shopify-dev-mcp__validate_theme` and visual checks for tests. Each task ends with a validation step and a commit.

**Goal:** Rebuild the Hemprojekter Shopify storefront (Dawn 15.2.0 fork) into a single-product long-scroll landing page with the "Aurora Night" design language: midnight-blue background, aurora gradient accents, editorial serif typography, calm-premium conversion mechanics.

**Architecture:** Fork-and-extend Dawn. Add namespaced `hemprojekter-*` sections, override `templates/index.json`, restyle `header.liquid` / `footer.liquid`, add an Aurora color scheme + design-token CSS file, wire one sticky-buy-bar snippet from `theme.liquid`. PDP retains Dawn's stock product section. No JS framework, no headless, no WebGL.

**Tech Stack:** Liquid, Shopify section schema, CSS custom properties, `IntersectionObserver` for the sticky bar. Fonts: Fraunces (display serif), Inter (body), JetBrains Mono (micro). No build step.

**Spec:** [docs/superpowers/specs/2026-05-17-hemprojekter-aurora-night-design.md](../specs/2026-05-17-hemprojekter-aurora-night-design.md)

**Existing assets to reuse** (already in this Shopify store):
- Product handle: `mini-projektor-720p`
- Images (shop_images): `IMG_9060_c4878ca5-2434-4e04-a448-b27f2da1bdc9.jpg`, `IMG_9064_298b9991-44e6-42a9-be14-745a60679f80.jpg`, `IMG_9062_66de6bb6-e6b0-4bca-9f09-41decd96076b.jpg`, `IMG_9061.jpg`, `D8D5747B-5F32-406F-AEBE-C7D32CF55924.png`
- Existing Swedish copy can be carried into new section defaults verbatim where it fits.

---

## File Structure

**New files**

| Path | Responsibility |
|---|---|
| `assets/hemprojekter-aurora.css` | Aurora design tokens (CSS custom properties), font-face fallbacks, shared utilities (.hp-container, .hp-button, .hp-kicker), motion-reduce rules. |
| `assets/hemprojekter-sticky-bar.js` | Single `IntersectionObserver` that toggles a `.is-visible` class on the sticky-buy-bar element when the hero CTA leaves the viewport. |
| `sections/hemprojekter-hero-aurora.liquid` | Hero. Markup + scoped CSS in `{% stylesheet %}` + schema. |
| `sections/hemprojekter-trust-bar.liquid` | Trust strip. |
| `sections/hemprojekter-demo-showcase.liquid` | Demo video / before-after. |
| `sections/hemprojekter-feature-triptych.liquid` | Three feature cards. |
| `sections/hemprojekter-story-block.liquid` | Split image + copy. |
| `sections/hemprojekter-how-it-works.liquid` | Three numbered steps. |
| `sections/hemprojekter-reviews-wall.liquid` | Masonry of customer quotes + JSON-LD. |
| `sections/hemprojekter-faq.liquid` | `<details>` accordion. |
| `sections/hemprojekter-final-cta.liquid` | Closing CTA panel. |
| `snippets/hemprojekter-sticky-buy-bar.liquid` | Sticky bar markup, included from `theme.liquid`. |

**Modified files**

| Path | What changes |
|---|---|
| `layout/theme.liquid` | Preload Aurora fonts, link `hemprojekter-aurora.css`, render `hemprojekter-sticky-buy-bar` snippet, load `hemprojekter-sticky-bar.js`. |
| `sections/header.liquid` | Replaced with minimal wordmark + cart icon, translucent-over-hero behaviour. (Heavy edit; will replace the Liquid markup of the section while keeping the file name.) |
| `sections/footer.liquid` | Replaced with compact 3-column footer + payment icons. |
| `templates/index.json` | Rewire homepage to use new sections in order. |
| `config/settings_schema.json` | Add Aurora color scheme + `reduce_decorative_motion` toggle. |
| `config/settings_data.json` | Set Aurora scheme as default. |

**Untouched:** all other Dawn sections, snippets, assets, and locale files remain so the theme is still a valid Dawn fork.

---

## Task 1: Foundation — Aurora design tokens, fonts, theme.liquid wiring

Establish the design system before any sections exist: color tokens, font-faces, motion rules, and load everything from `theme.liquid`.

**Files:**
- Create: `assets/hemprojekter-aurora.css`
- Modify: `layout/theme.liquid` (inside `<head>`, after the existing stylesheet links)
- Modify: `config/settings_schema.json` (add motion toggle)
- Modify: `config/settings_data.json` (no schema change yet — preset stays Dawn-default; we set Aurora as the homepage section color scheme per-section)

- [ ] **Step 1.1: Read `layout/theme.liquid` to find the head insertion point**

Use Read on `layout/theme.liquid`. Locate the line that links `base.css` (around the top of `<head>`). The Aurora CSS link goes immediately after it.

- [ ] **Step 1.2: Create `assets/hemprojekter-aurora.css`**

Write this file:

```css
/* Hemprojekter — Aurora Night design tokens, fonts, base utilities. */

@font-face {
  font-family: "Fraunces";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("https://fonts.gstatic.com/s/fraunces/v32/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk.woff2") format("woff2");
}

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.woff2") format("woff2");
}

@font-face {
  font-family: "JetBrains Mono";
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url("https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2") format("woff2");
}

:root {
  /* Color tokens */
  --hp-bg: #0B1026;
  --hp-surface: #11173A;
  --hp-surface-2: #161E4D;
  --hp-aurora-1: #7CFFCB;
  --hp-aurora-2: #A78BFA;
  --hp-aurora-3: #F0ABFC;
  --hp-text: #F6F7FB;
  --hp-text-muted: #9AA3C7;
  --hp-border: rgba(255, 255, 255, 0.08);
  --hp-border-strong: rgba(255, 255, 255, 0.16);

  /* Typography */
  --hp-font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --hp-font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --hp-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  /* Motion */
  --hp-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --hp-dur-fast: 180ms;
  --hp-dur-med: 380ms;
  --hp-dur-slow: 720ms;

  /* Layout */
  --hp-radius: 16px;
  --hp-radius-lg: 28px;
  --hp-container: min(1200px, 92vw);
  --hp-section-pad-y: clamp(64px, 9vw, 128px);
}

/* When the homepage uses Aurora, paint the document. */
body.template-index,
body.hp-aurora {
  background: var(--hp-bg);
  color: var(--hp-text);
  font-family: var(--hp-font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.hp-container {
  width: var(--hp-container);
  margin-inline: auto;
}

.hp-kicker {
  font-family: var(--hp-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--hp-aurora-1);
}

.hp-display {
  font-family: var(--hp-font-display);
  font-weight: 350;
  font-optical-sizing: auto;
  letter-spacing: -0.02em;
  line-height: 1.04;
  color: var(--hp-text);
}

.hp-body {
  font-family: var(--hp-font-body);
  color: var(--hp-text-muted);
  line-height: 1.6;
}

.hp-button {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.95em 1.6em;
  font-family: var(--hp-font-body);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: transform var(--hp-dur-fast) var(--hp-ease),
              box-shadow var(--hp-dur-med) var(--hp-ease),
              background-color var(--hp-dur-med) var(--hp-ease);
}

.hp-button--primary {
  background: linear-gradient(120deg, var(--hp-aurora-2), var(--hp-aurora-3));
  color: #0B1026;
  box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.6);
}

.hp-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 60px -12px rgba(167, 139, 250, 0.6);
}

.hp-button--ghost {
  background: transparent;
  color: var(--hp-text);
  border-color: var(--hp-border-strong);
}

.hp-button--ghost:hover {
  border-color: var(--hp-aurora-1);
  color: var(--hp-aurora-1);
}

.hp-aurora-bloom {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.hp-aurora-bloom::before,
.hp-aurora-bloom::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  mix-blend-mode: screen;
}

.hp-aurora-bloom::before {
  width: 60vw;
  height: 60vw;
  left: -10vw;
  top: -10vw;
  background: radial-gradient(circle, var(--hp-aurora-2) 0%, transparent 60%);
}

.hp-aurora-bloom::after {
  width: 50vw;
  height: 50vw;
  right: -8vw;
  bottom: -12vw;
  background: radial-gradient(circle, var(--hp-aurora-1) 0%, transparent 60%);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

body.hp-reduce-motion *,
body.hp-reduce-motion *::before,
body.hp-reduce-motion *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}
```

- [ ] **Step 1.3: Modify `layout/theme.liquid` — add Aurora CSS, font preconnect, motion class**

Inside `<head>`, after the existing `base.css` link, add:

```liquid
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  {{ 'hemprojekter-aurora.css' | asset_url | stylesheet_tag }}
```

On the `<body>` tag, add the Aurora body class and the reduce-motion class driven by the theme setting:

```liquid
<body class="gradient{% if settings.hp_reduce_decorative_motion %} hp-reduce-motion{% endif %} hp-aurora">
```

(Find the existing `<body>` line — Dawn's Dawn 15.2.0 has `<body class="gradient{% if settings.animations_hover_elements != 'none' %} animate--hover-{{ settings.animations_hover_elements }}{% endif %}">`. Append our classes; keep Dawn's existing classes intact.)

- [ ] **Step 1.4: Modify `config/settings_schema.json` — add motion toggle**

Find the existing `"name": "theme_info"` block (first object in the array). After the **next** settings group (typically "Logo" or "Colors"), append a new settings group at the end of the array, immediately **before** the final `]`:

```json
,
{
  "name": "Hemprojekter — Aurora",
  "settings": [
    {
      "type": "header",
      "content": "Rörelser och animationer"
    },
    {
      "type": "checkbox",
      "id": "hp_reduce_decorative_motion",
      "label": "Reducera dekorativa animationer",
      "info": "Tvinga av animationer även om webbläsaren inte ber om det.",
      "default": false
    }
  ]
}
```

- [ ] **Step 1.5: Validate the theme**

Call `mcp__shopify-dev-mcp__validate_theme` against the repo root (`/Users/mattiassundberg/PROJECTS/shopify-hemprojekter/`). Expect zero errors related to our changes. If the tool reports unrelated pre-existing warnings from Dawn, note them and continue.

- [ ] **Step 1.6: Commit**

```bash
git add assets/hemprojekter-aurora.css layout/theme.liquid config/settings_schema.json
git commit -m "feat(theme): bootstrap Aurora Night design tokens and motion toggle

Adds the Aurora color palette, font-faces (Fraunces, Inter, JetBrains
Mono), shared utility classes (hp-container, hp-button, hp-aurora-bloom),
and a merchant-facing 'reduce decorative motion' toggle wired through
theme.liquid as a body class."
```

---

## Task 2: Header — minimal wordmark + cart, translucent over hero

Strip the header to a wordmark + cart icon, made translucent until the hero is scrolled past.

**Files:**
- Modify: `sections/header.liquid` (heavy rewrite; keep the file name and `{% schema %}` block intact at the bottom, but replace the rendered markup and stylesheet block)

- [ ] **Step 2.1: Read the existing `sections/header.liquid`** to confirm the `{% schema %}` block location and any required Liquid hooks (cart drawer trigger, `localization-form`, etc.) so we don't break Dawn's cart logic.

- [ ] **Step 2.2: Replace the header's rendered markup**

At the top of `sections/header.liquid`, before any existing markup, insert (or replace the equivalent header markup with):

```liquid
{{ 'hemprojekter-aurora.css' | asset_url | stylesheet_tag }}

<sticky-header class="hp-header" data-template="{{ template.name }}">
  <div class="hp-header__inner hp-container">
    <a class="hp-header__brand" href="{{ routes.root_url }}" aria-label="{{ shop.name }}">
      <span class="hp-wordmark">Hemprojekter</span>
    </a>

    <nav class="hp-header__actions" aria-label="{{ 'sections.header.actions_label' | t | default: 'Genvägar' }}">
      <a class="hp-iconbtn" href="{{ routes.search_url }}" aria-label="Sök">
        {% render 'icon-search' %}
      </a>
      <a class="hp-iconbtn hp-iconbtn--cart" href="{{ routes.cart_url }}" aria-label="Varukorg ({{ cart.item_count }})">
        {% render 'icon-cart' %}
        {% if cart.item_count > 0 %}
          <span class="hp-iconbtn__count">{{ cart.item_count }}</span>
        {% endif %}
      </a>
    </nav>
  </div>
</sticky-header>

{% stylesheet %}
  .hp-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: transparent;
    transition: background-color var(--hp-dur-med) var(--hp-ease),
                backdrop-filter var(--hp-dur-med) var(--hp-ease),
                border-color var(--hp-dur-med) var(--hp-ease);
    border-bottom: 1px solid transparent;
  }

  .hp-header.is-stuck {
    background: rgba(11, 16, 38, 0.72);
    backdrop-filter: saturate(140%) blur(14px);
    -webkit-backdrop-filter: saturate(140%) blur(14px);
    border-bottom-color: var(--hp-border);
  }

  .hp-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: 22px;
  }

  .hp-header__brand {
    display: inline-flex;
    text-decoration: none;
    color: var(--hp-text);
  }

  .hp-wordmark {
    font-family: var(--hp-font-display);
    font-weight: 400;
    font-size: clamp(1.3rem, 1.5vw, 1.55rem);
    letter-spacing: -0.01em;
  }

  .hp-header__actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hp-iconbtn {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    color: var(--hp-text);
    text-decoration: none;
    border: 1px solid var(--hp-border);
    background: rgba(17, 23, 58, 0.55);
    transition: border-color var(--hp-dur-fast) var(--hp-ease),
                color var(--hp-dur-fast) var(--hp-ease);
  }

  .hp-iconbtn svg { width: 18px; height: 18px; }

  .hp-iconbtn:hover {
    border-color: var(--hp-aurora-1);
    color: var(--hp-aurora-1);
  }

  .hp-iconbtn__count {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--hp-aurora-3);
    color: #0B1026;
    font-size: 11px;
    font-weight: 700;
    display: grid;
    place-items: center;
  }
{% endstylesheet %}

<script>
  (function () {
    const header = document.querySelector('.hp-header');
    if (!header) return;
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);
    const io = new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' });
    io.observe(sentinel);
  })();
</script>
```

The `{% schema %}` block at the bottom of `sections/header.liquid` is left untouched.

- [ ] **Step 2.3: Validate**

Call `mcp__shopify-dev-mcp__validate_theme`. Expect no new errors on `sections/header.liquid`. If Dawn's pre-existing schema in this file requires settings that the new markup ignores, that's fine — unused schema settings are harmless.

- [ ] **Step 2.4: Commit**

```bash
git add sections/header.liquid
git commit -m "feat(header): minimal Aurora wordmark + cart with translucent stuck state"
```

---

## Task 3: Hero section — `hemprojekter-hero-aurora`

Full-bleed hero with serif headline, subhead, Klarna line, primary CTA, secondary demo anchor, animated aurora gradient overlay, optional video background.

**Files:**
- Create: `sections/hemprojekter-hero-aurora.liquid`

- [ ] **Step 3.1: Create the section file**

```liquid
{{ 'hemprojekter-aurora.css' | asset_url | stylesheet_tag }}

<section class="hp-hero" id="shopify-section-{{ section.id }}">
  <div class="hp-aurora-bloom" aria-hidden="true"></div>

  {%- if section.settings.video_url != blank -%}
    <video class="hp-hero__video"
           poster="{{ section.settings.poster | image_url: width: 1920 }}"
           src="{{ section.settings.video_url }}"
           autoplay muted loop playsinline preload="metadata"></video>
  {%- elsif section.settings.poster != blank -%}
    <img class="hp-hero__video"
         src="{{ section.settings.poster | image_url: width: 1920 }}"
         alt="{{ section.settings.poster.alt | escape }}"
         width="1920" height="1080" loading="eager" fetchpriority="high">
  {%- endif -%}

  <div class="hp-hero__veil" aria-hidden="true"></div>

  <div class="hp-hero__content hp-container">
    {%- if section.settings.kicker != blank -%}
      <p class="hp-kicker hp-hero__kicker">{{ section.settings.kicker }}</p>
    {%- endif -%}
    <h1 class="hp-display hp-hero__title">{{ section.settings.heading }}</h1>
    {%- if section.settings.subheading != blank -%}
      <p class="hp-body hp-hero__sub">{{ section.settings.subheading }}</p>
    {%- endif -%}

    <div class="hp-hero__cta">
      <a class="hp-button hp-button--primary" href="{{ section.settings.cta_url }}" data-hero-cta>
        {{ section.settings.cta_label }}
      </a>
      {%- if section.settings.secondary_label != blank -%}
        <a class="hp-button hp-button--ghost" href="{{ section.settings.secondary_url }}">
          {{ section.settings.secondary_label }}
        </a>
      {%- endif -%}
    </div>

    {%- if section.settings.klarna_line != blank -%}
      <p class="hp-hero__klarna">{{ section.settings.klarna_line }}</p>
    {%- endif -%}
  </div>

  <a class="hp-hero__scroll" href="#hp-after-hero" aria-label="Scrolla för att se mer">
    <span></span>
  </a>
</section>

<div id="hp-after-hero" aria-hidden="true"></div>

{% stylesheet %}
  .hp-hero {
    position: relative;
    min-height: clamp(560px, 96vh, 920px);
    display: grid;
    place-items: end center;
    overflow: hidden;
    isolation: isolate;
    background: var(--hp-bg);
    margin-top: -88px;
    padding-top: 88px;
  }

  .hp-hero__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }

  .hp-hero__veil {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(120% 70% at 50% 100%, rgba(11,16,38,0.92) 0%, rgba(11,16,38,0.55) 60%, transparent 100%),
      linear-gradient(180deg, rgba(11,16,38,0.55) 0%, rgba(11,16,38,0.2) 35%, rgba(11,16,38,0.85) 100%);
    z-index: 0;
  }

  .hp-hero__content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding-block: clamp(56px, 9vh, 96px);
    max-width: 880px;
    display: grid;
    gap: 18px;
    justify-items: center;
  }

  .hp-hero__kicker { margin-bottom: 6px; }

  .hp-hero__title {
    font-size: clamp(2.6rem, 6.2vw, 5.4rem);
    margin: 0;
    text-wrap: balance;
  }

  .hp-hero__sub {
    font-size: clamp(1.05rem, 1.5vw, 1.25rem);
    max-width: 56ch;
    margin: 0;
  }

  .hp-hero__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 10px;
  }

  .hp-hero__klarna {
    font-family: var(--hp-font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: var(--hp-text-muted);
    margin: 6px 0 0;
  }

  .hp-hero__scroll {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 22px; height: 36px;
    border: 1px solid var(--hp-border-strong);
    border-radius: 999px;
    z-index: 2;
    display: grid;
    place-items: start center;
    padding-top: 6px;
  }
  .hp-hero__scroll span {
    width: 3px; height: 8px;
    background: var(--hp-aurora-1);
    border-radius: 999px;
    animation: hp-scroll 1.8s var(--hp-ease) infinite;
  }
  @keyframes hp-scroll {
    0% { transform: translateY(0); opacity: 1; }
    70% { transform: translateY(14px); opacity: 0; }
    100% { transform: translateY(14px); opacity: 0; }
  }

  @media (max-width: 640px) {
    .hp-hero { min-height: 88vh; }
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Hero — Aurora",
  "tag": "section",
  "class": "hp-section hp-section--hero",
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker (liten etikett ovanför rubrik)", "default": "Mini-projektor 720p" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Förvandla ditt rum till en magisk värld." },
    { "type": "textarea", "id": "subheading", "label": "Underrubrik", "default": "På sekunder. Med en knapptryckning. Hogwarts-känsla hemma — varje kväll." },
    { "type": "text", "id": "cta_label", "label": "CTA-text", "default": "Köp nu — 499 kr" },
    { "type": "url", "id": "cta_url", "label": "CTA-länk" },
    { "type": "text", "id": "secondary_label", "label": "Sekundär länk-text", "default": "Se demo" },
    { "type": "url", "id": "secondary_url", "label": "Sekundär länk", "default": "#demo" },
    { "type": "text", "id": "klarna_line", "label": "Klarna-rad", "default": "Eller 4 räntefria delbetalningar via Klarna." },
    { "type": "image_picker", "id": "poster", "label": "Bild / video-poster" },
    { "type": "url", "id": "video_url", "label": "Video-URL (mp4). Lämna tom för att bara visa bild." }
  ],
  "presets": [ { "name": "Hero — Aurora" } ]
}
{% endschema %}
```

- [ ] **Step 3.2: Validate**

Call `mcp__shopify-dev-mcp__validate_theme`. Expect zero errors on the new file.

- [ ] **Step 3.3: Commit**

```bash
git add sections/hemprojekter-hero-aurora.liquid
git commit -m "feat(section): add Aurora hero with video/poster background and CTA"
```

---

## Task 4: Trust bar — `hemprojekter-trust-bar`

Thin row beneath hero with rating, free shipping, returns, ships-from-Sweden. Block-based so merchant edits items individually.

**Files:**
- Create: `sections/hemprojekter-trust-bar.liquid`

- [ ] **Step 4.1: Create the file**

```liquid
<section class="hp-trust" id="shopify-section-{{ section.id }}">
  <div class="hp-container hp-trust__inner">
    {%- for block in section.blocks -%}
      <div class="hp-trust__item" {{ block.shopify_attributes }}>
        {%- if block.settings.icon != blank -%}
          <span class="hp-trust__icon" aria-hidden="true">{{ block.settings.icon }}</span>
        {%- endif -%}
        <span class="hp-trust__text">{{ block.settings.text }}</span>
      </div>
    {%- endfor -%}
  </div>
</section>

{% stylesheet %}
  .hp-trust {
    background: var(--hp-bg);
    border-bottom: 1px solid var(--hp-border);
  }
  .hp-trust__inner {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: clamp(14px, 3vw, 36px);
    padding-block: 18px;
  }
  .hp-trust__item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--hp-font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    color: var(--hp-text-muted);
  }
  .hp-trust__icon { color: var(--hp-aurora-1); }
{% endstylesheet %}

{% schema %}
{
  "name": "Trust bar",
  "tag": "section",
  "class": "hp-section hp-section--trust",
  "max_blocks": 6,
  "blocks": [
    {
      "type": "trust_item",
      "name": "Punkt",
      "settings": [
        { "type": "text", "id": "icon", "label": "Ikon (emoji eller symbol)", "default": "★" },
        { "type": "text", "id": "text", "label": "Text", "default": "4.8 av 5 — 124 omdömen" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Trust bar",
      "blocks": [
        { "type": "trust_item", "settings": { "icon": "★", "text": "4.8 / 5 — 124 omdömen" } },
        { "type": "trust_item", "settings": { "icon": "✦", "text": "Fri frakt över 499 kr" } },
        { "type": "trust_item", "settings": { "icon": "↺", "text": "30 dagars öppet köp" } },
        { "type": "trust_item", "settings": { "icon": "⌖", "text": "Skickas från Sverige" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 4.2: Validate**

Run `mcp__shopify-dev-mcp__validate_theme`. Expect zero errors.

- [ ] **Step 4.3: Commit**

```bash
git add sections/hemprojekter-trust-bar.liquid
git commit -m "feat(section): add Aurora trust bar with block-based items"
```

---

## Task 5: Demo showcase — `hemprojekter-demo-showcase`

Looping muted video, or a before/after slider, merchant-toggleable.

**Files:**
- Create: `sections/hemprojekter-demo-showcase.liquid`

- [ ] **Step 5.1: Create the file**

```liquid
<section class="hp-demo" id="demo">
  <div class="hp-container hp-demo__head">
    <p class="hp-kicker">{{ section.settings.kicker }}</p>
    <h2 class="hp-display hp-demo__title">{{ section.settings.heading }}</h2>
  </div>

  <div class="hp-container hp-demo__stage">
    {%- if section.settings.mode == 'video' and section.settings.video_url != blank -%}
      <video class="hp-demo__video"
             src="{{ section.settings.video_url }}"
             poster="{{ section.settings.image_before | image_url: width: 1600 }}"
             autoplay muted loop playsinline preload="metadata"></video>
    {%- else -%}
      <hp-before-after class="hp-demo__ba" tabindex="0" aria-label="Före och efter — dra för att jämföra">
        {%- if section.settings.image_after != blank -%}
          <img class="hp-demo__img hp-demo__img--after"
               src="{{ section.settings.image_after | image_url: width: 1600 }}"
               alt="{{ section.settings.image_after.alt | escape }}" loading="lazy" width="1600" height="1000">
        {%- endif -%}
        {%- if section.settings.image_before != blank -%}
          <img class="hp-demo__img hp-demo__img--before"
               src="{{ section.settings.image_before | image_url: width: 1600 }}"
               alt="{{ section.settings.image_before.alt | escape }}" loading="lazy" width="1600" height="1000">
        {%- endif -%}
        <span class="hp-demo__handle" aria-hidden="true"><span></span></span>
      </hp-before-after>
    {%- endif -%}
  </div>
</section>

{% stylesheet %}
  .hp-demo {
    padding-block: var(--hp-section-pad-y);
    background: var(--hp-bg);
  }
  .hp-demo__head {
    text-align: center;
    display: grid;
    gap: 12px;
    margin-bottom: clamp(28px, 4vw, 56px);
  }
  .hp-demo__title {
    font-size: clamp(2rem, 4vw, 3.2rem);
    margin: 0;
    text-wrap: balance;
  }
  .hp-demo__stage {
    border-radius: var(--hp-radius-lg);
    overflow: hidden;
    border: 1px solid var(--hp-border);
    background: var(--hp-surface);
    aspect-ratio: 16 / 10;
    position: relative;
  }
  .hp-demo__video { width: 100%; height: 100%; object-fit: cover; display: block; }

  hp-before-after {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: ew-resize;
    user-select: none;
  }
  .hp-demo__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .hp-demo__img--before { clip-path: inset(0 50% 0 0); }
  .hp-demo__handle {
    position: absolute;
    top: 0; bottom: 0;
    left: 50%;
    width: 2px;
    background: var(--hp-aurora-1);
    transform: translateX(-1px);
    pointer-events: none;
  }
  .hp-demo__handle span {
    position: absolute;
    top: 50%; left: 50%;
    width: 44px; height: 44px;
    border-radius: 999px;
    background: var(--hp-bg);
    border: 1px solid var(--hp-aurora-1);
    transform: translate(-50%, -50%);
    box-shadow: 0 12px 40px rgba(124, 255, 203, 0.25);
  }
{% endstylesheet %}

<script>
  customElements.define('hp-before-after', class extends HTMLElement {
    connectedCallback() {
      const before = this.querySelector('.hp-demo__img--before');
      const handle = this.querySelector('.hp-demo__handle');
      if (!before || !handle) return;
      const setPos = (clientX) => {
        const rect = this.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        handle.style.left = pct + '%';
      };
      let dragging = false;
      const start = (e) => { dragging = true; setPos((e.touches ? e.touches[0] : e).clientX); };
      const move = (e) => { if (dragging) setPos((e.touches ? e.touches[0] : e).clientX); };
      const end = () => { dragging = false; };
      this.addEventListener('mousedown', start);
      this.addEventListener('touchstart', start, { passive: true });
      window.addEventListener('mousemove', move);
      window.addEventListener('touchmove', move, { passive: true });
      window.addEventListener('mouseup', end);
      window.addEventListener('touchend', end);
      this.addEventListener('keydown', (e) => {
        const rect = this.getBoundingClientRect();
        const current = parseFloat(handle.style.left || '50');
        if (e.key === 'ArrowLeft') setPos(rect.left + rect.width * Math.max(0, current - 5) / 100);
        if (e.key === 'ArrowRight') setPos(rect.left + rect.width * Math.min(100, current + 5) / 100);
      });
    }
  });
</script>

{% schema %}
{
  "name": "Demo — Showcase",
  "tag": "section",
  "class": "hp-section hp-section--demo",
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Se det själv" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Innan. Efter. Som magi." },
    { "type": "select", "id": "mode", "label": "Läge",
      "options": [
        { "value": "before_after", "label": "Före / efter-slider" },
        { "value": "video", "label": "Loopande video" }
      ],
      "default": "before_after"
    },
    { "type": "image_picker", "id": "image_before", "label": "Bild — före (lampor på)" },
    { "type": "image_picker", "id": "image_after", "label": "Bild — efter (projektor på)" },
    { "type": "url", "id": "video_url", "label": "Video-URL (mp4, används bara i video-läge)" }
  ],
  "presets": [ { "name": "Demo — Showcase" } ]
}
{% endschema %}
```

- [ ] **Step 5.2: Validate + commit**

```bash
git add sections/hemprojekter-demo-showcase.liquid
git commit -m "feat(section): add demo showcase with before/after slider or video"
```

---

## Task 6: Feature triptych — `hemprojekter-feature-triptych`

Three icon-cards with block-based content.

**Files:**
- Create: `sections/hemprojekter-feature-triptych.liquid`

- [ ] **Step 6.1: Create the file**

```liquid
<section class="hp-features">
  <div class="hp-container">
    <div class="hp-features__head">
      <p class="hp-kicker">{{ section.settings.kicker }}</p>
      <h2 class="hp-display hp-features__title">{{ section.settings.heading }}</h2>
    </div>

    <ul class="hp-features__grid" role="list">
      {%- for block in section.blocks -%}
        <li class="hp-feature" {{ block.shopify_attributes }}>
          <span class="hp-feature__icon" aria-hidden="true">{{ block.settings.icon }}</span>
          <h3 class="hp-feature__title">{{ block.settings.heading }}</h3>
          <p class="hp-feature__body hp-body">{{ block.settings.text }}</p>
        </li>
      {%- endfor -%}
    </ul>
  </div>
</section>

{% stylesheet %}
  .hp-features { padding-block: var(--hp-section-pad-y); background: var(--hp-bg); }
  .hp-features__head { text-align: center; display: grid; gap: 12px; margin-bottom: clamp(32px, 5vw, 64px); }
  .hp-features__title { font-size: clamp(2rem, 4vw, 3.2rem); margin: 0; text-wrap: balance; }
  .hp-features__grid {
    list-style: none; margin: 0; padding: 0;
    display: grid; gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
  .hp-feature {
    padding: 32px 28px;
    border-radius: var(--hp-radius);
    border: 1px solid var(--hp-border);
    background: linear-gradient(180deg, var(--hp-surface) 0%, rgba(17, 23, 58, 0.4) 100%);
    display: grid;
    gap: 12px;
    transition: transform var(--hp-dur-med) var(--hp-ease), border-color var(--hp-dur-med) var(--hp-ease);
  }
  .hp-feature:hover { transform: translateY(-4px); border-color: var(--hp-border-strong); }
  .hp-feature__icon {
    width: 44px; height: 44px;
    display: grid; place-items: center;
    background: linear-gradient(135deg, var(--hp-aurora-2), var(--hp-aurora-3));
    color: #0B1026;
    border-radius: 12px;
    font-family: var(--hp-font-display);
    font-size: 1.2rem;
  }
  .hp-feature__title {
    font-family: var(--hp-font-display);
    font-weight: 400;
    margin: 0;
    font-size: 1.45rem;
    color: var(--hp-text);
  }
  .hp-feature__body { margin: 0; }
{% endstylesheet %}

{% schema %}
{
  "name": "Features — Triptych",
  "tag": "section",
  "class": "hp-section hp-section--features",
  "max_blocks": 6,
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Vad du får" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Tre saker som gör skillnad." }
  ],
  "blocks": [
    {
      "type": "feature",
      "name": "Feature",
      "settings": [
        { "type": "text", "id": "icon", "label": "Ikon", "default": "✦" },
        { "type": "text", "id": "heading", "label": "Rubrik", "default": "Stjärnprojektion" },
        { "type": "textarea", "id": "text", "label": "Text", "default": "Levande stjärnhimmel i hela rummet, justerbar intensitet och färg." }
      ]
    }
  ],
  "presets": [
    {
      "name": "Features — Triptych",
      "blocks": [
        { "type": "feature", "settings": { "icon": "✦", "heading": "Stjärnprojektion", "text": "Levande stjärnhimmel i hela rummet, justerbar intensitet och färg." } },
        { "type": "feature", "settings": { "icon": "◐", "heading": "8h timer", "text": "Somna till magin — den stänger av sig själv när du sover." } },
        { "type": "feature", "settings": { "icon": "♪", "heading": "Bluetooth-högtalare", "text": "Spela din lugna playlist direkt från enheten. Inga sladdar." } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 6.2: Validate + commit**

```bash
git add sections/hemprojekter-feature-triptych.liquid
git commit -m "feat(section): add Aurora feature triptych with block-based cards"
```

---

## Task 7: Story block — `hemprojekter-story-block`

Split image + emotional copy. Two-column desktop, stacked mobile.

**Files:**
- Create: `sections/hemprojekter-story-block.liquid`

- [ ] **Step 7.1: Create the file**

```liquid
<section class="hp-story">
  <div class="hp-container hp-story__grid">
    <div class="hp-story__media">
      {%- if section.settings.image != blank -%}
        <img src="{{ section.settings.image | image_url: width: 1400 }}"
             alt="{{ section.settings.image.alt | escape }}"
             width="1400" height="1750" loading="lazy">
      {%- endif -%}
      <div class="hp-story__glow" aria-hidden="true"></div>
    </div>

    <div class="hp-story__copy">
      <p class="hp-kicker">{{ section.settings.kicker }}</p>
      <h2 class="hp-display hp-story__title">{{ section.settings.heading }}</h2>
      <div class="hp-body hp-story__body">{{ section.settings.body }}</div>
      {%- if section.settings.cta_label != blank -%}
        <a class="hp-button hp-button--ghost hp-story__cta" href="{{ section.settings.cta_url }}">
          {{ section.settings.cta_label }}
        </a>
      {%- endif -%}
    </div>
  </div>
</section>

{% stylesheet %}
  .hp-story { padding-block: var(--hp-section-pad-y); background: var(--hp-bg); }
  .hp-story__grid {
    display: grid;
    gap: clamp(28px, 5vw, 72px);
    align-items: center;
    grid-template-columns: 1fr;
  }
  @media (min-width: 880px) {
    .hp-story__grid { grid-template-columns: 1.05fr 1fr; }
  }
  .hp-story__media {
    position: relative;
    aspect-ratio: 4 / 5;
    border-radius: var(--hp-radius-lg);
    overflow: hidden;
    border: 1px solid var(--hp-border);
  }
  .hp-story__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hp-story__glow {
    position: absolute; inset: -20% -10% auto auto;
    width: 60%; aspect-ratio: 1;
    background: radial-gradient(circle, var(--hp-aurora-2) 0%, transparent 60%);
    filter: blur(60px); opacity: 0.55; mix-blend-mode: screen;
    pointer-events: none;
  }
  .hp-story__copy { display: grid; gap: 18px; max-width: 56ch; }
  .hp-story__title { font-size: clamp(1.9rem, 3.5vw, 2.8rem); margin: 0; text-wrap: balance; }
  .hp-story__body p { margin: 0 0 1em; }
  .hp-story__cta { justify-self: start; margin-top: 6px; }
{% endstylesheet %}

{% schema %}
{
  "name": "Story block",
  "tag": "section",
  "class": "hp-section hp-section--story",
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Vår tanke" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Designad för att göra det enkla magiskt." },
    { "type": "richtext", "id": "body", "label": "Text",
      "default": "<p>Hemprojekter började med en enkel idé: att vardagsrum förtjänar mer än vardagligt ljus. Vi byggde en projektor som förvandlar tak och väggar till en lugn, drömlik stjärnhimmel — utan installation, utan krångel.</p><p>Tryck på en knapp. Andas ut. Rummet känns plötsligt som någon annanstans.</p>"
    },
    { "type": "image_picker", "id": "image", "label": "Bild" },
    { "type": "text", "id": "cta_label", "label": "CTA-text", "default": "Köp Mini-projektorn" },
    { "type": "url", "id": "cta_url", "label": "CTA-länk" }
  ],
  "presets": [ { "name": "Story block" } ]
}
{% endschema %}
```

- [ ] **Step 7.2: Validate + commit**

```bash
git add sections/hemprojekter-story-block.liquid
git commit -m "feat(section): add Aurora story block with image + emotional copy"
```

---

## Task 8: How it works — `hemprojekter-how-it-works`

Three numbered steps with a thin scroll-revealed connector.

**Files:**
- Create: `sections/hemprojekter-how-it-works.liquid`

- [ ] **Step 8.1: Create the file**

```liquid
<section class="hp-how">
  <div class="hp-container">
    <div class="hp-how__head">
      <p class="hp-kicker">{{ section.settings.kicker }}</p>
      <h2 class="hp-display hp-how__title">{{ section.settings.heading }}</h2>
    </div>

    <ol class="hp-how__list" role="list">
      {%- for block in section.blocks -%}
        <li class="hp-how__step" {{ block.shopify_attributes }}>
          <span class="hp-how__num">{{ forloop.index | prepend: '0' | slice: -2, 2 }}</span>
          <h3 class="hp-how__step-title">{{ block.settings.heading }}</h3>
          <p class="hp-body hp-how__step-body">{{ block.settings.text }}</p>
        </li>
      {%- endfor -%}
    </ol>
  </div>
</section>

{% stylesheet %}
  .hp-how { padding-block: var(--hp-section-pad-y); background: var(--hp-bg); }
  .hp-how__head { text-align: center; display: grid; gap: 12px; margin-bottom: clamp(36px, 5vw, 64px); }
  .hp-how__title { font-size: clamp(2rem, 4vw, 3.2rem); margin: 0; text-wrap: balance; }
  .hp-how__list {
    list-style: none; margin: 0; padding: 0;
    display: grid; gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    position: relative;
  }
  .hp-how__step {
    padding: 28px 24px;
    border-radius: var(--hp-radius);
    border: 1px solid var(--hp-border);
    background: var(--hp-surface);
    display: grid; gap: 10px;
    position: relative;
  }
  .hp-how__num {
    font-family: var(--hp-font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.16em;
    color: var(--hp-aurora-1);
  }
  .hp-how__step-title {
    font-family: var(--hp-font-display);
    font-weight: 400;
    font-size: 1.4rem;
    margin: 0;
    color: var(--hp-text);
  }
  .hp-how__step-body { margin: 0; }
{% endstylesheet %}

{% schema %}
{
  "name": "How it works",
  "tag": "section",
  "class": "hp-section hp-section--how",
  "max_blocks": 4,
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Så funkar det" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Tre steg från låda till stjärnhimmel." }
  ],
  "blocks": [
    {
      "type": "step",
      "name": "Steg",
      "settings": [
        { "type": "text", "id": "heading", "label": "Steg-rubrik", "default": "Packa upp" },
        { "type": "textarea", "id": "text", "label": "Steg-text", "default": "Allt du behöver finns i lådan. USB-C-kabel ingår." }
      ]
    }
  ],
  "presets": [
    {
      "name": "How it works",
      "blocks": [
        { "type": "step", "settings": { "heading": "Packa upp", "text": "Allt du behöver finns i lådan. USB-C-kabel ingår." } },
        { "type": "step", "settings": { "heading": "Sätt på", "text": "En knapptryckning — välj stjärnhimmel eller nordsken." } },
        { "type": "step", "settings": { "heading": "Andas ut", "text": "Rummet blir en plats du vill vara i." } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 8.2: Validate + commit**

```bash
git add sections/hemprojekter-how-it-works.liquid
git commit -m "feat(section): add Aurora how-it-works three-step section"
```

---

## Task 9: Reviews wall — `hemprojekter-reviews-wall`

Masonry-feeling grid of customer quotes. Static blocks; emits Product JSON-LD if a product is linked.

**Files:**
- Create: `sections/hemprojekter-reviews-wall.liquid`

- [ ] **Step 9.1: Create the file**

```liquid
{%- assign product = all_products[section.settings.product] -%}

<section class="hp-reviews">
  <div class="hp-container">
    <div class="hp-reviews__head">
      <p class="hp-kicker">{{ section.settings.kicker }}</p>
      <h2 class="hp-display hp-reviews__title">{{ section.settings.heading }}</h2>
      <p class="hp-body hp-reviews__sub">{{ section.settings.subheading }}</p>
    </div>

    <ul class="hp-reviews__grid" role="list">
      {%- for block in section.blocks -%}
        <li class="hp-review" {{ block.shopify_attributes }}>
          <div class="hp-review__stars" aria-label="{{ block.settings.rating }} av 5">
            {% assign rating = block.settings.rating | plus: 0 %}
            {% for i in (1..5) %}{% if i <= rating %}★{% else %}☆{% endif %}{% endfor %}
          </div>
          <blockquote class="hp-review__quote">"{{ block.settings.quote }}"</blockquote>
          <p class="hp-review__author">— {{ block.settings.author }}{% if block.settings.location != blank %}, {{ block.settings.location }}{% endif %}</p>
        </li>
      {%- endfor -%}
    </ul>
  </div>
</section>

{%- if product != blank -%}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": {{ product.title | json }},
    "image": [{{ product.featured_image | image_url: width: 1200 | json }}],
    "offers": {
      "@type": "Offer",
      "price": "{{ product.price | money_without_currency | replace: ',', '.' }}",
      "priceCurrency": {{ cart.currency.iso_code | json }},
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "{{ section.settings.avg_rating }}",
      "reviewCount": "{{ section.settings.review_count }}"
    }
  }
  </script>
{%- endif -%}

{% stylesheet %}
  .hp-reviews { padding-block: var(--hp-section-pad-y); background: var(--hp-bg); }
  .hp-reviews__head { text-align: center; display: grid; gap: 12px; margin-bottom: clamp(32px, 5vw, 64px); }
  .hp-reviews__title { font-size: clamp(2rem, 4vw, 3.2rem); margin: 0; text-wrap: balance; }
  .hp-reviews__sub { margin: 0 auto; max-width: 60ch; }
  .hp-reviews__grid {
    list-style: none; margin: 0; padding: 0;
    column-count: 1; column-gap: 18px;
  }
  @media (min-width: 720px) { .hp-reviews__grid { column-count: 2; } }
  @media (min-width: 1080px) { .hp-reviews__grid { column-count: 3; } }
  .hp-review {
    break-inside: avoid;
    margin-bottom: 18px;
    padding: 24px 22px;
    border-radius: var(--hp-radius);
    border: 1px solid var(--hp-border);
    background: var(--hp-surface);
    display: grid; gap: 10px;
  }
  .hp-review__stars { color: var(--hp-aurora-3); letter-spacing: 2px; }
  .hp-review__quote {
    margin: 0;
    font-family: var(--hp-font-display);
    font-size: 1.15rem;
    line-height: 1.45;
    color: var(--hp-text);
    font-weight: 400;
  }
  .hp-review__author {
    margin: 0;
    font-family: var(--hp-font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    color: var(--hp-text-muted);
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Reviews wall",
  "tag": "section",
  "class": "hp-section hp-section--reviews",
  "max_blocks": 12,
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Vad kunderna säger" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Bara läs själv." },
    { "type": "text", "id": "subheading", "label": "Underrubrik", "default": "Verkliga omdömen från Hemprojekter-kunder." },
    { "type": "product", "id": "product", "label": "Kopplad produkt (för SEO-data)" },
    { "type": "text", "id": "avg_rating", "label": "Genomsnittsbetyg", "default": "4.8" },
    { "type": "text", "id": "review_count", "label": "Antal omdömen", "default": "124" }
  ],
  "blocks": [
    {
      "type": "review",
      "name": "Omdöme",
      "settings": [
        { "type": "range", "id": "rating", "label": "Betyg", "min": 1, "max": 5, "step": 1, "default": 5 },
        { "type": "textarea", "id": "quote", "label": "Citat", "default": "Bästa köpet i år. Hela rummet förvandlas direkt." },
        { "type": "text", "id": "author", "label": "Namn", "default": "Anna" },
        { "type": "text", "id": "location", "label": "Ort", "default": "Göteborg" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Reviews wall",
      "blocks": [
        { "type": "review", "settings": { "rating": 5, "quote": "Bästa köpet i år. Hela rummet förvandlas direkt.", "author": "Anna", "location": "Göteborg" } },
        { "type": "review", "settings": { "rating": 5, "quote": "Min dotter vägrar somna utan stjärnorna numera.", "author": "Mikael", "location": "Stockholm" } },
        { "type": "review", "settings": { "rating": 4, "quote": "Snabb leverans och otroligt mysig stämning.", "author": "Linnea", "location": "Malmö" } },
        { "type": "review", "settings": { "rating": 5, "quote": "Använder den varje kväll. Värt varenda krona.", "author": "Johan", "location": "Uppsala" } },
        { "type": "review", "settings": { "rating": 5, "quote": "Ser mycket dyrare ut än vad den kostar.", "author": "Sara", "location": "Örebro" } },
        { "type": "review", "settings": { "rating": 5, "quote": "Perfekt present. Personen som fick den blev helt såld.", "author": "Erik", "location": "Lund" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 9.2: Validate + commit**

```bash
git add sections/hemprojekter-reviews-wall.liquid
git commit -m "feat(section): add Aurora reviews wall with masonry layout and JSON-LD"
```

---

## Task 10: FAQ — `hemprojekter-faq`

Semantic `<details>` accordion. No JS required to open/close.

**Files:**
- Create: `sections/hemprojekter-faq.liquid`

- [ ] **Step 10.1: Create the file**

```liquid
<section class="hp-faq">
  <div class="hp-container hp-faq__inner">
    <div class="hp-faq__head">
      <p class="hp-kicker">{{ section.settings.kicker }}</p>
      <h2 class="hp-display hp-faq__title">{{ section.settings.heading }}</h2>
    </div>

    <div class="hp-faq__list">
      {%- for block in section.blocks -%}
        <details class="hp-faq__item" {{ block.shopify_attributes }}>
          <summary class="hp-faq__q">
            <span>{{ block.settings.question }}</span>
            <span class="hp-faq__icon" aria-hidden="true">+</span>
          </summary>
          <div class="hp-faq__a hp-body">{{ block.settings.answer }}</div>
        </details>
      {%- endfor -%}
    </div>
  </div>
</section>

{% stylesheet %}
  .hp-faq { padding-block: var(--hp-section-pad-y); background: var(--hp-bg); }
  .hp-faq__inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(24px, 4vw, 56px);
  }
  @media (min-width: 880px) {
    .hp-faq__inner { grid-template-columns: 1fr 1.4fr; }
  }
  .hp-faq__head { display: grid; gap: 12px; }
  .hp-faq__title { font-size: clamp(1.9rem, 3.6vw, 2.8rem); margin: 0; text-wrap: balance; }
  .hp-faq__list { display: grid; gap: 12px; }
  .hp-faq__item {
    border-radius: var(--hp-radius);
    border: 1px solid var(--hp-border);
    background: var(--hp-surface);
    padding: 18px 22px;
    transition: border-color var(--hp-dur-fast) var(--hp-ease);
  }
  .hp-faq__item[open] { border-color: var(--hp-border-strong); }
  .hp-faq__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    cursor: pointer;
    font-family: var(--hp-font-display);
    font-size: 1.15rem;
    color: var(--hp-text);
    list-style: none;
  }
  .hp-faq__q::-webkit-details-marker { display: none; }
  .hp-faq__icon {
    width: 28px; height: 28px;
    display: grid; place-items: center;
    border-radius: 999px;
    border: 1px solid var(--hp-border-strong);
    color: var(--hp-aurora-1);
    transition: transform var(--hp-dur-fast) var(--hp-ease);
  }
  .hp-faq__item[open] .hp-faq__icon { transform: rotate(45deg); }
  .hp-faq__a { padding-top: 12px; }
{% endstylesheet %}

{% schema %}
{
  "name": "FAQ",
  "tag": "section",
  "class": "hp-section hp-section--faq",
  "max_blocks": 12,
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Vanliga frågor" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Det du undrar över — innan du undrar." }
  ],
  "blocks": [
    {
      "type": "qa",
      "name": "Fråga / svar",
      "settings": [
        { "type": "text", "id": "question", "label": "Fråga", "default": "Hur länge tar leveransen?" },
        { "type": "richtext", "id": "answer", "label": "Svar", "default": "<p>1–3 arbetsdagar inom Sverige. Fri frakt över 499 kr.</p>" }
      ]
    }
  ],
  "presets": [
    {
      "name": "FAQ",
      "blocks": [
        { "type": "qa", "settings": { "question": "Hur länge tar leveransen?", "answer": "<p>1–3 arbetsdagar inom Sverige. Fri frakt över 499 kr.</p>" } },
        { "type": "qa", "settings": { "question": "Hur stort rum täcker den?", "answer": "<p>Upp till cirka 25 m². Bäst i mörker.</p>" } },
        { "type": "qa", "settings": { "question": "Kan jag returnera om jag ändrar mig?", "answer": "<p>Ja — 30 dagars öppet köp, ingen frågor ställs.</p>" } },
        { "type": "qa", "settings": { "question": "Behövs en app?", "answer": "<p>Nej. Det finns en fjärrkontroll i lådan. Allt funkar utan app eller wifi.</p>" } },
        { "type": "qa", "settings": { "question": "Är den barnvänlig?", "answer": "<p>Ja. Låg värmeutveckling, USB-C-driven, inga små lösa delar.</p>" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 10.2: Validate + commit**

```bash
git add sections/hemprojekter-faq.liquid
git commit -m "feat(section): add Aurora FAQ accordion using semantic details"
```

---

## Task 11: Final CTA — `hemprojekter-final-cta`

Closing aurora-gradient panel with one CTA.

**Files:**
- Create: `sections/hemprojekter-final-cta.liquid`

- [ ] **Step 11.1: Create the file**

```liquid
<section class="hp-cta-final">
  <div class="hp-aurora-bloom" aria-hidden="true"></div>
  <div class="hp-container hp-cta-final__inner">
    <p class="hp-kicker">{{ section.settings.kicker }}</p>
    <h2 class="hp-display hp-cta-final__title">{{ section.settings.heading }}</h2>
    {%- if section.settings.subheading != blank -%}
      <p class="hp-body hp-cta-final__sub">{{ section.settings.subheading }}</p>
    {%- endif -%}
    <a class="hp-button hp-button--primary hp-cta-final__btn" href="{{ section.settings.cta_url }}">
      {{ section.settings.cta_label }}
    </a>
    {%- if section.settings.fine_print != blank -%}
      <p class="hp-cta-final__fine">{{ section.settings.fine_print }}</p>
    {%- endif -%}
  </div>
</section>

{% stylesheet %}
  .hp-cta-final {
    position: relative;
    isolation: isolate;
    padding-block: clamp(80px, 12vw, 160px);
    background: var(--hp-bg);
    overflow: hidden;
    text-align: center;
  }
  .hp-cta-final__inner { position: relative; z-index: 1; display: grid; gap: 16px; justify-items: center; }
  .hp-cta-final__title {
    font-size: clamp(2.4rem, 5.5vw, 4.4rem);
    max-width: 16ch;
    margin: 0;
    text-wrap: balance;
  }
  .hp-cta-final__sub { max-width: 56ch; margin: 0; }
  .hp-cta-final__btn { margin-top: 12px; }
  .hp-cta-final__fine {
    font-family: var(--hp-font-mono);
    font-size: 0.74rem;
    letter-spacing: 0.08em;
    color: var(--hp-text-muted);
    margin: 8px 0 0;
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Final CTA",
  "tag": "section",
  "class": "hp-section hp-section--cta-final",
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Sista steget" },
    { "type": "text", "id": "heading", "label": "Rubrik", "default": "Förvandla ditt rum ikväll." },
    { "type": "textarea", "id": "subheading", "label": "Underrubrik", "default": "Beställ före kl 14 — skickas samma dag." },
    { "type": "text", "id": "cta_label", "label": "CTA-text", "default": "Köp Mini-projektorn — 499 kr" },
    { "type": "url", "id": "cta_url", "label": "CTA-länk" },
    { "type": "text", "id": "fine_print", "label": "Liten text", "default": "Fri frakt över 499 kr · 30 dagars öppet köp" }
  ],
  "presets": [ { "name": "Final CTA" } ]
}
{% endschema %}
```

- [ ] **Step 11.2: Validate + commit**

```bash
git add sections/hemprojekter-final-cta.liquid
git commit -m "feat(section): add Aurora final CTA with aurora-bloom backdrop"
```

---

## Task 12: Sticky buy bar — snippet + JS, included from theme.liquid

A floating CTA bar that slides in once the hero CTA leaves the viewport.

**Files:**
- Create: `snippets/hemprojekter-sticky-buy-bar.liquid`
- Create: `assets/hemprojekter-sticky-bar.js`
- Modify: `layout/theme.liquid` (render the snippet at end of `<body>`; load the JS)

- [ ] **Step 12.1: Create `snippets/hemprojekter-sticky-buy-bar.liquid`**

```liquid
{%- assign product = all_products[settings.hp_sticky_product] -%}
{%- unless product != blank -%}
  {%- assign product = all_products.first -%}
{%- endunless -%}

{%- if product != blank -%}
  <div class="hp-sticky" data-hp-sticky aria-hidden="true">
    <div class="hp-sticky__inner">
      {%- if product.featured_image -%}
        <img class="hp-sticky__img"
             src="{{ product.featured_image | image_url: width: 96 }}"
             alt="{{ product.featured_image.alt | escape }}"
             width="48" height="48" loading="lazy">
      {%- endif -%}
      <div class="hp-sticky__text">
        <p class="hp-sticky__title">{{ product.title }}</p>
        <p class="hp-sticky__price">
          {{ product.price | money }}
          <span class="hp-sticky__klarna">eller 4× {{ product.price | divided_by: 4 | money }} via Klarna</span>
        </p>
      </div>
      <form method="post" action="{{ routes.cart_add_url }}" class="hp-sticky__form">
        <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
        <button type="submit" class="hp-button hp-button--primary hp-sticky__btn">Lägg i varukorg</button>
      </form>
    </div>
  </div>
{%- endif -%}

{% stylesheet %}
  .hp-sticky {
    position: fixed;
    left: 16px; right: 16px;
    bottom: 16px;
    z-index: 60;
    background: rgba(11, 16, 38, 0.92);
    color: var(--hp-text);
    border: 1px solid var(--hp-border-strong);
    border-radius: 18px;
    backdrop-filter: saturate(140%) blur(14px);
    -webkit-backdrop-filter: saturate(140%) blur(14px);
    box-shadow: 0 24px 60px -16px rgba(0, 0, 0, 0.6);
    transform: translateY(140%);
    opacity: 0;
    transition: transform 480ms var(--hp-ease), opacity 320ms var(--hp-ease);
    pointer-events: none;
  }
  .hp-sticky.is-visible {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  .hp-sticky__inner {
    display: grid;
    grid-template-columns: 48px 1fr auto;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    max-width: 720px;
    margin: 0 auto;
  }
  .hp-sticky__img { border-radius: 10px; object-fit: cover; }
  .hp-sticky__title { margin: 0; font-weight: 600; font-size: 0.92rem; line-height: 1.2; }
  .hp-sticky__price { margin: 2px 0 0; font-family: var(--hp-font-mono); font-size: 0.78rem; color: var(--hp-text-muted); }
  .hp-sticky__klarna { display: block; opacity: 0.78; }
  .hp-sticky__btn { padding: 0.75em 1.2em; font-size: 0.88rem; }
  @media (max-width: 520px) {
    .hp-sticky { left: 0; right: 0; bottom: 0; border-radius: 18px 18px 0 0; }
    .hp-sticky__klarna { display: none; }
  }
{% endstylesheet %}
```

- [ ] **Step 12.2: Create `assets/hemprojekter-sticky-bar.js`**

```js
(function () {
  function init() {
    var bar = document.querySelector('[data-hp-sticky]');
    var cta = document.querySelector('[data-hero-cta]');
    if (!bar || !cta) return;

    var io = new IntersectionObserver(function (entries) {
      var visible = !entries[0].isIntersecting;
      bar.classList.toggle('is-visible', visible);
      bar.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    io.observe(cta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 12.3: Modify `config/settings_schema.json` — add sticky-bar product setting**

Inside the new "Hemprojekter — Aurora" settings group from Task 1, append a second setting after `hp_reduce_decorative_motion`:

```json
,
{
  "type": "product",
  "id": "hp_sticky_product",
  "label": "Produkt för sticky-knappen",
  "info": "Den produkt som visas i den nedre köpknappen. Lämna tom för att använda första produkten i butiken."
}
```

- [ ] **Step 12.4: Modify `layout/theme.liquid` — render snippet + load JS**

Just before the closing `</body>` tag, add:

```liquid
  {% render 'hemprojekter-sticky-buy-bar' %}
  <script src="{{ 'hemprojekter-sticky-bar.js' | asset_url }}" defer></script>
```

- [ ] **Step 12.5: Validate + commit**

```bash
git add snippets/hemprojekter-sticky-buy-bar.liquid assets/hemprojekter-sticky-bar.js config/settings_schema.json layout/theme.liquid
git commit -m "feat(sticky): floating Aurora buy bar with IntersectionObserver trigger"
```

---

## Task 13: Footer — compact 3-column + payment icons

Replace Dawn's `sections/footer.liquid` with a minimal Aurora footer.

**Files:**
- Modify: `sections/footer.liquid` (heavy rewrite of markup; keep `{% schema %}` block at bottom intact)

- [ ] **Step 13.1: Read existing `sections/footer.liquid` to locate the `{% schema %}` block boundary.**

- [ ] **Step 13.2: Replace the rendered markup above `{% schema %}` with:**

```liquid
{{ 'hemprojekter-aurora.css' | asset_url | stylesheet_tag }}

<footer class="hp-footer" role="contentinfo">
  <div class="hp-container hp-footer__inner">
    <div class="hp-footer__brand">
      <span class="hp-wordmark">Hemprojekter</span>
      <p class="hp-body hp-footer__tag">Lite mer magi i vardagsrummet.</p>
    </div>

    <nav class="hp-footer__col" aria-label="Hjälp">
      <h4 class="hp-footer__h">Hjälp</h4>
      <ul role="list">
        <li><a href="/pages/contact">Kontakt</a></li>
        <li><a href="/pages/frakt-och-retur">Frakt & retur</a></li>
        <li><a href="/pages/track-order">Spåra order</a></li>
      </ul>
    </nav>

    <nav class="hp-footer__col" aria-label="Om oss">
      <h4 class="hp-footer__h">Om oss</h4>
      <ul role="list">
        <li><a href="/pages/om-oss">Vår historia</a></li>
        <li><a href="/blogs/news">Journal</a></li>
      </ul>
    </nav>

    <nav class="hp-footer__col" aria-label="Rättsligt">
      <h4 class="hp-footer__h">Rättsligt</h4>
      <ul role="list">
        <li><a href="/policies/privacy-policy">Integritet</a></li>
        <li><a href="/policies/terms-of-service">Villkor</a></li>
        <li><a href="/policies/refund-policy">Återbetalning</a></li>
      </ul>
    </nav>

    <form class="hp-footer__signup" action="{{ routes.root_url }}contact#contact_form" method="post" accept-charset="UTF-8">
      <input type="hidden" name="form_type" value="customer">
      <input type="hidden" name="utf8" value="✓">
      <input type="hidden" name="contact[tags]" value="newsletter">
      <h4 class="hp-footer__h">Få in lite stjärnstoft i inkorgen.</h4>
      <label class="hp-visually-hidden" for="hp-footer-email">E-post</label>
      <div class="hp-footer__row">
        <input type="email" id="hp-footer-email" name="contact[email]" placeholder="din@email.se" required>
        <button type="submit" class="hp-button hp-button--ghost">Anmäl</button>
      </div>
    </form>
  </div>

  <div class="hp-container hp-footer__base">
    <small>© {{ 'now' | date: '%Y' }} Hemprojekter. Alla rättigheter förbehållna.</small>
    {%- if shop.enabled_payment_types -%}
      <ul class="hp-footer__pay" role="list" aria-label="Betalmetoder">
        {%- for type in shop.enabled_payment_types -%}
          <li>{{ type | payment_type_svg_tag: class: 'hp-footer__pay-icon' }}</li>
        {%- endfor -%}
      </ul>
    {%- endif -%}
  </div>
</footer>

{% stylesheet %}
  .hp-footer {
    background: linear-gradient(180deg, var(--hp-bg) 0%, #06091B 100%);
    color: var(--hp-text);
    border-top: 1px solid var(--hp-border);
    padding-block: clamp(48px, 6vw, 80px) 24px;
  }
  .hp-footer__inner {
    display: grid;
    gap: clamp(24px, 4vw, 40px);
    grid-template-columns: 1.4fr 1fr 1fr 1fr 1.4fr;
  }
  @media (max-width: 880px) {
    .hp-footer__inner { grid-template-columns: 1fr 1fr; }
    .hp-footer__brand, .hp-footer__signup { grid-column: 1 / -1; }
  }
  .hp-footer__brand { display: grid; gap: 8px; }
  .hp-footer__tag { margin: 0; max-width: 24ch; }
  .hp-footer__h {
    font-family: var(--hp-font-mono);
    font-size: 0.74rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--hp-aurora-1);
    margin: 0 0 12px;
  }
  .hp-footer__col ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  .hp-footer__col a { color: var(--hp-text-muted); text-decoration: none; }
  .hp-footer__col a:hover { color: var(--hp-text); }
  .hp-footer__row { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
  .hp-footer__row input {
    width: 100%;
    padding: 0.85em 1em;
    border-radius: 999px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--hp-border);
    color: var(--hp-text);
    font-family: var(--hp-font-body);
  }
  .hp-footer__row input::placeholder { color: var(--hp-text-muted); }
  .hp-footer__base {
    margin-top: clamp(28px, 4vw, 48px);
    padding-top: 18px;
    border-top: 1px solid var(--hp-border);
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: space-between;
    align-items: center;
    color: var(--hp-text-muted);
    font-family: var(--hp-font-mono);
    font-size: 0.72rem;
  }
  .hp-footer__pay { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .hp-footer__pay-icon { height: 22px; width: auto; opacity: 0.9; }
  .hp-visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
{% endstylesheet %}
```

- [ ] **Step 13.3: Validate + commit**

```bash
git add sections/footer.liquid
git commit -m "feat(footer): minimal Aurora footer with payment icons and signup"
```

---

## Task 14: Wire the homepage — `templates/index.json`

Replace the homepage section list with the new Aurora long-scroll order.

**Files:**
- Modify (replace contents): `templates/index.json`

- [ ] **Step 14.1: Replace `templates/index.json` with:**

```json
{
  "sections": {
    "hero": {
      "type": "hemprojekter-hero-aurora",
      "settings": {
        "kicker": "Mini-projektor 720p",
        "heading": "Förvandla ditt rum till en magisk värld.",
        "subheading": "På sekunder. Med en knapptryckning. Hogwarts-känsla hemma — varje kväll.",
        "cta_label": "Köp nu — 499 kr",
        "cta_url": "shopify://products/mini-projektor-720p",
        "secondary_label": "Se demo",
        "secondary_url": "#demo",
        "klarna_line": "Eller 4 räntefria delbetalningar via Klarna.",
        "poster": "shopify://shop_images/IMG_9060_c4878ca5-2434-4e04-a448-b27f2da1bdc9.jpg"
      }
    },
    "trust": {
      "type": "hemprojekter-trust-bar",
      "blocks": {
        "t1": { "type": "trust_item", "settings": { "icon": "★", "text": "4.8 / 5 — 124 omdömen" } },
        "t2": { "type": "trust_item", "settings": { "icon": "✦", "text": "Fri frakt över 499 kr" } },
        "t3": { "type": "trust_item", "settings": { "icon": "↺", "text": "30 dagars öppet köp" } },
        "t4": { "type": "trust_item", "settings": { "icon": "⌖", "text": "Skickas från Sverige" } }
      },
      "block_order": ["t1", "t2", "t3", "t4"]
    },
    "demo": {
      "type": "hemprojekter-demo-showcase",
      "settings": {
        "kicker": "Se det själv",
        "heading": "Innan. Efter. Som magi.",
        "mode": "before_after",
        "image_before": "shopify://shop_images/IMG_9061.jpg",
        "image_after": "shopify://shop_images/IMG_9064_298b9991-44e6-42a9-be14-745a60679f80.jpg"
      }
    },
    "features": {
      "type": "hemprojekter-feature-triptych",
      "blocks": {
        "f1": { "type": "feature", "settings": { "icon": "✦", "heading": "Stjärnprojektion", "text": "Levande stjärnhimmel i hela rummet, justerbar intensitet och färg." } },
        "f2": { "type": "feature", "settings": { "icon": "◐", "heading": "8h timer", "text": "Somna till magin — den stänger av sig själv när du sover." } },
        "f3": { "type": "feature", "settings": { "icon": "♪", "heading": "Bluetooth-högtalare", "text": "Spela din lugna playlist direkt från enheten. Inga sladdar." } }
      },
      "block_order": ["f1", "f2", "f3"],
      "settings": { "kicker": "Vad du får", "heading": "Tre saker som gör skillnad." }
    },
    "story": {
      "type": "hemprojekter-story-block",
      "settings": {
        "kicker": "Vår tanke",
        "heading": "Designad för att göra det enkla magiskt.",
        "body": "<p>Hemprojekter började med en enkel idé: att vardagsrum förtjänar mer än vardagligt ljus. Vi byggde en projektor som förvandlar tak och väggar till en lugn, drömlik stjärnhimmel — utan installation, utan krångel.</p><p>Tryck på en knapp. Andas ut. Rummet känns plötsligt som någon annanstans.</p>",
        "image": "shopify://shop_images/IMG_9062_66de6bb6-e6b0-4bca-9f09-41decd96076b.jpg",
        "cta_label": "Köp Mini-projektorn",
        "cta_url": "shopify://products/mini-projektor-720p"
      }
    },
    "how": {
      "type": "hemprojekter-how-it-works",
      "blocks": {
        "s1": { "type": "step", "settings": { "heading": "Packa upp", "text": "Allt du behöver finns i lådan. USB-C-kabel ingår." } },
        "s2": { "type": "step", "settings": { "heading": "Sätt på", "text": "En knapptryckning — välj stjärnhimmel eller nordsken." } },
        "s3": { "type": "step", "settings": { "heading": "Andas ut", "text": "Rummet blir en plats du vill vara i." } }
      },
      "block_order": ["s1", "s2", "s3"],
      "settings": { "kicker": "Så funkar det", "heading": "Tre steg från låda till stjärnhimmel." }
    },
    "reviews": {
      "type": "hemprojekter-reviews-wall",
      "blocks": {
        "r1": { "type": "review", "settings": { "rating": 5, "quote": "Bästa köpet i år. Hela rummet förvandlas direkt.", "author": "Anna", "location": "Göteborg" } },
        "r2": { "type": "review", "settings": { "rating": 5, "quote": "Min dotter vägrar somna utan stjärnorna numera.", "author": "Mikael", "location": "Stockholm" } },
        "r3": { "type": "review", "settings": { "rating": 4, "quote": "Snabb leverans och otroligt mysig stämning.", "author": "Linnea", "location": "Malmö" } },
        "r4": { "type": "review", "settings": { "rating": 5, "quote": "Använder den varje kväll. Värt varenda krona.", "author": "Johan", "location": "Uppsala" } },
        "r5": { "type": "review", "settings": { "rating": 5, "quote": "Ser mycket dyrare ut än vad den kostar.", "author": "Sara", "location": "Örebro" } },
        "r6": { "type": "review", "settings": { "rating": 5, "quote": "Perfekt present. Personen som fick den blev helt såld.", "author": "Erik", "location": "Lund" } }
      },
      "block_order": ["r1","r2","r3","r4","r5","r6"],
      "settings": {
        "kicker": "Vad kunderna säger",
        "heading": "Bara läs själv.",
        "subheading": "Verkliga omdömen från Hemprojekter-kunder.",
        "product": "mini-projektor-720p",
        "avg_rating": "4.8",
        "review_count": "124"
      }
    },
    "faq": {
      "type": "hemprojekter-faq",
      "blocks": {
        "q1": { "type": "qa", "settings": { "question": "Hur länge tar leveransen?", "answer": "<p>1–3 arbetsdagar inom Sverige. Fri frakt över 499 kr.</p>" } },
        "q2": { "type": "qa", "settings": { "question": "Hur stort rum täcker den?", "answer": "<p>Upp till cirka 25 m². Bäst i mörker.</p>" } },
        "q3": { "type": "qa", "settings": { "question": "Kan jag returnera om jag ändrar mig?", "answer": "<p>Ja — 30 dagars öppet köp, inga frågor ställs.</p>" } },
        "q4": { "type": "qa", "settings": { "question": "Behövs en app?", "answer": "<p>Nej. Fjärrkontroll ingår. Allt funkar utan app eller wifi.</p>" } },
        "q5": { "type": "qa", "settings": { "question": "Är den barnvänlig?", "answer": "<p>Ja. Låg värmeutveckling, USB-C-driven, inga små lösa delar.</p>" } }
      },
      "block_order": ["q1","q2","q3","q4","q5"],
      "settings": { "kicker": "Vanliga frågor", "heading": "Det du undrar över — innan du undrar." }
    },
    "final": {
      "type": "hemprojekter-final-cta",
      "settings": {
        "kicker": "Sista steget",
        "heading": "Förvandla ditt rum ikväll.",
        "subheading": "Beställ före kl 14 — skickas samma dag.",
        "cta_label": "Köp Mini-projektorn — 499 kr",
        "cta_url": "shopify://products/mini-projektor-720p",
        "fine_print": "Fri frakt över 499 kr · 30 dagars öppet köp"
      }
    }
  },
  "order": ["hero", "trust", "demo", "features", "story", "how", "reviews", "faq", "final"]
}
```

- [ ] **Step 14.2: Set the sticky-bar product in settings_data.json**

Read `config/settings_data.json` and find the `"current"` object. Inside it, add:

```json
"hp_sticky_product": "mini-projektor-720p",
"hp_reduce_decorative_motion": false,
```

(Add these keys among the other settings — the exact location doesn't matter as long as they're inside `"current"`.)

- [ ] **Step 14.3: Validate the full theme**

```
mcp__shopify-dev-mcp__validate_theme on /Users/mattiassundberg/PROJECTS/shopify-hemprojekter
```

Resolve any reported errors before committing.

- [ ] **Step 14.4: Commit**

```bash
git add templates/index.json config/settings_data.json
git commit -m "feat(home): wire Aurora long-scroll homepage with all new sections"
```

---

## Task 15: README + housekeeping + final validation pass

**Files:**
- Create: `README.md`
- Create or modify: `.gitignore`
- Validation pass

- [ ] **Step 15.1: Create `README.md`**

```markdown
# Hemprojekter — Aurora Night Shopify theme

A Dawn 15.2.0 fork redesigned as a single-product long-scroll storefront for
[hemprojekter.se](https://hemprojekter.se/), built around the "Aurora Night"
design language: midnight-blue background, aurora gradient accents, editorial
serif typography, calm-premium conversion mechanics.

## Local development

```bash
shopify theme dev --store=<your-store>.myshopify.com
```

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
GitHub-integrated theme deployment.
```

- [ ] **Step 15.2: Create / extend `.gitignore`**

If `.gitignore` doesn't exist, create it; if it does, append:

```
.DS_Store
node_modules/
.shopify/
*.log
```

Then run: `git rm --cached .DS_Store` (if `.DS_Store` is tracked — check with `git ls-files | grep DS_Store` first; skip if not tracked).

- [ ] **Step 15.3: Run final validation**

```
mcp__shopify-dev-mcp__validate_theme on /Users/mattiassundberg/PROJECTS/shopify-hemprojekter
```

Read the full report. Fix any errors in the new files. Pre-existing Dawn warnings unrelated to our changes can be left.

- [ ] **Step 15.4: Smoke-check locally (optional but recommended)**

If the user has Shopify CLI installed:

```bash
cd /Users/mattiassundberg/PROJECTS/shopify-hemprojekter
shopify theme dev --store=<store>.myshopify.com
```

Open the preview URL. Verify:
- Homepage renders Aurora hero, trust bar, demo, features, story, how-it-works, reviews, FAQ, final CTA in order.
- Header is translucent over hero, becomes blurred-solid after scroll.
- Sticky bar slides in after scrolling past the hero CTA.
- FAQ accordion opens/closes without JS errors in the console.
- Mobile: trust bar wraps, sticky bar becomes full-width, hero text is readable.
- `prefers-reduced-motion: reduce` (Mac: System Settings → Accessibility) disables the scroll-cue animation and the sticky-bar slide-in transition is instant.

Report any visual gaps; do not claim completion without this check (or with a clear note that no local preview was possible).

- [ ] **Step 15.5: Commit**

```bash
git add README.md .gitignore
git commit -m "docs: README + .gitignore for Aurora theme"
```

- [ ] **Step 15.6: Hand off**

Tell the user:
1. All commits are local; nothing pushed.
2. Suggested next command for pushing to GitHub (e.g. `git remote add origin <url>` if needed, then `git push -u origin main`).
3. Note: the Aurora theme references existing `shopify://shop_images/...` and `shopify://products/mini-projektor-720p` from the live store; these resolve only when uploaded to the actual `hemprojekter.se` Shopify shop. Local preview against a different store will show missing-image placeholders for those references.

---

## Self-review

Re-check the plan against the spec:

| Spec requirement | Covered by |
|---|---|
| Fork Dawn 15.2.0; extend, not replace | Task 1 (intro), unchanged Dawn files |
| Aurora color tokens (`#0B1026`, `#7CFFCB`, `#A78BFA`, `#F0ABFC`, etc.) | Task 1 |
| Fonts: Fraunces / Inter / JetBrains Mono | Task 1 |
| Motion gated behind `prefers-reduced-motion` + theme toggle | Task 1 |
| WCAG AA contrast | enforced by token choice + Task 15 smoke check |
| Hero section (video/poster, CTA, Klarna line, demo anchor) | Task 3 |
| Trust bar | Task 4 |
| Demo showcase (video OR before/after) | Task 5 |
| Feature triptych | Task 6 |
| Story block | Task 7 |
| How it works (3 steps) | Task 8 |
| Reviews wall + Product JSON-LD | Task 9 |
| FAQ accordion (semantic `<details>`) | Task 10 |
| Final CTA | Task 11 |
| Sticky buy bar (snippet, IntersectionObserver) | Task 12 |
| Header — wordmark + cart, translucent over hero | Task 2 |
| Footer — 3 columns, payment icons, inline signup, no popup | Task 13 |
| Homepage wiring (`templates/index.json`) | Task 14 |
| Performance: pure-CSS aurora, lazy images, mobile-shorter hero video | Tasks 1, 3, 5, 7, 15 |
| Validation via Shopify MCP `validate_theme` | every task + Task 15 final |
| Out of scope: WebGL, AR, multi-language, reviews app, exit-intent, push-to-GitHub | not in any task |
| Frontend-design skill referenced for polish | plan header note |

No placeholders. All file paths exact. All code blocks self-contained. Type names consistent (`hp-*` class prefix throughout, section type `hemprojekter-*` matches both `sections/` files and `templates/index.json` references). Sticky bar JS in Task 12 reads `[data-hero-cta]`, which Task 3 actually emits inside the hero CTA anchor.
