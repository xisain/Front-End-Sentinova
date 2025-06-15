import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiUpload,
  FiList,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
} from "react-icons/fi";
import { useClerk } from "@clerk/clerk-react";

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobile, setIsMobileOpen, isMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
    if (isMobile) setIsMobileOpen(false);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiBarChart2 />, path: "/flow" },
    { id: "analysis", label: "Analisis Baru", icon: <FiUpload />, path: "/flow/analysis" },
    { id: "history", label: "Riwayat Analisis", icon: <FiList />, path: "/flow/history" },
    { id: "reports", label: "Laporan", icon: <FiFileText />, path: "/flow/reports" },
    { id: "settings", label: "Pengaturan", icon: <FiSettings />, path: "/flow/settings" },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-black/30 backdrop-blur-md border-r border-white/10">
      {/* Header */}
      <div className={`p-6 border-b border-white/10 ${isCollapsed ? "px-4" : ""}`}>
        <div className={`flex ${isCollapsed ? "justify-center items-center" : "items-center justify-between"}`}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-3">
              <img src="/Sentinova.png" className="h-8" alt="Sentinova Logo" />
            </Link>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6 space-y-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.id} to={item.path} onClick={() => isMobile && setIsMobileOpen(false)}>
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 5 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 overflow-hidden ${
                  isActive ? "bg-blue-600/30 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-full h-full bg-blue-600/30 rounded-lg z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span className="text-lg flex-shrink-0 z-10">{item.icon}</span>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 mt-auto border-t border-white/10">
        <button
          onClick={handleBackHome}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all duration-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <FiHome className="text-lg flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Back to Home
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full"
    >
      <SidebarContent />
    </motion.div>
  );
};

export default Sidebar;
