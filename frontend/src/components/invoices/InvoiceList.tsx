// frontend/src/components/invoices/InvoiceList.tsx
import React, { useEffect, useState } from 'react';
import { listInvoices } from '../../api/invoices';
import type { Invoice } from '../../types/invoices';
import { FileText, Calendar, DollarSign, Loader2, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceListProps {
  orderId?: number;
  onInvoiceClick?: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ orderId, onInvoiceClick }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [orderId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = orderId ? { order: orderId } : {};
      const response = await listInvoices(params);
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (e: React.MouseEvent, pdfUrl: string, invoiceNumber: string) => {
    e.stopPropagation();
    
    try {
      // Dropbox URLs are direct download links
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${invoiceNumber}_invoice.pdf`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ PDF download initiated from Dropbox');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{invoice.invoice_number}</h3>
              <p className="text-sm text-gray-600">{invoice.title}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>

          {/* Overdue Warning */}
          {invoice.is_overdue && (
            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 flex items-center text-sm text-red-800">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Payment Overdue</span>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <div>
                <span className="font-medium text-gray-900">₹{invoice.total_amount}</span>
                {parseFloat(invoice.balance_due) > 0 && (
                  <span className="ml-2 text-red-600">(₹{invoice.balance_due} due)</span>
                )}
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</span>
            </div>
            {invoice.due_date && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {invoice.pdf_url && (
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => handleDownloadPDF(e, invoice.pdf_url!, invoice.invoice_number)}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InvoiceList;

