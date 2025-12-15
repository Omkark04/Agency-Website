// frontend/src/components/estimations/EstimationList.tsx
import React, { useEffect, useState } from 'react';
import { getOrderEstimations, sendEstimation, generateEstimationPDF } from '../../api/estimations';
import type { Estimation } from '../../types/estimations';
import { FileText, Calendar, DollarSign, Loader2, Send, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

interface EstimationListProps {
  orderId: number;
  onEstimationClick?: (estimation: Estimation) => void;
}

const EstimationList: React.FC<EstimationListProps> = ({ orderId, onEstimationClick }) => {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEstimations();
  }, [orderId]);

  const fetchEstimations = async () => {
    try {
      setLoading(true);
      const response = await getOrderEstimations(orderId);
      setEstimations(response.data);
    } catch (error) {
      console.error('Failed to fetch estimations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEstimation = async (e: React.MouseEvent, estimationId: number) => {
    e.stopPropagation();
    try {
      setSending(estimationId);
      await sendEstimation(estimationId);
      await fetchEstimations(); // Refresh list
      alert('Estimation sent to client successfully!');
    } catch (error: any) {
      console.error('Failed to send estimation:', error);
      alert(error.response?.data?.error || 'Failed to send estimation');
    } finally {
      setSending(null);
    }
  };

  const handleGeneratePDF = async (e: React.MouseEvent, estimationId: number) => {
    e.stopPropagation();
    try {
      setGenerating(estimationId);
      await generateEstimationPDF(estimationId);
      await fetchEstimations(); // Refresh to get PDF URL
      alert('PDF generated successfully!');
    } catch (error: any) {
      console.error('Failed to generate PDF:', error);
      alert(error.response?.data?.error || 'Failed to generate PDF');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadPDF = (e: React.MouseEvent, pdfUrl: string) => {
    e.stopPropagation();
    window.open(pdfUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'service_head';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (estimations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No estimations found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estimations.map((estimation) => (
        <div
          key={estimation.id}
          onClick={() => onEstimationClick && onEstimationClick(estimation)}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{estimation.title}</h3>
              <p className="text-sm text-gray-600">#{estimation.uuid}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(estimation.status)}`}>
              {estimation.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="font-medium text-gray-900">₹{estimation.total_amount}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{format(new Date(estimation.created_at), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span>{estimation.estimated_timeline_days} days</span>
            </div>
          </div>

          {/* Action Buttons (Admin only) */}
          {isAdmin && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              {/* Generate PDF Button */}
              {!estimation.pdf_url && (
                <button
                  onClick={(e) => handleGeneratePDF(e, estimation.id)}
                  disabled={generating === estimation.id}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generating === estimation.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </button>
              )}

              {/* Download PDF Button */}
              {estimation.pdf_url && (
                <button
                  onClick={(e) => handleDownloadPDF(e, estimation.pdf_url!)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              )}

              {/* Send to Client Button */}
              {estimation.status === 'draft' && estimation.pdf_url && (
                <button
                  onClick={(e) => handleSendEstimation(e, estimation.id)}
                  disabled={sending === estimation.id}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending === estimation.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to Client
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EstimationList;
