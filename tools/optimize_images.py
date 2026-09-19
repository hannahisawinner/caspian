#!/usr/bin/env python3
"""Shrink website photos in place: resize, recompress, and strip hidden metadata (GPS, camera info).

Usage (run from the repo root):
    python3 tools/optimize_images.py                      # every image under images/
    python3 tools/optimize_images.py images/properties/newplace-card.jpg
    python3 tools/optimize_images.py images/properties/newplace/   # a whole folder
    python3 tools/optimize_images.py --dry-run            # show what WOULD change, write nothing

Safe to re-run: images that are already small enough, correctly sized and metadata-free are skipped.
Overwrites files, so keep your full-size originals somewhere else (git history also keeps old copies).
Needs Pillow:  pip3 install pillow
"""
import argparse
import io
import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageCms, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip3 install pillow")

# Size presets: (longest edge in pixels, target file size in KB).
# Chosen from how the site displays each kind of image (see style.css).
PRESETS = {
    "hero":    (1920, 350),  # full-width backgrounds, carousel, market/about heroes
    "card":    (1200, 260),  # images/properties/<name>-card.jpg (card + detail-page photo)
    "gallery": (1200, 250),  # images/properties/<name>/*  (before/after photos)
}
START_QUALITY = 82
MIN_QUALITY = 60
JPEG_FORMATS = {"JPEG", "MPO"}  # MPO is a camera variant of JPEG; re-saving normalises it


def preset_for(path: Path) -> str:
    if path.name.lower().endswith("-card.jpg"):
        return "card"
    parts = path.resolve().parts
    if "properties" in parts and len(parts) - parts.index("properties") > 2:
        return "gallery"
    return "hero"


def to_srgb(im: Image.Image) -> Image.Image:
    """Convert wide-gamut photos to sRGB so colours don't look dull once the profile is dropped."""
    icc = im.info.get("icc_profile")
    if icc:
        try:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            dst = ImageCms.createProfile("sRGB")
            im = ImageCms.profileToProfile(im, src, dst, outputMode="RGB")
        except Exception:
            pass
    return im.convert("RGB")


def has_hidden_metadata(im: Image.Image) -> bool:
    return bool(im.info.get("exif") or im.info.get("icc_profile") or im.info.get("xmp"))


def encode(im: Image.Image, target_kb: int) -> tuple[bytes, int]:
    q = START_QUALITY
    while True:
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        data = buf.getvalue()
        if len(data) <= target_kb * 1024 or q <= MIN_QUALITY:
            return data, q
        q = max(q - 3, MIN_QUALITY)


def process(path: Path, dry_run: bool):
    orig_size = path.stat().st_size
    try:
        im = Image.open(path)
        fmt = im.format
    except Exception:
        return None  # not an image
    if fmt not in JPEG_FORMATS:
        print(f"  SKIP  {path}  (format {fmt}; convert to .jpg first)")
        return None

    preset = preset_for(path)
    max_edge, target_kb = PRESETS[preset]
    w, h = im.size
    needs_resize = max(w, h) > max_edge
    dirty = has_hidden_metadata(im) or fmt != "JPEG"

    # 15% slack so a photo that already sits at the quality floor is not re-compressed on every run
    # (each re-compression would lose a little more quality).
    if not needs_resize and not dirty and orig_size <= target_kb * 1024 * 1.15:
        return orig_size, orig_size, "ok"

    im = ImageOps.exif_transpose(im)  # bake in rotation before metadata is dropped
    im = to_srgb(im)
    if needs_resize:
        im.thumbnail((max_edge, max_edge), Image.LANCZOS)
    data, q = encode(im, target_kb)

    if len(data) >= orig_size and not dirty:
        return orig_size, orig_size, "kept"  # never make a clean file bigger
    if not dry_run:
        tmp = path.with_name(path.name + ".tmp")
        tmp.write_bytes(data)
        os.replace(tmp, path)
    print(f"  {'WOULD ' if dry_run else ''}FIX   {path}  [{preset}] {w}x{h} -> {im.size[0]}x{im.size[1]}, "
          f"{orig_size // 1024}KB -> {len(data) // 1024}KB (q{q})")
    return orig_size, len(data), "fixed"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="*", default=["images"], help="files or folders (default: images/)")
    ap.add_argument("--dry-run", action="store_true", help="report only; change nothing")
    args = ap.parse_args()

    files = []
    for p in map(Path, args.paths):
        if p.is_dir():
            files += sorted(f for f in p.rglob("*") if f.is_file() and not f.name.startswith("."))
        elif p.is_file():
            files.append(p)
        else:
            sys.exit(f"Not found: {p}")

    before = after = fixed = 0
    for f in files:
        res = process(f, args.dry_run)
        if res:
            before += res[0]
            after += res[1]
            fixed += res[2] == "fixed"
        if res and f.suffix.lower() not in (".jpg", ".jpeg"):
            print(f"  NOTE  {f} has no .jpg extension; rename it to <name>.jpg (see CLAUDE.md).")
    print(f"\n{'Would change' if args.dry_run else 'Changed'} {fixed} of {len(files)} files: "
          f"{before / 1048576:.1f}MB -> {after / 1048576:.1f}MB")


if __name__ == "__main__":
    main()
