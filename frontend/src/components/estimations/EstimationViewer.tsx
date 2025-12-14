// frontend/src/components/estimations/EstimationViewer.tsx
import React, { useState } from 'react';
import { Estimation } from '../../types/estimations';
import { Download, FileText, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface EstimationViewerProps {
  estimation: Estimation;
  onApprove?: () => void;
  onReject?: () => void;
  isClient?: boolean;
}

const EstimationViewer: React.FC<EstimationViewerProps> = ({
  estimation,
  onApprove,
  onReject,
  isClient = false,
}) => {
  const [showActions, setShowActions] = useState(isClient && estimation.status === 'sent');

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      expired: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Expired' },
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{estimation.title}</h2>
            <p className="text-blue-100">Estimation #{estimation.uuid}</p>
          </div>
          {getStatusBadge(estimation.status)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium text-gray-900">
                {format(new Date(estimation.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {estimation.valid_until && (
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(estimation.valid_until), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Timeline</p>
              <p className="font-medium text-gray-900">
                {estimation.estimated_timeline_days} days
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {estimation.description && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{estimation.description}</p>
          </div>
        )}

        {/* Cost Breakdown */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
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
                {estimation.cost_breakdown.map((item, index) => (
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
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-medium text-gray-900">₹{estimation.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Tax ({estimation.tax_percentage}%):</span>
            <span className="font-medium text-gray-900">₹{estimation.tax_amount}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-blue-600">₹{estimation.total_amount}</span>
          </div>
        </div>

        {/* Client Notes */}
        {estimation.client_notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-700 text-sm">{estimation.client_notes}</p>
          </div>
        )}

        {/* PDF Download */}
        {estimation.pdf_url && (
          <div className="flex justify-center">
            <a
              href={estimation.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </a>
          </div>
        )}

        {/* Client Actions */}
        {showActions && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {onReject && (
              <button
                onClick={onReject}
                className="px-6 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimationViewer;
