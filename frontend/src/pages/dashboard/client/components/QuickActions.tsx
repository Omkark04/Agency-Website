import { Plus, MessageSquare, FileDown, ArrowRight, Download, Upload, Settings, HelpCircle } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { icon: Plus, label: 'Start New Project', color: 'from-[#00C2A8] to-[#0066FF]' },
    { icon: MessageSquare, label: 'Contact Support', color: 'from-teal-500 to-emerald-500' },
    { icon: FileDown, label: 'Upload File', color: 'from-blue-500 to-indigo-500' },
    { icon: Download, label: 'Download Resources', color: 'from-purple-500 to-pink-500' },
    { icon: Upload, label: 'Submit Feedback', color: 'from-orange-500 to-red-500' },
    { icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-700' },
    { icon: HelpCircle, label: 'Help & Tutorials', color: 'from-cyan-500 to-blue-500' },
    { icon: ArrowRight, label: 'View Services', color: 'from-green-500 to-teal-500' },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              className={`p-4 rounded-xl border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300 group`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                  {action.label}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Need something else?{' '}
            <a href="#" className="font-medium text-[#00C2A8] hover:text-[#0086b3] transition-colors duration-200">
              Browse all features →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}