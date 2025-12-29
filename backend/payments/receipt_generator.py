# payments/receipt_generator.py
"""
PDF generation utility for payment receipts using xhtml2pdf
"""
try:
    from xhtml2pdf import pisa
    PDF_AVAILABLE = True
except ImportError as e:
    PDF_AVAILABLE = False
    print(f"Warning: xhtml2pdf not available - PDF generation disabled: {e}")

from django.template.loader import render_to_string
from django.conf import settings
from io import BytesIO
from datetime import datetime


class ReceiptPDFGenerator:
    """
    Generate PDF receipt for payment transactions
    """
    
    def __init__(self, transaction):
        self.transaction = transaction
    
    def get_html_content(self):
        """Generate HTML content for receipt"""
        context = {
            "transaction": self.transaction,
            "order": self.transaction.order,
            "client": self.transaction.user,
            "company_name": getattr(settings, "COMPANY_NAME", "UdyogWorks"),
            "company_address": getattr(settings, "COMPANY_ADDRESS", ""),
            "company_email": getattr(settings, "COMPANY_EMAIL", ""),
            "company_phone": getattr(settings, "COMPANY_PHONE", ""),
            "generated_date": datetime.now().strftime("%B %d, %Y %I:%M %p"),
        }
        
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
                height: 180px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                z-index: -1;
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
                margin-bottom: 50px;
                color: white;
                height: 100px;
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
                opacity: 0.9;
                letter-spacing: 2px;
            }
            .doc-title {
                text-align: right;
            }
            .doc-title h1 {
                margin: 0;
                font-size: 42px;
                color: white;
                font-weight: 800;
                letter-spacing: 1px;
            }
            .doc-title p {
                margin: 5px 0 0;
                font-size: 14px;
                color: white;
                opacity: 0.9;
                letter-spacing: 1px;
            }
            
            .success-badge {
                background-color: #d1fae5;
                color: #065f46;
                padding: 15px 25px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 30px;
                border-left: 5px solid #10b981;
            }
            .success-badge h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
            }
            .success-badge p {
                margin: 5px 0 0;
                font-size: 14px;
            }
            
            .info-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                gap: 30px;
            }
            .info-box {
                flex: 1;
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            .info-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            .info-value {
                font-size: 16px;
                font-weight: 600;
                color: #111827;
            }
            
            .payment-details {
                background: white;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 25px;
                margin: 30px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                color: #6b7280;
                font-size: 14px;
            }
            .detail-value {
                font-weight: 600;
                color: #111827;
                font-size: 14px;
            }
            .amount-paid {
                background: #10b981;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
            }
            .amount-paid .label {
                font-size: 16px;
                font-weight: 600;
            }
            .amount-paid .value {
                font-size: 24px;
                font-weight: 800;
            }
            
            .footer-note {
                margin-top: 40px;
                padding: 20px;
                background: #f9fafb;
                border-radius: 8px;
                text-align: center;
            }
            .footer-note h3 {
                margin: 0 0 10px;
                color: #10b981;
                font-size: 18px;
            }
            .footer-note p {
                margin: 5px 0;
                color: #6b7280;
                font-size: 13px;
            }
            
            .bottom-footer {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 40px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            <div class="header-bg"></div>
            
            <div class="container">
                <div class="header-content">
                    <div class="logo-section">
                        <h1>{{ company_name }}</h1>
                        <p>DIGITAL AGENCY</p>
                    </div>
                    <div class="doc-title">
                        <h1>RECEIPT</h1>
                        <p>{{ generated_date }}</p>
                    </div>
                </div>
                
                <div class="success-badge">
                    <h2>✓ Payment Successful</h2>
                    <p>Transaction ID: {{ transaction.transaction_id }}</p>
                </div>
                
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-label">Paid By</div>
                        <div class="info-value">{{ client.get_full_name|default:client.email }}</div>
                        <p style="margin: 5px 0 0; font-size: 13px; color: #6b7280;">{{ client.email }}</p>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Order</div>
                        <div class="info-value">#{{ order.id }} - {{ order.title }}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Payment Date</div>
                        <div class="info-value">{{ transaction.completed_at|date:"M d, Y" }}</div>
                        <p style="margin: 5px 0 0; font-size: 13px; color: #6b7280;">{{ transaction.completed_at|time:"h:i A" }}</p>
                    </div>
                </div>
                
                <div class="payment-details">
                    <h3 style="margin: 0 0 20px; color: #111827;">Payment Details</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">{{ transaction.transaction_id }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Gateway:</span>
                        <span class="detail-value">{{ transaction.get_gateway_display }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">{{ transaction.get_payment_method_display }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Currency:</span>
                        <span class="detail-value">{{ transaction.currency }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" style="color: #10b981;">{{ transaction.get_status_display }}</span>
                    </div>
                    
                    <div class="amount-paid">
                        <span class="label">Amount Paid</span>
                        <span class="value">{{ transaction.currency }} {{ transaction.amount|floatformat:2 }}</span>
                    </div>
                </div>
                
                <div class="footer-note">
                    <h3>Thank You for Your Payment!</h3>
                    <p>This is an official receipt for your payment.</p>
                    <p>{{ company_name }} | {{ company_email }} | {{ company_phone }}</p>
                    <p style="font-size: 11px; margin-top: 15px;">
                        This is a computer-generated receipt and does not require a signature.
                    </p>
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
                "xhtml2pdf is not available. PDF generation requires xhtml2pdf library."
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
            
            if not pdf_content.startswith(b'%PDF'):
                raise RuntimeError("Generated file is not a valid PDF")
            
            # Reset file pointer
            pdf_file = BytesIO(pdf_content)
            pdf_file.seek(0)
            
            return pdf_file
        except Exception as e:
            raise RuntimeError(f"PDF generation failed: {str(e)}")

