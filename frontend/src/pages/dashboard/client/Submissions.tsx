
import { useState, useEffect } from 'react';
import { listSubmissions } from '../../../api/forms';
import type { FormSubmission } from '../../../api/forms';
import { 
  FileText, 
  Clock, 
  Eye,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Submissions() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await listSubmissions();
      // Assuming response.data contains the list or paginated results
      const data = Array.isArray(response.data) ? response.data : (response.data as any).results || [];
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your submissions...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
        <p className="text-gray-500 mt-1">History of your service requests</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {submissions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {submission.form_title || 'Service Request'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Service:</span> {submission.service_title}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {getTimeAgo(submission.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                        {submission.submission_summary || 'No summary available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {submission.order ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Order Created
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending Review
                      </span>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-500">
              Submit a service request to see it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

