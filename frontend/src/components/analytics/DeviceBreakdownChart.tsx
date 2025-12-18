// frontend/src/components/analytics/DeviceBreakdownChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface DeviceBreakdownChartProps {
  data: Array<{
    device: string;
    sessions: number;
    users: number;
  }>;
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#3B82F6',
  mobile: '#10B981',
  tablet: '#F59E0B',
};

const DEVICE_ICONS: Record<string, any> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export const DeviceBreakdownChart: React.FC<DeviceBreakdownChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.device.charAt(0).toUpperCase() + item.device.slice(1),
    value: item.sessions,
    users: item.users,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Device Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => {
              const deviceKey = entry.name.toLowerCase();
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={DEVICE_COLORS[deviceKey] || '#6B7280'}
                />
              );
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Device stats */}
      <div className="mt-4 space-y-3">
        {data.map((device) => {
          const Icon = DEVICE_ICONS[device.device.toLowerCase()] || Monitor;
          const percentage = total > 0 ? ((device.sessions / total) * 100).toFixed(1) : 0;
          
          return (
            <div key={device.device} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: DEVICE_COLORS[device.device.toLowerCase()] + '20',
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: DEVICE_COLORS[device.device.toLowerCase()] }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {device.device.charAt(0).toUpperCase() + device.device.slice(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {device.users} users
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {percentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {device.sessions} sessions
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
