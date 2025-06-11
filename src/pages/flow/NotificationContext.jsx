import React, { createContext, useContext, useState, useEffect } from "react";
import { Toast, ToastToggle } from "flowbite-react";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (text, type = "info") => {
    setNotifications((pv) => [{ id: Math.random(), text, type }, ...pv]);
  };

  const removeNotification = (id) => {
    setNotifications((pv) => pv.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-2 right-2 z-50 w-80 flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <Notification key={n.id} {...n} removeNotification={removeNotification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const NOTIFICATION_TTL = 5000;

const Notification = ({ text, id, type, removeNotification }) => {
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotification(id);
    }, NOTIFICATION_TTL);
    return () => clearTimeout(timeoutRef);
  }, [id, removeNotification]);

  let icon, bg, textColor;
  if (type === "success") {
    icon = <HiCheck className="h-5 w-5" />;
    bg = "bg-green-100 dark:bg-green-800";
    textColor = "text-green-500 dark:text-green-200";
  } else if (type === "error") {
    icon = <HiX className="h-5 w-5" />;
    bg = "bg-red-100 dark:bg-red-800";
    textColor = "text-red-500 dark:text-red-200";
  } else {
    icon = <HiExclamation className="h-5 w-5" />;
    bg = "bg-orange-100 dark:bg-orange-700";
    textColor = "text-orange-500 dark:text-orange-200";
  }

  return (
    <Toast className="pointer-events-auto">
      <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ${textColor}`}>
        {icon}
      </div>
      <div className="ml-3 text-sm font-normal">{text}</div>
      <ToastToggle onDismiss={() => removeNotification(id)} />
    </Toast>
  );
};
