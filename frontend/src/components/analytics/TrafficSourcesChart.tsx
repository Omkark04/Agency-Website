// frontend/src/components/analytics/TrafficSourcesChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TrafficSourcesChartProps {
  data: Array<{
    source: string;
    sessions: number;
    users: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.source,
    value: item.sessions,
  }));

  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Traffic Sources
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Source breakdown table */}
      <div className="mt-4 space-y-2">
        {data.map((source, index) => (
          <div key={source.source} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-700 dark:text-gray-300">{source.source}</span>
            </div>
            <div className="flex gap-4 text-gray-600 dark:text-gray-400">
              <span>{source.sessions} sessions</span>
              <span>{source.users} users</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
