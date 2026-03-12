import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-600',   text: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-600',  text: 'text-green-700'  },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-500',  text: 'text-amber-700'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-600',    text: 'text-red-700'    },
};

const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, color = 'blue',
}) => {
  const c = colorMap[color];
  return (
    <div className={`card flex items-center space-x-4 ${c.bg} border-0`}>
      <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
