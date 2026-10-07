import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(40, 42, 572, 42)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 30, "Academic Project Update — Guidance Brief")
        self.drawRightString(572, 30, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    output_path = r"C:\Users\USER11\Desktop\agrilink\Academic_Project_Proposal_Concept_Note_Guidelines.pdf"
    
    # 54pt margin = 0.75 inch, width = 612, height = 792
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Base typography styles
    style_kicker = ParagraphStyle(
        'Kicker',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#94A3B8'),
        textTransform='uppercase'
    )

    style_banner_title = ParagraphStyle(
        'BannerTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.white
    )

    style_meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#64748B'),
        textTransform='uppercase'
    )

    style_meta_val = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    style_sec_heading = ParagraphStyle(
        'SecHeading',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0F172A')
    )

    style_card_title = ParagraphStyle(
        'CardTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0284C7')
    )

    style_card_body = ParagraphStyle(
        'CardBody',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    style_bullet_item = ParagraphStyle(
        'BulletItem',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#334155')
    )

    style_stage_badge = ParagraphStyle(
        'StageBadge',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    style_stage_text = ParagraphStyle(
        'StageText',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )

    style_notice_title = ParagraphStyle(
        'NoticeTitle',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#047857')
    )

    style_notice_body = ParagraphStyle(
        'NoticeBody',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#065F46')
    )

    story = []

    # 1. Dark Top Banner Card
    banner_content = [
        [Paragraph("ACADEMIC PROJECT BRIEFING", style_kicker)],
        [Spacer(1, 3)],
        [Paragraph("Project Proposal & Concept Note Guidelines", style_banner_title)]
    ]
    banner_table = Table(
        banner_content,
        colWidths=[532],
        style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0A192F')),
            ('TOPPADDING', (0,0), (-1,-1), 16),
            ('BOTTOMPADDING', (0,0), (-1,-1), 16),
            ('LEFTPADDING', (0,0), (-1,-1), 18),
            ('RIGHTPADDING', (0,0), (-1,-1), 18),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]
    )
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # 2. Metadata 3-Column Info Card
    meta_data = [
        [
            Paragraph("DOCUMENT TYPE", style_meta_label),
            Paragraph("TARGET SCOPE", style_meta_label),
            Paragraph("NEXT PHASE", style_meta_label)
        ],
        [
            Paragraph("Concept Note Guide", style_meta_val),
            Paragraph("1-Page Abstract", style_meta_val),
            Paragraph("Chapter 1 Writing", style_meta_val)
        ]
    ]
    meta_table = Table(
        meta_data,
        colWidths=[177, 177, 178],
        style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,0), 8),
            ('BOTTOMPADDING', (0,0), (-1,0), 2),
            ('TOPPADDING', (0,1), (-1,1), 2),
            ('BOTTOMPADDING', (0,1), (-1,1), 9),
            ('LEFTPADDING', (0,0), (-1,-1), 14),
            ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ]
    )
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 3. Key Directives from Lecturer
    story.append(Paragraph("Key Directives from Lecturer", style_sec_heading))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=0, spaceAfter=8))

    col1_content = [
        Paragraph("1. Scope & Length", style_card_title),
        Spacer(1, 4),
        Paragraph("Submit a concise <b>1-page Concept Note</b>. It functions similarly to an executive summary or abstract, detailing core proposal ideas without unnecessary fluff.", style_card_body)
    ]
    col2_content = [
        Paragraph("2. Topic Selection", style_card_title),
        Spacer(1, 4),
        Paragraph("Select <b>one specific research topic</b>. Due to class size constraints, multiple proposals per student or group will not be reviewed.", style_card_body)
    ]

    directives_table = Table(
        [[col1_content, col2_content]],
        colWidths=[261, 261],
        style=[
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F0F9FF')),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F0F9FF')),
            ('BOX', (0,0), (0,0), 1, colors.HexColor('#BAE6FD')),
            ('BOX', (1,0), (1,0), 1, colors.HexColor('#BAE6FD')),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]
    )
    story.append(directives_table)
    story.append(Spacer(1, 14))

    # 4. Core Elements of the Concept Note
    story.append(Paragraph("Core Elements of the Concept Note", style_sec_heading))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=0, spaceAfter=8))

    elements = [
        ("Problem Statement / Background", "Highlighting the main problem and what you are thinking about investigating."),
        ("Research Scope", "Providing clear, high-level information on what the study/project covers."),
        ("Objectives", "Identifying primary targets and anticipated outcomes of the project."),
        ("Proposed Methodology", "Briefly outlining how the project or research will be executed.")
    ]

    elem_data = []
    for title, desc in elements:
        bullet_text = f"&bull;&nbsp;&nbsp;<b>{title}:</b> {desc}"
        elem_data.append([Paragraph(bullet_text, style_bullet_item)])

    elem_table = Table(
        elem_data,
        colWidths=[532],
        style=[
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ]
    )
    story.append(elem_table)
    story.append(Spacer(1, 14))

    # 5. Project Progression Workflow
    story.append(Paragraph("Project Progression Workflow", style_sec_heading))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=0, spaceAfter=8))

    workflow_data = [
        [
            Paragraph("STAGE 1", style_stage_badge),
            Paragraph("<b>Draft Concept Note:</b> Write and refine the 1-page document focusing on a single, clear topic.", style_stage_text)
        ],
        [
            Paragraph("STAGE 2", style_stage_badge),
            Paragraph("<b>Lecturer Approval:</b> Submit for review. The lecturer will assess feasibility and grant approval.", style_stage_text)
        ],
        [
            Paragraph("STAGE 3", style_stage_badge),
            Paragraph("<b>Chapter 1 Drafting:</b> Once approved, proceed immediately to write Chapter 1 of the full proposal.", style_stage_text)
        ]
    ]

    workflow_table = Table(
        workflow_data,
        colWidths=[65, 455],
        style=[
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#0284C7')),
            ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (0,-1), 4),
            ('RIGHTPADDING', (0,0), (0,-1), 4),
            ('LEFTPADDING', (1,0), (1,-1), 10),
            ('RIGHTPADDING', (1,0), (1,-1), 10),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]
    )
    story.append(workflow_table)
    story.append(Spacer(1, 14))

    # 6. Action Item & Deadline Notice
    notice_content = [
        [Paragraph("Action Item & Deadline Notice", style_notice_title)],
        [Spacer(1, 2)],
        [Paragraph("The lecturer will provide detailed formatting guidelines and update the submission deadline on the e-learning portal. Take advantage of current free time to prepare your draft early.", style_notice_body)]
    ]
    notice_table = Table(
        notice_content,
        colWidths=[526],
        style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ECFDF5')),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#A7F3D0')),
            ('LINELEFT', (0,0), (0,-1), 3.5, colors.HexColor('#10B981')),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ]
    )
    story.append(notice_table)

    # Build PDF with custom running footer canvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_path}")

if __name__ == '__main__':
    build_pdf()
