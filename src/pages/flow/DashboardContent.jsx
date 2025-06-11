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
  FiDownload     

} from "react-icons/fi"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { signInWithCustomToken } from "firebase/auth"
import { db, auth } from "../../firebaseConfig/config"
import { useAuth } from "@clerk/clerk-react"

import StatCard from "../../components/StatCard"
import AnalysisCard from "../../components/AnalysisCard"

const DashboardContent = () => {
  const [analyses, setAnalyses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [avgPositif, setAvgPositif] = useState("0%")
  const [avgNegatif, setAvgNegatif] = useState("0%")
  const navigate = useNavigate()
  const { getToken, isSignedIn } = useAuth()

  const signIntoFirebase = async () => {
    const token = await getToken({ template: "integration_firebase" })
    if (token) {
      await signInWithCustomToken(auth, token)
    }
  }

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      await signIntoFirebase()
      const user = auth.currentUser
      if (!user) return

      const q = query(
        collection(db, "historyAnalysis"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      )

      const snapshot = await getDocs(q)
      const results = snapshot.docs.map(doc => {
        const data = doc.data()
        const timestamp = data.timestamp?.toDate?.() || new Date()
        return {
          id: doc.id,
          title: data.productName || "Produk",
          date: timestamp.toLocaleDateString("id-ID"),
          time: timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          timestamp,
          results: data.results || {},
          count: data.results?.totalReviews || 0
        }
      })

      setAnalyses(results)

      // Rata-rata sentimen bulan ini
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const isThisMonth = (date) => {
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }

      const allReviews = results.flatMap((item) =>
        isThisMonth(item.timestamp) ? item.results?.reviewDetails || [] : []
      )

      const getLabel = (review) => {
        const preds = review?.transformer?.IndoBERT?.predictions || []
        const top = preds.reduce((max, p) => (p.score > max.score ? p : max), preds[0])
        return top?.label?.toLowerCase()
      }

      const labels = allReviews.map(getLabel).filter(Boolean)
      const pos = labels.filter(l => l === "positive").length
      const neg = labels.filter(l => l === "negative").length
      const total = labels.length

      setAvgPositif(total > 0 ? `${(pos / total * 100).toFixed(1)}%` : "0%")
      setAvgNegatif(total > 0 ? `${(neg / total * 100).toFixed(1)}%` : "0%")
    } catch (err) {
      console.error("Gagal mengambil data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      fetchHistory()
    }
  }, [isSignedIn])

  return (
    <div className="p-6 pt-20 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Selamat datang kembali!</p>
        </div>
        <div className="flex gap-3">
          <Link to="/flow/analysis">
            <motion.button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FiPlus /> Analisis Baru
            </motion.button>
          </Link>
          <motion.button onClick={fetchHistory} className="bg-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Analisis" value={analyses.length} icon={<FiBarChart2 />} color="bg-blue-500" isLoading={isLoading} />
        <StatCard title="Sentimen Positif" value={avgPositif} icon={<FiPieChart />} color="bg-green-500" isLoading={isLoading} />
        <StatCard title="Sentimen Negatif" value={avgNegatif} icon={<FiPieChart />} color="bg-red-500" isLoading={isLoading} />
        <StatCard title="Ulasan Dianalisis" value={analyses.reduce((sum, a) => sum + a.count, 0)} icon={<FiList />} color="bg-purple-500" isLoading={isLoading} />
      </div>

      <p className="text-sm text-gray-400 text-center mt-2">
        Total sentimen kamu bulan ini berdasarkan seluruh ulasan yang dianalisis.
      </p>

      <div>
        <div className="flex justify-between items-center mb-6 mt-8">
          <h2 className="text-xl font-bold text-white">Analisis Terbaru</h2>
          <Link to="/flow/history" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Lihat Semua <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {isLoading ? (
    Array(4).fill(0).map((_, i) => <AnalysisCard key={`skeleton-${i}`} isLoading />)
  ) : (
    analyses.slice(0, 4).map((item) => (
      <AnalysisCard
        key={item.id}
        analysis={item}
        onView={(data) => {
          navigate("/flow/analysis/results", {
            state: {
              analysisId: item.id,
              productName: item.title,
              analysisType: "history",
              timestamp: item.timestamp,
              results: item.results,
            }
          })
        }}
      />
    ))
  )}
</div>

{/* Quick Actions */}
<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mt-10">
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
    </div>
  )
}

export default DashboardContent
