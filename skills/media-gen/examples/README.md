# media-gen examples

Standalone reference scripts built while producing a diamond-grillz product ad.
They call Fal directly via `fal-client` (independent of `scripts/generate.py`) and
are meant as copy-and-adapt starting points.

## Prerequisites

```bash
pip install fal-client        # + ffmpeg on PATH for crop/trim helpers
export FAL_KEY="<key>:<secret>"
```

> Note: Fal (`fal.run` / `fal.ai`) must be reachable from where you run these.
> Claude Code on the web may block it via the environment network policy — run
> these locally, or open the policy to allow `fal.run`.

## `generate_jewelry_ad.py`

Two modes for animating a product still into a vertical (9:16) ad:

- `--mode orbit` — text-to-video hero shot (camera orbits the piece). The product
  is AI-invented from the prompt and will **not** match a real product exactly.
- `--mode product` — image-to-video from your real photo. Exact product preserved;
  motion limited to slow push-in + parallax + sparkle (a single still can't orbit).

Auto-crops one panel out of an N-panel composite, generates at a supported
duration (5s/10s), and optionally trims to a target length.

```bash
# Exact product, pedestal panel, native 10s, keep full length:
python generate_jewelry_ad.py --mode product --image composite.jpg --panel 3 \
  --gen-duration 10 --trim 0
```

## `animate_grillz.py`

Single-purpose image-to-video: generates a 5s Kling v3 Pro master and trims to a
clean 3.0s clip (models expose discrete 5s/10s durations, so trimming is the
reliable path to an exact 3s).

```bash
python animate_grillz.py --image source.jpeg --gen-duration 5 --trim 3.0
```

## Cost

Fal bills video per second and has no billing endpoint. Quote before running and
confirm live pricing at fal.ai. Kling v3 Pro (from `../models.json`, verified
2026-05-21): ~$0.112/s audio off, ~$0.168/s audio on.
