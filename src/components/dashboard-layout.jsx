import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import { FiMenu, FiBell } from "react-icons/fi"
import { useUser, UserButton } from "@clerk/clerk-react"
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

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn, isLoaded, user } = useUser()
  const username = user?.username || user?.firstName || "User"
  const userButtonRef = useRef(null)

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
          <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
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
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors relative">
                  <FiBell />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-sm font-bold text-white"
                      }
                    }}
                    ref={userButtonRef}
                  />
                  <span
                    className="text-white font-medium hidden sm:block cursor-pointer"
                    onClick={() => {
                      if (userButtonRef.current) {
                        const btn = userButtonRef.current.querySelector('button');
                        if (btn) btn.click();
                      }
                    }}
                  >
                    {username.length > 10 ? `${username.substring(0, 10)}...` : username}
                  </span>
                </div>
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