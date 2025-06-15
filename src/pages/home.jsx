import { useEffect, useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { FiArrowRight, FiTarget, FiSmile, FiLock, FiLink, FiSettings, FiLogOut } from "react-icons/fi"
import { motion } from "framer-motion"
import { useUser, useClerk } from "@clerk/clerk-react"

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
    return user?.username?.substring(0, 2).toUpperCase() || "U"
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors border border-white/20"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName || "User"}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">{getInitials()}</span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-start">
            <span className="text-white text-sm font-medium">
              {user?.firstName || user?.username?.split("@")[0] || "User"}
            </span>
            <span className="text-gray-400 text-xs">
              {user?.primaryEmailAddress?.emailAddress?.split("@")[0]}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName || user?.username}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className="p-2">
            <button
              onClick={handleDashboard}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
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

      {/* Optimize floating elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl"
        animate={{
          y: [0, 10, 0],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-purple-500/5 blur-2xl"
        animate={{
          y: [0, -10, 0],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
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

// New Feature Section Component
const FeatureSection = () => {
  const features = [
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: "Akurasi Tinggi",
      description: "Didukung AI mutakhir untuk analisis sentimen dan ringkasan ulasan yang presisi.",
      color: "text-emerald-400"
    },
    {
      icon: <FiSmile className="w-6 h-6" />,
      title: "Mudah Digunakan",
      description: "Antarmuka sederhana, hasil instan tanpa perlu keahlian teknis.",
      color: "text-blue-400"
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: "Privasi Terjamin",
      description: "Data Anda aman dan tidak dibagikan ke pihak ketiga.",
      color: "text-purple-400"
    },
    {
      icon: <FiLink className="w-6 h-6" />,
      title: "Integrasi Mudah",
      description: "Anda dapat terhubung dengan sistem hanya dalam beberapa langkah.",
      color: "text-pink-400"
    }
  ]

  return (
    <div className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Fitur Utama
          </h2>
          <p className="text-gray-400 text-lg">
            Teknologi AI terdepan untuk analisis sentimen dan summarization yang akurat
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simple background component
const SimpleBackground = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <Canvas>
          <Stars radius={100} depth={50} count={2000} factor={2} fade speed={0.5} />
        </Canvas>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser()
  const navigate = useNavigate()

  const [authState, setAuthState] = useState({
    isSignedIn: false,
    isLoaded: false,
  })

  useEffect(() => {
    if (isLoaded) {
      setAuthState({
        isSignedIn,
        isLoaded,
      })
    }
  }, [isSignedIn, isLoaded])

  return (
    <SimpleBackground>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-20 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-screen-xl flex items-center justify-between mx-auto px-6 py-4">
          <Link to="/" className="flex items-center">
            <img src="/Sentinova.png" className="h-10" alt="Sentinova Logo" />
          </Link>
          
          {isLoaded && (
            <div className="flex items-center justify-end ml-auto">
              {isSignedIn ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/auth"
                    className="text-white hover:text-gray-300 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <EnhancedHero />

      {/* Product Analysis Section */}
      <ProductAnalysisSection />

      {/* Feature Section */}
      <FeatureSection />

      {/* Enhanced FAQ Section */}
      <EnhancedFAQSection />

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center px-4">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img src="/Sentinova.png" className="h-8" alt="Sentinova Logo" />
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
    </SimpleBackground>
  )
}