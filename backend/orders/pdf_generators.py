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
        self.navy = colors.HexColor('#1a233a')
        self.orange = colors.HexColor('#ff9f00')
        self.light_gray = colors.HexColor('#f5f5f5')
    
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
        
        # Build header with logo and diagonal design
        header_height = 50*mm
        diagonal_bg = DiagonalBackground(A4[0] - 30*mm, header_height)
        
        # Header table with logo and title
        logo_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'UdyogWorks logo.png')
        
        header_content = []
        if os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=40*mm, height=20*mm)
                logo.hAlign = 'LEFT'
            except:
                logo = Paragraph("<font color='white' size='18'><b>UDYOGWORKS</b></font>", styles['Normal'])
        else:
            logo = Paragraph("<font color='white' size='18'><b>UDYOGWORKS</b></font>", styles['Normal'])
        
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Normal'],
            fontSize=32,
            textColor=self.orange,
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
        
        header_data = [
            [logo, Paragraph("ESTIMATION", title_style)],
            ['', Paragraph(f"ID NO: {str(self.estimation.uuid)[:16]}", id_style)]
        ]
        
        header_table = Table(header_data, colWidths=[100*mm, 80*mm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BACKGROUND', (0, 0), (-1, -1), self.navy),
            ('LEFTPADDING', (0, 0), (0, -1), 10),
            ('RIGHTPADDING', (1, 0), (1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 10*mm))
        
        # Client info boxes
        client = self.estimation.order.client
        client_name = client.get_full_name() if hasattr(client, 'get_full_name') else client.email
        
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
        
        # To and From sections
        to_data = [
            [Paragraph("Estimation To:", info_title_style)],
            [Paragraph(f"<b>{client_name}</b><br/>{client.email}<br/>{getattr(client, 'phone', 'N/A')}", info_content_style)]
        ]
        
        from_data = [
            [Paragraph("Estimation From:", info_title_style)],
            [Paragraph(f"<b>{settings.COMPANY_NAME}</b><br/>{getattr(settings, 'COMPANY_EMAIL', '')}<br/>{getattr(settings, 'COMPANY_PHONE', '')}", info_content_style)]
        ]
        
        to_table = Table(to_data, colWidths=[85*mm])
        to_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.navy),
            ('BACKGROUND', (0, 1), (0, 1), self.light_gray),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        from_table = Table(from_data, colWidths=[85*mm])
        from_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.navy),
            ('BACKGROUND', (0, 1), (0, 1), self.light_gray),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        info_wrapper = Table([[to_table, from_table]], colWidths=[90*mm, 90*mm], spaceBefore=0, spaceAfter=0)
        info_wrapper.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(info_wrapper)
        elements.append(Spacer(1, 10*mm))
        
        # Items table
        items_data = [['DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']]
        
        for item in self.estimation.cost_breakdown:
            desc = item.get('item', 'N/A')
            if item.get('description'):
                desc += f"<br/><font size='8' color='#666'>{item['description']}</font>"
            
            items_data.append([
                Paragraph(desc, info_content_style),
                str(item.get('quantity', 1)),
                f"₹{float(item.get('rate', 0)):.2f}",
                f"₹{float(item.get('amount', 0)):.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[95*mm, 25*mm, 30*mm, 30*mm])
        items_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), self.orange),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (1, 0), (-1, 0), 'CENTER'),
            # Data rows
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.light_gray]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        
        elements.append(items_table)
        elements.append(Spacer(1, 10*mm))
        
        # Totals section
        totals_data = []
        totals_data.append(['Subtotal:', f"₹{float(self.estimation.subtotal):.2f}"])
        
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
            ('BACKGROUND', (0, -1), (-1, -1), self.orange),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.grey),
        ]))
        
        # Right-align totals table
        totals_wrapper = Table([[' ', totals_table]], colWidths=[100*mm, 80*mm])
        totals_wrapper.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(totals_wrapper)
        elements.append(Spacer(1, 15*mm))
        
        # Footer section
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            leading=12
        )
        
        if self.estimation.client_notes:
            elements.append(Paragraph(f"<b>Notes:</b> {self.estimation.client_notes}", footer_style))
            elements.append(Spacer(1, 5*mm))
        
        elements.append(Paragraph(f"<b>Estimated Timeline:</b> {self.estimation.estimated_timeline_days} days from project start", footer_style))
        elements.append(Spacer(1, 3*mm))
        elements.append(Paragraph(f"Valid until: {self.estimation.valid_until if self.estimation.valid_until else 'further notice'}", footer_style))
        elements.append(Spacer(1, 10*mm))
        
        # Signature and thank you
        elements.append(Paragraph("<b>Thanks for your business!</b>", ParagraphStyle('ThankYou', parent=styles['Normal'], fontSize=12, fontName='Helvetica-Bold', textColor=self.navy)))
        
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
        self.navy = colors.HexColor('#1a233a')
        self.orange = colors.HexColor('#ff9f00')
        self.light_gray = colors.HexColor('#f5f5f5')
    
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
        
        # Build header (similar to estimation)
        header_height = 50*mm
        
        logo_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'UdyogWorks logo.png')
        
        if os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=40*mm, height=20*mm)
                logo.hAlign = 'LEFT'
            except:
                logo = Paragraph("<font color='white' size='18'><b>UDYOGWORKS</b></font>", styles['Normal'])
        else:
            logo = Paragraph("<font color='white' size='18'><b>UDYOGWORKS</b></font>", styles['Normal'])
        
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Normal'],
            fontSize=32,
            textColor=self.orange,
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
        
        header_data = [
            [logo, Paragraph("INVOICE", title_style)],
            ['', Paragraph(f"NO: {self.invoice.invoice_number}", id_style)]
        ]
        
        header_table = Table(header_data, colWidths=[100*mm, 80*mm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BACKGROUND', (0, 0), (-1, -1), self.navy),
            ('LEFTPADDING', (0, 0), (0, -1), 10),
            ('RIGHTPADDING', (1, 0), (1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 10*mm))
        
        # Client info
        client = self.invoice.order.client
        client_name = client.get_full_name() if hasattr(client, 'get_full_name') else client.email
        
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
        
        to_data = [
            [Paragraph("Invoice To:", info_title_style)],
            [Paragraph(f"<b>{client_name}</b><br/>{client.email}<br/>{getattr(client, 'phone', 'N/A')}", info_content_style)]
        ]
        
        from_data = [
            [Paragraph("Invoice From:", info_title_style)],
            [Paragraph(f"<b>{settings.COMPANY_NAME}</b><br/>{getattr(settings, 'COMPANY_EMAIL', '')}<br/>{getattr(settings, 'COMPANY_PHONE', '')}", info_content_style)]
        ]
        
        to_table = Table(to_data, colWidths=[85*mm])
        to_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.navy),
            ('BACKGROUND', (0, 1), (0, 1), self.light_gray),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        from_table = Table(from_data, colWidths=[85*mm])
        from_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), self.navy),
            ('BACKGROUND', (0, 1), (0, 1), self.light_gray),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (0, 0), 5),
            ('BOTTOMPADDING', (0, 0), (0, 0), 5),
            ('LEFTPADDING', (0, 1), (0, 1), 10),
            ('RIGHTPADDING', (0, 1), (0, 1), 10),
            ('TOPPADDING', (0, 1), (0, 1), 10),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))
        
        info_wrapper = Table([[to_table, from_table]], colWidths=[90*mm, 90*mm])
        info_wrapper.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(info_wrapper)
        elements.append(Spacer(1, 10*mm))
        
        # Items table
        items_data = [['DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']]
        
        for item in self.invoice.line_items:
            desc = item.get('item', 'N/A')
            if item.get('description'):
                desc += f"<br/><font size='8' color='#666'>{item['description']}</font>"
            
            items_data.append([
                Paragraph(desc, info_content_style),
                str(item.get('quantity', 1)),
                f"₹{float(item.get('rate', 0)):.2f}",
                f"₹{float(item.get('amount', 0)):.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[95*mm, 25*mm, 30*mm, 30*mm])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.orange),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (1, 0), (-1, 0), 'CENTER'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.light_gray]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        
        elements.append(items_table)
        elements.append(Spacer(1, 10*mm))
        
        # Totals section
        totals_data = []
        totals_data.append(['Subtotal:', f"₹{float(self.invoice.subtotal):.2f}"])
        
        if self.invoice.tax_percentage > 0:
            totals_data.append([f'Tax ({self.invoice.tax_percentage}%):', f"₹{float(self.invoice.tax_amount):.2f}"])
        
        if self.invoice.discount_amount > 0:
            totals_data.append(['Discount:', f"-₹{float(self.invoice.discount_amount):.2f}"])
        
        totals_data.append(['TOTAL', f"₹{float(self.invoice.total_amount):.2f}"])
        
        totals_table = Table(totals_data, colWidths=[40*mm, 40*mm])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -2), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -2), 9),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('BACKGROUND', (0, -1), (-1, -1), self.orange),
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
        elements.append(Spacer(1, 15*mm))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            leading=12
        )
        
        if self.invoice.notes:
            elements.append(Paragraph(f"<b>Notes:</b> {self.invoice.notes}", footer_style))
            elements.append(Spacer(1, 5*mm))
        
        if self.invoice.due_date:
            elements.append(Paragraph(f"<b>Due Date:</b> {self.invoice.due_date}", footer_style))
            elements.append(Spacer(1, 3*mm))
        
        elements.append(Paragraph("<b>Thanks for your business!</b>", ParagraphStyle('ThankYou', parent=styles['Normal'], fontSize=12, fontName='Helvetica-Bold', textColor=self.navy)))
        
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
