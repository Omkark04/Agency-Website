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
    const badges: Record<string, { bg: string; text: string; gradient: string; icon: React.ReactElement; label: string; emoji: string }> = {
      draft: { bg: 'bg-gradient-to-r from-gray-50 to-slate-50', text: 'text-gray-700', gradient: 'from-gray-500 to-slate-500', icon: <Clock className="w-3.5 h-3.5" />, label: 'Draft', emoji: '📝' },
      sent: { bg: 'bg-gradient-to-r from-blue-50 to-blue-100', text: 'text-[#1E40AF]', gradient: 'from-[#2563EB] to-[#1E40AF]', icon: <Clock className="w-3.5 h-3.5" />, label: 'Sent', emoji: '📤' },
      approved: { bg: 'bg-gradient-to-r from-green-50 to-emerald-50', text: 'text-green-700', gradient: 'from-green-500 to-emerald-500', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Approved', emoji: '✅' },
      rejected: { bg: 'bg-gradient-to-r from-red-50 to-rose-50', text: 'text-red-700', gradient: 'from-red-500 to-rose-500', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Rejected', emoji: '❌' },
      expired: { bg: 'bg-gradient-to-r from-gray-50 to-gray-100', text: 'text-gray-600', gradient: 'from-gray-500 to-gray-600', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Expired', emoji: '⏰' },
      pending: { bg: 'bg-gradient-to-r from-yellow-50 to-amber-50', text: 'text-yellow-700', gradient: 'from-yellow-500 to-amber-500', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending', emoji: '⏳' },
      partial: { bg: 'bg-gradient-to-r from-orange-50 to-amber-50', text: 'text-orange-700', gradient: 'from-orange-500 to-amber-500', icon: <Clock className="w-3.5 h-3.5" />, label: 'Partially Paid', emoji: '💰' },
      paid: { bg: 'bg-gradient-to-r from-green-50 to-green-100', text: 'text-[#15803D]', gradient: 'from-[#16A34A] to-[#15803D]', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Paid', emoji: '💵' },
      overdue: { bg: 'bg-gradient-to-r from-red-50 to-pink-50', text: 'text-red-700', gradient: 'from-red-500 to-pink-500', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Overdue', emoji: '⚠️' },
      cancelled: { bg: 'bg-gradient-to-r from-gray-50 to-slate-50', text: 'text-gray-600', gradient: 'from-gray-500 to-slate-500', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelled', emoji: '🚫' },
    };

    const badge = badges[status] || badges.draft;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text} shadow-sm border border-current/20`}>
        <span className="mr-1.5">{badge.emoji}</span>
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
              {estimations.map((estimation, index) => (
                <div key={estimation.id} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  {/* Floating gradient blur */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-[#1E40AF]/10 rounded-full blur-3xl group-hover:from-[#2563EB]/20 group-hover:to-[#1E40AF]/20 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-xl shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{estimation.title}</h3>
                        </div>
                        {estimation.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{estimation.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {getStatusBadge(estimation.status)}
                    </div>

                    <div className="space-y-3 mb-5 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm mr-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="font-medium">Total Amount</span>
                        </div>
                        <span className="text-lg font-black text-gray-900">₹{estimation.total_amount}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{format(new Date(estimation.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {estimation.valid_until && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-amber-600" />
                          <span>Valid until: {format(new Date(estimation.valid_until), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {estimation.pdf_url && (
                      <button
                        onClick={() => handleDownload(estimation.pdf_url, `Estimation-${estimation.id}.pdf`)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                    )}
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#1E40AF] to-[#2563EB] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
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
              {invoices.map((invoice, index) => (
                <div key={invoice.id} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  {/* Floating gradient blur */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#16A34A]/10 to-[#15803D]/10 rounded-full blur-3xl group-hover:from-[#16A34A]/20 group-hover:to-[#15803D]/20 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-xl shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{invoice.invoice_number}</h3>
                            <p className="text-sm text-gray-600">{invoice.title}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {getStatusBadge(invoice.status)}
                    </div>

                    <div className="space-y-3 mb-5 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                        <span className="text-lg font-black text-gray-900">₹{invoice.total_amount}</span>
                      </div>
                      {parseFloat(invoice.amount_paid) > 0 && (
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-700">Amount Paid:</span>
                          <span className="text-sm font-bold text-green-600">₹{invoice.amount_paid}</span>
                        </div>
                      )}
                      {parseFloat(invoice.balance_due) > 0 && (
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium text-red-700">Balance Due:</span>
                          <span className="text-sm font-bold text-red-600">₹{invoice.balance_due}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</span>
                      </div>
                      {invoice.due_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-amber-600" />
                          <span>Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {invoice.pdf_url && (
                      <button
                        onClick={() => handleDownload(invoice.pdf_url, `Invoice-${invoice.invoice_number}.pdf`)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                    )}
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
