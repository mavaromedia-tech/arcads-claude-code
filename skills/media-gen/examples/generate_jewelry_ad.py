#!/usr/bin/env python3
"""
Two corrected paths for the drama-mask grillz ad. Pick ONE via --mode.

  orbit  : text-to-video hero shot (camera rotates around the piece).
           Product is AI-invented from the prompt -- will NOT match your
           real grillz exactly. Use for a stylized hero/reveal.

  product: image-to-video from your REAL photo. Exact product preserved.
           Motion limited to slow push-in + parallax + diamond sparkle
           (NO orbit -- a single still can't show the back of the piece).

Requirements:
  pip install fal-client         # + ffmpeg on PATH for the crop/trim helpers
  export FAL_KEY="<key>:<secret>"

IMPORTANT: verify the model slugs at fal.ai/models before running -- Luma's
slug in particular drifts (often .../ray-2). Quote cost first: fal bills video
per second and has no billing endpoint.
"""
from __future__ import annotations
import argparse, os, shutil, subprocess, sys, urllib.request
from pathlib import Path

try:
    import fal_client
except ImportError:
    sys.exit("Run: pip install fal-client")

# --- prompts -----------------------------------------------------------------
ORBIT_PROMPT = (
    "Cinematic 4K high-end jewelry commercial macro shot. A set of rose gold teeth "
    "grillz fully iced out with flawless shimmering VVS diamonds; in the center a "
    "highly polished solid rose-gold comedy-and-tragedy drama mask emblem catches the "
    "light. The camera slowly orbits and pushes in as the grillz rest on a black velvet "
    "pedestal in a moody deep-black studio. Dramatic hyper-realistic volumetric lighting, "
    "intense diamond sparkle, sharp starburst lens flares, slow-motion premium luxury look."
)
PRODUCT_MOTION_PROMPT = (
    "Ultra-smooth slow cinematic macro push-in with a subtle parallax drift on the "
    "rose-gold diamond grillz and the central comedy-and-tragedy drama mask emblem. The "
    "product stays locked and still -- no morphing, no warping. Only motion is the dynamic "
    "play of light: individual pave diamonds catch brilliant white specular highlights in "
    "sequence, crisp starburst lens flares roll across the iced-out surface, rose-gold edges "
    "glint warm against the deep-black velvet. Studio commercial lighting, high contrast, "
    "photorealistic, razor-sharp facets, luxury jewelry ad aesthetic."
)
NEGATIVE = ("product morphing, warping, distortion, blurring diamond detail, deforming "
            "emblem, text, watermark, low quality")

# --- helpers -----------------------------------------------------------------
def crop_panel(src: Path, panel: int, panels: int = 3) -> Path:
    """Crop one vertical panel out of an N-panel composite (1-indexed)."""
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg needed to crop the composite; or pass an already-cropped --image")
    out = src.with_name(f"{src.stem}-panel{panel}.png")
    # in_w/panels wide, full height, offset by (panel-1) panels
    vf = f"crop=in_w/{panels}:in_h:(in_w/{panels})*{panel-1}:0"
    subprocess.run(["ffmpeg", "-y", "-i", str(src), "-vf", vf, str(out)],
                   check=True, capture_output=True)
    print(f"      cropped panel {panel} -> {out.name}")
    return out

def trim(master: Path, seconds: float, out: Path) -> None:
    if seconds <= 0 or not shutil.which("ffmpeg"):
        shutil.copy2(master, out); return
    subprocess.run(["ffmpeg", "-y", "-i", str(master), "-t", str(seconds),
                    "-c", "copy", "-movflags", "+faststart", str(out)],
                   check=True, capture_output=True)

# --- main --------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["orbit", "product"], required=True)
    ap.add_argument("--image", default="source-IMG_2676.jpeg", help="Composite or single frame")
    ap.add_argument("--panel", type=int, default=3, help="Which panel to animate (product mode)")
    ap.add_argument("--model", default=None, help="Override fal slug")
    ap.add_argument("--gen-duration", type=int, default=5, help="5 or 10 (10 ~2x cost)")
    ap.add_argument("--trim", type=float, default=3.0, help="Final length; 0 = keep full")
    ap.add_argument("--out", default="grillz-ad.mp4")
    args = ap.parse_args()

    if not os.environ.get("FAL_KEY"):
        sys.exit('FAL_KEY not set. export FAL_KEY="<key>:<secret>"')

    if args.mode == "orbit":
        model = args.model or "fal-ai/luma-dream-machine"   # VERIFY slug at fal.ai/models
        payload = {"prompt": ORBIT_PROMPT, "aspect_ratio": "9:16", "loop": False}
        print(f"[orbit] text-to-video via {model} -- product will be AI-invented.")
    else:  # product
        model = args.model or "fal-ai/kling-video/v3/pro/image-to-video"
        img = Path(args.image)
        if not img.is_file():
            sys.exit(f"Image not found: {img}")
        frame = crop_panel(img, args.panel) if args.panel else img
        print(f"[product] uploading {frame.name} ...")
        image_url = fal_client.upload_file(str(frame))
        payload = {
            "image_url": image_url,          # 9:16 inherited from this frame
            "prompt": PRODUCT_MOTION_PROMPT,
            "negative_prompt": NEGATIVE,
            "duration": args.gen_duration,
            "cfg_scale": 0.5,                # lower = more faithful to the still
        }

    print(f"Generating {args.gen_duration}s (1-3 min)...")
    result = fal_client.subscribe(model, arguments=payload, with_logs=True)
    video_url = result["video"]["url"]

    master = Path(f"grillz-{args.mode}-master.mp4")
    urllib.request.urlretrieve(video_url, master)
    print(f"master -> {master}")
    trim(master, args.trim, Path(args.out))
    print(f"done -> {args.out}")

if __name__ == "__main__":
    main()
