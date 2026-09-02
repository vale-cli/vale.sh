"""Builds static/brand, the favicons, and the wordmark component from one
drawing of the mark.

Needs rsvg-convert on PATH and the packages in requirements.txt. Run it from
anywhere; paths are resolved from this file.

    python3 script/brand/main.py
"""

import colorsys
import os
import subprocess
import tempfile
import zipfile

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, '..', '..'))
STATIC = os.path.join(SITE, 'static')
OUT = os.path.join(STATIC, 'brand')
# The wordmark. Newsreader is OFL; see fonts/OFL.txt.
NEWSREADER = (os.path.join(HERE, 'fonts', 'Newsreader.ttf'), {'wght': 600, 'opsz': 72})
# The site's own face, for the social card's tagline.
INTER = (os.path.join(STATIC, 'fonts', 'Inter', 'inter-latin.woff2'), {'wght': 500})
TMP = tempfile.mkdtemp(prefix='vale-brand-')


def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return '#%02X%02X%02X' % tuple(round(c * 255) for c in (r, g, b))


# The accent, and the site's theme tokens (see src/styles/app.css and the
# lime ramp in tailwind.config.ts). Grass is lime-500, the mark on Paper;
# the light step is lime-400, the mark on Graphite.
GRASS = hsl(92, 62, 40)
GRASS_LIGHT = hsl(92, 60, 58)
INK = hsl(90, 20, 7)
PAPER = hsl(80, 34, 96.5)
GRAPHITE = hsl(90, 16, 5.5)
MUTED = hsl(85, 10, 68)

# --- the mark ---------------------------------------------------------------
#
# Two strokes at a 1:2 slope, each W wide. The right one is cut by a line
# parallel to the left, one stroke-width away, so the gap is a third stroke.
W, K, H, U, B = 1.0, 0.5, 2.5, 1.25, 3.0

LEFT = [(0, 0), (W, 0), (W + K * H, H), (K * H, H)]
_y1 = (B - K * U - 2 * W) / (2 * K)
_y2 = (B + W - K * U - 2 * W) / (2 * K)
RIGHT = [(B, -U), (B + W, -U), (2 * W + K * _y2, _y2), (2 * W + K * _y1, _y1)]

_xs = [x for p in (LEFT, RIGHT) for x, _ in p]
_ys = [y for p in (LEFT, RIGHT) for _, y in p]
MX0, MY0 = min(_xs), min(_ys)
MW, MH = max(_xs) - MX0, max(_ys) - MY0


def num(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


def mark_path(scale, ox, oy):
    d = []
    for poly in (LEFT, RIGHT):
        pts = ((ox + (x - MX0) * scale, oy + (y - MY0) * scale) for x, y in poly)
        d.append('M' + ' '.join(f'{num(x)} {num(y)}' for x, y in pts) + 'Z')
    return ''.join(d)


def mark_in_box(size, pad):
    scale = size * (1 - 2 * pad) / max(MW, MH)
    return mark_path(scale, (size - MW * scale) / 2, (size - MH * scale) / 2)


# --- type -------------------------------------------------------------------


def instance(font):
    """A static TTF of a variable font at the given axes."""
    path, axes = font
    out = os.path.join(TMP, os.path.basename(path).split('.')[0] + '-' + '-'.join(f'{k}{v}' for k, v in axes.items()) + '.ttf')
    if not os.path.exists(out):
        ttf = TTFont(path)
        if 'fvar' in ttf:
            ttf = instantiateVariableFont(ttf, axes)
        ttf.flavor = None  # or a WOFF2 source saves as WOFF2, which HarfBuzz can't read
        ttf.save(out)
    return out


def shape(text, font):
    """Shapes `text` with HarfBuzz. Returns (path, advance, cap height, bounds)
    in font units, y-down, with the origin on the baseline."""
    path = instance(font)
    ttf = TTFont(path)
    hbfont = hb.Font(hb.Face(hb.Blob.from_file_path(path)))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {'kern': True, 'liga': True, 'calt': True})
    gs, order = ttf.getGlyphSet(), ttf.getGlyphOrder()
    x, d, bounds = 0, [], [1e9, 1e9, -1e9, -1e9]
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        flip = (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset)
        pen = SVGPathPen(gs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
        gs[name].draw(TransformPen(pen, flip))
        bp = BoundsPen(gs)
        gs[name].draw(TransformPen(bp, flip))
        if bp.bounds:
            bounds = [min(bounds[0], bp.bounds[0]), min(bounds[1], bp.bounds[1]), max(bounds[2], bp.bounds[2]), max(bounds[3], bp.bounds[3])]
        d.append(pen.getCommands())
        x += pos.x_advance
    return ''.join(d), x, ttf['OS/2'].sCapHeight, bounds


def text_path(text, font, cap_px, x, baseline, fill):
    d, adv, cap, _ = shape(text, font)
    s = cap_px / cap
    return f'<path fill="{fill}" transform="translate({x:.2f} {baseline:.2f}) scale({s:.6f})" d="{d}"/>', adv * s


# --- files ------------------------------------------------------------------

SVG = '<svg xmlns="http://www.w3.org/2000/svg"'


def write(name, svg, where=OUT):
    path = os.path.join(where, name)
    with open(path, 'w') as fh:
        fh.write(svg)
    return path


def png(svg, out, width, bg=None):
    cmd = ['rsvg-convert', svg, '-o', out, '-w', str(width)]
    if bg:
        cmd += ['-b', bg]
    subprocess.run(cmd, check=True)
    return out


def body(svg):
    """The elements of an SVG document, for nesting it in another."""
    return svg.split('>', 1)[1].rsplit('</svg>', 1)[0]


os.makedirs(OUT, exist_ok=True)

# Mark, tight viewBox. The same path is in src/lib/components/icons/logo.svelte.
MS = 128 / MW
MARK_VB = f'0 0 128 {MH * MS:g}'


def mark_svg(fill):
    return f'{SVG} viewBox="{MARK_VB}" role="img" aria-label="Vale"><path fill="{fill}" d="{mark_path(MS, 0, 0)}"/></svg>\n'


write('vale-mark.svg', mark_svg(GRASS))
write('vale-mark-dark.svg', mark_svg(GRASS_LIGHT))
write('vale-mark-black.svg', mark_svg(INK))
write('vale-mark-white.svg', mark_svg('#FFFFFF'))
print('mark', MARK_VB, mark_path(MS, 0, 0))

# Wordmark: Newsreader Semibold at its display optical size. Written as a
# component too, so the header and footer set it from the same outlines.
WORD_D, WORD_ADV, WORD_CAP, WORD_BOUNDS = shape('Vale', NEWSREADER)
wx0, wy0, wx1, wy1 = WORD_BOUNDS
WORD_S = 100 / WORD_CAP  # cap height = 100 units
ww, wh = (wx1 - wx0) * WORD_S, (wy1 - wy0) * WORD_S
wordmark_svelte = f"""<script lang="ts">
	import type {{ HTMLAttributes }} from 'svelte/elements';

	type $$Props = HTMLAttributes<SVGElement>;
</script>

<!--
	Generated by script/brand/main.py: "Vale" in Newsreader Semibold, as paths,
	so it renders the same everywhere without loading the font. The viewBox is
	tight to the letters; the baseline sits {num(-wy0 * WORD_S)} units from the top.
-->
<svg viewBox="0 0 {num(ww)} {num(wh)}" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {{...$$restProps}}>
	<path transform="translate({num(-wx0 * WORD_S)} {num(-wy0 * WORD_S)}) scale({WORD_S:.6f})" d="{WORD_D}" />
</svg>
"""
write('wordmark.svelte', wordmark_svelte, os.path.join(SITE, 'src', 'lib', 'components', 'icons'))

# Lockup. Cap height is 100 units; the mark stands a touch taller and sits on
# the baseline.
CAP, MARK_H, GAP = 100, 118, 30
LS = MARK_H / MH
LOCK_MARK_W = MW * LS


def lockup_svg(mark_fill, text_fill):
    # Trim the wordmark's side bearings from the advance.
    tx = LOCK_MARK_W + GAP - wx0 * WORD_S
    w = tx + wx1 * WORD_S
    h = max(MARK_H, -wy0 * WORD_S)  # the 'l' ascender may rise above the mark
    top = h - MARK_H
    return (
        f'{SVG} viewBox="0 0 {w:.2f} {h:.2f}" role="img" aria-label="Vale">'
        f'<path fill="{mark_fill}" d="{mark_path(LS, 0, top)}"/>'
        f'<path fill="{text_fill}" transform="translate({tx:.2f} {h:.2f}) scale({WORD_S:.6f})" d="{WORD_D}"/>'
        f'</svg>\n'
    ), w, h


LOCK_LIGHT, LOCK_W, LOCK_H = lockup_svg(GRASS, INK)
LOCK_DARK, _, _ = lockup_svg(GRASS_LIGHT, '#FFFFFF')
write('vale-logo.svg', LOCK_LIGHT)
write('vale-logo-dark.svg', LOCK_DARK)
write('vale-logo-black.svg', lockup_svg(INK, INK)[0])
write('vale-logo-white.svg', lockup_svg('#FFFFFF', '#FFFFFF')[0])
print('lockup', round(LOCK_W, 2), round(LOCK_H, 2))

for size in (512, 1024):
    png(os.path.join(OUT, 'vale-mark.svg'), os.path.join(OUT, f'vale-mark-{size}.png'), size)
png(os.path.join(OUT, 'vale-logo.svg'), os.path.join(OUT, 'vale-logo.png'), 2400)
png(os.path.join(OUT, 'vale-logo-dark.svg'), os.path.join(OUT, 'vale-logo-dark.png'), 2400)

# Icons: opaque squares for avatars. The platform rounds the corners.
for name, bg, fill in (('dark', GRAPHITE, GRASS_LIGHT), ('light', PAPER, GRASS)):
    svg = f'{SVG} viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="{bg}"/><path fill="{fill}" d="{mark_in_box(1024, 0.2)}"/></svg>\n'
    png(write(f'vale-icon-{name}.svg', svg), os.path.join(OUT, f'vale-icon-{name}.png'), 1024)

# Social card, 1200x630.
CW, CH = 1200, 630
lock_h = 150
k = lock_h / LOCK_H
tag, tag_w = text_path('A linter for prose.', INTER, 34, 0, 0, MUTED)
top = (CH - (lock_h + 74)) / 2
tag, _ = text_path('A linter for prose.', INTER, 34, (CW - tag_w) / 2, top + lock_h + 74, MUTED)
social = (
    f'{SVG} viewBox="0 0 {CW} {CH}"><rect width="{CW}" height="{CH}" fill="{GRAPHITE}"/>'
    f'<g transform="translate({(CW - LOCK_W * k) / 2:.2f} {top:.2f}) scale({k:.6f})">{body(LOCK_DARK)}</g>{tag}</svg>\n'
)
png(write('vale-social.svg', social, TMP), os.path.join(OUT, 'vale-social.png'), CW)

# Favicons and touch icons, at the site root. Light ground, like the site.
fav = write('favicon.svg', f'{SVG} viewBox="0 0 64 64"><path fill="{GRASS}" d="{mark_in_box(64, 0.06)}"/></svg>', TMP)
touch = write('touch.svg', f'{SVG} viewBox="0 0 64 64"><rect width="64" height="64" fill="{PAPER}"/><path fill="{GRASS}" d="{mark_in_box(64, 0.16)}"/></svg>', TMP)
for size in (16, 32):
    png(fav, os.path.join(STATIC, f'favicon-{size}x{size}.png'), size)
png(touch, os.path.join(STATIC, 'apple-touch-icon.png'), 180)
for size in (192, 512):
    png(touch, os.path.join(STATIC, f'android-chrome-{size}x{size}.png'), size)
# Largest first: Pillow drops any size bigger than the base image.
frames = [Image.open(png(fav, os.path.join(TMP, f'fav-{s}.png'), s)).convert('RGBA') for s in (48, 32, 16)]
frames[0].save(
    os.path.join(STATIC, 'favicon.ico'),
    format='ICO',
    sizes=[(48, 48), (32, 32), (16, 16)],
    append_images=frames[1:],
)

README = f"""Vale brand assets
=================

vale-mark*.svg / .png      The mark alone. Grass for light backgrounds, -dark for dark ones,
                           black/white for mono.
vale-logo*.svg / .png      The horizontal lockup: mark plus wordmark.
                           -dark is for dark backgrounds; -black/-white are mono.
vale-icon-*.png            Opaque 1024px squares for avatars. Let the platform round the corners.
vale-social.png            1200x630 card for link previews.

Colors
  Grass        {GRASS}   the mark and buttons, on light backgrounds
  Grass, light {GRASS_LIGHT}   the same, on dark backgrounds
  Ink          {INK}   type on light backgrounds
  Paper        {PAPER}   light background
  Graphite     {GRAPHITE}   dark background

The wordmark is Newsreader Semibold (SIL Open Font License), shipped as paths.

Guidelines and current files: https://vale.sh/brand
"""
with zipfile.ZipFile(os.path.join(OUT, 'vale-brand.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('vale-brand/README.txt', README)
    for f in sorted(os.listdir(OUT)):
        if f.endswith(('.svg', '.png')):
            z.write(os.path.join(OUT, f), f'vale-brand/{f}')

print('wrote', OUT)
