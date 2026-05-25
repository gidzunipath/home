import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

const NotificationSystem = ({ notifications = [], onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <FaExclamationTriangle className="w-5 h-5 text-red-600" />;
      case "info":
      default:
        return <FaInfoCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-2xl border shadow-soft animate-fade-in-up ${getNotificationStyles(
            notification.type
          )}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90">{notification.message}</p>
              {notification.timestamp && (
                <p className="text-xs opacity-75 mt-2">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
