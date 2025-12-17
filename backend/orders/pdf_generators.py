# orders/pdf_generators.py
"""
PDF generation utilities for Estimations and Invoices using WeasyPrint
"""
try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError) as e:
    # WeasyPrint requires GTK+ on Windows which may not be installed
    # PDF generation will be disabled but the system will still work
    WEASYPRINT_AVAILABLE = False
    print(f"Warning: WeasyPrint not available - PDF generation disabled: {e}")

from django.template.loader import render_to_string
from django.conf import settings
import cloudinary.uploader
from io import BytesIO
from datetime import datetime


class EstimationPDFGenerator:
    """
    Generate PDF for service estimations
    """
    
    def __init__(self, estimation):
        self.estimation = estimation
    
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
        
        # Shared CSS styles for the modern geometric design
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
                        <h1>ESTIMATION</h1>
                        <p>ID NO: {{ estimation.uuid }}</p>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-header">Estimation To :</div>
                        <div class="info-details">
                            <h3>{{ client.get_full_name|default:client.email }}</h3>
                            {% if client.company %}<p>{{ client.company }}</p>{% endif %}
                            <p>{{ client.email }}</p>
                            {% if client.phone %}<p>{{ client.phone }}</p>{% endif %}
                        </div>
                    </div>
                    <div class="info-box">
                        <div class="info-header">Estimation From :</div>
                        <div class="info-details">
                            <h3>{{ company_name }}</h3>
                            <p>{{ company_address }}</p>
                            <p>{{ company_email }}</p>
                            <p>{{ company_phone }}</p>
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
                        {% for item in estimation.cost_breakdown %}
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
                    <div class="terms-info">
                        <div class="info-header">Estimated Timeline :</div>
                        <p style="margin-top: 5px;">{{ estimation.estimated_timeline_days }} days from project start</p>
                        
                        {% if estimation.client_notes %}
                        <div style="margin-top: 20px;">
                            <div class="info-header">Notes :</div>
                            <p style="font-size: 12px; color: #666; max-width: 90%;">{{ estimation.client_notes }}</p>
                        </div>
                        {% endif %}
                    </div>
                    
                    <div class="totals-section">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>{{ estimation.subtotal|floatformat:2 }}</span>
                        </div>
                        {% if estimation.tax_percentage > 0 %}
                        <div class="total-row">
                            <span>Tax ({{ estimation.tax_percentage }}%):</span>
                            <span>{{ estimation.tax_amount|floatformat:2 }}</span>
                        </div>
                        {% endif %}
                        <div class="grand-total">
                            <span>TOTAL</span>
                            <span>{{ estimation.total_amount|floatformat:2 }}</span>
                        </div>
                        
                        <div class="signature-line">
                            Authorized Signature
                        </div>
                    </div>
                </div>
                
                <div class="thank-you">
                    Thanks for your business!
                </div>
                
                <div style="font-size: 11px; color: #888; margin-top: 10px;">
                    This estimation is valid until {{ estimation.valid_until|default:"further notice" }}.
                </div>
            </div>
            
            <div class="bottom-footer"></div>
        </body>
        </html>
        """
        
        from django.template import Template, Context
        template = Template(html_template)
        # We need to render the CSS separately or inject it into the context if passing as variable, 
        # but here we are using {{ css_styles }} in the template string which will be replaced by Django template engine
        # if we pass css_styles in context.
        context['css_styles'] = css_styles
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
        template = Template(html_template)
        context['css_styles'] = css_styles
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
