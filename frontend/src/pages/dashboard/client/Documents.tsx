import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

export default function Documents() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">View your invoices and estimations</p>
      </div>
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Documents Coming Soon</p>
        <p className="text-gray-400 text-sm mt-2">Your invoices and estimations will appear here</p>
      </div>
    </div>
  );
}
