import React, { useEffect } from 'react';

export default function NotificationToast({ 
  notification, 
  onClose, 
  position = "top-24 right-6",
  autoClose = true,
  autoCloseDelay = 3000
}) {
  useEffect(() => {
    if (autoClose && notification.show) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show, autoClose, autoCloseDelay, onClose]);

  if (!notification.show) return null;

  const getNotificationStyles = () => {
    const baseStyles = `fixed ${position} z-50 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 transform`;
    
    if (notification.type === "success") {
      return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-600 text-white`;
    } else if (notification.type === "error") {
      return `${baseStyles} bg-gradient-to-r from-red-500 to-pink-600 text-white`;
    } else if (notification.type === "warning") {
      return `${baseStyles} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`;
    } else {
      return `${baseStyles} bg-gradient-to-r from-blue-500 to-indigo-600 text-white`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={getNotificationStyles()}>
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getIcon()}</span>
        <span className="font-medium">{notification.message}</span>
        <button 
          onClick={onClose}
          className="ml-2 text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
