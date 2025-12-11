'use client';

import { useState } from 'react';
import { FiCheckCircle, FiClock, FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiX, FiCheck, FiFile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

interface Submission {
  id: string;
  title: string;
  submittedBy: string;
  submittedDate: string;
  dueDate: string;
  status: SubmissionStatus;
  priority: 'high' | 'medium' | 'low';
  type: 'document' | 'design' | 'report' | 'other';
  description: string;
  attachments: number;
}

const SubmissionsApproval = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 'SUB-001',
      title: 'Q4 Marketing Report',
      submittedBy: 'Alex Johnson',
      submittedDate: '2025-01-10',
      dueDate: '2025-01-15',
      status: 'pending',
      priority: 'high',
      type: 'report',
      description: 'Complete quarterly marketing performance report with analytics and insights.',
      attachments: 3,
    },
    {
      id: 'SUB-002',
      title: 'Website Redesign Mockups',
      submittedBy: 'Sarah Williams',
      submittedDate: '2025-01-09',
      dueDate: '2025-01-12',
      status: 'needs_revision',
      priority: 'high',
      type: 'design',
      description: 'Initial mockups for the homepage redesign project.',
      attachments: 5,
    },
    {
      id: 'SUB-003',
      title: 'Project Budget Approval',
      submittedBy: 'Michael Chen',
      submittedDate: '2025-01-08',
      dueDate: '2025-01-20',
      status: 'approved',
      priority: 'medium',
      type: 'document',
      description: 'Proposed budget for the upcoming product launch campaign.',
      attachments: 2,
    },
    {
      id: 'SUB-004',
      title: 'User Research Findings',
      submittedBy: 'Emily Rodriguez',
      submittedDate: '2025-01-07',
      dueDate: '2025-01-14',
      status: 'rejected',
      priority: 'medium',
      type: 'report',
      description: 'Analysis of user feedback and research findings from Q4.',
      attachments: 4,
    },
    {
      id: 'SUB-005',
      title: 'Social Media Calendar - January',
      submittedBy: 'David Kim',
      submittedDate: '2025-01-11',
      dueDate: '2025-01-18',
      status: 'pending',
      priority: 'low',
      type: 'document',
      description: 'Planned social media posts and campaigns for January.',
      attachments: 1,
    },
  ]);

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = 
      (filters.status === 'all' || submission.status === filters.status) &&
      (filters.type === 'all' || submission.type === filters.type) &&
      (filters.priority === 'all' || submission.priority === filters.priority);
    
    return matchesSearch && matchesFilters;
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}><FiCheckCircle className="inline mr-1" /> Approved</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}><FiX className="inline mr-1" /> Rejected</span>;
      case 'needs_revision':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><FiEdit className="inline mr-1" /> Needs Revision</span>;
      default:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}><FiClock className="inline mr-1" /> Pending</span>;
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (priority) {
      case 'high':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>High</span>;
      case 'medium':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Medium</span>;
      default:
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Low</span>;
    }
  };

  const handleApprove = (submission: Submission) => {
    setSubmissions(prev => prev.map(s => 
      s.id === submission.id ? { ...s, status: 'approved' as const } : s
    ));
  };

  const handleReject = (submission: Submission) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setSubmissions(prev => prev.map(s => 
      s.id === submission.id ? { ...s, status: 'rejected' as const } : s
    ));
    setShowDetailModal(false);
    setRejectionReason('');
  };

  const handleRequestRevision = (submission: Submission) => {
    if (!rejectionReason.trim()) {
      alert('Please provide details about what needs to be revised');
      return;
    }
    setSubmissions(prev => prev.map(s => 
      s.id === submission.id ? { ...s, status: 'needs_revision' as const } : s
    ));
    setShowDetailModal(false);
    setRejectionReason('');
  };

  const openSubmissionDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submissions & Approvals</h1>
            <p className="text-gray-500">Manage and review team submissions</p>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="all">All Types</option>
                      <option value="document">Document</option>
                      <option value="design">Design</option>
                      <option value="report">Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="text-sm text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      setFilters({
                        status: 'all',
                        type: 'all',
                        priority: 'all',
                      });
                      setSearchQuery('');
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submissions List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            {submission.type.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{submission.title}</div>
                            <div className="text-sm text-gray-500">{submission.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{submission.submittedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(submission.submittedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(submission.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(submission.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openSubmissionDetails(submission)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FiEye className="inline mr-1" /> View
                        </button>
                        {submission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(submission)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <FiCheck className="inline mr-1" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowDetailModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiX className="inline mr-1" /> Reject
                            </button>
                          </>
                        )}
                        {submission.status === 'needs_revision' && (
                          <button
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowDetailModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <FiEdit className="inline mr-1" /> Revise
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No submissions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedSubmission && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {selectedSubmission.title}
                        </h3>
                        <button
                          onClick={() => {
                            setShowDetailModal(false);
                            setRejectionReason('');
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <FiX className="h-6 w-6" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            <span className="font-medium">Submitted by:</span> {selectedSubmission.submittedBy}
                          </span>
                          <span className="text-sm text-gray-500">
                            <span className="font-medium">Type:</span> {selectedSubmission.type}
                          </span>
                          {getPriorityBadge(selectedSubmission.priority)}
                          {getStatusBadge(selectedSubmission.status)}
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">Description</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {selectedSubmission.description}
                          </p>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">Attachments ({selectedSubmission.attachments})</h4>
                          <div className="mt-2 flex space-x-2">
                            {Array.from({ length: selectedSubmission.attachments }).map((_, i) => (
                              <div key={i} className="border rounded p-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                <FiFile className="inline mr-1" />
                                Document_{i + 1}.pdf
                              </div>
                            ))}
                            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                              <FiDownload className="mr-1" /> Download All
                            </button>
                          </div>
                        </div>

                        {(selectedSubmission.status === 'pending' || selectedSubmission.status === 'needs_revision') && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              {selectedSubmission.status === 'pending' ? 'Add a comment (optional)' : 'What needs to be revised?'}
                            </h4>
                            <textarea
                              rows={3}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                              placeholder={selectedSubmission.status === 'pending' ? 'Add your comments here...' : 'Please specify what needs to be revised...'}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            ></textarea>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedSubmission)}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(selectedSubmission)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestRevision(selectedSubmission)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-yellow-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Request Revision
                      </button>
                    </>
                  )}
                  {selectedSubmission.status === 'needs_revision' && (
                    <button
                      type="button"
                      onClick={() => handleRequestRevision(selectedSubmission)}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Submit Revision Request
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      setRejectionReason('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubmissionsApproval;
