# CLAUDE.md — Kynd Tea Blends Website

Claude Code reads this file automatically at the start of every session. Keep it lean and high-signal. Full reference data lives in `docs/brand-brief.md` — read it before touching product data, copy, or pricing.

## What this project is

A premium marketing-site rebuild for **Kynd Tea Blends** (kyndtea.com), a Canadian DTC brand selling functional loose-leaf wellness teas. The deliverable is `kynd-tea.html` — a **single self-contained HTML file** (no build step, deployable as-is to Netlify/Vercel/any static host).

It is a **front-end concept**: buttons link out to the live kyndtea.com product/checkout pages rather than running a real cart. Product imagery is hotlinked from the brand's Shopify CDN with a botanical-gradient fallback on error.

## Brand facts (non-negotiable)

- **Name:** Kynd Tea Blends · **Legal entity:** KYND TEA BLENDS INC. · **Site:** kyndtea.com
- **Positioning:** functional wellness tea — "whole botanicals, no dust" — for gut health, glow, immunity, mind/focus
- **Tagline:** "Be Kynd" · **Voice:** warm, calm, feminine self-care; not clinical, not hypey
- **Products:** all named `Be ___` (Be Snatched, Be Glowing, etc.); hero accessory is the **Poppy Infuser**
- **Emails:** info@kyndtea.com (general), contact@kyndtea.com (press/wholesale)
- **Socials:** IG [@kyndteablends](https://www.instagram.com/kyndteablends/), TikTok @kyndteablends, Facebook "Kynd Tea"
- ⚠️ **kynd.life (Matt Stenmark, Australia) is a DIFFERENT, unrelated brand. Never conflate the two.**

## Brand palette (confirmed by client — warm beige + dusty blush + soft green)

Use these CSS variables; do not drift from them.

```
--ink:#2E4034        /* deep eucalyptus green — primary text + dark sections    */
--forest:#37503f     /* deep green section background                            */
--jade:#94B197       /* soft sage — secondary green / specs                      */
--jade-deep:#5F7D64  /* deeper sage — eyebrows + links on light                  */
--amber:#C4867F      /* DUSTY BLUSH — primary accent (buttons, stars, highlights)*/
--amber-soft:#E3B7B0 /* soft blush                                               */
--porcelain:#F6EFE3  /* warm cream — main light background                       */
--porcelain-2:#ECE0CE/* deeper warm beige — alt band                            */
--sage:#CBD6C6       /* muted light green — secondary text on dark               */
--ink-soft:#5E6F61   /* muted green-grey — secondary text on light              */
```

Blush is the accent that carries the brand. Newsletter block is a blush gradient (`#CE9890 → #A96F68`); reviews sit on a blush band (`#F1E4DE`); footer is deep green (`#26382d`). Hero + brew-ritual are the two deep-green "grounding" sections; everything else is light/airy.

Note: the palette was set from the client's stated direction, not pixel-sampled from the live theme. If the client provides exact hexes or a screenshot, match those precisely and update this block.

## Tech stack & conventions

- **Single-file HTML.** All CSS and JS inline. No frameworks, no bundler.
- **Fonts (Google Fonts):** Fraunces (display serif), Hanken Grotesk (body), JetBrains Mono (eyebrows/specs).
- **3D:** Three.js **r128** via cdnjs — the hero is a particle "steeping infusion" vortex + rising steam, recoloured to cream/sage/blush. It pauses off-screen and on tab-hidden, and respects `prefers-reduced-motion`.
- **Interactions:** vanilla JS only — IntersectionObserver scroll-reveals, steep scroll-progress bar, filterable product grid, FAQ accordion, infuser 3D tilt, mobile menu.
- **No browser storage** in any embedded/artifact context.
- **Accessibility floor:** visible focus states, semantic sections, alt text, reduced-motion support. Keep it.

## Working rules

- **Accuracy first. Real data over placeholders.** Product names, prices (CAD), ratings, and stock states must match `docs/brand-brief.md`. Flag anything you can't verify — never invent review text, stats, or health claims.
- Keep health/benefit copy **soft and non-medical** (mood/benefit words the brand itself uses), never clinical claims.
- The "million-dollar aesthetic" is the bar: premium motion, immersive but tasteful. **No cheesy effects** (lens flares, light sweeps) — the client considers those dealbreakers.
- Preserve the single-file, no-build format unless the client explicitly asks to split it.
- Get **palette/direction sign-off before large rebuilds** — a colour mismatch previously required a full redo.

## Current state (done)

Full premium single-file site built in the confirmed beige/blush/green palette. Sections: 3D hero, trust marquee, filterable 16-product grid (with real imagery/prices/ratings/sold-out states), Shop by Need (4 collections), Poppy Infuser feature (3D tilt), 4-step brew ritual, Be Kynd values, real customer reviews, 2 journal posts, Instagram grid, FAQ accordion, newsletter, full footer.

## Likely next tasks

- Host product images locally instead of hotlinking the Shopify CDN (see fallback logic in the grid JS).
- Refresh stock/rating data — it's a research snapshot and drifts daily.
- Optional: matching product-detail page, real cart integration, or a Shopify theme port.
- Business issues worth surfacing to the client (context, not site bugs): heavy out-of-stock inventory, shipping-delay complaints vs. the stated 1–2 day promise, small social footprint, US free-ship threshold ($150). Detail in `docs/brand-brief.md`.

## Files

- `kynd-tea.html` — the site (open in any browser)
- `docs/brand-brief.md` — full brand + product reference (read before editing content/data)
- `scroll-hero/` — standalone scroll-driven hero experience (Three.js r128). Scrubs a 150-frame sequence (extracted from `scroll-hero/kynd-hero-fallin-10s-1080p60.mp4` at 1280×720) forward on scroll down, backward on scroll up, with adjacent-frame blending in a shader, soft edge melt into a cream/blush/sage gradient, hero headline, and a closing CTA to kyndtea.com. Serve the folder over HTTP (e.g. `python3 -m http.server`) — frames won't load from `file://`. Regenerate frames: `ffmpeg -i kynd-hero-fallin-10s-1080p60.mp4 -vf "select=not(mod(n\,4)),scale=1280:720" -vsync vfr -q:v 4 frames/frame_%03d.jpg`.
