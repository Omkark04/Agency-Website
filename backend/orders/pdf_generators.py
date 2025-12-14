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
            "company_name": getattr(settings, "COMPANY_NAME", "Your Company"),
            "company_address": getattr(settings, "COMPANY_ADDRESS", ""),
            "company_email": getattr(settings, "COMPANY_EMAIL", ""),
            "company_phone": getattr(settings, "COMPANY_PHONE", ""),
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
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #2563eb;
                    margin: 0;
                    font-size: 32px;
                }
                .company-info {
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    margin-top: 10px;
                }
                .estimation-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .info-block {
                    flex: 1;
                }
                .info-block h3 {
                    color: #2563eb;
                    font-size: 14px;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                }
                .info-block p {
                    margin: 5px 0;
                    font-size: 13px;
                }
                .estimation-title {
                    background: #f3f4f6;
                    padding: 15px;
                    margin: 20px 0;
                    border-left: 4px solid #2563eb;
                }
                .estimation-title h2 {
                    margin: 0;
                    color: #1f2937;
                    font-size: 20px;
                }
                .description {
                    margin: 20px 0;
                    padding: 15px;
                    background: #fefce8;
                    border-radius: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                table thead {
                    background: #2563eb;
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
                table tbody tr:hover {
                    background: #f9fafb;
                }
                .totals {
                    margin-top: 20px;
                    text-align: right;
                }
                .totals table {
                    width: 300px;
                    margin-left: auto;
                }
                .totals td {
                    padding: 8px;
                }
                .totals .total-row {
                    font-weight: bold;
                    font-size: 16px;
                    background: #f3f4f6;
                }
                .timeline {
                    background: #ecfdf5;
                    padding: 15px;
                    margin: 20px 0;
                    border-left: 4px solid #10b981;
                }
                .notes {
                    margin-top: 30px;
                    padding: 15px;
                    background: #f9fafb;
                    border-radius: 5px;
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
                <h1>SERVICE ESTIMATION</h1>
                <div class="company-info">
                    <p><strong>{{ company_name }}</strong></p>
                    {% if company_address %}<p>{{ company_address }}</p>{% endif %}
                    {% if company_email %}<p>Email: {{ company_email }}</p>{% endif %}
                    {% if company_phone %}<p>Phone: {{ company_phone }}</p>{% endif %}
                </div>
            </div>
            
            <div class="estimation-info">
                <div class="info-block">
                    <h3>Client Information</h3>
                    <p><strong>{{ client.get_full_name|default:client.email }}</strong></p>
                    <p>{{ client.email }}</p>
                    {% if client.company %}<p>{{ client.company }}</p>{% endif %}
                    {% if client.phone %}<p>{{ client.phone }}</p>{% endif %}
                </div>
                <div class="info-block" style="text-align: right;">
                    <h3>Estimation Details</h3>
                    <p><strong>Estimation #:</strong> {{ estimation.uuid }}</p>
                    <p><strong>Order #:</strong> {{ order.id }}</p>
                    <p><strong>Date:</strong> {{ generated_date }}</p>
                    {% if estimation.valid_until %}<p><strong>Valid Until:</strong> {{ estimation.valid_until }}</p>{% endif %}
                </div>
            </div>
            
            <div class="estimation-title">
                <h2>{{ estimation.title }}</h2>
            </div>
            
            {% if estimation.description %}
            <div class="description">
                <h3 style="margin-top: 0;">Description</h3>
                <p>{{ estimation.description }}</p>
            </div>
            {% endif %}
            
            <h3>Cost Breakdown</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {% for item in estimation.cost_breakdown %}
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
                        <td style="text-align: right;">{{ estimation.subtotal|floatformat:2 }}</td>
                    </tr>
                    {% if estimation.tax_percentage > 0 %}
                    <tr>
                        <td>Tax ({{ estimation.tax_percentage }}%):</td>
                        <td style="text-align: right;">{{ estimation.tax_amount|floatformat:2 }}</td>
                    </tr>
                    {% endif %}
                    <tr class="total-row">
                        <td>Total:</td>
                        <td style="text-align: right;">{{ estimation.total_amount|floatformat:2 }}</td>
                    </tr>
                </table>
            </div>
            
            <div class="timeline">
                <h3 style="margin-top: 0;">Estimated Timeline</h3>
                <p><strong>{{ estimation.estimated_timeline_days }} days</strong> from project start</p>
            </div>
            
            {% if estimation.client_notes %}
            <div class="notes">
                <h3 style="margin-top: 0;">Notes</h3>
                <p>{{ estimation.client_notes }}</p>
            </div>
            {% endif %}
            
            <div class="footer">
                <p>This estimation is valid until {{ estimation.valid_until|default:"further notice" }}</p>
                <p>Thank you for your business!</p>
            </div>
        </body>
        </html>
        """
        
        # Render template with context
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
    
    def upload_to_cloudinary(self):
        """
        Generate PDF and upload to Cloudinary
        
        Returns:
            dict: Cloudinary upload response with 'url' and 'public_id'
        """
        pdf_file = self.generate()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            pdf_file,
            folder="estimations",
            resource_type="raw",
            public_id=f"estimation_{self.estimation.uuid}",
            format="pdf"
        )
        
        # Update estimation with PDF URL
        self.estimation.pdf_url = upload_result["secure_url"]
        self.estimation.pdf_public_id = upload_result["public_id"]
        self.estimation.save()
        
        return {
            "url": upload_result["secure_url"],
            "public_id": upload_result["public_id"]
        }


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
    
    def upload_to_cloudinary(self):
        """
        Generate PDF and upload to Cloudinary
        
        Returns:
            dict: Cloudinary upload response with 'url' and 'public_id'
        """
        pdf_file = self.generate()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            pdf_file,
            folder="invoices",
            resource_type="raw",
            public_id=f"invoice_{self.invoice.invoice_number}",
            format="pdf"
        )
        
        # Update invoice with PDF URL
        self.invoice.pdf_url = upload_result["secure_url"]
        self.invoice.pdf_public_id = upload_result["public_id"]
        self.invoice.save()
        
        return {
            "url": upload_result["secure_url"],
            "public_id": upload_result["public_id"]
        }
