import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import { FiMenu, FiBell, FiSettings, FiLogOut } from "react-icons/fi"
import { useUser, useClerk } from "@clerk/clerk-react"
import Sidebar from "./sidebar"

// Reuse the same color palette
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"]
const COLORS_BOTTOM = ["#0D4B3C", "#0A2342", "#4A1942", "#3D0E21"]

const AnimatedBackground = ({ children, className, speed = 12 }) => {
  const color = useMotionValue(COLORS_TOP[0])
  const bottomColor = useMotionValue(COLORS_BOTTOM[0])

  useEffect(() => {
    animate(color, [...COLORS_TOP], {
      ease: "easeInOut",
      duration: speed,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "mirror",
    })

    animate(bottomColor, [...COLORS_BOTTOM], {
      ease: "easeInOut",
      duration: speed,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "mirror",
    })
  }, [])

  const backgroundImage = useMotionTemplate`linear-gradient(to bottom, #020617 10%, ${color} 50%, ${bottomColor} 100%)`

  return (
    <motion.div style={{ backgroundImage }} className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        <Canvas>
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        </Canvas>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

const DashboardUserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    navigate("/")
  }

  const handleManageAccount = () => {
    navigate("/flow/settings")
    setIsOpen(false)
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase()
    }

    return "U"
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
      >
        {user?.imageUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={user.imageUrl || "/placeholder.svg"}
              alt={user.fullName || user.username || "User"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">{getInitials()}</span>
          </div>
        )}
        <span className="text-white text-sm font-medium hidden md:block">
          {user?.firstName || user?.username?.split("@")[0] || "User"}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-white/10">
            <p className="text-white font-medium truncate">{user?.fullName || user?.username}</p>
            <p className="text-gray-400 text-sm truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div className="p-2">
            <button
              onClick={handleManageAccount}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              Manage Account
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn, isLoaded, user } = useUser()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Clerk Auth check
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/")
    }
  }, [isLoaded, isSignedIn, navigate])

  const getTitle = () => {
    if (location.pathname === "/flow" || location.pathname === "/flow/") return "Dashboard"
    if (location.pathname.startsWith("/flow/analysis/results")) return "Hasil Analisis"
    if (location.pathname.startsWith("/flow/analysis")) return "Analisis Baru"
    if (location.pathname.startsWith("/flow/history")) return "Riwayat Analisis"
    if (location.pathname.startsWith("/flow/reports")) return "Laporan"
    if (location.pathname.startsWith("/flow/settings")) return "Pengaturan"
    return "Dashboard"
  }

  if (!isLoaded) {
    // Loading state saat Clerk masih loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="relative z-20 bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                  >
                    <FiMenu />
                  </button>
                )}
                <h1 className="text-xl font-semibold text-white">{getTitle()}</h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors relative">
                  <FiBell />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* User Dropdown - Using custom component similar to home.jsx */}
                <DashboardUserDropdown />
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout