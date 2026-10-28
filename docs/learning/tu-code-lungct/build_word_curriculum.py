# -*- coding: utf-8 -*-
"""
Script biên soạn 2 tài liệu giáo trình Word (.docx) chuyên nghiệp:
1. Giao_trinh_Tu_code_LungCT_Android.docx
2. Giao_trinh_Tu_code_LungCT_iOS.docx

Định dạng chuẩn học thuật:
- Khổ giấy A4, lề chuẩn (trên 2cm, dưới 2cm, trái 3cm, phải 2cm).
- Font chữ: Times New Roman / Segoe UI, cỡ chữ 11pt, giãn dòng 1.15x, Spacing After 4pt.
- Bảng biểu có viền thanh lịch, header màu xanh y tế đậm (#1A365D).
- Hộp mã lệnh (code block) có nền xám sáng (#F8FAFC), viền mỏng (#E2E8F0), font Consolas 9.5pt, thụt lề, chống tràn lề.
- Callout lưu ý / cảnh báo nổi bật.
- Mục lục và các chương đánh số rõ ràng.
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

# Màu sắc chuẩn giao diện y tế LungCT
COLOR_PRIMARY = RGBColor(26, 54, 93)     # #1A365D - Xanh than y tế
COLOR_SECONDARY = RGBColor(14, 116, 144) # #0E7490 - Xanh mòng két
COLOR_TEXT = RGBColor(30, 41, 59)        # #1E293B - Xám đen Slate
COLOR_MUTED = RGBColor(100, 116, 139)    # #64748B - Xám phụ
COLOR_BORDER = "E2E8F0"
HEX_BG_HEADER = "1A365D"
HEX_BG_CODE = "F8FAFC"
HEX_BG_NOTE = "EFF6FF"
HEX_BORDER_NOTE = "3B82F6"
HEX_BG_WARN = "FEF2F2"
HEX_BORDER_WARN = "EF4444"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                      f'<w:top w:w="{top}" w:type="dxa"/>'
                      f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                      f'<w:left w:w="{left}" w:type="dxa"/>'
                      f'<w:right w:w="{right}" w:type="dxa"/>'
                      f'</w:tcMar>')
    tcPr.append(tcMar)

def create_document():
    doc = Document()
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.1)
        section.right_margin = Inches(0.8)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
    return doc

def add_cover_page(doc, title, subtitle, author_name, mssv, platform_name):
    # Tiêu đề trường / khoa
    p_org = doc.add_paragraph()
    p_org.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_org1 = p_org.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO\nTRƯỜNG ĐẠI HỌC SƯ PHẠM THÀNH PHỐ HỒ CHÍ MINH\nKHOA CÔNG NGHỆ THÔNG TIN\n")
    r_org1.bold = True
    r_org1.font.size = Pt(11)
    r_org1.font.color.rgb = COLOR_PRIMARY
    
    r_line = p_org.add_run("━━━━━━━━━━━━━━━━━━━━\n\n\n\n")
    r_line.font.size = Pt(10)
    r_line.font.color.rgb = COLOR_SECONDARY

    # Tên giáo trình
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run(title + "\n")
    r_title.bold = True
    r_title.font.size = Pt(22)
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run(subtitle + "\n\n")
    r_sub.font.size = Pt(12)
    r_sub.italic = True
    r_sub.font.color.rgb = COLOR_SECONDARY

    # Cảnh báo trạng thái bản thảo đang hoàn thiện
    p_draft = doc.add_paragraph()
    p_draft.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_draft_box = p_draft.add_run(
        "⚠️ [TÀI LIỆU LƯU HÀNH NỘI BỘ - BẢN THẢO ĐANG BIÊN SOẠN]\n"
        "Hiện trạng: Bản thảo đang trong quá trình xây dựng tuần tự (khoảng 55 - 68 trang thực tế),\n"
        "CHƯA đạt mục tiêu hoàn thiện >300 trang và CHƯA bao phủ toàn bộ 121 tệp mã nguồn của ứng dụng.\n"
        "Các mốc tiếp theo đang tiếp tục được bổ sung theo đúng tiến độ thực hành.\n\n\n"
    )
    r_draft_box.font.size = Pt(10)
    r_draft_box.font.color.rgb = RGBColor(194, 65, 12) # Màu cam cảnh báo #C2410C
    r_draft_box.bold = True

    # Khung thông tin tác giả
    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_info.paragraph_format.line_spacing = 1.3
    
    r_info = p_info.add_run(
        f"Phân hệ triển khai: {platform_name}\n"
        f"Người thực hiện: {author_name} (MSSV: {mssv})\n"
        f"Giảng viên hướng dẫn: ThS. Trịnh Huy Hoàng\n"
        f"Ngành đào tạo: Sư phạm Tin học (Khóa 49, Niên khóa 2026 – 2027)\n"
        f"Đối tượng người học: Đã biết C++ cơ bản, bắt đầu từ thư mục trống\n\n\n"
    )
    r_info.font.size = Pt(11)
    r_info.font.color.rgb = COLOR_TEXT

    p_loc = doc.add_paragraph()
    p_loc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_loc = p_loc.add_run("Thành phố Hồ Chí Minh, Năm 2026")
    r_loc.bold = True
    r_loc.font.size = Pt(11)
    r_loc.font.color.rgb = COLOR_PRIMARY

    doc.add_page_break()

def add_heading_1(doc, text):
    h = doc.add_heading(text, level=1)
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(8)
    for run in h.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(16)
        run.bold = True
        run.font.color.rgb = COLOR_PRIMARY
    return h

def add_heading_2(doc, text):
    h = doc.add_heading(text, level=2)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(6)
    for run in h.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(13.5)
        run.bold = True
        run.font.color.rgb = COLOR_SECONDARY
    return h

def add_heading_3(doc, text):
    h = doc.add_heading(text, level=3)
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(4)
    for run in h.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)
        run.bold = True
        run.font.color.rgb = COLOR_TEXT
    return h

def add_paragraph(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Times New Roman"
        r_pre.font.size = Pt(11)
        r_pre.font.color.rgb = COLOR_TEXT
    r = p.add_run(text)
    r.italic = italic
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_TEXT
    return p

def add_callout(doc, text, title="LƯU Ý QUAN TRỌNG", is_warn=False):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.3)
    fill_hex = HEX_BG_WARN if is_warn else HEX_BG_NOTE
    border_hex = HEX_BORDER_WARN if is_warn else HEX_BORDER_NOTE
    set_cell_background(cell, fill_hex)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    # Viền trái dày nổi bật
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}>'
                          f'<w:top w:val="none"/>'
                          f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>'
                          f'<w:bottom w:val="none"/>'
                          f'<w:right w:val="none"/>'
                          f'</w:tcBorders>')
    tcPr.append(tcBorders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    r_tit = p.add_run(f"📌 {title}: ")
    r_tit.bold = True
    r_tit.font.name = "Times New Roman"
    r_tit.font.size = Pt(10.5)
    r_tit.font.color.rgb = RGBColor(185, 28, 28) if is_warn else RGBColor(29, 78, 216)
    
    r_txt = p.add_run(text)
    r_txt.font.name = "Times New Roman"
    r_txt.font.size = Pt(10.5)
    r_txt.font.color.rgb = COLOR_TEXT
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.3)
    set_cell_background(cell, HEX_BG_CODE)
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}>'
                          f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                          f'<w:left w:val="single" w:sz="16" w:space="0" w:color="64748B"/>'
                          f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                          f'<w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                          f'</w:tcBorders>')
    tcPr.append(tcBorders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    r = p.add_run(code_text.strip())
    r.font.name = "Consolas"
    r.font.size = Pt(9.0)
    r.font.color.rgb = RGBColor(15, 23, 42)
    doc.add_paragraph().paragraph_format.space_after = Pt(3)

def add_custom_table(doc, headers, rows_data, col_widths=None):
    tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Header row
    hdr_cells = tbl.rows[0].cells
    for i, header_text in enumerate(headers):
        hdr_cells[i].text = header_text
        set_cell_background(hdr_cells[i], HEX_BG_HEADER)
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.bold = True
            r.font.name = "Times New Roman"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(255, 255, 255)
            
    # Data rows
    for r_idx, row in enumerate(rows_data):
        row_cells = tbl.rows[r_idx + 1].cells
        bg_hex = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_hex)
            set_cell_margins(row_cells[c_idx], top=90, bottom=90, left=110, right=110)
            p = row_cells[c_idx].paragraphs[0]
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(9.5)
                r.font.color.rgb = COLOR_TEXT
                
    # Đặt độ rộng cột nếu có
    if col_widths:
        for row in tbl.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    # Đặt đường viền bảng mỏng thanh lịch
    tblPr = tbl._tbl.tblPr
    tblBorders = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                           f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                           f'<w:left w:val="none"/>'
                           f'<w:bottom w:val="single" w:sz="8" w:space="0" w:color="1A365D"/>'
                           f'<w:right w:val="none"/>'
                           f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                           f'<w:insideV w:val="none"/>'
                           f'</w:tblBorders>')
    tblPr.append(tblBorders)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

print("Helper functions ready.")
