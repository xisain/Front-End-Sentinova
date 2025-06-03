import React, { createContext, useContext, useState, useEffect } from "react";
import { FiCheckSquare, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (text) => {
    setNotifications((pv) => [{ id: Math.random(), text }, ...pv]);
  };

  const removeNotification = (id) => {
    setNotifications((pv) => pv.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-2 right-2 z-50 w-72 flex flex-col gap-1 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <Notification key={n.id} {...n} removeNotification={removeNotification} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

const NOTIFICATION_TTL = 5000;

const Notification = ({ text, id, removeNotification }) => {
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotification(id);
    }, NOTIFICATION_TTL);
    return () => clearTimeout(timeoutRef);
  }, []);

  return (
    <motion.div
      layout
      initial={{ y: -15, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-2 flex items-start rounded gap-2 text-xs font-medium shadow-lg text-white bg-indigo-500 pointer-events-auto"
    >
      <FiCheckSquare className="mt-0.5" />
      <span>{text}</span>
      <button onClick={() => removeNotification(id)} className="ml-auto mt-0.5">
        <FiX />
      </button>
    </motion.div>
  );
};
