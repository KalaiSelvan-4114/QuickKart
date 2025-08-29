import React from 'react';

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = "h-12 w-12",
  showBackground = true 
}) {
  const content = (
    <div className="text-center">
      <div className={`animate-spin rounded-full ${size} border-b-2 border-primary-600 mx-auto mb-4`}></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );

  if (showBackground) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
