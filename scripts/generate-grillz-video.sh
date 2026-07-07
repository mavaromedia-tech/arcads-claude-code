#!/usr/bin/env bash
#
# generate-grillz-video.sh
# ------------------------------------------------------------------
# Animate references/products/grillz.jpg into a 3-second, 9:16 vertical
# luxury social ad clip using Kling 3.0 image-to-video via the Arcads
# external API.
#
# WHY KLING 3.0 (see .claude/skills/arcads-external-api/reference.md):
#   - Image-to-video: on the v2 endpoint, kling-3.0 (startFrame) is the only
#     currently-working image-to-video path. veo31/grok startFrame and sora2
#     referenceImages hit a 500 regression; seedance-2.0 works but its minimum
#     duration is 4s.
#   - Kling 3.0 duration range is 3-15s, so it can hit an exact 3s clip.
#   - startFrame = "animate THIS exact frame" -> the real photo is frame 1,
#     which is what keeps the teeth/diamond structure from morphing.
#   - Kling 3.0 does NOT take aspectRatio/resolution params; it inherits them
#     from the start frame. Our source image is 858x1539 (vertical 9:16), so
#     the output is vertical automatically.
#   - Kling is silent (no audio track) -> add a music bed in post.
#
# USAGE:
#   1. Ensure .env exists with ARCADS_API_KEY  (run ./scripts/setup.sh)
#   2. ./scripts/generate-grillz-video.sh
#
# Requires: bash, curl, jq. (python3 optional, only for dimension logging.)
# ------------------------------------------------------------------
set -euo pipefail

# ---- Config ------------------------------------------------------
BASE="${ARCADS_BASE_URL:-https://external-api.arcads.ai}"
IMAGE="references/products/grillz.jpg"
DURATION=3                       # seconds (Kling 3.0 supports 3-15)
MODEL="kling-3.0"
OUTDIR="outputs/grillz-video"
POLL_INTERVAL=5                  # seconds between status checks
POLL_MAX=90                      # max poll attempts (~7.5 min)

# ---- Motion prompt (image-to-video: describe MOTION only) --------
# The start frame already defines the content, so the prompt only steers
# how it moves: a slow macro push-in + right-to-left drift, still lips, and
# traveling diamond sparkle. Kept as one clean paragraph (no keyword soup).
read -r -d '' PROMPT <<'EOF' || true
Ultra-slow macro push-in on the diamond grillz, the camera drifting gently from right to left across the parted lips. The lips and teeth stay completely still, no movement of the mouth and no change to the shape or position of the teeth. As the camera creeps closer, light travels across the iced-out rose-gold grillz: individual diamonds ignite one after another with sharp white glints and tiny starburst flares that sweep across the surface, brilliant sparkle rippling over the pave stones while warm reflections roll along the rose-gold edges. Smooth, steady, deliberate motion with no shake, high contrast with deep shadows around the lips so the jewelry is the brightest thing in frame. Avoid: warping or morphing of the teeth, distorted or blurred diamonds, any mouth movement, text overlays.
EOF

# ---- Preconditions ----------------------------------------------
[ -f .env ] && set -a && . ./.env && set +a || { echo "ERROR: .env missing. Run ./scripts/setup.sh"; exit 1; }
: "${ARCADS_API_KEY:?ARCADS_API_KEY not set in .env}"
[ -f "$IMAGE" ] || { echo "ERROR: $IMAGE not found"; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq is required"; exit 1; }
mkdir -p "$OUTDIR"

# Resolve productId: use ARCADS_PRODUCT_ID if set, else first product.
PRODUCT_ID="${ARCADS_PRODUCT_ID:-}"
if [ -z "$PRODUCT_ID" ]; then
  echo "==> Resolving productId (GET /v1/products)"
  PRODUCT_ID=$(curl -sS -u "$ARCADS_API_KEY:" "$BASE/v1/products" | jq -r '.items[0].id // .[0].id // empty')
  [ -n "$PRODUCT_ID" ] || { echo "ERROR: could not resolve a productId; set ARCADS_PRODUCT_ID in .env"; exit 1; }
fi
echo "    productId=$PRODUCT_ID"

# ---- 1. Upload the image as a start frame (presigned S3) ---------
echo "==> Requesting presigned upload URL"
PRESIGN=$(curl -sS -X POST -u "$ARCADS_API_KEY:" -H "Content-Type: application/json" \
  -d '{"fileType":"image/jpeg"}' "$BASE/v1/file-upload/get-presigned-url")
PRESIGN_URL=$(echo "$PRESIGN" | jq -r '.presignedUrl')
START_FRAME=$(echo "$PRESIGN" | jq -r '.filePath')
[ -n "$PRESIGN_URL" ] && [ "$PRESIGN_URL" != "null" ] || { echo "ERROR: no presignedUrl"; echo "$PRESIGN"; exit 1; }

echo "==> Uploading $IMAGE to S3"
curl -sS -o /dev/null -X PUT -H "Content-Type: image/jpeg" --data-binary @"$IMAGE" "$PRESIGN_URL"
echo "    startFrame filePath=$START_FRAME"

# ---- 2. Generate the video (Kling 3.0 image-to-video) -----------
# NOTE: no aspectRatio / resolution fields — Kling 3.0 rejects/ignores them
# and inherits both from the vertical start frame.
PAYLOAD=$(jq -n \
  --arg model "$MODEL" \
  --arg productId "$PRODUCT_ID" \
  --arg prompt "$PROMPT" \
  --arg startFrame "$START_FRAME" \
  --argjson duration "$DURATION" \
  '{model:$model, productId:$productId, prompt:$prompt, duration:$duration, startFrame:$startFrame}')

echo "==> POST /v2/videos/generate ($MODEL, ${DURATION}s, image-to-video)"
CREATE=$(curl -sS -X POST -u "$ARCADS_API_KEY:" -H "Content-Type: application/json" \
  -d "$PAYLOAD" "$BASE/v2/videos/generate")
ASSET_ID=$(echo "$CREATE" | jq -r '.id // empty')
ASSET_TYPE=$(echo "$CREATE" | jq -r '.type // empty')
[ -n "$ASSET_ID" ] || { echo "ERROR: generation failed"; echo "$CREATE" | jq .; exit 1; }
echo "    id=$ASSET_ID type=$ASSET_TYPE"

# ---- 3. Poll until generated (try /videos, fall back to /assets) -
echo "==> Polling for completion"
VIDEO_URL=""
for i in $(seq 1 "$POLL_MAX"); do
  V=$(curl -sS -u "$ARCADS_API_KEY:" "$BASE/v1/videos/$ASSET_ID" 2>/dev/null || echo '{}')
  STATUS=$(echo "$V" | jq -r '.videoStatus // empty')
  if [ -z "$STATUS" ]; then                       # kling asset may live under /assets
    V=$(curl -sS -u "$ARCADS_API_KEY:" "$BASE/v1/assets/$ASSET_ID" 2>/dev/null || echo '{}')
    STATUS=$(echo "$V" | jq -r '.status // empty')
  fi
  echo "    [$i/$POLL_MAX] status=$STATUS"
  case "$STATUS" in
    generated|completed|ready|succeeded)
      VIDEO_URL=$(echo "$V" | jq -r '.videoUrl // .url // empty'); break ;;
    failed|error)
      echo "ERROR: generation failed"; echo "$V" | jq '.data.error // .error // .'; exit 1 ;;
  esac
  sleep "$POLL_INTERVAL"
done
[ -n "$VIDEO_URL" ] || { echo "ERROR: timed out waiting for video"; exit 1; }

# ---- 4. Download -------------------------------------------------
OUT="$OUTDIR/grillz-3s-9x16.mp4"
echo "==> Downloading -> $OUT"
curl -sS -o "$OUT" "$VIDEO_URL"
echo "DONE: $OUT"
( xdg-open "$OUTDIR" 2>/dev/null || open "$OUTDIR" 2>/dev/null || true ) >/dev/null 2>&1 || true
