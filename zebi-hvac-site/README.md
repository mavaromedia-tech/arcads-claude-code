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

- **Phone & email:** Zebi's phone number and email are not published in any
  source we could access, so the contact section links to their
  [Facebook page](https://www.facebook.com/heatingandairconditionandrefrigeration/)
  and uses a demo quote form. Add the real `tel:` / `mailto:` links in
  `index.html` (`#contact` section and nav CTA) before launch.
- **Quote form:** front-end demo only — wire it to a form backend
  (Formspree, Netlify Forms, etc.) or a `mailto:`.
- **Testimonials:** illustrative placeholders written from the company's
  positioning ("satisfaction is our #1 priority"); replace with real reviews
  from their Facebook recommendations.
- Verified facts used throughout: Mississauga base, serving the GTA,
  operating since 2000, fully licensed / insured / T.S.S.A. registered,
  heating + cooling + refrigeration services.

## Regenerating frames

```bash
ffmpeg -i acherofallin10s1080p60.mp4 \
  -vf "select='not(mod(n\,4))',scale=1280:-2" -vsync vfr -q:v 6 \
  frames/frame_%03d.jpg
```
