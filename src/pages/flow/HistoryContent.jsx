import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FiSearch,
  FiCalendar,
  FiCpu,
  FiZap,
  FiBarChart2,
  FiTrash2,
  FiEye,
  FiChevronRight,
  FiClock,
  FiPackage,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi"

// Data dummy untuk riwayat analisis
const DUMMY_HISTORY = [
  {
    id: "analysis-smartphone-samsung-2025-01-15",
    title: "Smartphone Samsung Galaxy S24",
    date: "2025-01-15",
    time: "14:30",
    count: 150,
    processingTime: "3.2s",
    details: {
      productName: "Smartphone Samsung Galaxy S24",
      analysisDate: "2025-01-15",
      totalReviews: 150,
      processingTime: "3.2",

      // Hasil Summarization
      summary:
        "Smartphone dengan kamera berkualitas tinggi, performa cepat untuk gaming, dan layar yang jernih. Sebagian besar pengguna puas dengan fitur-fitur yang ditawarkan meskipun harga cukup premium.",

      // Hasil Sentiment Analysis - IndoBERT
      indoBertResults: {
        accuracy: 94.2,
        sentimentDistribution: [
          { name: "Positif", value: 78, count: 117, color: "#10B981" },
          { name: "Netral", value: 15, count: 23, color: "#6B7280" },
          { name: "Negatif", value: 7, count: 10, color: "#EF4444" },
        ],
      },

      // Hasil Sentiment Analysis - Naive Bayes
      naiveBayesResults: {
        accuracy: 89.5,
        sentimentDistribution: [
          { name: "Positif", value: 72, count: 108, color: "#10B981" },
          { name: "Netral", value: 20, count: 30, color: "#6B7280" },
          { name: "Negatif", value: 8, count: 12, color: "#EF4444" },
        ],
      },

      topKeywords: [
        { text: "kamera", value: 45 },
        { text: "bagus", value: 38 },
        { text: "cepat", value: 32 },
        { text: "layar", value: 28 },
      ],
      reviewDetails: [
        { id: 1, text: "Kamera sangat bagus dan jernih!", sentiment: "Positif", confidence: 0.95, color: "#10B981" },
        { id: 2, text: "Performa cepat untuk gaming.", sentiment: "Positif", confidence: 0.88, color: "#10B981" },
        { id: 3, text: "Harga agak mahal tapi worth it.", sentiment: "Netral", confidence: 0.72, color: "#6B7280" },
      ],
    },
  },
  {
    id: "analysis-laptop-asus-2025-01-14",
    title: "Laptop ASUS ROG Strix",
    date: "2025-01-14",
    time: "09:15",
    count: 89,
    processingTime: "2.8s",
    details: {
      productName: "Laptop ASUS ROG Strix",
      analysisDate: "2025-01-14",
      totalReviews: 89,
      processingTime: "2.8",

      summary:
        "Laptop gaming dengan performa tinggi, desain menarik, dan keyboard yang nyaman. Sangat cocok untuk gaming berat meskipun kipas agak berisik saat digunakan intensif.",

      indoBertResults: {
        accuracy: 92.1,
        sentimentDistribution: [
          { name: "Positif", value: 82, count: 73, color: "#10B981" },
          { name: "Netral", value: 12, count: 11, color: "#6B7280" },
          { name: "Negatif", value: 6, count: 5, color: "#EF4444" },
        ],
      },

      naiveBayesResults: {
        accuracy: 87.3,
        sentimentDistribution: [
          { name: "Positif", value: 79, count: 70, color: "#10B981" },
          { name: "Netral", value: 15, count: 13, color: "#6B7280" },
          { name: "Negatif", value: 6, count: 6, color: "#EF4444" },
        ],
      },

      topKeywords: [
        { text: "gaming", value: 52 },
        { text: "performa", value: 41 },
        { text: "cepat", value: 35 },
      ],
      reviewDetails: [
        { id: 1, text: "Gaming lancar jaya!", sentiment: "Positif", confidence: 0.92, color: "#10B981" },
        { id: 2, text: "Performa sangat memuaskan.", sentiment: "Positif", confidence: 0.89, color: "#10B981" },
      ],
    },
  },
  {
    id: "analysis-headphone-sony-2025-01-13",
    title: "Headphone Sony WH-1000XM5",
    date: "2025-01-13",
    time: "16:45",
    count: 67,
    processingTime: "2.1s",
    details: {
      productName: "Headphone Sony WH-1000XM5",
      analysisDate: "2025-01-13",
      totalReviews: 67,
      processingTime: "2.1",

      summary:
        "Headphone premium dengan kualitas suara excellent, noise cancelling yang sangat efektif, dan desain yang nyaman untuk penggunaan jangka panjang.",

      indoBertResults: {
        accuracy: 95.8,
        sentimentDistribution: [
          { name: "Positif", value: 85, count: 57, color: "#10B981" },
          { name: "Netral", value: 10, count: 7, color: "#6B7280" },
          { name: "Negatif", value: 5, count: 3, color: "#EF4444" },
        ],
      },

      naiveBayesResults: {
        accuracy: 91.2,
        sentimentDistribution: [
          { name: "Positif", value: 82, count: 55, color: "#10B981" },
          { name: "Netral", value: 13, count: 9, color: "#6B7280" },
          { name: "Negatif", value: 5, count: 3, color: "#EF4444" },
        ],
      },

      topKeywords: [
        { text: "suara", value: 48 },
        { text: "jernih", value: 42 },
        { text: "nyaman", value: 38 },
      ],
      reviewDetails: [
        { id: 1, text: "Kualitas suara luar biasa!", sentiment: "Positif", confidence: 0.96, color: "#10B981" },
        { id: 2, text: "Noise cancelling sangat efektif.", sentiment: "Positif", confidence: 0.91, color: "#10B981" },
      ],
    },
  },
]

// Komponen untuk menampilkan kartu riwayat analisis
const HistoryCard = ({ item, onView, onDelete }) => {
  // Mendapatkan rata-rata akurasi dari kedua model sentiment
  const getAverageAccuracy = () => {
    if (!item.details?.indoBertResults || !item.details?.naiveBayesResults) return 0
    return ((item.details.indoBertResults.accuracy + item.details.naiveBayesResults.accuracy) / 2).toFixed(1)
  }

  // Mendapatkan sentimen dominan dari IndoBERT
  const getDominantSentiment = () => {
    if (!item.details?.indoBertResults?.sentimentDistribution)
      return { color: "#6B7280", percentage: 0, name: "Tidak ada data" }

    const dominant = item.details.indoBertResults.sentimentDistribution.reduce(
      (max, current) => (current.value > max.value ? current : max),
      { value: 0 },
    )

    return {
      color: dominant.color,
      percentage: dominant.value,
      name: dominant.name,
    }
  }

  const dominantSentiment = getDominantSentiment()
  const averageAccuracy = getAverageAccuracy()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
    >
      {/* Header dengan 3 model indicators */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Analisis Lengkap</span>
          <span className="text-xs text-gray-400">{item.date}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">Summarization</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">IndoBERT</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-400">Naive Bayes</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">{item.title}</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-xs mb-1">Jumlah Ulasan</p>
            <div className="flex items-center gap-2">
              <FiBarChart2 className="text-green-400" />
              <p className="text-white font-semibold">{item.count}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-xs mb-1">Akurasi Rata-rata</p>
            <div className="flex items-center gap-2">
              <FiBarChart2 className="text-blue-400" />
              <p className="text-white font-semibold">{averageAccuracy}%</p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-xs mb-1">Waktu Proses</p>
            <div className="flex items-center gap-2">
              <FiClock className="text-orange-400" />
              <p className="text-white font-semibold">{item.processingTime}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-xs mb-1">Model</p>
            <div className="flex items-center gap-2">
              <FiCpu className="text-purple-400" />
              <p className="text-white font-semibold">3 Model</p>
            </div>
          </div>
        </div>

        {/* Model Comparison */}
        <div className="mb-6">
          <p className="text-gray-400 text-xs mb-3">Perbandingan Akurasi Model</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-400 text-sm">IndoBERT</span>
              <span className="text-white text-sm font-medium">{item.details?.indoBertResults?.accuracy || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-sm">Naive Bayes</span>
              <span className="text-white text-sm font-medium">{item.details?.naiveBayesResults?.accuracy || 0}%</span>
            </div>
          </div>
        </div>

        {/* Sentiment bar */}
        <div className="mb-6">
          <p className="text-gray-400 text-xs mb-2">Sentimen Dominan (IndoBERT)</p>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dominantSentiment.color }}></div>
            <span className="text-white font-medium">{dominantSentiment.name}</span>
            <span className="text-gray-400 text-sm">{dominantSentiment.percentage}%</span>
          </div>

          <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${dominantSentiment.percentage}%`,
                backgroundColor: dominantSentiment.color,
              }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onView(item)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FiEye />
            <span>Lihat Detail</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <FiTrash2 />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Komponen utama HistoryContent
function HistoryContent() {
  const [history, setHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Load history dari localStorage atau gunakan dummy data
  useEffect(() => {
    const loadHistory = () => {
      setIsLoading(true)
      setTimeout(() => {
        let data = JSON.parse(localStorage.getItem("analysis_history") || "[]")
        if (data.length === 0) {
          localStorage.setItem("analysis_history", JSON.stringify(DUMMY_HISTORY))
          data = DUMMY_HISTORY
        }
        setHistory(data)
        setIsLoading(false)
      }, 800) // Simulasi loading
    }

    loadHistory()
  }, [])

  // Filter history hanya berdasarkan pencarian
  const filteredHistory = history.filter((item) => {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Handler untuk melihat detail analisis
  const handleViewDetail = (item) => {
    if (item.details) {
      navigate("/flow/analysis/results", { state: { results: item.details, fromHistory: true } })
    } else {
      alert("Data detail tidak tersedia untuk riwayat ini.")
    }
  }

  // Handler untuk menghapus riwayat
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat analisis ini?")) {
      const updatedHistory = history.filter((item) => item.id !== id)
      localStorage.setItem("analysis_history", JSON.stringify(updatedHistory))
      setHistory(updatedHistory)
    }
  }

  // Handler untuk refresh data
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      let data = JSON.parse(localStorage.getItem("analysis_history") || "[]")
      if (data.length === 0) {
        localStorage.setItem("analysis_history", JSON.stringify(DUMMY_HISTORY))
        data = DUMMY_HISTORY
      }
      setHistory(data)
      setIsLoading(false)
    }, 800)
  }

  // Tampilan loading
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Memuat riwayat analisis...</p>
            <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Riwayat Analisis</h1>
          <p className="text-gray-400">Lihat dan kelola riwayat analisis sentimen yang telah dilakukan</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiRefreshCw />
          <span>Refresh Data</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <FiPackage className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Analisis</p>
                <p className="text-white font-bold text-lg">{history.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <FiBarChart2 className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Ulasan</p>
                <p className="text-white font-bold text-lg">{history.reduce((sum, item) => sum + item.count, 0)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <FiCpu className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Rata-rata Akurasi</p>
                <p className="text-white font-bold text-lg">
                  {history.length > 0
                    ? (
                        history.reduce((sum, item) => {
                          const indoBert = item.details?.indoBertResults?.accuracy || 0
                          const naiveBayes = item.details?.naiveBayesResults?.accuracy || 0
                          return sum + (indoBert + naiveBayes) / 2
                        }, 0) / history.length
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <FiZap className="text-orange-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Model Aktif</p>
                <p className="text-white font-bold text-lg">3</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filter */}
      {history.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center"
        >
          <FiAlertCircle className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Riwayat Analisis</h2>
          <p className="text-gray-400 mb-6">Mulai analisis sentimen pertama Anda untuk melihat riwayat di sini</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/flow/analysis")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <span>Mulai Analisis Baru</span>
            <FiChevronRight />
          </motion.button>
        </motion.div>
      ) : filteredHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center"
        >
          <FiSearch className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Tidak Ada Hasil yang Ditemukan</h2>
          <p className="text-gray-400 mb-6">Coba ubah kata kunci pencarian atau filter</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <HistoryCard key={item.id} item={item} onView={handleViewDetail} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Last Analysis Info */}
      {history.length > 0 && (
        <div className="mt-8 flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <FiCalendar />
            <span>Analisis terakhir: {new Date(history[0].date).toLocaleDateString("id-ID")}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiClock />
            <span>Total: {history.length} analisis</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryContent