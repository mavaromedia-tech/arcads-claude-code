# Kynd Tea Blends — Full Brand Brief

Reference companion to `CLAUDE.md`. Everything here is drawn from the live site (kyndtea.com) and public sources as of the research snapshot. Stock states and review counts drift — re-verify before relying on them.

## 1. Brand snapshot

| Field | Value |
|---|---|
| Brand | Kynd Tea Blends |
| Legal entity | KYND TEA BLENDS INC. |
| Site | https://kyndtea.com (Shopify) |
| Market | Canadian DTC, CAD default, Toronto-area |
| Positioning | Functional wellness tea — "whole botanicals, no dust" |
| Focus areas | Gut health · glow/skin · immunity · mind/focus |
| Tagline | "Be Kynd" |
| Owners | Not publicly named ("a small, passionate team") |
| General email | info@kyndtea.com |
| Press/wholesale | contact@kyndtea.com |
| Instagram | @kyndteablends (~1.9k followers, ~84 posts) |
| TikTok | @kyndteablends |
| Facebook | "Kynd Tea" |

⚠️ **kynd.life** (founder Matt Stenmark, Australia) is a completely separate, unrelated brand. Do not conflate.

## 2. Core values (as used on-site)

- **Function First** — every blend crafted with a purpose
- **Be Kynd** — to body, mind, and planet
- **No Dust** — whole botanicals only, never filler
- **Balance** — wellness that fits your lifestyle

## 3. Full product catalog

Single blends are loose-leaf, ~$19.95 CAD unless noted. All prices CAD. Ratings/stock are snapshot values.

| Product | Price | Was | Category | Caffeine-free | Rating | Stock |
|---|---|---|---|---|---|---|
| Limited Edition Poppy Infuser (accessory) | $41.00 | — | Accessory | — | 4.92 (24) | In stock |
| Be Snatched (detox) | $19.95 | — | Gut Health | No | 5.0 (4) | Sold out |
| Be Glowing | $19.95 | — | Mind & Skin | Yes | 5.0 (3) | In stock |
| Be Soothed | $19.95 | — | Gut Health | Yes | — | Sold out |
| Be Debloated | $24.95 | — | Gut Health | No | 5.0 (6) | Sold out |
| Be Balanced | $26.49 | — | Immunity & Wellness | No | 5.0 (3) | In stock |
| Be Regulated | $19.95 | — | Gut Health | Yes | 5.0 (4) | In stock |
| Be Reset | $19.95 | — | Gut Health | Yes | 5.0 (3) | Sold out |
| Be Replenished | $19.95 | — | Immunity & Wellness | No | 5.0 (3) | In stock |
| Be Focused | $19.95 | — | Mind & Skin | No | 5.0 (4) | In stock |
| Be Rooted | $19.95 | — | Immunity & Wellness | No | 5.0 (1) | Sold out |
| Be Present | $19.95 | — | Mind & Skin | Yes | 5.0 (3) | In stock |

Additional blends referenced by the brand's "Be ___" line but not all individually listed at snapshot time: **Be Grounded** (calm/focus). Confirm on-site before adding.

### Bundles

| Bundle | Price | Was | Rating | Stock |
|---|---|---|---|---|
| Best Seller Bundle | $84.95 | $105.00 | — | Sold out |
| Be Aligned Total Body Bundle | $94.95 | $105.00 | 5.0 (7) | In stock |
| Be Loved / Valentine's Bundle | $94.95 | $105.00 | 4.0 (1) | In stock |
| Seasonal Cozy (Winter) Bundle | from $79.00 | $100.00 | 5.0 (1) | In stock |

### Collections ("Shop by Need")

- **Gut Health** — Be Debloated, Be Soothed, Be Snatched, Be Regulated, Be Reset
- **Immunity & Wellness** — Be Replenished, Be Rooted, Be Balanced
- **Mind & Skin** — Be Glowing, Be Focused, Be Present
- **Caffeine-Free** — Be Present, Be Soothed, Be Reset, Be Glowing, Be Regulated

### Brew standard

1 tsp per 8 fl oz (250ml) · water at 85°C / 185°F · steep 5 minutes.

## 4. Reviews (real, on-site) — ~74 total, avg ~4.9★

Representative quotes used as testimonials in the build:
- Kelsey (Be Regulated) — sweet, creamy, stunning indigo colour; makes a pot for friends
- Nader (Be Focused) — "best tea I have ever had"
- Valerie (Poppy Infuser) — tiny holes, stands up on its own
- Aisha S (Poppy Infuser / Be Snatched) — "customer service is world class"; a functional art piece

## 5. Journal posts (real)

- **Dec 9, 2025** — "The Best Christmas Gifts for Tea Lovers in 2025"
- **Oct 8, 2025** — "The Science of Gut Health: How Functional Teas Support Digestion"
  (`/blogs/journal/the-science-of-gut-health-how-functional-teas-support-digestion`)

## 6. Shipping & fulfillment

- Free shipping: **Canada $75+ CAD**, **US $150+ USD**
- Stated processing: **1–2 business days**
- US free-ship threshold is high due to tariffs/import costs (brand says it's temporary)

## 7. Known business issues (context for the client — not site bugs)

1. **Heavy out-of-stock inventory** — ~6 of 16 products sold out at snapshot, directly hurting conversion.
2. **Shipping/fulfillment gap** — multiple customer reviews cite multi-week delays and poor back-order communication; the site's 1–2 day processing promise mismatches reported reality. One customer came close to a chargeback.
3. **Small social footprint** — ~1.9k IG followers = large growth runway.
4. **US shipping economics** — the $150 USD free-ship threshold is a conversion barrier for US buyers.

## 8. Image handling

Product/collection imagery is hotlinked from `https://kyndtea.com/cdn/shop/...`. Every `<img>` has an `onerror` fallback to a botanical gradient. For production, download and host the images locally, then swap the `src` values. Note: the Be Loved bundle source is a `.heic` (won't render in browsers) — replace it with a JPG/PNG when hosting locally.
