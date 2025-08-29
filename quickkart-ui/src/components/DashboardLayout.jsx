import React from 'react';
import PageLayout from './PageLayout';
import LoadingSpinner from './LoadingSpinner';

export default function DashboardLayout({ 
  title,
  subtitle,
  icon,
  iconBgColor = "from-primary-400 to-primary-600",
  loading,
  error,
  tabs = [],
  currentTab,
  onTabChange,
  children,
  showBackground = true
}) {
  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconBgColor={iconBgColor}
      showBackground={showBackground}
    >
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {tabs.length > 0 && (
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Dashboard Content */}
      {children}
    </PageLayout>
  );
}
