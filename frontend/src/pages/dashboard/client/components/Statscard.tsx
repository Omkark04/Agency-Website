import { motion } from 'framer-motion';
import { Folder, CreditCard, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

const stats = [
  { 
    id: 1, 
    name: 'Active Projects', 
    value: '12', 
    icon: Folder, 
    change: '+2', 
    changeType: 'increase',
    color: 'from-teal-500 to-emerald-500'
  },
  { 
    id: 3, 
    name: 'Payments Due', 
    value: '$2,450', 
    icon: CreditCard, 
    change: '+$450', 
    changeType: 'increase',
    color: 'from-blue-500 to-indigo-500'
  },
  { 
    id: 4, 
    name: 'Completed', 
    value: '24', 
    icon: CheckCircle, 
    change: '+5', 
    changeType: 'increase',
    color: 'from-green-500 to-teal-500'
  }
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <div className={`ml-3 flex items-center text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar for some stats */}
                {['Active Projects', 'Pending Tasks', 'Completed'].includes(stat.name) && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {stat.name === 'Active Projects' ? '75%' : 
                         stat.name === 'Pending Tasks' ? '40%' : '95%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color}`}
                        style={{ 
                          width: stat.name === 'Active Projects' ? '75%' : 
                                 stat.name === 'Pending Tasks' ? '40%' : '95%'
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional info for financial stats */}
            {['Payments Due', 'Total Revenue'].includes(stat.name) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">This month</span>
                  <span className="font-medium text-gray-900">
                    {stat.name === 'Payments Due' ? '+12%' : '+8.5%'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Hover effect border */}
          <div className={`h-1 bg-gradient-to-r ${stat.color} opacity-0 hover:opacity-100 transition-opacity duration-300`}></div>
        </motion.div>
      ))}
    </div>
  );
}