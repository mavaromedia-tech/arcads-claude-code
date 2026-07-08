#!/usr/bin/env python3
"""
Animate the diamond grillz still into a 3s vertical (9:16) luxury ad clip.

Pipeline:
  1. Upload the source image to Fal.
  2. Image-to-video via Kling v3 Pro (best specular glint on faceted surfaces).
  3. Generate at 5s (nearest supported duration), then trim to exactly 3.0s
     with a lossless ffmpeg stream-copy so you get the 3s ad you asked for.

Requirements:
  pip install fal-client
  export FAL_KEY="<key>:<secret>"
  ffmpeg on PATH (for the 3s trim; skip --trim to keep the raw 5s master)

Note: aspect ratio is inherited from the source image (already 9:16), so no
aspect flag is needed. Kling exposes discrete durations (5s/10s); we make the
5s master then trim, which is the reliable path to a clean 3.0s clip.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

try:
    import fal_client
except ImportError:
    sys.exit("Run: pip install fal-client")

MODEL = "fal-ai/kling-video/v3/pro/image-to-video"

MOTION_PROMPT = (
    "Ultra-smooth, slow cinematic macro push-in on the diamond-encrusted rose gold "
    "grillz, with a subtle right-to-left camera drift. The lips, teeth, and grillz "
    "stay completely locked and still - no morphing, no warping, no change to tooth "
    "shape. The only motion is the dynamic play of light: individual pave diamonds "
    "catch and release brilliant white specular highlights in sequence as the camera "
    "moves, producing crisp starburst lens flares and rolling sparkle across the "
    "iced-out surface; rose-gold edges glint warm. Studio commercial lighting, high "
    "contrast, photorealistic, razor-sharp facets, luxury jewelry advertisement "
    "aesthetic, steady high-frame-rate feel."
)

NEGATIVE_PROMPT = (
    "teeth morphing, warping, distortion, blurring diamond detail, lips moving, "
    "face deforming, text, watermark, low quality"
)


def build_payload(image_url: str, gen_duration: int, audio: bool) -> dict:
    """The Fal request body. This is the 'API payload configuration'."""
    return {
        "image_url": image_url,          # source still (9:16 inherited from here)
        "prompt": MOTION_PROMPT,
        "negative_prompt": NEGATIVE_PROMPT,
        "duration": gen_duration,        # Kling supports 5 / 10; we trim to 3s after
        "cfg_scale": 0.5,                # lower = more faithful to the still, less drift
        # "audio": audio,                # uncomment if your endpoint takes an audio flag
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", default="source-IMG_2676.jpeg", help="Path to source still")
    ap.add_argument("--gen-duration", type=int, default=5, help="Supported gen length (5 or 10)")
    ap.add_argument("--trim", type=float, default=3.0, help="Final clip length in seconds (0 = no trim)")
    ap.add_argument("--audio", action="store_true", help="Request audio (costs more)")
    ap.add_argument("--out", default="grillz-ad-3s.mp4")
    args = ap.parse_args()

    if not os.environ.get("FAL_KEY"):
        sys.exit("FAL_KEY not set. export FAL_KEY=\"<key>:<secret>\"")

    img = Path(args.image)
    if not img.is_file():
        sys.exit(f"Image not found: {img}")

    print(f"[1/3] Uploading {img.name} to Fal...")
    image_url = fal_client.upload_file(str(img))

    payload = build_payload(image_url, args.gen_duration, args.audio)
    print(f"[2/3] Generating {args.gen_duration}s via {MODEL} (1-3 min)...")
    result = fal_client.subscribe(MODEL, arguments=payload, with_logs=True)

    video_url = result["video"]["url"]
    master = Path(f"grillz-ad-{args.gen_duration}s-master.mp4")
    urllib.request.urlretrieve(video_url, master)
    print(f"      master saved -> {master}")

    if args.trim and args.trim > 0:
        if not shutil.which("ffmpeg"):
            print("      ffmpeg missing; keeping full-length master, skipping trim.")
            return
        print(f"[3/3] Trimming to {args.trim}s (lossless)...")
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(master), "-t", str(args.trim),
             "-c", "copy", "-movflags", "+faststart", args.out],
            check=True, capture_output=True,
        )
        print(f"      done -> {args.out}")
    else:
        shutil.copy2(master, args.out)
        print(f"[3/3] No trim -> {args.out}")


if __name__ == "__main__":
    main()
