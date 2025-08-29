import React from 'react';

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  icon, 
  iconBgColor = "from-primary-400 to-primary-600",
  showBackground = true,
  maxWidth = "max-w-7xl"
}) {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      {showBackground && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        </>
      )}
      
      <div className={`relative z-10 ${maxWidth} mx-auto`}>
        {/* Page Header */}
        {title && (
          <div className="text-center mb-8">
            {icon && (
              <div className={`mx-auto h-16 w-16 bg-gradient-to-br ${iconBgColor} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                <span className="text-2xl">{icon}</span>
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
