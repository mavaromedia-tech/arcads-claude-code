# Aziz The Jeweller — Scroll-Driven 3D Hero Site

One-page brand site for **Aziz The Jeweller** (Toronto & Dubai — custom pieces, bridal, gold buyer).

The hero is a **scroll-driven frame animation built with Three.js**: the
`jewelryherofallin10s1080p60` video (gold marquise ring, iced-out "on2louie"
pendant, oval solitaire falling onto velvet podiums) was pre-extracted into
150 JPEG frames. As you scroll down the video plays forward; scroll up and it
reverses. The footage is rendered as a texture on a plane in a WebGL scene with
gold-dust particles, fog, and mouse parallax.

## The Vault (showcase gallery)

A gallery of real pieces from Aziz's Instagram (`images/work/`). On desktop the
section pins and vertical scrolling slides the pieces sideways, spotlighting one
at a time; clicking a piece opens a full-screen close-up with arrow-key
navigation. On phones and with reduced motion enabled it falls back to a plain
stacked grid. To add a piece, copy a `<figure class="piece">` block in
`index.html` and set `--r` to the photo's width ÷ height.

## Run it

Any static server works (ES modules + image fetches need http, not file://):

```bash
cd aziz-jeweller-site
python3 -m http.server 8000
# open http://localhost:8000
```

Three.js is loaded from a CDN via an import map (internet required on first load).

## Structure

- `index.html` — hero + Story / Collection / Services / Contact sections
- `css/style.css` — dark luxury theme, gradient background, responsive
- `js/main.js` — Three.js scene, frame preloader, scroll scrubbing, parallax
- `frames/` — 150 frames (1280×720 JPEG) extracted at 15fps equivalent from the 10s/60fps source

## Regenerating frames

```bash
ffmpeg -i jewelryherofallin10s1080p60.mp4 \
  -vf "select='not(mod(n,4))',scale=1280:720" -vsync vfr -q:v 5 \
  frames/frame_%03d.jpg
```
