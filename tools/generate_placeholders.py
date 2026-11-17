#!/usr/bin/env python3
"""Generate lightweight SVG placeholder images for the demo site.

Real product photography can replace these files later without any HTML/CSS
changes: keep the same filenames and just swap the images (or update the
`image` fields in data/products.json and data/blog.json).
"""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCT_DIR = ROOT / "images" / "products"
BLOG_DIR = ROOT / "images" / "blog"
IMAGES_DIR = ROOT / "images"

CATEGORY_STYLE = {
    "pain-relief": ("#E8F5E9", "#2E7D32", "🩹"),
    "skin-care": ("#F1F8E9", "#43A047", "🌿"),
    "hair-care": ("#E0F7FA", "#00897B", "💆"),
    "oral-care": ("#E3F2FD", "#1976D2", "🦷"),
    "digestive-care": ("#F1F8E9", "#7CB342", "🍃"),
    "mother-tinctures": ("#FFF8E1", "#F9A825", "🌱"),
    "bio-chemic": ("#F3E5F5", "#7B1FA2", "💊"),
    "ointments": ("#FFF3E0", "#EF6C00", "🧴"),
}


def esc(value: str) -> str:
    return html.escape(str(value), quote=True)


def wrap_label(text: str, width: int = 18) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) > width and current:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines[:2]


def product_svg(name: str, category: str, number: int, variant: int = 0) -> str:
    bg, accent, icon = CATEGORY_STYLE.get(category, ("#F5F5F5", "#2E7D32", "🌿"))
    view_icons = [icon, "🧴", "📋", "🌿"]
    view_icon = view_icons[variant]
    view_label = f"VIEW {variant + 1:02d} · PRODUCT {number:02d}" if variant else f"PRODUCT PLACEHOLDER · {number:02d}"
    lines = wrap_label(name)
    label = "".join(
        f'<text x="300" y="{412 + i * 26}" text-anchor="middle" '
        f'font-family="Poppins,Arial,sans-serif" font-size="21" font-weight="600" '
        f'fill="#263238">{esc(line)}</text>'
        for i, line in enumerate(lines)
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="{esc(name)} placeholder image">
  <defs>
    <linearGradient id="bg{number}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="{bg}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" rx="28" fill="url(#bg{number})"/>
  <circle cx="300" cy="265" r="158" fill="#FFFFFF" opacity="0.75"/>
  <circle cx="300" cy="265" r="128" fill="none" stroke="{accent}" stroke-opacity="0.16" stroke-width="2"/>
  <g>
    <rect x="252" y="130" width="96" height="34" rx="8" fill="{accent}" opacity="0.9"/>
    <rect x="240" y="158" width="120" height="190" rx="22" fill="#FFFFFF" stroke="{accent}" stroke-opacity="0.35" stroke-width="3"/>
    <rect x="252" y="205" width="96" height="96" rx="10" fill="{bg}"/>
    <text x="300" y="267" text-anchor="middle" font-size="48">{view_icon}</text>
    <circle cx="452" cy="356" r="13" fill="{accent}" opacity="0.18"/>
    <circle cx="416" cy="382" r="8" fill="{accent}" opacity="0.28"/>
    <circle cx="150" cy="372" r="10" fill="{accent}" opacity="0.22"/>
  </g>
  {label}
  <text x="300" y="486" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="15" letter-spacing="2" fill="#607D8B">HOMEOKIT HOMOEOPATHY</text>
  <text x="300" y="530" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" fill="#90A4AE">{view_label}</text>
</svg>
'''


def blog_svg(title: str, category: str, number: int) -> str:
    palettes = [
        ("#E8F5E9", "#2E7D32"),
        ("#E0F7FA", "#00897B"),
        ("#FFF8E1", "#F9A825"),
        ("#F3E5F5", "#7B1FA2"),
        ("#F1F8E9", "#43A047"),
    ]
    bg, accent = palettes[(number - 1) % len(palettes)]
    words = title.split()[:5]
    short = " ".join(words) + ("…" if len(title.split()) > 5 else "")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="900" height="520" role="img" aria-label="{esc(title)} placeholder image">
  <defs>
    <linearGradient id="bgn{number}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{bg}"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="900" height="520" rx="24" fill="url(#bgn{number})"/>
  <circle cx="740" cy="90" r="180" fill="{accent}" opacity="0.07"/>
  <circle cx="120" cy="460" r="150" fill="{accent}" opacity="0.06"/>
  <g stroke="{accent}" stroke-opacity="0.35" stroke-width="3" fill="none">
    <path d="M690 420 C660 330 700 240 780 175"/>
    <path d="M700 360 C650 340 620 300 610 260"/>
    <path d="M720 300 C770 290 800 260 820 220"/>
    <path d="M680 400 C640 400 610 380 590 350"/>
  </g>
  <g fill="{accent}" opacity="0.28">
    <ellipse cx="610" cy="258" rx="26" ry="12" transform="rotate(35 610 258)"/>
    <ellipse cx="820" cy="218" rx="28" ry="13" transform="rotate(-30 820 218)"/>
    <ellipse cx="590" cy="348" rx="24" ry="11" transform="rotate(20 590 348)"/>
    <ellipse cx="780" cy="174" rx="26" ry="12" transform="rotate(-45 780 174)"/>
  </g>
  <text x="56" y="300" font-family="Poppins,Arial,sans-serif" font-size="34" font-weight="700" fill="#263238">{esc(short)}</text>
  <rect x="56" y="336" width="150" height="36" rx="18" fill="{accent}" opacity="0.12"/>
  <text x="131" y="360" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="{accent}">{esc(category.upper())}</text>
  <text x="56" y="418" font-family="Inter,Arial,sans-serif" font-size="14" fill="#90A4AE">BLOG PLACEHOLDER · {number:02d}</text>
</svg>
'''


def hero_svg() -> str:
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760" role="img" aria-label="Homeopathy medicine bottle with herbs illustration">
  <defs>
    <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F1F8E9"/>
      <stop offset="100%" stop-color="#E0F2F1"/>
    </linearGradient>
    <linearGradient id="bottle" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#C8E6C9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="760" rx="32" fill="url(#heroBg)"/>
  <circle cx="930" cy="180" r="240" fill="#FFFFFF" opacity="0.55"/>
  <circle cx="330" cy="640" r="190" fill="#00897B" opacity="0.05"/>
  <ellipse cx="690" cy="660" rx="270" ry="38" fill="#2E7D32" opacity="0.08"/>
  <g stroke="#2E7D32" stroke-opacity="0.35" stroke-width="5" fill="none">
    <path d="M1010 630 C940 500 965 340 1085 210"/>
    <path d="M980 520 C900 500 855 445 830 380"/>
    <path d="M1030 420 C1105 400 1150 350 1170 290"/>
    <path d="M250 700 C210 590 230 480 310 400"/>
  </g>
  <g fill="#43A047" opacity="0.28">
    <ellipse cx="830" cy="378" rx="48" ry="20" transform="rotate(35 830 378)"/>
    <ellipse cx="1170" cy="288" rx="52" ry="22" transform="rotate(-30 1170 288)"/>
    <ellipse cx="1085" cy="208" rx="50" ry="22" transform="rotate(-45 1085 208)"/>
    <ellipse cx="310" cy="398" rx="44" ry="19" transform="rotate(40 310 398)"/>
  </g>
  <g>
    <rect x="510" y="150" width="180" height="58" rx="12" fill="#1B5E20"/>
    <rect x="480" y="200" width="240" height="420" rx="40" fill="url(#bottle)" stroke="#2E7D32" stroke-opacity="0.3" stroke-width="4"/>
    <rect x="506" y="310" width="188" height="200" rx="16" fill="#FFFFFF" opacity="0.95"/>
    <text x="600" y="372" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-size="28" font-weight="700" fill="#2E7D32">Homeokit</text>
    <text x="600" y="404" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" letter-spacing="3" fill="#00897B">HOMOEOPATHY</text>
    <path d="M560 430 Q600 400 640 430 Q600 470 560 430Z" fill="#43A047" opacity="0.75"/>
    <circle cx="455" cy="570" r="18" fill="#FFFFFF" stroke="#2E7D32" stroke-opacity="0.25" stroke-width="3"/>
    <circle cx="500" cy="605" r="13" fill="#FFFFFF" stroke="#2E7D32" stroke-opacity="0.25" stroke-width="3"/>
    <circle cx="745" cy="585" r="16" fill="#FFFFFF" stroke="#2E7D32" stroke-opacity="0.25" stroke-width="3"/>
  </g>
</svg>
'''


def logo_svg() -> str:
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 72" width="300" height="72" role="img" aria-label="Homeokit Homoeopathy logo">
  <path d="M40 58 C8 46 10 14 40 8 C42 30 40 44 40 58Z" fill="#2E7D32"/>
  <path d="M40 58 C40 34 52 18 70 12 C68 38 56 52 40 58Z" fill="#43A047"/>
  <path d="M40 58 C28 42 26 28 30 16" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
  <text x="92" y="40" font-family="Poppins,Arial,sans-serif" font-size="29" font-weight="700" fill="#263238">Homeo<tspan fill="#2E7D32">kit</tspan></text>
  <text x="94" y="60" font-family="Inter,Arial,sans-serif" font-size="12" letter-spacing="4" fill="#00897B">HOMOEOPATHY</text>
</svg>
'''


def main() -> None:
    PRODUCT_DIR.mkdir(parents=True, exist_ok=True)
    BLOG_DIR.mkdir(parents=True, exist_ok=True)

    products = json.loads((ROOT / "data" / "products.json").read_text(encoding="utf-8"))
    for product in products:
        number = int(product["id"])
        for variant in range(4):
            suffix = "" if variant == 0 else f"-{variant}"
            (PRODUCT_DIR / f"product-{number}{suffix}.svg").write_text(
                product_svg(product["name"], product["category"], number, variant),
                encoding="utf-8",
            )

    posts = json.loads((ROOT / "data" / "blog.json").read_text(encoding="utf-8"))
    for post in posts:
        number = int(post["id"])
        (BLOG_DIR / f"blog-{number}.svg").write_text(
            blog_svg(post["title"], post["category"], number), encoding="utf-8"
        )

    (IMAGES_DIR / "hero.svg").write_text(hero_svg(), encoding="utf-8")
    (IMAGES_DIR / "logo.svg").write_text(logo_svg(), encoding="utf-8")
    print(f"Generated {len(products)} product images, {len(posts)} blog images, hero.svg and logo.svg")


if __name__ == "__main__":
    main()
