// frontend/src/components/invoices/InvoiceViewer.tsx
import React from 'react';
import type { Invoice } from '../../types/invoices';
import { Download, FileText, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceViewerProps {
  invoice: Invoice;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoice }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      partial: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Partially Paid' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
            <p className="text-red-100 text-lg font-semibold">{invoice.invoice_number}</p>
          </div>
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Overdue Warning */}
        {invoice.is_overdue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Payment Overdue</p>
              <p className="text-sm text-red-700 mt-1">
                This invoice is past its due date. Please make payment as soon as possible.
              </p>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-medium text-gray-900">
                {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {invoice.due_date && (
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Order</p>
              <p className="font-medium text-gray-900">{invoice.order_title}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.line_items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.item}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity || 1}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-red-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-medium text-gray-900">₹{invoice.subtotal}</span>
          </div>
          {parseFloat(invoice.tax_percentage) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax ({invoice.tax_percentage}%):</span>
              <span className="font-medium text-gray-900">₹{invoice.tax_amount}</span>
            </div>
          )}
          {parseFloat(invoice.discount_amount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Discount:</span>
              <span className="font-medium text-gray-900">-₹{invoice.discount_amount}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-red-600">₹{invoice.total_amount}</span>
          </div>
          {parseFloat(invoice.amount_paid) > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Amount Paid:</span>
                <span className="font-medium text-green-600">₹{invoice.amount_paid}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-900">Balance Due:</span>
                <span className="text-red-600">₹{invoice.balance_due}</span>
              </div>
            </>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-700 text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* Terms */}
        {invoice.terms_and_conditions && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">{invoice.terms_and_conditions}</p>
          </div>
        )}

        {/* PDF Download */}
        {invoice.pdf_url && (
          <div className="flex justify-center">
            <a
              href={invoice.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Invoice PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceViewer;
