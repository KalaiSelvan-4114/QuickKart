import React from 'react';

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  iconBgColor = "bg-blue-100", 
  iconColor = "text-blue-600",
  subtitle,
  trend,
  trendValue,
  trendType = "up", // up, down, neutral
  onClick,
  className = ""
}) {
  const getTrendIcon = () => {
    switch (trendType) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      default:
        return "→";
    }
  };

  const getTrendColor = () => {
    switch (trendType) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div 
      className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {trend && (
          <div className={`text-right ${getTrendColor()}`}>
            <div className="text-sm font-medium">
              {getTrendIcon()} {trendValue}
            </div>
            <div className="text-xs">{trend}</div>
          </div>
        )}
      </div>
    </div>
  );
}
