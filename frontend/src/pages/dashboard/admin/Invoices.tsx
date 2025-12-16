// frontend/src/pages/dashboard/admin/Invoices.tsx
import { useEffect, useState } from 'react';
import { Receipt, Download, Eye, Calendar, Filter, Search, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { listInvoices, deleteInvoice } from '../../../api/invoices';
import type { Invoice } from '../../../types/invoices';
import { useToast } from '../../../components/Toast';

export default function Invoices() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await listInvoices();
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      showToast('error', 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (pdfUrl: string, invoiceNumber: string) => {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${invoiceNumber}_invoice.pdf`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('success', 'PDF download initiated');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('error', 'Failed to download PDF');
    }
  };

  const handleViewPDF = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  const handleDelete = async (id: number, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice "${invoiceNumber}"?`)) return;
    
    try {
      await deleteInvoice(id);
      showToast('success', 'Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      showToast('error', 'Failed to delete invoice');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    return badges[status] || badges.draft;
  };

  const isOverdue = (invoice: Invoice) => {
    if (!invoice.due_date || invoice.status === 'paid' || invoice.status === 'cancelled') {
      return false;
    }
    return new Date(invoice.due_date) < new Date();
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Receipt className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Invoices</h1>
                <p className="text-white/90 text-lg mt-1">Manage and track all invoices</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
            placeholder="Search by invoice number, title, or client..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No invoices found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex-1 flex items-center gap-2">
                      <h3 className="font-bold text-xl text-gray-900">{invoice.invoice_number}</h3>
                      {isOverdue(invoice) && (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                          <AlertCircle className="w-4 h-4" />
                          Overdue
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Invoice"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-gray-700 font-medium">{invoice.title}</p>
                  <p className="text-sm text-gray-500">#{invoice.uuid}</p>
                  {invoice.client_name && (
                    <p className="text-sm text-gray-600 mt-1">Client: {invoice.client_name}</p>
                  )}
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Total Amount</span>
                  <span className="font-bold text-lg text-gray-900">₹{invoice.total_amount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Amount Paid</span>
                  <span className="font-bold text-lg text-green-600">₹{invoice.amount_paid}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Balance Due</span>
                  <span className="font-bold text-lg text-red-600">₹{invoice.balance_due}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Invoice Date</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              {invoice.due_date && (
                <div className="mb-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">
                      Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              )}

              {invoice.pdf_url && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownloadPDF(invoice.pdf_url!, invoice.invoice_number)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleViewPDF(invoice.pdf_url!)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
