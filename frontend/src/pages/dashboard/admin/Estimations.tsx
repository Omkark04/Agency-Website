// frontend/src/pages/dashboard/admin/Estimations.tsx
import { useEffect, useState } from 'react';
import { FileText, Download, Eye, Calendar, DollarSign, Filter, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { listEstimations, deleteEstimation } from '../../../api/estimations';
import type { Estimation } from '../../../types/estimations';
import { useToast } from '../../../components/Toast';

export default function Estimations() {
  const { showToast } = useToast();
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchEstimations();
  }, []);

  const fetchEstimations = async () => {
    try {
      setLoading(true);
      const response = await listEstimations();
      setEstimations(response.data);
    } catch (error) {
      console.error('Failed to fetch estimations:', error);
      showToast('error', 'Failed to load estimations');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (pdfUrl: string, title: string) => {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}_estimation.pdf`;
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

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete estimation "${title}"?`)) return;
    
    try {
      await deleteEstimation(id);
      showToast('success', 'Estimation deleted successfully');
      fetchEstimations();
    } catch (error) {
      console.error('Failed to delete estimation:', error);
      showToast('error', 'Failed to delete estimation');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || badges.draft;
  };

  const filteredEstimations = estimations.filter(est => {
    const matchesSearch = 
      est.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || est.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Estimations</h1>
                <p className="text-white/90 text-lg mt-1">Manage and track all project estimations</p>
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
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            placeholder="Search by title, UUID, or client..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Estimations List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredEstimations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No estimations found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEstimations.map((estimation) => (
            <div
              key={estimation.id}
              className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-1">{estimation.title}</h3>
                      <p className="text-sm text-gray-500">#{estimation.uuid}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(estimation.id, estimation.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Estimation"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  {estimation.client_name && (
                    <p className="text-sm text-gray-600 mt-1">Client: {estimation.client_name}</p>
                  )}
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(estimation.status)}`}>
                    {estimation.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  <span className="font-semibold text-gray-900">₹{estimation.total_amount}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  <span>{format(new Date(estimation.created_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  <span>{estimation.estimated_timeline_days} days</span>
                </div>
              </div>

              {estimation.pdf_url && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownloadPDF(estimation.pdf_url!, estimation.title)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleViewPDF(estimation.pdf_url!)}
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
