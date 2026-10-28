# -*- coding: utf-8 -*-
"""
HỆ THỐNG BIÊN SOẠN BẢN THẢO THỰC HÀNH TỰ TAY CODE LẠI LUNGCT TỪ SỐ 0
(Tích hợp đầy đủ chuỗi liên kết: Lệnh -> Folder -> File -> Mã nguồn -> Giải thích từng dòng -> Comment -> Nối vào App -> Chạy thử -> Kết quả -> Lỗi)
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

from build_word_curriculum import (
    create_document, add_cover_page, add_heading_1, add_heading_2, add_heading_3,
    add_paragraph, add_callout, add_code_block, add_custom_table,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT
)

def add_full_step(
    doc,
    step_num,
    title,
    purpose,
    terminal_location,
    shell_action,
    code_file_path,
    full_code,
    line_by_line_explanation,
    comment_guide,
    wiring_guide,
    run_and_verify,
    troubleshooting,
    checklist
):
    h = doc.add_heading(f"BƯỚC {step_num:03d}: {title.upper()}", level=2)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    for run in h.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(13)
        run.bold = True
        run.font.color.rgb = COLOR_PRIMARY

    add_paragraph(doc, purpose, bold_prefix="1. Mục đích kỹ thuật: ")
    add_paragraph(doc, terminal_location, bold_prefix="2. Terminal & Thư mục làm việc: ")
    add_paragraph(doc, shell_action, bold_prefix="3. Lệnh tạo thư mục và tệp: ")
    
    if full_code:
        add_paragraph(doc, f"Mã nguồn đầy đủ cho tệp `{code_file_path}` (gõ trực tiếp không viết tắt):", bold_prefix="4. Mã nguồn chi tiết 100%: ")
        add_code_block(doc, full_code)

    if line_by_line_explanation and len(line_by_line_explanation) > 0:
        add_paragraph(doc, "Bảng giải thích cú pháp, nhiệm vụ và lý do cần thiết của từng khối lệnh:", bold_prefix="5. Bảng giải thích chi tiết từng dòng: ")
        add_custom_table(doc, ["Dòng code / Khai báo", "Cú pháp, Nhiệm vụ kỹ thuật & Lý do cần thiết"], line_by_line_explanation, [2.5, 3.8])

    if comment_guide:
        add_paragraph(doc, comment_guide, bold_prefix="6. Hướng dẫn viết Comment chuyên nghiệp: ")

    if wiring_guide:
        add_paragraph(doc, wiring_guide, bold_prefix="7. Cách nối ghép vào hệ thống đang chạy (Wiring): ")

    add_paragraph(doc, run_and_verify, bold_prefix="8. Lệnh chạy thử và Kết quả mong đợi: ")
    add_paragraph(doc, troubleshooting, bold_prefix="9. Chẩn đoán và Xử lý lỗi thường gặp: ")
    add_paragraph(doc, checklist, bold_prefix="10. Tiêu chí kiểm tra (Checklist) đạt yêu cầu: ")
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

print("[*] Module build_step_by_step_complete.py loaded successfully.")
