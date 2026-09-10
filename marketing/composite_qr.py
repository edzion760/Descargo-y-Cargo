#!/usr/bin/env python3
"""Integra un QR con tarjeta blanca en la esquina inferior derecha de una imagen.
Uso: python composite_qr.py base.png qr.png salida.png
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont


def find_font(bold=True):
    import matplotlib
    ttf = os.path.join(os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf")
    return os.path.join(ttf, "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")


def main(base_path, qr_path, out_path, k=1.0, fx=None, fy=None):
    base = Image.open(base_path).convert("RGB")
    qr = Image.open(qr_path).convert("RGB")
    W, H = base.size
    s = (W / 2048.0) * k  # factor de escala (soporta 2K y 4K, k ajusta tamaño)

    card_w, card_h = int(330 * s), int(430 * s)
    margin = int(45 * s)
    x0 = int(fx * W) if fx is not None else W - card_w - margin
    y0 = int(fy * H) if fy is not None else H - card_h - margin

    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle([x0, y0, x0 + card_w, y0 + card_h], radius=int(24 * s), fill="white")

    # QR centrado
    qr_size = int(290 * s)
    qr = qr.resize((qr_size, qr_size), Image.NEAREST)
    qx = x0 + (card_w - qr_size) // 2
    qy = y0 + int(20 * s)
    base.paste(qr, (qx, qy))

    f_small = ImageFont.truetype(find_font(True), int(19 * s))
    f_url = ImageFont.truetype(find_font(True), int(23 * s))

    t1 = "ESCANEA Y DESCARGA LA APP"
    t2 = "descargoycargo.com"
    b1 = draw.textbbox((0, 0), t1, font=f_small)
    b2 = draw.textbbox((0, 0), t2, font=f_url)
    ty = qy + qr_size + int(18 * s)
    draw.text((x0 + (card_w - (b1[2] - b1[0])) / 2, ty), t1, font=f_small, fill=(24, 24, 27))
    draw.text((x0 + (card_w - (b2[2] - b2[0])) / 2, ty + int(34 * s)), t2, font=f_url, fill=(5, 150, 105))

    base.save(out_path, quality=95)
    print(f"OK: {out_path} ({base.size[0]}x{base.size[1]})")


if __name__ == "__main__":
    k = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
    fx = float(sys.argv[5]) if len(sys.argv) > 5 else None
    fy = float(sys.argv[6]) if len(sys.argv) > 6 else None
    main(sys.argv[1], sys.argv[2], sys.argv[3], k, fx, fy)
