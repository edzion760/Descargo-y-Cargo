#!/usr/bin/env python3
"""Conversor Markdown -> PDF con reportlab (guías Descargo & Cargo).
Soporta: encabezados, negrita, código inline/bloques, listas, tablas, citas.
Uso: python md2pdf_reportlab.py entrada.md salida.pdf
"""
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted, HRFlowable,
)

EMERALD = colors.HexColor("#0d7a52")
ZINC_DARK = colors.HexColor("#18181b")
ZINC_MID = colors.HexColor("#52525b")
ZINC_LIGHT = colors.HexColor("#f4f4f5")

S_H1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=20, leading=25, textColor=ZINC_DARK, spaceAfter=10)
S_H2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=EMERALD, spaceBefore=16, spaceAfter=8)
S_H3 = ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=ZINC_DARK, spaceBefore=12, spaceAfter=6)
S_BODY = ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=15, textColor=ZINC_DARK, spaceAfter=6)
S_BULLET = ParagraphStyle("bullet", parent=S_BODY, leftIndent=16, bulletIndent=6, spaceAfter=3)
S_QUOTE = ParagraphStyle("quote", parent=S_BODY, leftIndent=14, textColor=ZINC_MID, borderColor=EMERALD, borderWidth=2, borderPadding=6, backColor=colors.HexColor("#f0fdf6"))
S_CODE = ParagraphStyle("code", fontName="Courier", fontSize=9, leading=12.5, textColor=ZINC_DARK, backColor=ZINC_LIGHT, borderPadding=8, leftIndent=0)
S_CELL = ParagraphStyle("cell", fontName="Helvetica", fontSize=9.5, leading=13, textColor=ZINC_DARK)
S_CELL_B = ParagraphStyle("cellb", parent=S_CELL, fontName="Helvetica-Bold", textColor=colors.white)


def inline(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r'<font face="Courier" backColor="#e4e4e7">\1</font>', text)
    text = re.sub(r"\[(.+?)\]\((.+?)\)", r'<font color="#0d7a52"><u>\1</u></font>', text)
    return text


def convert(md_path: Path, pdf_path: Path) -> None:
    lines = md_path.read_text(encoding="utf-8").splitlines()
    story, i = [], 0

    def header_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(ZINC_MID)
        canvas.drawString(2 * cm, 1.1 * cm, "Descargo & Cargo 2.0 · Guía técnica · 2026")
        canvas.drawRightString(A4[0] - 2 * cm, 1.1 * cm, f"Página {doc.page}")
        canvas.setStrokeColor(EMERALD)
        canvas.setLineWidth(1.5)
        canvas.line(2 * cm, A4[1] - 1.6 * cm, A4[0] - 2 * cm, A4[1] - 1.6 * cm)
        canvas.restoreState()

    while i < len(lines):
        line = lines[i].rstrip()

        # Bloque de código
        if line.strip().startswith("```"):
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1
            story.append(Spacer(1, 4))
            story.append(Preformatted("\n".join(code_lines), S_CODE))
            story.append(Spacer(1, 8))
            continue

        # Tabla
        if line.strip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:\-|]+\|\s*$", lines[i + 1]):
            header = [c.strip() for c in line.strip().strip("|").split("|")]
            rows = []
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            ncols = len(header)
            width = (A4[0] - 4 * cm) / ncols
            data = [[Paragraph(inline(h), S_CELL_B) for h in header]]
            for r in rows:
                r = r + [""] * (ncols - len(r))
                data.append([Paragraph(inline(c), S_CELL) for c in r[:ncols]])
            t = Table(data, colWidths=[width] * ncols, repeatRows=1)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), EMERALD),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ZINC_LIGHT]),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d4d4d8")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]))
            story.append(Spacer(1, 4))
            story.append(t)
            story.append(Spacer(1, 10))
            continue

        if not line.strip():
            i += 1
            continue
        if line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), S_H3))
        elif line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), S_H2))
        elif line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), S_H1))
            story.append(HRFlowable(width="100%", thickness=2, color=EMERALD, spaceAfter=10))
        elif line.strip() == "---":
            story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#d4d4d8"), spaceBefore=6, spaceAfter=10))
        elif line.lstrip().startswith("> "):
            story.append(Paragraph(inline(line.lstrip()[2:]), S_QUOTE))
        elif re.match(r"^\s*[-*]\s", line):
            story.append(Paragraph("• " + inline(re.sub(r"^\s*[-*]\s", "", line)), S_BULLET))
        elif re.match(r"^\s*\d+\.\s", line):
            m = re.match(r"^\s*(\d+)\.\s(.*)", line)
            story.append(Paragraph(f"<b>{m.group(1)}.</b> " + inline(m.group(2)), S_BULLET))
        elif line.strip().startswith("- [ ]"):
            story.append(Paragraph("☐ " + inline(line.strip()[5:].strip()), S_BULLET))
        else:
            story.append(Paragraph(inline(line), S_BODY))
        i += 1

    doc = SimpleDocTemplate(str(pdf_path), pagesize=A4,
                            leftMargin=2 * cm, rightMargin=2 * cm,
                            topMargin=2.4 * cm, bottomMargin=2 * cm,
                            title=md_path.stem, author="Descargo & Cargo 2.0")
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"OK: {pdf_path.name} ({pdf_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    convert(Path(sys.argv[1]), Path(sys.argv[2]))
