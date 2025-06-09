import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FiBarChart2,
  FiPieChart,
  FiList,
  FiPlus,
  FiArrowRight,
  FiRefreshCw,
  FiUpload,
  FiFileText,
  FiSearch,
  FiDownload,
} from "react-icons/fi"
import StatCard from "../../components/StatCard"
import AnalysisCard from "../../components/AnalysisCard"

// Mock data for dashboard
const mockRecentAnalyses = [
  { id: 1, title: "Ulasan Produk A", date: "2025-05-25", sentiment: "positive", score: 0.87, count: 124 },
  { id: 2, title: "Feedback Layanan", date: "2025-05-24", sentiment: "neutral", score: 0.52, count: 78 },
  { id: 3, title: "Review Aplikasi", date: "2025-05-22", sentiment: "negative", score: 0.23, count: 45 },
  { id: 4, title: "Komentar Media Sosial", date: "2025-05-20", sentiment: "positive", score: 0.91, count: 230 },
]

const DashboardContent = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    // Tambahkan pt-20 agar konten turun lebih jauh ke bawah, tidak menutupi dropdown profile
    <div className="p-6 pt-20 space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Selamat datang kembali! Berikut ringkasan aktivitas analisis Anda</p>
        </div>
        <div className="flex gap-3">
          <Link to="/flow/analysis">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus />
              Analisis Baru
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Analisis"
          value="24"
          icon={<FiBarChart2 className="text-blue-400" />}
          color="bg-blue-500"
          change="+4"
          isLoading={isLoading}
        />
        <StatCard
          title="Sentimen Positif"
          value="68%"
          icon={<FiPieChart className="text-green-400" />}
          color="bg-green-500"
          change="+12%"
          isLoading={isLoading}
        />
        <StatCard
          title="Sentimen Negatif"
          value="18%"
          icon={<FiPieChart className="text-red-400" />}
          color="bg-red-500"
          change="-5%"
          isLoading={isLoading}
        />
        <StatCard
          title="Ulasan Dianalisis"
          value="1,248"
          icon={<FiList className="text-purple-400" />}
          color="bg-purple-500"
          change="+248"
          isLoading={isLoading}
        />
      </div>

      {/* Recent analyses */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Analisis Terbaru</h2>
          <Link
            to="/flow/history"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Lihat Semua
            <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => <AnalysisCard key={i} isLoading={true} />)
            : mockRecentAnalyses.map((analysis) => <AnalysisCard key={analysis.id} analysis={analysis} />)}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/flow/analysis">
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-blue-500/20">
                <FiUpload className="text-blue-400 text-xl" />
              </div>
              <span className="text-white font-medium">Upload CSV</span>
            </motion.div>
          </Link>
          <Link to="/flow/reports">
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-green-500/20">
                <FiFileText className="text-green-400 text-xl" />
              </div>
              <span className="text-white font-medium">Buat Laporan</span>
            </motion.div>
          </Link>
          <Link to="/flow/history">
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-purple-500/20">
                <FiSearch className="text-purple-400 text-xl" />
              </div>
              <span className="text-white font-medium">Cari Analisis</span>
            </motion.div>
          </Link>
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer"
          >
            <div className="p-3 rounded-full bg-yellow-500/20">
              <FiDownload className="text-yellow-400 text-xl" />
            </div>
            <span className="text-white font-medium">Download Data</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent