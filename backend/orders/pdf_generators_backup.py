# orders/pdf_generators.py
"""
PDF generation utilities for Estimations and Invoices using ReportLab
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

from django.conf import settings
import cloudinary.uploader
from io import BytesIO
from datetime import datetime

PDF_AVAILABLE = True


class EstimationPDFGenerator:
    """
    Generate PDF for service estimations using ReportLab
    """
    
    def __init__(self, estimation):
        self.estimation = estimation
        self.navy = colors.HexColor('#1a233a')
        self.orange = colors.HexColor('#ff9f00')
    
    def generate(self):
        """
        Generate PDF and return BytesIO object
        
        Returns:
            BytesIO: PDF file content
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=20*mm,
            bottomMargin=20*mm,
            leftMargin=20*mm,
            rightMargin=20*mm
        )
        
        # Container for PDF elements
        elements = []
        
        # Create styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=36,
            textColor=self.orange,
            alignment=TA_RIGHT,
            spaceAfter=5
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_RIGHT,
            spaceAfter=20
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=self.navy,
            spaceAfter=10
        )
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=5
        )
        
        # Header with company name and document title
        header_data = [
            [
                Paragraph(f"<b>{settings.COMPANY_NAME}</b><br/><font size=8>DIGITAL AGENCY</font>", styles['Normal']),
                Paragraph(f"<font size=36 color='#ff9f00'><b>ESTIMATION</b></font><br/><font size=10>ID NO: {self.estimation.uuid}</font>", subtitle_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[90*mm, 80*mm])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), self.navy),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.white),
            ('TEXTCOLOR', (1, 0), (1, 0), colors.white),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 15*mm))
        
        # Client and Company info
        client = self.estimation.order.client
        client_name = client.get_full_name() if hasattr(client, 'get_full_name') else client.email
        
        info_data = [
            [
                Paragraph("<b>Estimation To:</b>", heading_style),
                Paragraph("<b>Estimation From:</b>", heading_style)
            ],
            [
                Paragraph(f"<b>{client_name}</b><br/>{client.email}<br/>{getattr(client, 'phone', 'N/A')}", normal_style),
                Paragraph(f"<b>{settings.COMPANY_NAME}</b><br/>{getattr(settings, 'COMPANY_EMAIL', '')}<br/>{getattr(settings, 'COMPANY_PHONE', '')}", normal_style)
            ]
        ]
        info_table = Table(info_data, colWidths=[85*mm, 85*mm])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 10*mm))
        
        # Items table
        items_data = [['Description', 'Qty', 'Price', 'Total']]
        for item in self.estimation.cost_breakdown:
            desc = item.get('item', 'N/A')
            if item.get('description'):
                desc += f"\n{item['description']}"
            items_data.append([
                Paragraph(desc, normal_style),
                str(item.get('quantity', 1)),
                f"₹{float(item.get('rate', 0)):.2f}",
                f"₹{float(item.get('amount', 0)):.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[80*mm, 25*mm, 30*mm, 35*mm])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.orange),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 10*mm))
        
        # Totals
        totals_data = [
            ['Subtotal:', f"₹{float(self.estimation.subtotal):.2f}"]
        ]
        if self.estimation.tax_percentage > 0:
            totals_data.append([
                f'Tax ({self.estimation.tax_percentage}%):', 
                f"₹{float(self.estimation.tax_amount):.2f}"
            ])
        totals_data.append([
            Paragraph("<b>TOTAL</b>", heading_style),
            Paragraph(f"<b>₹{float(self.estimation.total_amount):.2f}</b>", heading_style)
        ])
        
        totals_table = Table(totals_data, colWidths=[120*mm, 50*mm])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('BACKGROUND', (0, -1), (-1, -1), self.orange),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
            ('PADDING', (0, 0), (-1, -1), 10),
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.grey),
        ]))
        elements.append(totals_table)
        elements.append(Spacer(1, 10*mm))
        
        # Timeline and notes
        timeline_text = f"<b>Estimated Timeline:</b> {self.estimation.estimated_timeline_days} days from project start"
        elements.append(Paragraph(timeline_text, normal_style))
        
        if self.estimation.client_notes:
            elements.append(Spacer(1, 5*mm))
            elements.append(Paragraph(f"<b>Notes:</b> {self.estimation.client_notes}", normal_style))
        
        elements.append(Spacer(1, 10*mm))
        elements.append(Paragraph("<b>Thanks for your business!</b>", heading_style))
        elements.append(Paragraph(f"Valid until: {self.estimation.valid_until if self.estimation.valid_until else 'further notice'}", normal_style))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    def upload_to_dropbox(self):
        """
        Generate PDF and upload to Dropbox
        
        Returns:
            dict: Dropbox upload response with 'file_path', 'download_url'
        """
        try:
            from utils.dropbox_service import get_dropbox_service
            
            # Generate PDF
            pdf_file = self.generate()
            
            # Upload to Dropbox
            dropbox_service = get_dropbox_service()
            file_name = f"estimation_{self.estimation.uuid}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            folder_path = f"/estimations/{self.estimation.order.client.id}"
            
            result = dropbox_service.upload_file(
                file_content=pdf_file.read(),
                file_name=file_name,
                folder_path=folder_path
            )
            
            return result
        except Exception as e:
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")
    
    def get_html_content(self):
        """Generate HTML content for estimation"""
        context = {
            "estimation": self.estimation,
            "order": self.estimation.order,
            "client": self.estimation.order.client,
            "company_name": getattr(settings, "COMPANY_NAME", "UdyogWorks"),
            "company_address": getattr(settings, "COMPANY_ADDRESS", ""),
            "company_email": getattr(settings, "COMPANY_EMAIL", ""),
            "company_phone": getattr(settings, "COMPANY_PHONE", ""),
            "generated_date": datetime.now().strftime("%B %d, %Y"),
        }
        
        # Simplified CSS for xhtml2pdf compatibility
        css_styles = """
            @page {
                size: A4;
                margin: 20mm;
            }
            body {
                font-family: Helvetica, Arial, sans-serif;
                color: #333;
                margin: 0;
                padding: 0;
                font-size: 11pt;
            }
            .header {
                background-color: #1a233a;
                color: white;
                padding: 20px;
                margin: -20mm -20mm 20px -20mm;
            }
            .header-table {
                width: 100%;
                border-collapse: collapse;
            }
            .header-table td {
                padding: 10px;
                vertical-align: top;
            }
            .company-name {
                font-size: 24pt;
                font-weight: bold;
                text-transform: uppercase;
                margin: 0;
            }
            .company-tagline {
                font-size: 9pt;
                margin: 5px 0 0 0;
                opacity: 0.9;
                letter-spacing: 2px;
            }
            .doc-title {
                font-size: 36pt;
                font-weight: bold;
                color: #ff9f00;
                margin: 0;
                text-align: right;
            }
            .doc-id {
                font-size: 10pt;
                margin: 5px 0 0 0;
                text-align: right;
            }
            
            .info-section {
                width: 100%;
                margin: 20px 0;
                border-collapse: collapse;
            }
            .info-section td {
                padding: 15px;
                vertical-align: top;
                width: 50%;
            }
            .info-header {
                background-color: #1a233a;
                color: white;
                padding: 8px 15px;
                font-weight: bold;
                margin-bottom: 10px;
                display: inline-block;
            }
            .info-box {
                background-color: #f9fafb;
                padding: 15px;
                border: 1px solid #e5e7eb;
            }
            .client-name {
                font-size: 14pt;
                font-weight: bold;
                color: #1a233a;
                margin: 0 0 5px 0;
            }
            .info-detail {
                margin: 3px 0;
                font-size: 10pt;
                color: #555;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .items-table th {
                background-color: #ff9f00;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: bold;
                font-size: 10pt;
            }
            .items-table th.text-right {
                text-align: right;
            }
            .items-table th.text-center {
                text-align: center;
            }
            .items-table td {
                padding: 12px;
                border-bottom: 1px solid #eee;
                font-size: 10pt;
            }
            .items-table td.text-right {
                text-align: right;
            }
            .items-table td.text-center {
                text-align: center;
            }
            .item-desc {
                font-size: 9pt;
                color: #666;
                margin-top: 3px;
            }
            .items-table tr:last-child td {
                border-bottom: 2px solid #1a233a;
            }
            
            .footer-section {
                width: 100%;
                margin: 20px 0;
                border-collapse: collapse;
            }
            .footer-section td {
                padding: 15px;
                vertical-align: top;
            }
            .timeline-box {
                background-color: #f3f4f6;
                padding: 15px;
                border-left: 4px solid #ff9f00;
            }
            .notes-box {
                background-color: #f9fafb;
                padding: 15px;
                border: 1px solid #e5e7eb;
                margin-top: 15px;
            }
            
            .totals-table {
                width: 300px;
                margin-left: auto;
                border-collapse: collapse;
            }
            .totals-table td {
                padding: 8px;
                font-size: 11pt;
            }
            .totals-table .label {
                text-align: left;
                color: #666;
            }
            .totals-table .value {
                text-align: right;
                font-weight: bold;
            }
            .grand-total {
                background-color: #ff9f00;
                color: white;
                padding: 12px;
                font-weight: bold;
                font-size: 13pt;
            }
            
            .thank-you {
                margin-top: 30px;
                font-size: 13pt;
                font-weight: bold;
                color: #1a233a;
            }
            .validity {
                font-size: 9pt;
                color: #888;
                margin-top: 10px;
            }
            .signature-line {
                margin-top: 40px;
                padding-top: 40px;
                border-top: 1px solid #333;
                text-align: center;
                font-size: 10pt;
                color: #666;
                width: 200px;
                float: right;
            }
            
            .footer {
                background-color: #1a233a;
                color: white;
                padding: 15px 20px;
                margin: 40px -20mm -20mm -20mm;
                border-top: 5px solid #ff9f00;
                text-align: center;
                font-size: 9pt;
            }
        """

        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                {{ css_styles }}
            </style>
        </head>
        <body>
            <div class="header">
                <table class="header-table">
                    <tr>
                        <td style="width: 60%;">
                            <div class="company-name">{{ company_name }}</div>
                            <div class="company-tagline">DIGITAL AGENCY</div>
                        </td>
                        <td style="width: 40%;">
                            <div class="doc-title">ESTIMATION</div>
                            <div class="doc-id">ID NO: {{ estimation.uuid }}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <table class="info-section">
                <tr>
                    <td>
                        <div class="info-header">Estimation To :</div>
                        <div class="info-box">
                            <p class="client-name">{{ client.get_full_name|default:client.email }}</p>
                            {% if client.company %}<p class="info-detail">{{ client.company }}</p>{% endif %}
                            <p class="info-detail">{{ client.email }}</p>
                            {% if client.phone %}<p class="info-detail">{{ client.phone }}</p>{% endif %}
                        </div>
                    </td>
                    <td>
                        <div class="info-header">Estimation From :</div>
                        <div class="info-box">
                            <p class="client-name">{{ company_name }}</p>
                            <p class="info-detail">{{ company_address }}</p>
                            <p class="info-detail">{{ company_email }}</p>
                            <p class="info-detail">{{ company_phone }}</p>
                        </div>
                    </td>
                </tr>
            </table>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {% for item in estimation.cost_breakdown %}
                    <tr>
                        <td>
                            <strong>{{ item.item }}</strong>
                            {% if item.description %}<div class="item-desc">{{ item.description }}</div>{% endif %}
                        </td>
                        <td class="text-center">{{ item.quantity|default:1 }}</td>
                        <td class="text-right">₹{{ item.rate|floatformat:2 }}</td>
                        <td class="text-right">₹{{ item.amount|floatformat:2 }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>

            <table class="footer-section">
                <tr>
                    <td style="width: 50%;">
                        <div class="timeline-box">
                            <div class="info-header">Estimated Timeline :</div>
                            <p class="info-detail" style="margin-top: 10px;">
                                {{ estimation.estimated_timeline_days }} days from project start
                            </p>
                        </div>
                        
                        {% if estimation.client_notes %}
                        <div class="notes-box">
                            <div class="info-header">Notes :</div>
                            <p class="info-detail" style="margin-top: 10px;">{{ estimation.client_notes }}</p>
                        </div>
                        {% endif %}
                    </td>
                    <td style="width: 50%;">
                        <table class="totals-table">
                            <tr>
                                <td class="label">Subtotal:</td>
                                <td class="value">₹{{ estimation.subtotal|floatformat:2 }}</td>
                            </tr>
                            {% if estimation.tax_percentage > 0 %}
                            <tr>
                                <td class="label">Tax ({{ estimation.tax_percentage }}%):</td>
                                <td class="value">₹{{ estimation.tax_amount|floatformat:2 }}</td>
                            </tr>
                            {% endif %}
                            <tr class="grand-total">
                                <td>TOTAL</td>
                                <td style="text-align: right;">₹{{ estimation.total_amount|floatformat:2 }}</td>
                            </tr>
                        </table>
                        
                        <div class="signature-line">
                            Authorized Signature
                        </div>
                    </td>
                </tr>
            </table>

            <div class="thank-you">Thanks for your business!</div>
            <div class="validity">This estimation is valid until {{ estimation.valid_until|default:"further notice" }}.</div>

            <div class="footer">
                {{ company_name }} | {{ company_email }} | {{ company_phone }}
            </div>
        </body>
        </html>
        """
        
        from django.template import Template, Context
        from django.utils.safestring import mark_safe
        template = Template(html_template)
        context['css_styles'] = mark_safe(css_styles)
        html_content = template.render(Context(context))
        
        return html_content
    
    def generate(self):
        """
        Generate PDF and return BytesIO object
        
        Returns:
            BytesIO: PDF file content
        """
        if not PDF_AVAILABLE:
            raise RuntimeError(
                "xhtml2pdf is not available. PDF generation requires xhtml2pdf library. "
                "Install with: pip install xhtml2pdf"
            )
        
        try:
            html_content = self.get_html_content()
            pdf_file = BytesIO()
            
            # Generate PDF from HTML
            pisa_status = pisa.CreatePDF(
                html_content,
                dest=pdf_file
            )
            
            if pisa_status.err:
                raise RuntimeError(f"PDF generation failed with error code: {pisa_status.err}")
            
            # Validate PDF was generated
            pdf_file.seek(0)
            pdf_content = pdf_file.read()
            
            if len(pdf_content) == 0:
                raise RuntimeError("Generated PDF is empty")
            
            # Check if it's a valid PDF (starts with %PDF)
            if not pdf_content.startswith(b'%PDF'):
                raise RuntimeError("Generated file is not a valid PDF")
            
            # Reset file pointer
            pdf_file = BytesIO(pdf_content)
            pdf_file.seek(0)
            
            return pdf_file
        except Exception as e:
            raise RuntimeError(f"PDF generation failed: {str(e)}")
    
    def upload_to_dropbox(self):
        """
        Generate PDF and upload to Dropbox
        
        Returns:
            dict: Dropbox upload response with 'file_path', 'download_url'
        """
        try:
            from utils.dropbox_service import get_dropbox_service
            
            # Generate PDF
            pdf_file = self.generate()
            
            # Verify PDF file is valid before upload
            pdf_file.seek(0)
            pdf_content = pdf_file.read()
            
            if len(pdf_content) < 100:  # PDF should be at least 100 bytes
                raise RuntimeError(f"PDF file too small ({len(pdf_content)} bytes), likely corrupted")
            
            # Reset for upload
            pdf_file = BytesIO(pdf_content)
            pdf_file.seek(0)
            
            # Get Dropbox service
            dropbox_service = get_dropbox_service()
            
            # Generate filename
            filename = f"estimation_{self.estimation.uuid}.pdf"
            
            # Upload to Dropbox
            result = dropbox_service.upload_pdf(
                pdf_file=pdf_file,
                filename=filename,
                folder_path="/Estimations"
            )
            
            # Update estimation with Dropbox info
            self.estimation.pdf_url = result['download_url']
            self.estimation.pdf_file_path = result['file_path']
            self.estimation.save()
            
            return {
                "url": result['download_url'],
                "file_path": result['file_path']
            }
        except Exception as e:
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")


class InvoicePDFGenerator:
    """
    Generate PDF for invoices
    """
    
    def __init__(self, invoice):
        self.invoice = invoice
    
    def get_html_content(self):
        """Generate HTML content for invoice"""
        context = {
            "invoice": self.invoice,
            "order": self.invoice.order,
            "client": self.invoice.order.client,
            "company_name": getattr(settings, "COMPANY_NAME", "UdyogWorks"),
            "company_address": getattr(settings, "COMPANY_ADDRESS", ""),
            "company_email": getattr(settings, "COMPANY_EMAIL", ""),
            "company_phone": getattr(settings, "COMPANY_PHONE", ""),
            "company_tax_id": getattr(settings, "COMPANY_TAX_ID", ""),
            "generated_date": datetime.now().strftime("%B %d, %Y"),
        }
        
        # Reuse same styles
        css_styles = """
            @page {
                size: A4;
                margin: 0;
            }
            body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                color: #333;
                margin: 0;
                padding: 0;
                font-size: 14px;
            }
            .header-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 200px;
                background-color: #1a233a;
                z-index: -1;
                overflow: hidden;
            }
            .header-shape {
                position: absolute;
                top: 0;
                right: 30%;
                width: 100px;
                height: 100%;
                background-color: #ff9f00;
                transform: skewX(-20deg);
                z-index: 0;
            }
            .header-shape-2 {
                position: absolute;
                top: 0;
                right: 25%;
                width: 20px;
                height: 100%;
                background-color: #1a233a;
                transform: skewX(-20deg);
                z-index: 1;
            }
            .container {
                padding: 40px;
                padding-top: 40px;
                position: relative;
            }
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 60px;
                color: white;
                height: 120px;
            }
            .logo-section h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .logo-section p {
                margin: 5px 0 0;
                font-size: 12px;
                opacity: 0.8;
                letter-spacing: 2px;
            }
            .doc-title {
                text-align: right;
            }
            .doc-title h1 {
                margin: 0;
                font-size: 42px;
                color: #ff9f00;
                font-weight: 800;
                letter-spacing: 1px;
            }
            .doc-title p {
                margin: 5px 0 0;
                font-size: 14px;
                color: white;
                letter-spacing: 1px;
            }
            
            .info-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                gap: 40px;
            }
            .info-box {
                flex: 1;
            }
            .info-header {
                background-color: #1a233a;
                color: white;
                padding: 8px 15px;
                font-weight: bold;
                display: inline-block;
                min-width: 150px;
                margin-bottom: 10px;
                position: relative;
            }
            .info-header::after {
                content: '';
                position: absolute;
                top: 0;
                right: -10px;
                width: 20px;
                height: 100%;
                background-color: #ff9f00;
                transform: skewX(-20deg);
                z-index: -1;
            }
            .info-details h3 {
                margin: 0 0 5px;
                font-size: 16px;
                color: #1a233a;
            }
            .info-details p {
                margin: 2px 0;
                font-size: 13px;
                color: #555;
            }
            
            table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin-bottom: 30px;
            }
            th {
                background-color: #ff9f00;
                color: white;
                padding: 12px 15px;
                text-align: left;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 13px;
            }
            th:first-child {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }
            th:last-child {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                text-align: right;
            }
            td {
                padding: 15px;
                border-bottom: 1px solid #eee;
                font-size: 13px;
                color: #333;
            }
            td:last-child {
                text-align: right;
                font-weight: bold;
            }
            tr:last-child td {
                border-bottom: 2px solid #1a233a;
            }
            
            .footer-section {
                display: flex;
                justify-content: space-between;
                margin-top: 30px;
            }
            .payment-info, .terms-info {
                flex: 1;
            }
            .totals-section {
                width: 300px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                font-size: 14px;
            }
            .grand-total {
                background-color: #ff9f00;
                color: white;
                padding: 10px 15px;
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 16px;
                margin-top: 10px;
                border-radius: 4px;
            }
            .payment-badge {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .status-paid { background-color: #dcfce7; color: #166534; }
            .status-pending { background-color: #fef9c3; color: #854d0e; }
            
            .bottom-footer {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 40px;
                background-color: #1a233a;
                border-top: 5px solid #ff9f00;
            }
            .thank-you {
                margin-top: 40px;
                font-size: 16px;
                font-weight: bold;
                color: #1a233a;
            }
            .signature-line {
                margin-top: 60px;
                width: 200px;
                border-top: 1px solid #333;
                text-align: center;
                padding-top: 5px;
                float: right;
            }
        """

        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                {{ css_styles }}
            </style>
        </head>
        <body>
            <div class="header-bg">
                <div class="header-shape"></div>
                <div class="header-shape-2"></div>
            </div>
            
            <div class="container">
                <div class="header-content">
                    <div class="logo-section">
                        <h1>{{ company_name }}</h1>
                        <p>DIGITAL AGENCY</p>
                    </div>
                    <div class="doc-title">
                        <h1>INVOICE</h1>
                        <p>ID NO: {{ invoice.invoice_number }}</p>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-header">Invoice To :</div>
                        <div class="info-details">
                            <h3>{{ client.get_full_name|default:client.email }}</h3>
                            {% if client.company %}<p>{{ client.company }}</p>{% endif %}
                            <p>{{ client.email }}</p>
                            {% if client.phone %}<p>{{ client.phone }}</p>{% endif %}
                        </div>
                    </div>
                    <div class="info-box">
                        <div class="info-header">Invoice From :</div>
                        <div class="info-details">
                            <h3>{{ company_name }}</h3>
                            <p>{{ company_address }}</p>
                            <p>{{ company_email }}</p>
                            <p>{{ company_phone }}</p>
                            {% if company_tax_id %}<p>Tax ID: {{ company_tax_id }}</p>{% endif %}
                        </div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for item in invoice.line_items %}
                        <tr>
                            <td>
                                <strong>{{ item.item }}</strong>
                                {% if item.description %}<br><span style="font-size: 11px; color: #666;">{{ item.description }}</span>{% endif %}
                            </td>
                            <td style="text-align: center;">{{ item.quantity|default:1 }}</td>
                            <td style="text-align: right;">{{ item.rate|floatformat:2 }}</td>
                            <td>{{ item.amount|floatformat:2 }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
                
                <div class="footer-section">
                    <div class="payment-info">
                        <div class="info-header">Payment Info :</div>
                        <div class="payment-badge {% if invoice.status == 'paid' %}status-paid{% else %}status-pending{% endif %}">
                            STATUS: {{ invoice.get_status_display|upper }}
                        </div>
                        
                        {% if invoice.status != 'paid' and invoice.due_date %}
                        <p><strong>Due Date:</strong> {{ invoice.due_date }}</p>
                        {% endif %}
                        
                        {% if invoice.notes %}
                        <div style="margin-top: 15px;">
                            <p style="font-weight: bold; font-size: 12px;">Notes:</p>
                            <p style="font-size: 12px; color: #666; max-width: 90%;">{{ invoice.notes }}</p>
                        </div>
                        {% endif %}
                        
                        {% if invoice.terms_and_conditions %}
                        <div style="margin-top: 15px;">
                            <p style="font-weight: bold; font-size: 12px;">Terms:</p>
                            <p style="font-size: 12px; color: #666; max-width: 90%;">{{ invoice.terms_and_conditions }}</p>
                        </div>
                        {% endif %}
                    </div>
                    
                    <div class="totals-section">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>{{ invoice.subtotal|floatformat:2 }}</span>
                        </div>
                        {% if invoice.tax_percentage > 0 %}
                        <div class="total-row">
                            <span>Tax ({{ invoice.tax_percentage }}%):</span>
                            <span>{{ invoice.tax_amount|floatformat:2 }}</span>
                        </div>
                        {% endif %}
                        {% if invoice.discount_amount > 0 %}
                        <div class="total-row">
                            <span>Discount:</span>
                            <span>-{{ invoice.discount_amount|floatformat:2 }}</span>
                        </div>
                        {% endif %}
                        
                        <div class="grand-total">
                            <span>TOTAL</span>
                            <span>{{ invoice.total_amount|floatformat:2 }}</span>
                        </div>
                        
                        {% if invoice.amount_paid > 0 %}
                        <div class="total-row" style="margin-top: 10px; font-weight: bold; color: #166534;">
                            <span>Amount Paid:</span>
                            <span>{{ invoice.amount_paid|floatformat:2 }}</span>
                        </div>
                        <div class="total-row" style="font-weight: bold; color: #dc2626;">
                            <span>Balance Due:</span>
                            <span>{{ invoice.balance_due|floatformat:2 }}</span>
                        </div>
                        {% endif %}
                        
                        <div class="signature-line">
                            Authorized Signature
                        </div>
                    </div>
                </div>
                
                <div class="thank-you">
                    Thanks for your business!
                </div>
            </div>
            
            <div class="bottom-footer"></div>
        </body>
        </html>
        """
        
        from django.template import Template, Context
        from django.utils.safestring import mark_safe
        template = Template(html_template)
        context['css_styles'] = mark_safe(css_styles)
        html_content = template.render(Context(context))
        
        return html_content
    
    def generate(self):
        """
        Generate PDF and return BytesIO object
        
        Returns:
            BytesIO: PDF file content
        """
        if not PDF_AVAILABLE:
            raise RuntimeError(
                "xhtml2pdf is not available. PDF generation requires xhtml2pdf library. "
                "Install with: pip install xhtml2pdf"
            )
        
        try:
            html_content = self.get_html_content()
            pdf_file = BytesIO()
            
            # Generate PDF from HTML
            pisa_status = pisa.CreatePDF(
                html_content,
                dest=pdf_file
            )
            
            if pisa_status.err:
                raise RuntimeError(f"PDF generation failed with error code: {pisa_status.err}")
            
            # Validate PDF was generated
            pdf_file.seek(0)
            pdf_content = pdf_file.read()
            
            if len(pdf_content) == 0:
                raise RuntimeError("Generated PDF is empty")
            
            # Check if it's a valid PDF (starts with %PDF)
            if not pdf_content.startswith(b'%PDF'):
                raise RuntimeError("Generated file is not a valid PDF")
            
            # Reset file pointer
            pdf_file = BytesIO(pdf_content)
            pdf_file.seek(0)
            
            return pdf_file
        except Exception as e:
            raise RuntimeError(f"PDF generation failed: {str(e)}")
    
    def upload_to_dropbox(self):
        """
        Generate PDF and upload to Dropbox
        
        Returns:
            dict: Dropbox upload response with 'file_path', 'download_url'
        """
        try:
            from utils.dropbox_service import get_dropbox_service
            
            # Generate PDF
            pdf_file = self.generate()
            
            # Get Dropbox service
            dropbox_service = get_dropbox_service()
            
            # Generate filename
            filename = f"invoice_{self.invoice.invoice_number}.pdf"
            
            # Upload to Dropbox
            result = dropbox_service.upload_pdf(
                pdf_file=pdf_file,
                filename=filename,
                folder_path="/Invoices"
            )
            
            # Update invoice with Dropbox info
            self.invoice.pdf_url = result['download_url']
            self.invoice.pdf_file_path = result['file_path']
            self.invoice.save()
            
            return {
                "url": result['download_url'],
                "file_path": result['file_path']
            }
        except Exception as e:
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")
    
    def generate(self):
        """
        Generate PDF and return BytesIO object
        
        Returns:
            BytesIO: PDF file content
        """
        if not WEASYPRINT_AVAILABLE:
            raise RuntimeError(
                "WeasyPrint is not available. PDF generation requires GTK+ libraries. "
                "See: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows"
            )
        
        try:
            html_content = self.get_html_content()
            pdf_file = BytesIO()
            
            # Generate PDF
            HTML(string=html_content).write_pdf(pdf_file)
            
            # Validate PDF was generated
            pdf_file.seek(0)
            pdf_content = pdf_file.read()
            
            if len(pdf_content) == 0:
                raise RuntimeError("Generated PDF is empty")
            
            # Check if it's a valid PDF (starts with %PDF)
            if not pdf_content.startswith(b'%PDF'):
                raise RuntimeError("Generated file is not a valid PDF")
            
            # Reset file pointer
            pdf_file = BytesIO(pdf_content)
            pdf_file.seek(0)
            
            return pdf_file
        except Exception as e:
            raise RuntimeError(f"PDF generation failed: {str(e)}")
    
    def upload_to_dropbox(self):
        """
        Generate PDF and upload to Dropbox
        
        Returns:
            dict: Dropbox upload response with 'file_path', 'download_url'
        """
        try:
            from utils.dropbox_service import get_dropbox_service
            
            # Generate PDF
            pdf_file = self.generate()
            
            # Verify PDF file is valid before upload
            pdf_file.seek(0)
            pdf_content = pdf_file.read()
            
            if len(pdf_content) < 100:  # PDF should be at least 100 bytes
                raise RuntimeError(f"PDF file too small ({len(pdf_content)} bytes), likely corrupted")
            
            # Reset for upload
            pdf_file = BytesIO(pdf_content)
            pdf_file.seek(0)
            
            # Get Dropbox service
            dropbox_service = get_dropbox_service()
            
            # Generate filename
            filename = f"estimation_{self.estimation.uuid}.pdf"
            
            # Upload to Dropbox
            result = dropbox_service.upload_pdf(
                pdf_file=pdf_file,
                filename=filename,
                folder_path="/Estimations"
            )
            
            # Update estimation with Dropbox info
            self.estimation.pdf_url = result['download_url']
            self.estimation.pdf_file_path = result['file_path']
            self.estimation.save()
            
            return {
                "url": result['download_url'],
                "file_path": result['file_path']
            }
        except Exception as e:
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")


class InvoicePDFGenerator:
    """
    Generate PDF for invoices
    """
    
    def __init__(self, invoice):
        self.invoice = invoice
    
    def get_html_content(self):
        """Generate HTML content for invoice"""
        context = {
            "invoice": self.invoice,
            "order": self.invoice.order,
            "client": self.invoice.order.client,
            "company_name": getattr(settings, "COMPANY_NAME", "Your Company"),
            "company_address": getattr(settings, "COMPANY_ADDRESS", ""),
            "company_email": getattr(settings, "COMPANY_EMAIL", ""),
            "company_phone": getattr(settings, "COMPANY_PHONE", ""),
            "company_tax_id": getattr(settings, "COMPANY_TAX_ID", ""),
            "generated_date": datetime.now().strftime("%B %d, %Y"),
        }
        
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: A4;
                    margin: 2cm;
                }
                body {
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    color: #333;
                    line-height: 1.6;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #dc2626;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #dc2626;
                    margin: 0;
                    font-size: 36px;
                }
                .company-info {
                    font-size: 12px;
                    color: #666;
                }
                .invoice-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .info-block {
                    flex: 1;
                }
                .info-block h3 {
                    color: #dc2626;
                    font-size: 14px;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                }
                .info-block p {
                    margin: 5px 0;
                    font-size: 13px;
                }
                .invoice-number {
                    background: #fee2e2;
                    padding: 15px;
                    margin: 20px 0;
                    border-left: 4px solid #dc2626;
                    font-size: 18px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                table thead {
                    background: #dc2626;
                    color: white;
                }
                table th {
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                table td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .totals {
                    margin-top: 20px;
                    text-align: right;
                }
                .totals table {
                    width: 350px;
                    margin-left: auto;
                }
                .totals td {
                    padding: 8px;
                }
                .totals .total-row {
                    font-weight: bold;
                    font-size: 18px;
                    background: #fee2e2;
                    color: #dc2626;
                }
                .payment-status {
                    background: #dcfce7;
                    padding: 15px;
                    margin: 20px 0;
                    border-left: 4px solid #16a34a;
                }
                .payment-status.pending {
                    background: #fef3c7;
                    border-left-color: #f59e0b;
                }
                .terms {
                    margin-top: 30px;
                    padding: 15px;
                    background: #f9fafb;
                    border-radius: 5px;
                    font-size: 12px;
                }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    font-size: 11px;
                    color: #666;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>INVOICE</h1>
                    <div class="company-info">
                        <p><strong>{{ company_name }}</strong></p>
                        {% if company_address %}<p>{{ company_address }}</p>{% endif %}
                        {% if company_email %}<p>{{ company_email }}</p>{% endif %}
                        {% if company_phone %}<p>{{ company_phone }}</p>{% endif %}
                        {% if company_tax_id %}<p>Tax ID: {{ company_tax_id }}</p>{% endif %}
                    </div>
                </div>
                <div style="text-align: right;">
                    <p><strong>Invoice Number:</strong><br>{{ invoice.invoice_number }}</p>
                    <p><strong>Invoice Date:</strong><br>{{ invoice.invoice_date }}</p>
                    {% if invoice.due_date %}<p><strong>Due Date:</strong><br>{{ invoice.due_date }}</p>{% endif %}
                </div>
            </div>
            
            <div class="invoice-info">
                <div class="info-block">
                    <h3>Bill To</h3>
                    <p><strong>{{ client.get_full_name|default:client.email }}</strong></p>
                    <p>{{ client.email }}</p>
                    {% if client.company %}<p>{{ client.company }}</p>{% endif %}
                    {% if client.phone %}<p>{{ client.phone }}</p>{% endif %}
                </div>
                <div class="info-block" style="text-align: right;">
                    <h3>Order Details</h3>
                    <p><strong>Order #:</strong> {{ order.id }}</p>
                    <p><strong>Service:</strong> {{ order.service.title }}</p>
                </div>
            </div>
            
            <h3>Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {% for item in invoice.line_items %}
                    <tr>
                        <td>{{ item.item }}</td>
                        <td>{{ item.description|default:"-" }}</td>
                        <td style="text-align: center;">{{ item.quantity|default:1 }}</td>
                        <td style="text-align: right;">{{ item.rate|floatformat:2 }}</td>
                        <td style="text-align: right;">{{ item.amount|floatformat:2 }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
            
            <div class="totals">
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td style="text-align: right;">{{ invoice.subtotal|floatformat:2 }}</td>
                    </tr>
                    {% if invoice.tax_percentage > 0 %}
                    <tr>
                        <td>Tax ({{ invoice.tax_percentage }}%):</td>
                        <td style="text-align: right;">{{ invoice.tax_amount|floatformat:2 }}</td>
                    </tr>
                    {% endif %}
                    {% if invoice.discount_amount > 0 %}
                    <tr>
                        <td>Discount:</td>
                        <td style="text-align: right;">-{{ invoice.discount_amount|floatformat:2 }}</td>
                    </tr>
                    {% endif %}
                    <tr class="total-row">
                        <td>Total Amount:</td>
                        <td style="text-align: right;">{{ invoice.total_amount|floatformat:2 }}</td>
                    </tr>
                    {% if invoice.amount_paid > 0 %}
                    <tr>
                        <td>Amount Paid:</td>
                        <td style="text-align: right;">{{ invoice.amount_paid|floatformat:2 }}</td>
                    </tr>
                    <tr style="font-weight: bold;">
                        <td>Balance Due:</td>
                        <td style="text-align: right;">{{ invoice.balance_due|floatformat:2 }}</td>
                    </tr>
                    {% endif %}
                </table>
            </div>
            
            <div class="payment-status {% if invoice.status == 'paid' %}{% else %}pending{% endif %}">
                <h3 style="margin-top: 0;">Payment Status</h3>
                <p><strong>Status:</strong> {{ invoice.get_status_display }}</p>
                {% if invoice.status != 'paid' and invoice.due_date %}
                <p><strong>Payment Due:</strong> {{ invoice.due_date }}</p>
                {% endif %}
            </div>
            
            {% if invoice.notes %}
            <div class="terms">
                <h3 style="margin-top: 0;">Notes</h3>
                <p>{{ invoice.notes }}</p>
            </div>
            {% endif %}
            
            {% if invoice.terms_and_conditions %}
            <div class="terms">
                <h3 style="margin-top: 0;">Terms & Conditions</h3>
                <p>{{ invoice.terms_and_conditions }}</p>
            </div>
            {% endif %}
            
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>Please make payment by {{ invoice.due_date|default:"the due date" }}</p>
            </div>
        </body>
        </html>
        """
        
        from django.template import Template, Context
        template = Template(html_template)
        html_content = template.render(Context(context))
        
        return html_content
    
    def generate(self):
        """
        Generate PDF and return BytesIO object
        
        Returns:
            BytesIO: PDF file content
        """
        if not WEASYPRINT_AVAILABLE:
            raise RuntimeError(
                "WeasyPrint is not available. PDF generation requires GTK+ libraries. "
                "See: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows"
            )
        
        html_content = self.get_html_content()
        pdf_file = BytesIO()
        HTML(string=html_content).write_pdf(pdf_file)
        pdf_file.seek(0)
        return pdf_file
    
    def upload_to_dropbox(self):
        """
        Generate PDF and upload to Dropbox
        
        Returns:
            dict: Dropbox upload response with 'file_path', 'download_url'
        """
        try:
            from utils.dropbox_service import get_dropbox_service
            
            # Generate PDF
            pdf_file = self.generate()
            
            # Get Dropbox service
            dropbox_service = get_dropbox_service()
            
            # Generate filename
            filename = f"invoice_{self.invoice.invoice_number}.pdf"
            
            # Upload to Dropbox
            result = dropbox_service.upload_pdf(
                pdf_file=pdf_file,
                filename=filename,
                folder_path="/Invoices"
            )
            
            # Update invoice with Dropbox info
            self.invoice.pdf_url = result['download_url']
            self.invoice.pdf_file_path = result['file_path']
            self.invoice.save()
            
            return {
                "url": result['download_url'],
                "file_path": result['file_path']
            }
        except Exception as e:
            raise RuntimeError(f"PDF upload to Dropbox failed: {str(e)}")
