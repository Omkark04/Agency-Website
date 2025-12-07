import React from 'react';
import { Card } from '../ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  format = 'number'
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat().format(val);
    }
  };

  return (
    <Card className="kpi-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="kpi-label">{title}</div>
          <div className="kpi-value">{formatValue(value)}</div>
          {change !== undefined && (
            <div className={`kpi-change ${change >= 0 ? 'positive' : 'negative'}`}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500">from last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-blue-50 text-blue-600 ml-4">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default KPICard;