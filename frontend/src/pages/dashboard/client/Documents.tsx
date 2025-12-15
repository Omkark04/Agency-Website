// frontend/src/pages/dashboard/client/Documents.tsx
import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { listEstimations } from '../../../api/estimations';
import { listInvoices } from '../../../api/invoices';
import type { Estimation } from '../../../types/estimations';
import type { Invoice } from '../../../types/invoices';
import { format } from 'date-fns';

export default function Documents() {
  const [activeTab, setActiveTab] = useState<'estimations' | 'invoices'>('estimations');
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== Fetching Documents ===');
      
      // Fetch both estimations and invoices
      const [estimationsRes, invoicesRes] = await Promise.all([
        listEstimations().catch((err) => {
          console.error('Estimations API error:', err);
          return { data: [] };
        }),
        listInvoices().catch((err) => {
          console.error('Invoices API error:', err);
          return { data: [] };
        })
      ]);

      console.log('Estimations response:', estimationsRes);
      console.log('Estimations data:', estimationsRes.data);
      console.log('Number of estimations:', estimationsRes.data?.length || 0);
      
      console.log('Invoices response:', invoicesRes);
      console.log('Invoices data:', invoicesRes.data);
      console.log('Number of invoices:', invoicesRes.data?.length || 0);

      setEstimations(estimationsRes.data || []);
      setInvoices(invoicesRes.data || []);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: JSX.Element; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <Clock className="w-4 h-4" />, label: 'Draft' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="w-4 h-4" />, label: 'Sent' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Rejected' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <XCircle className="w-4 h-4" />, label: 'Expired' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
      partial: { bg: 'bg-orange-100', text: 'text-orange-800', icon: <Clock className="w-4 h-4" />, label: 'Partially Paid' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Paid' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Overdue' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' },
    };

    const badge = badges[status] || badges.draft;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="ml-1.5">{badge.label}</span>
      </span>
    );
  };

  const handleDownload = (pdfUrl: string, filename: string) => {
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">View your invoices and estimations</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">View your invoices and estimations</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchDocuments}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">View your invoices and estimations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('estimations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'estimations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estimations ({estimations.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Invoices ({invoices.length})
          </button>
        </nav>
      </div>

      {/* Estimations Tab */}
      {activeTab === 'estimations' && (
        <div>
          {estimations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No Estimations Yet</p>
              <p className="text-gray-400 text-sm mt-2">Your estimations will appear here once created</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estimations.map((estimation) => (
                <div key={estimation.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{estimation.title}</h3>
                      {estimation.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{estimation.description}</p>
                      )}
                    </div>
                    {getStatusBadge(estimation.status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="font-semibold text-gray-900">₹{estimation.total_amount}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{format(new Date(estimation.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    {estimation.valid_until && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Valid until: {format(new Date(estimation.valid_until), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  {estimation.pdf_url && (
                    <button
                      onClick={() => handleDownload(estimation.pdf_url, `Estimation-${estimation.id}.pdf`)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No Invoices Yet</p>
              <p className="text-gray-400 text-sm mt-2">Your invoices will appear here once generated</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{invoice.invoice_number}</h3>
                      <p className="text-sm text-gray-600">{invoice.title}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-gray-900">₹{invoice.total_amount}</span>
                    </div>
                    {parseFloat(invoice.amount_paid) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-semibold text-green-600">₹{invoice.amount_paid}</span>
                      </div>
                    )}
                    {parseFloat(invoice.balance_due) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Balance Due:</span>
                        <span className="font-semibold text-red-600">₹{invoice.balance_due}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {invoice.due_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  {invoice.pdf_url && (
                    <button
                      onClick={() => handleDownload(invoice.pdf_url, `Invoice-${invoice.invoice_number}.pdf`)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
