# orders/pdf_generators.py
"""
PDF generation using ReportLab - Professional styled PDFs
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.platypus.flowables import Flowable
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.pdfgen import canvas

from django.conf import settings
from io import BytesIO
from datetime import datetime
from django.utils import timezone
import os

PDF_AVAILABLE = True


class DiagonalBackground(Flowable):
    """Custom flowable for diagonal orange stripe"""
    def __init__(self, width, height):
        Flowable.__init__(self)
        self.width = width
        self.height = height
    
    def draw(self):
        # Navy background
        self.canv.setFillColor(colors.HexColor('#1a233a'))
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        
        # Diagonal orange stripe
        self.canv.setFillColor(colors.HexColor('#ff9f00'))
        points = [
            (self.width * 0.6, self.height),
            (self.width * 0.75, self.height),
            (self.width * 0.55, 0),
            (self.width * 0.4, 0)
        ]
        p = self.canv.beginPath()
        p.moveTo(points[0][0], points[0][1])
        for point in points[1:]:
            p.lineTo(point[0], point[1])
        p.close()
        self.canv.drawPath(p, fill=1, stroke=0)


class EstimationPDFGenerator:
    """Generate professional estimation PDFs using ReportLab"""
    
    def __init__(self, estimation):
        self.estimation = estimation
        # New color scheme
        self.navy = colors.HexColor('#0F172A')  # Primary
        self.teal = colors.HexColor('#14B8A6')  # Secondary
        self.emerald = colors.HexColor('#10B981')  # Accent
        self.off_white = colors.HexColor('#F8FAFC')  # Background
        self.charcoal = colors.HexColor('#1E293B')  # Text
    
    def generate(self):
        """Generate PDF and return BytesIO"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            topMargin=10*mm,
            bottomMargin=15*mm,
            leftMargin=15*mm,
            rightMargin=15*mm
        )
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Header with company info
        # Header with company info
        logo_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'UdyogWorks logo.png')
        
        logo = None
        if os.path.exists(logo_path):
            try:
                # Reduced size to 25mm width
                logo = Image(logo_path, width=25*mm, height=12.5*mm)
                logo.hAlign = 'LEFT'
            except:
                pass
        
        company_name_para = Paragraph("<font color='white' size='16'><b>UDYOGWORKS</b></font>", styles['Normal'])
        
        if logo:
            logo_content = Table([[logo, company_name_para]], colWidths=[30*mm, 70*mm])
            logo_content.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
        else:
            logo_content = company_name_para
        
        # Company info
        company_info = Paragraph(
            f"<font color='white' size='8'>Business Development & Marketing Agency<br/>"
            f"udyogworks.official@gmail.com<br/>"
            f"www.udyogworks.in</font>",
            styles['Normal']
        )
        
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Normal'],
            fontSize=32,
            textColor=self.teal,
            alignment=TA_RIGHT,
            fontName='Helvetica-Bold'
        )
        
        id_style = ParagraphStyle(
            'IDStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.white,
            alignment=TA_RIGHT
        )
        
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.white,
            alignment=TA_RIGHT
        )
        
        header_data = [
            [logo_content, Paragraph("ESTIMATION", title_style)],
            [company_info, Paragraph(f"ID: EST-{self.estimation.id:04d}", id_style)],
            ['', Paragraph(f"Date: {timezone.now().strftime('%d %B, %Y')}", date_style)]
        ]
        
        header_table = Table(header_data, colWidths=[100*mm, 80*mm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BACKGROUND', (0, 0), (-1, -1), self.navy),
            ('LEFTPADDING', (0, 0), (0, -1), 10),
            ('RIGHTPADDING', (1, 0), (1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 10*mm))
        
        # Sender and Receiver Details
        info_title_style = ParagraphStyle(
            'InfoTitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            leftIndent=5,
            rightIndent=5
        )
        
        info_content_style = ParagraphStyle(
            'InfoContent',
            parent=styles['Normal'],
            fontSize=9,
            leading=12
        )
        
        # Sender details (Department Head)
        # Sender details (Department Head)
        # Sender details (Department Head)
        dept_head_name = self.estimation.department_head_name or ""
        dept_head_email = self.estimation.department_head_email or "udyogworks.official@gmail.com"
        dept_head_phone = self.estimation.department_head_phone or getattr(settings, 'COMPANY_PHONE', '')
        service_name = self.estimation.order.service.title if self.estimation.order.service else "Service"
        
        department_title = "Department Head"
        if self.estimation.order.service and self.estimation.order.service.department:
            department_title = self.estimation.order.service.department.title

        from_data = [
            [Paragraph("Estimation From:", info_title_style)],
            [Paragraph(
                f"<b>{dept_head_name}</b><br/>"
                f"{department_title}<br/>"
                f"{dept_head_email}<br/>"
                f"{dept_head_phone}<br/>"
                f"<i>Service: {service_name}</i>",
                info_content_style
            )]
        ]
        
        # Receiver details (Client)
        # Use stored details if available, otherwise fallback to order client
        client = self.estimation.order.client
        
        client_email = self.estimation.client_email
        if not client_email:
            client_email = client.email if client else ''
            
        client_name = self.estimation.client_name
        if not client_name:
            client_name = client.get_full_name() if hasattr(client, 'get_full_name') and client else ''
            if not client_name and not client_email:
                client_name = 'Client'
        client_phone = self.estimation.client_phone or getattr(client, 'phone', 'N/A')
        client_address = self.estimation.client_address or getattr(client, 'address', '') or ''
        
        to_data = [
            [Paragraph("Estimation To:", info_title_style)],
            [Paragraph(
                f"<b>{client_name}</b><br/>"
                f"{client_email}<br/>"
                f"{client_phone}<br/>"
                f"{client_address}",
                info_content_style
            )]
        ]
        
        from_table = Table(from_data, colWidths=[85*mm])
        from_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.teal),
            ('BACKGROUND', (0, 1), (0, 1), self.off_white),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        to_table = Table(to_data, colWidths=[85*mm])
        to_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.teal),
            ('BACKGROUND', (0, 1), (0, 1), self.off_white),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        info_wrapper = Table([[from_table, to_table]], colWidths=[90*mm, 90*mm])
        info_wrapper.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(info_wrapper)
        elements.append(Spacer(1, 8*mm))
        
        # Estimation Title
        if self.estimation.title:
            title_para = Paragraph(
                f"<b>{self.estimation.title}</b>",
                ParagraphStyle('EstTitle', parent=styles['Normal'], fontSize=14, textColor=self.navy, fontName='Helvetica-Bold')
            )
            elements.append(title_para)
            elements.append(Spacer(1, 5*mm))
        
        # Items table
        items_data = [['Sr. No.', 'ITEM NAME', 'DESCRIPTION', 'QTY', 'AMOUNT']]
        
        for idx, item in enumerate(self.estimation.cost_breakdown, 1):
            desc = item.get('description', '') or ''
            if len(desc) > 50:
                desc = desc[:47] + "..."
            
            items_data.append([
                str(idx),
                Paragraph(item.get('item', 'N/A'), info_content_style),
                Paragraph(desc, ParagraphStyle('Desc', parent=styles['Normal'], fontSize=8, textColor=self.charcoal)),
                str(item.get('quantity', 1)),
                f"₹{float(item.get('amount', 0)):.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[15*mm, 45*mm, 60*mm, 20*mm, 40*mm])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.teal),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (3, 0), (3, -1), 'CENTER'),
            ('ALIGN', (4, 0), (4, -1), 'RIGHT'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.off_white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(items_table)
        elements.append(Spacer(1, 8*mm))
        
        # Totals section
        totals_data = []
        totals_data.append(['Subtotal:', f"₹{float(self.estimation.subtotal):.2f}"])
        
        if self.estimation.discount_amount > 0:
            totals_data.append(['Discount:', f"-₹{float(self.estimation.discount_amount):.2f}"])
        
        if self.estimation.tax_percentage > 0:
            totals_data.append([f'Tax ({self.estimation.tax_percentage}%):', f"₹{float(self.estimation.tax_amount):.2f}"])
        
        totals_data.append(['TOTAL', f"₹{float(self.estimation.total_amount):.2f}"])
        
        totals_table = Table(totals_data, colWidths=[40*mm, 40*mm])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -2), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -2), 9),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('BACKGROUND', (0, -1), (-1, -1), self.emerald),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.grey),
        ]))
        
        totals_wrapper = Table([[' ', totals_table]], colWidths=[100*mm, 80*mm])
        totals_wrapper.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(totals_wrapper)
        elements.append(Spacer(1, 2*mm))
        
        # Footer section
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            leading=12,
            textColor=self.charcoal
        )
        
        footer_data = []
        
        # Delivery Date
        if self.estimation.delivery_date:
            footer_data.append([
                Paragraph("<b>Delivery Date:</b>", footer_style),
                Paragraph(f"{self.estimation.delivery_date.strftime('%d %B, %Y')}", footer_style)
            ])
        
        # Timeline
        footer_data.append([
            Paragraph("<b>Estimated Timeline:</b>", footer_style),
            Paragraph(f"{self.estimation.estimated_timeline_days} days from project start", footer_style)
        ])
        
        # Notes
        if self.estimation.client_notes:
            footer_data.append([
                Paragraph("<b>Note:</b>", footer_style),
                Paragraph(self.estimation.client_notes, footer_style)
            ])
        
        if footer_data:
            footer_table = Table(footer_data, colWidths=[40*mm, 140*mm])
            footer_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(footer_table)
            elements.append(Spacer(1, 8*mm))
        
        # Department Head Signature
        elements.append(Spacer(1, 15*mm))
        
        # Try to load signature image
        sig_data = []
        sig_found = False
        
        if self.estimation.order.service and self.estimation.order.service.department:
            dept_title = self.estimation.order.service.department.title
            
            # Check extensions: jpeg, jpg, png
            for ext in ['.jpeg', '.jpg', '.png']:
                sig_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'DepartmentSignatures', f'{dept_title}{ext}')
                if os.path.exists(sig_path):
                    try:
                        sig_img = Image(sig_path, width=40*mm, height=15*mm)
                        sig_data = [[sig_img]]
                        sig_found = True
                        break
                    except:
                        continue
        
        if not sig_found:
            sig_data = [[Paragraph("_________________", footer_style)]]
        
        sig_data.append([Paragraph("<b>Department Head's Signature</b>", footer_style)])
        
        sig_table = Table(sig_data, colWidths=[50*mm])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        
        sig_wrapper = Table([[' ', sig_table]], colWidths=[110*mm, 70*mm])
        sig_wrapper.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        
        elements.append(sig_wrapper)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    def upload_to_dropbox(self):
        """Generate PDF and upload to Dropbox"""
        try:
            from utils.dropbox_service import get_dropbox_service
            
            pdf_file = self.generate()
            dropbox_service = get_dropbox_service()
            file_name = f"estimation_{self.estimation.uuid}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            folder_path = f"/estimations/{self.estimation.order.client.id}"
            
            result = dropbox_service.upload_pdf(
                pdf_file=pdf_file,
                filename=file_name,
                folder_path=folder_path
            )
            
            return result
        except Exception as e:
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")



class InvoicePDFGenerator:
    """Generate professional invoice PDFs using ReportLab"""
    
    def __init__(self, invoice):
        self.invoice = invoice
        # New color scheme
        self.navy = colors.HexColor('#0F172A')  # Primary
        self.teal = colors.HexColor('#14B8A6')  # Secondary
        self.emerald = colors.HexColor('#10B981')  # Accent
        self.off_white = colors.HexColor('#F8FAFC')  # Background
        self.charcoal = colors.HexColor('#1E293B')  # Text
    
    def generate(self):
        """Generate PDF and return BytesIO"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            topMargin=10*mm,
            bottomMargin=15*mm,
            leftMargin=15*mm,
            rightMargin=15*mm
        )
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Header
        # Header
        logo_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'UdyogWorks logo.png')
        
        logo = None
        if os.path.exists(logo_path):
            try:
                # Reduced size to 25mm width
                logo = Image(logo_path, width=25*mm, height=12.5*mm)
                logo.hAlign = 'LEFT'
            except:
                pass
        
        company_name_para = Paragraph("<font color='white' size='16'><b>UDYOGWORKS</b></font>", styles['Normal'])
        
        if logo:
            logo_content = Table([[logo, company_name_para]], colWidths=[30*mm, 70*mm])
            logo_content.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
        else:
            logo_content = company_name_para
        
        # Company info
        company_info = Paragraph(
            f"<font color='white' size='8'>Business Development & Marketing Agency<br/>"
            f"udyogworks.official@gmail.com<br/>"
            f"www.udyogworks.in</font>",
            styles['Normal']
        )
        
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Normal'],
            fontSize=32,
            textColor=self.teal,
            alignment=TA_RIGHT,
            fontName='Helvetica-Bold'
        )
        
        id_style = ParagraphStyle(
            'IDStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.white,
            alignment=TA_RIGHT
        )
        
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.white,
            alignment=TA_RIGHT
        )
        
        header_data = [
            [logo_content, Paragraph("INVOICE", title_style)],
            [company_info, Paragraph(f"NO: {self.invoice.invoice_number}", id_style)],
            ['', Paragraph(f"Date: {self.invoice.invoice_date.strftime('%d %B, %Y')}", date_style)]
        ]
        
        header_table = Table(header_data, colWidths=[100*mm, 80*mm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BACKGROUND', (0, 0), (-1, -1), self.navy),
            ('LEFTPADDING', (0, 0), (0, -1), 10),
            ('RIGHTPADDING', (1, 0), (1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 10*mm))
        
        # Sender and Receiver Details
        info_title_style = ParagraphStyle(
            'InfoTitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            leftIndent=5,
            rightIndent=5
        )
        
        info_content_style = ParagraphStyle(
            'InfoContent',
            parent=styles['Normal'],
            fontSize=9,
            leading=12
        )
        
        # Sender details
        # Sender details
        # Sender details
        sender_name = self.invoice.department_head_name or ""
        sender_email = self.invoice.department_head_email or "udyogworks.official@gmail.com"
        sender_phone = self.invoice.department_head_phone or getattr(settings, 'COMPANY_PHONE', '')
        service_name = self.invoice.order.service.title if self.invoice.order.service else "Service"
        
        department_title = "Department Head"
        if self.invoice.order.service and self.invoice.order.service.department:
            department_title = self.invoice.order.service.department.title

        from_data = [
            [Paragraph("Invoice From:", info_title_style)],
            [Paragraph(
                f"<b>{sender_name}</b><br/>"
                f"{department_title}<br/>"
                f"{sender_email}<br/>"
                f"{sender_phone}<br/>"
                f"<i>Service: {service_name}</i>",
                info_content_style
            )]
        ]
        
        # Receiver details
        # Use stored details if available, otherwise fallback to order client
        client = self.invoice.order.client
        
        client_email = self.invoice.client_email
        if not client_email:
            client_email = client.email if client else ''
            
        client_name = self.invoice.client_name
        if not client_name:
            client_name = client.get_full_name() if hasattr(client, 'get_full_name') and client else ''
            if not client_name and not client_email:
                client_name = 'Client'
        client_phone = self.invoice.client_phone or getattr(client, 'phone', 'N/A')
        client_address = self.invoice.client_address or getattr(client, 'address', '') or ''
        
        to_data = [
            [Paragraph("Invoice To:", info_title_style)],
            [Paragraph(
                f"<b>{client_name}</b><br/>"
                f"{client_email}<br/>"
                f"{client_phone}<br/>"
                f"{client_address}",
                info_content_style
            )]
        ]
        
        from_table = Table(from_data, colWidths=[85*mm])
        from_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.teal),
            ('BACKGROUND', (0, 1), (0, 1), self.off_white),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        to_table = Table(to_data, colWidths=[85*mm])
        to_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.teal),
            ('BACKGROUND', (0, 1), (0, 1), self.off_white),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        info_wrapper = Table([[from_table, to_table]], colWidths=[90*mm, 90*mm])
        info_wrapper.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(info_wrapper)
        elements.append(Spacer(1, 8*mm))
        
        # Invoice Title
        if self.invoice.title:
            title_para = Paragraph(
                f"<b>{self.invoice.title}</b>",
                ParagraphStyle('InvTitle', parent=styles['Normal'], fontSize=14, textColor=self.navy, fontName='Helvetica-Bold')
            )
            elements.append(title_para)
            elements.append(Spacer(1, 5*mm))
        
        # Items table
        items_data = [['Sr. No.', 'ITEM', 'DESCRIPTION', 'QTY', 'AMOUNT']]
        
        for idx, item in enumerate(self.invoice.line_items, 1):
            desc = item.get('description', '') or ''
            if len(desc) > 50:
                desc = desc[:47] + "..."
            
            items_data.append([
                str(idx),
                Paragraph(item.get('item', 'N/A'), info_content_style),
                Paragraph(desc, ParagraphStyle('Desc', parent=styles['Normal'], fontSize=8, textColor=self.charcoal)),
                str(item.get('quantity', 1)),
                f"₹{float(item.get('amount', 0)):.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[15*mm, 45*mm, 60*mm, 20*mm, 40*mm])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.teal),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (3, 0), (3, -1), 'CENTER'),
            ('ALIGN', (4, 0), (4, -1), 'RIGHT'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.off_white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(items_table)
        elements.append(Spacer(1, 8*mm))
        
        # Totals section
        totals_data = []
        totals_data.append(['Subtotal:', f"₹{float(self.invoice.subtotal):.2f}"])
        
        if self.invoice.discount_amount > 0:
            totals_data.append(['Discount:', f"-₹{float(self.invoice.discount_amount):.2f}"])
        
        if self.invoice.tax_percentage > 0:
            totals_data.append([f'Tax ({self.invoice.tax_percentage}%):', f"₹{float(self.invoice.tax_amount):.2f}"])
        
        totals_data.append(['GRAND TOTAL', f"₹{float(self.invoice.total_amount):.2f}"])
        
        totals_table = Table(totals_data, colWidths=[40*mm, 40*mm])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -2), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -2), 9),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('BACKGROUND', (0, -1), (-1, -1), self.emerald),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.grey),
        ]))
        
        totals_wrapper = Table([[' ', totals_table]], colWidths=[100*mm, 80*mm])
        totals_wrapper.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(totals_wrapper)
        elements.append(Spacer(1, 2*mm))
        
        # Footer section with referral policies and terms
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            leading=12,
            textColor=self.charcoal
        )
        
        footer_data = []
        
        # Team Note with Referral Policies (left side)
        left_content = []
        if self.invoice.notes or self.invoice.referral_policies:
            left_content.append(Paragraph("<b>Team Note:</b>", footer_style))
            left_content.append(Spacer(1, 0.5*mm))
            
            # Add referral policies first if exists
            if self.invoice.referral_policies:
                left_content.append(Paragraph(self.invoice.referral_policies, footer_style))
                if self.invoice.notes:
                    left_content.append(Spacer(1, 2*mm))
            
            # Add team notes
            if self.invoice.notes:
                left_content.append(Paragraph(self.invoice.notes, footer_style))
        
        # Terms & Conditions (right side)
        right_content = []
        if self.invoice.terms_and_conditions:
            right_content.append(Paragraph("<b>Terms & Conditions:</b>", footer_style))
            right_content.append(Spacer(1, 0.5*mm))
            right_content.append(Paragraph(self.invoice.terms_and_conditions, footer_style))
        
        if self.invoice.due_date:
            if right_content:
                right_content.append(Spacer(1, 4*mm))
            right_content.append(Paragraph(f"<b>Due Date:</b> {self.invoice.due_date.strftime('%d %B, %Y')}", footer_style))
        
        # Create two-column layout for footer
        if left_content or right_content:
            # Add boxing styles
            box_style = TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOX', (0, 0), (-1, -1), 0.5, self.teal),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ])
            
            left_table = Table([[item] for item in left_content], colWidths=[85*mm])
            left_table.setStyle(box_style)
            
            right_table = Table([[item] for item in right_content], colWidths=[85*mm])
            right_table.setStyle(box_style)
            
            footer_wrapper = Table([[left_table, right_table]], colWidths=[90*mm, 90*mm])
            footer_wrapper.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ]))
            
            elements.append(footer_wrapper)
            elements.append(Spacer(1, 2*mm)) # Reduced from 10mm to pull signatures up
        
        # Thank you message
        elements.append(Paragraph(
            "<b>Thank You for Your Business.</b>",
            ParagraphStyle('ThankYou', parent=styles['Normal'], fontSize=11, fontName='Helvetica-Bold', textColor=self.navy, alignment=TA_CENTER)
        ))
        elements.append(Spacer(1, 2*mm)) # Reduced spacing for signatures # Reduced spacing for signatures
        
        # Three Signatures
        sig_style = ParagraphStyle(
            'SigStyle',
            parent=styles['Normal'],
            fontSize=8,
            alignment=TA_CENTER,
            textColor=self.charcoal
        )
        
        # Department Head Signature
        dept_sig_data = []
        dept_sig_found = False
        
        if self.invoice.order.service and self.invoice.order.service.department:
            dept_title = self.invoice.order.service.department.title
            
            # Check extensions: jpeg, jpg, png
            for ext in ['.jpeg', '.jpg', '.png']:
                sig_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'DepartmentSignatures', f'{dept_title}{ext}')
                if os.path.exists(sig_path):
                    try:
                        dept_sig_data.append([Image(sig_path, width=35*mm, height=12*mm)])
                        dept_sig_found = True
                        break
                    except:
                        continue
        
        if not dept_sig_found:
            dept_sig_data.append([Paragraph("_____________", sig_style)])
        
        dept_sig_data.append([Paragraph("<b>Department Head's<br/>Signature</b>", sig_style)])
        
        # Chairperson Signature
        chair_sig_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'AuthoritySignatures', 'Chair.png')
        if not os.path.exists(chair_sig_path):
            chair_sig_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'AuthoritySignatures', 'Chair.jpg')
        
        chair_sig_data = []
        if os.path.exists(chair_sig_path):
            try:
                chair_sig_data.append([Image(chair_sig_path, width=35*mm, height=12*mm)])
            except:
                chair_sig_data.append([Paragraph("_____________", sig_style)])
        else:
            chair_sig_data.append([Paragraph("_____________", sig_style)])
        
        chair_sig_data.append([Paragraph(f"<b>Chairperson's<br/>Signature</b><br/>{self.invoice.chairperson_name}", sig_style)])
        
        # Vice-Chairperson Signature
        vice_sig_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'AuthoritySignatures', 'Vice-Chair.png')
        if not os.path.exists(vice_sig_path):
            vice_sig_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'AuthoritySignatures', 'Vice-Chair.jpg')
        
        vice_sig_data = []
        if os.path.exists(vice_sig_path):
            try:
                vice_sig_data.append([Image(vice_sig_path, width=35*mm, height=12*mm)])
            except:
                vice_sig_data.append([Paragraph("_____________", sig_style)])
        else:
            vice_sig_data.append([Paragraph("_____________", sig_style)])
        
        vice_sig_data.append([Paragraph(f"<b>Vice-Chairperson's<br/>Signature</b><br/>{self.invoice.vice_chairperson_name}", sig_style)])
        
        # Create signature tables
        dept_sig_table = Table(dept_sig_data, colWidths=[50*mm])
        dept_sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        chair_sig_table = Table(chair_sig_data, colWidths=[50*mm])
        chair_sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        vice_sig_table = Table(vice_sig_data, colWidths=[50*mm])
        vice_sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        # Arrange signatures in a row
        sig_wrapper = Table([[dept_sig_table, chair_sig_table, vice_sig_table]], colWidths=[60*mm, 60*mm, 60*mm])
        sig_wrapper.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(sig_wrapper)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    def upload_to_dropbox(self):
        """Generate PDF and upload to Dropbox"""
        try:
            from utils.dropbox_service import get_dropbox_service
            
            pdf_file = self.generate()
            dropbox_service = get_dropbox_service()
            file_name = f"invoice_{self.invoice.invoice_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            folder_path = f"/invoices/{self.invoice.order.client.id}"
            
            result = dropbox_service.upload_pdf(
                pdf_file=pdf_file,
                filename=file_name,
                folder_path=folder_path
            )
            
            return result
        except Exception as e:
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")

