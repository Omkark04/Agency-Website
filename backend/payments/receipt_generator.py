# payments/receipt_generator.py
"""
PDF generation utility for payment receipts using ReportLab
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

from django.conf import settings
from io import BytesIO
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
PDF_AVAILABLE = True


class ReceiptPDFGenerator:
    """
    Generate PDF receipt for payment transactions using ReportLab
    """
    
    def __init__(self, transaction):
        self.transaction = transaction
        self.navy = colors.HexColor('#1a233a')
        self.orange = colors.HexColor('#ff9f00')
        self.light_gray = colors.HexColor('#f5f5f5')
        self.green = colors.HexColor('#10b981')
    
    def generate(self):
        """Generate PDF and return BytesIO"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=15*mm,
            bottomMargin=15*mm,
            leftMargin=15*mm,
            rightMargin=15*mm
        )
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Header with company name and "RECEIPT" title
        header_data = [
            [
                Paragraph("<font size='20' color='#1a233a'><b>UDYOGWORKS</b></font>", styles['Normal']),
                Paragraph("<font size='32' color='#ff9f00'><b>RECEIPT</b></font>", 
                         ParagraphStyle('Title', parent=styles['Normal'], alignment=TA_RIGHT))
            ],
            [
                Paragraph("<font size='9' color='#666'>Digital Agency</font>", styles['Normal']),
                Paragraph(f"<font size='9' color='#666'>Receipt No: {str(self.transaction.uuid)[:16]}</font>",
                         ParagraphStyle('ID', parent=styles['Normal'], alignment=TA_RIGHT))
            ]
        ]
        
        header_table = Table(header_data, colWidths=[95*mm, 85*mm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BACKGROUND', (0, 0), (-1, -1), self.navy),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 10*mm))
        
        # Success badge
        success_data = [[
            Paragraph("<font size='16' color='#10b981'><b>✓ Payment Successful</b></font>", 
                     ParagraphStyle('Success', parent=styles['Normal'], alignment=TA_CENTER))
        ]]
        
        success_table = Table(success_data, colWidths=[180*mm])
        success_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#d1fae5')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('BOX', (0, 0), (-1, -1), 2, self.green),
        ]))
        
        elements.append(success_table)
        elements.append(Spacer(1, 8*mm))
        
        # Transaction details
        client = self.transaction.user
        client_name = client.get_full_name() if hasattr(client, 'get_full_name') and client.get_full_name() else client.email
        
        info_style = ParagraphStyle('Info', parent=styles['Normal'], fontSize=9, leading=14)
        
        # Paid by and order info
        info_data = [
            [
                Paragraph("<font size='10' color='white'><b>Paid By:</b></font>", styles['Normal']),
                Paragraph("<font size='10' color='white'><b>Order:</b></font>", styles['Normal']),
                Paragraph("<font size='10' color='white'><b>Payment Date:</b></font>", styles['Normal'])
            ],
            [
                Paragraph(f"<b>{client_name}</b><br/>{client.email}<br/>{getattr(client, 'phone', 'N/A')}", info_style),
                Paragraph(f"<b>#{self.transaction.order.id}</b><br/>{self.transaction.order.title}", info_style),
                Paragraph(f"<b>{self.transaction.completed_at.strftime('%B %d, %Y') if self.transaction.completed_at else 'N/A'}</b><br/>{self.transaction.completed_at.strftime('%I:%M %p') if self.transaction.completed_at else ''}", info_style)
            ]
        ]
        
        info_table = Table(info_data, colWidths=[60*mm, 60*mm, 60*mm])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.navy),
            ('BACKGROUND', (0, 1), (-1, 1), self.light_gray),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, 0), 5),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, 1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 10),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 10*mm))
        
        # Payment details table
        detail_style = ParagraphStyle('Detail', parent=styles['Normal'], fontSize=10)
        
        payment_data = [
            [Paragraph("<b>Payment Details</b>", ParagraphStyle('SectionTitle', parent=styles['Normal'], fontSize=14, textColor=self.navy))]
        ]
        
        details_rows = [
            ['Transaction ID:', self.transaction.transaction_id],
            ['Payment Gateway:', self.transaction.get_gateway_display()],
            ['Payment Method:', self.transaction.get_payment_method_display()],
            ['Currency:', self.transaction.currency],
            ['Status:', '✓ Success'],
        ]
        
        for label, value in details_rows:
            payment_data.append([
                Paragraph(f"<font color='#6b7280'>{label}</font>", detail_style),
                Paragraph(f"<b>{value}</b>", detail_style)
            ])
        
        payment_table = Table(payment_data, colWidths=[90*mm, 90*mm])
        payment_table.setStyle(TableStyle([
            ('SPAN', (0, 0), (1, 0)),
            ('BACKGROUND', (0, 0), (1, 0), colors.white),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('LINEBELOW', (0, 0), (-1, 0), 2, self.navy),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.light_gray]),
            ('GRID', (0, 1), (-1, -1), 0.5, colors.grey),
        ]))
        
        elements.append(payment_table)
        elements.append(Spacer(1, 8*mm))
        
        # Amount paid - prominent display
        amount_data = [[
            Paragraph("<font size='16' color='white'><b>Amount Paid</b></font>", styles['Normal']),
            Paragraph(f"<font size='24' color='white'><b>{self.transaction.currency} {float(self.transaction.amount):.2f}</b></font>",
                     ParagraphStyle('Amount', parent=styles['Normal'], alignment=TA_RIGHT))
        ]]
        
        amount_table = Table(amount_data, colWidths=[90*mm, 90*mm])
        amount_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), self.green),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ]))
        
        elements.append(amount_table)
        elements.append(Spacer(1, 15*mm))
        
        # Footer
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, leading=14, alignment=TA_CENTER)
        
        elements.append(Paragraph("<b>Thank You for Your Payment!</b>", 
                                 ParagraphStyle('ThankYou', parent=styles['Normal'], fontSize=12, 
                                              fontName='Helvetica-Bold', textColor=self.navy, alignment=TA_CENTER)))
        elements.append(Spacer(1, 5*mm))
        elements.append(Paragraph("This is an official receipt for your payment.", footer_style))
        elements.append(Paragraph(f"{settings.COMPANY_NAME} | {getattr(settings, 'COMPANY_EMAIL', '')} | {getattr(settings, 'COMPANY_PHONE', '')}", footer_style))
        elements.append(Spacer(1, 3*mm))
        elements.append(Paragraph("<font size='8'>This is a computer-generated receipt and does not require a signature.</font>", footer_style))
        
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
            file_name = f"receipt_{self.transaction.uuid}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            folder_path = f"/receipts/{self.transaction.user.id}"
            
            result = dropbox_service.upload_pdf(
                pdf_file=pdf_file,
                filename=file_name,
                folder_path=folder_path
            )
            
            logger.info(f"Receipt PDF uploaded to Dropbox for transaction {self.transaction.id}")
            return result
        except Exception as e:
            logger.error(f"PDF upload to Dropbox failed: {str(e)}")
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")
