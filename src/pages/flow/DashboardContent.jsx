import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
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
import { collection, getDocs, query } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "../../firebaseConfig/config"

import StatCard from "../../components/StatCard"
import AnalysisCard from "../../components/AnalysisCard"

const DashboardContent = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [analyses, setAnalyses] = useState([])
  const [userId, setUserId] = useState(null)
  const [totalPositif, setTotalPositif] = useState(0)
  const [avgPositif, setAvgPositif] = useState("0%")
  const [totalNegatif, setTotalNegatif] = useState(0)
  const [avgNegatif, setAvgNegatif] = useState("0%")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAnalyses = async () => {
      setIsLoading(true)
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setIsLoading(false)
          return
        }
        setUserId(user.uid)
        try {
          const q = query(collection(db, "historyAnalysis", user.uid, "analysis_result"))
          const snapshot = await getDocs(q)
          const results = snapshot.docs.map((doc) => {
            const data = doc.data()
            const reviews = data.results?.reviewDetails || []
            return {
              id: doc.id,
              title: data.productName || "Produk",
              date: data.results?.analysisDate || "-",
              sentiment: data.results?.sentimentDominant || "neutral",
              score: data.results?.confidence || 0.5,
              count: data.results?.totalReviews || 0,
              results: {
                ...data.results,
                reviewDetails: reviews
              }
            }
          })
          results.sort((a, b) => new Date(b.date) - new Date(a.date))
          setAnalyses(results)

          // Hitung total positif & negatif dari semua reviewDetails di bulan ini
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()

          const isThisMonth = (dateStr) => {
  const [tanggal, waktu] = dateStr.split(", ")
  if (!tanggal) return false
  const [day, month, year] = tanggal.split("/").map(Number)
  return month - 1 === currentMonth && year === currentYear
}

          const allReviews = results.flatMap((item) => {
            const reviewDate = item.date
            if (!isThisMonth(reviewDate)) return []
            return item.results.reviewDetails || []
          })

          const getLabelFromIndoBERT = (review) => {
            const preds = review?.transformer?.IndoBERT?.predictions || []
            if (!preds.length) return null
            return preds.reduce((max, p) => (p.score > max.score ? p : max), preds[0]).label.toLowerCase()
          }

          const allLabels = allReviews.map(getLabelFromIndoBERT).filter(Boolean)
          const positif = allLabels.filter(l => l === "positive").length
          const negatif = allLabels.filter(l => l === "negative").length

          setTotalPositif(positif)
          setTotalNegatif(negatif)

          const netral = allLabels.filter(l => l === "neutral").length
          const total = positif + negatif + netral
          const avgPos = total > 0 ? (positif / total * 100).toFixed(1) + '%' : '0%'
          const avgNeg = total > 0 ? (negatif / total * 100).toFixed(1) + '%' : '0%'
          setAvgPositif(avgPos)
          setAvgNegatif(avgNeg)
        } catch (error) {
          console.error("Gagal ambil data analisis:", error)
        } finally {
          setIsLoading(false)
        }
      })
    }
    fetchAnalyses()
  }, [])

  return (
    <div className="p-6 pt-20 space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Analisis"
          value={analyses.length}
          icon={<FiBarChart2 className="text-blue-400" />}
          color="bg-blue-500"
          change=""
          isLoading={isLoading}
        />
        <StatCard
          title="Rata-rata Sentimen Positif"
          value={avgPositif}
          icon={<FiPieChart className="text-green-400" />}
          color="bg-green-500"
          change=""
          isLoading={isLoading}
        />
        <StatCard
          title="Rata-rata Sentimen Negatif"
          value={avgNegatif}
          icon={<FiPieChart className="text-red-400" />}
          color="bg-red-500"
          change=""
          isLoading={isLoading}
        />
        <StatCard
          title="Ulasan Dianalisis"
          value={analyses.reduce((sum, a) => sum + a.count, 0)}
          icon={<FiList className="text-purple-400" />}
          color="bg-purple-500"
          change=""
          isLoading={isLoading}
        />
      </div>

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
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <AnalysisCard key={i} isLoading={true} />)
          ) : analyses.length > 0 ? (
            analyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onView={(item) => {
                  const analysisData = {
                    analysisId: item.id,
                    productName: item.title,
                    analysisType: "history",
                    timestamp: item.date,
                    results: item.results,
                  }
                  navigate("/flow/analysis/results", {
                    state: analysisData,
                  })
                }}
              />
            ))
          ) : (
            <div className="text-gray-400 col-span-4">Belum ada analisis ditemukan.</div>
          )}
        </div>
        </div>
        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/flow/analysis">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-blue-500/20">
                <FiUpload className="text-blue-400 text-xl" />
              </div>
              <span className="text-white font-medium">Upload CSV</span>
            </motion.div>
          </Link>
          <Link to="/flow/reports">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-green-500/20">
                <FiFileText className="text-green-400 text-xl" />
              </div>
              <span className="text-white font-medium">Buat Laporan</span>
            </motion.div>
          </Link>
          <Link to="/flow/history">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-purple-500/20">
                <FiSearch className="text-purple-400 text-xl" />
              </div>
              <span className="text-white font-medium">Cari Analisis</span>
            </motion.div>
          </Link>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer"
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