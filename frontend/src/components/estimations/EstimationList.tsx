// frontend/src/components/estimations/EstimationList.tsx
import React, { useEffect, useState } from 'react';
import { getOrderEstimations } from '../../api/estimations';
import { Estimation } from '../../types/estimations';
import { FileText, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface EstimationListProps {
  orderId: number;
  onEstimationClick?: (estimation: Estimation) => void;
}

const EstimationList: React.FC<EstimationListProps> = ({ orderId, onEstimationClick }) => {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loading, setLoading] = useState(true);

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
        </div>
      ))}
    </div>
  );
};

export default EstimationList;
