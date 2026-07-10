# Zebi Refrigeration & Air Conditioning Inc. — scroll-driven site

A single-page marketing site for **Zebi Refrigeration & Air Conditioning Inc.**
(Mississauga, ON — est. 2000, licensed, insured & T.S.S.A. registered), with a
scroll-driven 3D hero: the `acherofallin10s1080p60` video plays **forward as you
scroll down and in reverse as you scroll up**, rendered with **Three.js**.

## How the hero works

- The 10 s / 60 fps source video was pre-extracted into **150 JPEG frames**
  (`frames/frame_001.jpg … frame_150.jpg`, every 4th frame, 1280×720) with ffmpeg.
- `js/main.js` builds a Three.js scene: an orthographic camera and a single
  full-viewport plane whose texture is swapped to the frame that matches the
  scroll position inside the 520 vh hero track (`#scroll-stage`).
- Scroll progress is eased (lerped) each animation frame, so scrubbing feels
  fluid in both directions; frames load progressively (every 8th first, then
  gaps fill in) so the page is interactive almost immediately.
- Caption stages fade in/out at fixed progress ranges, Apple-product-page style.
- `prefers-reduced-motion` is respected; if WebGL is unavailable the hero falls
  back to a static frame.

## Run locally

Any static server works (ES modules require http, not file://):

```bash
cd zebi-hvac-site
python3 -m http.server 8080
# → http://localhost:8080
```

Three.js (r160) is vendored at `js/vendor/three.module.js`; the site is fully
self-contained with no external requests.

## Content notes / TODO before going live

- **Contact details** (phone (416) 710-6130, email
  zebiheatingandcooling@gmail.com, hours Mon–Sat 9am–9pm / Sun closed,
  Visa/Mastercard/Amex/Discover accepted, "your final stop for comfort"
  tagline) were taken from Zebi's current Wix site. The offers section
  ($99 A/C tune-up, $500 off new system installation, free service call
  with any repair), 24/7 emergency service and "all makes & models"
  messaging come from the company's newer site design (zebihvac.com).
- **Quote form:** opens the visitor's email app pre-addressed to
  zebiheatingandcooling@gmail.com. For silent submissions, wire it to a form
  backend (Formspree, Netlify Forms, etc.) instead.
- **Testimonials:** illustrative placeholders written from the company's
  positioning ("satisfaction is our #1 priority"); replace with real reviews
  from their Facebook recommendations.
- Other verified facts used throughout: Mississauga base, serving the GTA,
  operating since 2000, fully licensed / insured / T.S.S.A. registered,
  heating + cooling + refrigeration services.

## Regenerating frames

```bash
ffmpeg -i acherofallin10s1080p60.mp4 \
  -vf "select='not(mod(n\,4))',scale=1280:-2" -vsync vfr -q:v 6 \
  frames/frame_%03d.jpg
```
