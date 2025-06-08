import { useEffect, useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { FiArrowRight, FiTarget, FiSmile, FiLock, FiLink, FiSettings, FiLogOut } from "react-icons/fi"
import TiltCard from "./tiltcard"
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import { useUser, useClerk } from "@clerk/clerk-react"

// Expanded color palette for the entire site
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"]
const COLORS_BOTTOM = ["#0D4B3C", "#0A2342", "#4A1942", "#3D0E21"]

// Custom animated background component that can be reused
const AnimatedBackground = ({ children, className, speed = 10, colorIndex = 0 }) => {
  const color = useMotionValue(COLORS_TOP[colorIndex % COLORS_TOP.length])
  const bottomColor = useMotionValue(COLORS_BOTTOM[colorIndex % COLORS_BOTTOM.length])

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

// User Dropdown Component - Improved version
const UserDropdown = () => {
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
  }

  const handleDashboard = () => {
    navigate("/flow")
    setIsOpen(false)
  }

  const handleDashboardAnalysis = () => {
    navigate("/flow/analysis")
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
              onClick={handleDashboard}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Enhanced hero section with better typography and layout
const EnhancedHero = () => {
  const [typedText, setTypedText] = useState("")
  const fullText = "Platform AI untuk memahami review pelanggan Anda dengan mudah dan cepat."
  const typingSpeed = 50
  const typingRef = useRef(null)

  useEffect(() => {
    let currentIndex = 0
    typingRef.current = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingRef.current)
      }
    }, typingSpeed)

    return () => {
      if (typingRef.current) clearInterval(typingRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-4"
      >
        <div className="inline-block px-6 py-2 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm mb-8">
          <span className="text-blue-400 font-medium">AI-Powered Analytics</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter">
          <span className="inline-block relative">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              SENTI
            </span>
          </span>
          <span className="inline-block relative ml-2">
            <span className="bg-gradient-to-r from-purple-200 via-blue-100 to-white bg-clip-text text-transparent">
              NOVA
            </span>
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-6"
        >
          <p className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Meringkas ulasan dan menganalisis sentimen dengan hasil yang akurat.
          </p>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto h-8">
            {typedText}
            <span className="animate-pulse">|</span>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mt-12"
          >
            {/* Button di bawah teks utama dihapus sesuai permintaan */}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          y: [0, 15, 0],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  )
}

// New Product Analysis Section Component
const ProductAnalysisSection = () => {
  const navigate = useNavigate()

  // Pastikan handleDashboardAnalysis di sini, bukan dari UserDropdown
  const handleDashboardAnalysis = () => {
    navigate("/flow/analysis")
  }

  return (
    <div className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-5xl sm:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Analisis Ulasan Produk dengan AI
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed">
              Dapatkan insight mendalam dari ulasan pelanggan dengan teknologi{" "}
              <span className="text-blue-400 font-semibold hover:text-blue-300 transition-colors cursor-pointer">
                Summarization
              </span>{" "}
              dan{" "}
              <span className="text-purple-400 font-semibold hover:text-purple-300 transition-colors cursor-pointer">
                Sentiment Analysis
              </span>{" "}
              berbasis AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl text-lg font-medium flex items-center gap-2 transition-all duration-300 group"
                onClick={handleDashboardAnalysis}
              >
                Mulai Analisis
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 bg-white/5 backdrop-blur-md text-gray-100 hover:bg-white/10 px-8 py-6 rounded-xl text-lg font-medium transition-all duration-300"
              >
                Lihat Demo
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-8 pt-8"
            >
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-3xl font-bold text-blue-400 mb-2 cursor-pointer transition-transform"
                >
                  1000+
                </motion.div>
                <div className="text-gray-400">Ulasan Dianalisis</div>
              </div>
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-3xl font-bold text-purple-400 mb-2 cursor-pointer transition-transform"
                >
                  95%
                </motion.div>
                <div className="text-gray-400">Akurasi AI</div>
              </div>
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-3xl font-bold text-green-400 mb-2 cursor-pointer transition-transform"
                >
                  24/7
                </motion.div>
                <div className="text-gray-400">Otomatis</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-500/30 rounded-full blur-xl"></div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-blue-900/20 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-gray-400 text-sm">Analisis Ulasan Dashboard</div>
              </div>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="border-l-4 border-green-500 bg-gray-900/50 p-4 rounded-r-lg hover:bg-gray-900/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500 mr-2"
                      >
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>
                      <span className="text-green-400 font-medium">Sentiment: Positif</span>
                    </div>
                    <span className="text-green-400 font-bold">94%</span>
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Confidence: 94%</div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="border-l-4 border-blue-500 bg-gray-900/50 p-4 rounded-r-lg hover:bg-gray-900/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500 mr-2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="text-blue-400 font-medium">Ringkasan</span>
                  </div>
                  <div className="text-gray-300 mt-2 leading-relaxed">
                    Produk berkualitas tinggi dengan fitur yang inovatif. Pelanggan sangat puas dengan performa dan daya
                    tahan.
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="border-l-4 border-purple-500 bg-gray-900/50 p-4 rounded-r-lg hover:bg-gray-900/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-500 mr-2"
                      >
                        <path d="M3 3v18h18"></path>
                        <path d="m19 9-5 5-4-4-3 3"></path>
                      </svg>
                      <span className="text-purple-400 font-medium">Analisis Kategori</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-300">Kualitas:</span>
                    <div className="flex items-center">
                      <span className="text-purple-400 font-bold mr-2">4.8/5</span>
                      <div className="flex">
                        {[1, 2, 3, 4].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-purple-400"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        ))}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-purple-400/50"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Enhanced FAQ Section
const EnhancedFAQSection = () => {
  const [openPanel, setOpenPanel] = useState(null)

  const faqs = [
    {
      question: "Apa itu Sentinova?",
      answer:
        "Sentinova adalah platform AI yang menggunakan teknologi IndoT5 dan IndoBERT untuk meringkas ulasan produk dan menganalisis sentimen pelanggan secara otomatis dengan akurasi tinggi.",
    },
    {
      question: "Seberapa akurat Sentinova?",
      answer:
        "Sentinova menggunakan model AI terdepan IndoT5 untuk summarization dan IndoBERT untuk sentiment analysis, memberikan tingkat akurasi hingga 95% untuk bahasa Indonesia.",
    },
    {
      question: "Apa fungsi utama Sentinova?",
      answer:
        "Fungsi utama Sentinova adalah meringkas ulasan produk menjadi versi pendek yang mempertahankan makna esensial, serta menganalisis sentimen ulasan ke dalam kategori positif, negatif, atau netral.",
    },
  ]

  return (
    <div className="py-24 px-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4 pb-2">
            Pertanyaan Umum
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan yang sering diajukan tentang Sentinova
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
              onMouseEnter={() => setOpenPanel(index)}
              onMouseLeave={() => setOpenPanel(null)}
            >
              <div
                className={`bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 overflow-hidden transition-all duration-300 ${
                  openPanel === index ? "shadow-blue-500/10" : ""
                }`}
              >
                <div className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer">
                  <span className="text-xl font-medium text-white group-hover:text-blue-300 transition-colors">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openPanel === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400 group-hover:text-blue-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </motion.span>
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    height: openPanel === index ? "auto" : 0,
                    opacity: openPanel === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 text-gray-300 leading-relaxed border-t border-white/5">{faq.answer}</div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser()
  const navigate = useNavigate()

  // Tambahkan state untuk memastikan UI dirender ulang saat status auth berubah
  const [authState, setAuthState] = useState({
    isSignedIn: false,
    isLoaded: false,
  })

  // Update state saat status auth berubah
  useEffect(() => {
    if (isLoaded) {
      setAuthState({
        isSignedIn,
        isLoaded,
      })
    }
  }, [isSignedIn, isLoaded])

  return (
    <AnimatedBackground className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-20 bg-black/20 backdrop-blur-md shadow-none">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/image/Sentinova.png" className="h-9" alt="Sentinova Logo" />
          </Link>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 md:flex-row md:mt-0">
              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <li>
                      <UserDropdown />
                    </li>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/auth"
                          className="text-white font-poppins text-sm px-5 py-2.5 me-2 mb-2 transition inline-block text-center hover:bg-white/10 rounded-lg"
                        >
                          Sign In
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/auth"
                          className="text-white bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm focus:ring-4 focus:outline-none focus:ring-blue-300/50 font-poppins rounded-lg text-sm px-5 py-2.5 me-2 mb-2 transition inline-block text-center"
                        >
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <EnhancedHero />

      {/* Product Analysis Section */}
      <ProductAnalysisSection />

      {/* Enhanced FAQ Section */}
      <EnhancedFAQSection />

      {/* Card Grid Section */}
      <div className="py-24">
        <div className="max-w-screen-xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
              Fitur Utama
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Teknologi AI terdepan untuk analisis sentimen dan summarization yang akurat
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 place-items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              viewport={{ once: true }}
              className="w-full flex justify-center"
            >
              <TiltCard
                icon={<FiTarget className="text-green-400 text-3xl" />}
                title="Akurasi Tinggi"
                description="Didukung AI mutakhir untuk analisis sentimen dan ringkasan ulasan yang presisi."
                className="relative h-96 w-full max-w-xs rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              viewport={{ once: true }}
              className="w-full flex justify-center"
            >
              <TiltCard
                icon={<FiSmile className="text-yellow-300 text-3xl" />}
                title="Mudah Digunakan"
                description="Antarmuka sederhana, hasil instan tanpa perlu keahlian teknis."
                className="relative h-96 w-full max-w-xs rounded-xl bg-gradient-to-br from-blue-300 to-cyan-300"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              viewport={{ once: true }}
              className="w-full flex justify-center"
            >
              <TiltCard
                icon={<FiLock className="text-blue-400 text-3xl" />}
                title="Privasi Terjamin"
                description="Data Anda aman dan tidak dibagikan ke pihak ketiga."
                className="relative h-96 w-full max-w-xs rounded-xl bg-gradient-to-br from-pink-300 to-fuchsia-300"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              viewport={{ once: true }}
              className="w-full flex justify-center"
            >
              <TiltCard
                icon={<FiLink className="text-pink-400 text-3xl" />}
                title="Integrasi Mudah"
                description="Anda dapat terhubung dengan sistem hanya dalam beberapa langkah."
                className="relative h-96 w-full max-w-xs rounded-xl bg-gradient-to-br from-emerald-300 to-lime-300"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 backdrop-blur-md">
        <div className="max-w-6xl mx-auto text-center px-4">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img src="/image/Sentinova.png" className="h-8" alt="Sentinova Logo" />
          </div>
          <p className="text-gray-400 mb-6">Platform AI untuk analisis sentimen dan summarization.</p>
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </div>
          <p className="text-sm text-gray-500">&copy; 2025 Sentinova. All rights reserved.</p>
        </div>
      </footer>
    </AnimatedBackground>
  )
}