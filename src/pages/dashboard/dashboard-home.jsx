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
} from "react-icons/fi"

import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { signInWithCustomToken } from "firebase/auth"
import { db, auth } from "../../firebaseConfig/config"

import { useAuth } from "@clerk/clerk-react"
import HistoryCard from "../history/HistoryContent"

const StatCard = ({ title, value, icon, color, isLoading }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 relative overflow-hidden"
  >
    {isLoading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
        <div className="h-8 bg-white/20 rounded w-3/4"></div>
        <div className="h-4 bg-white/20 rounded w-1/4"></div>
      </div>
    ) : (
      <>
        <div className={`absolute top-0 right-0 w-24 h-24 ${color} rounded-full blur-3xl opacity-20`}></div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-400 font-medium">{title}</h3>
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white mb-2">{value}</p>
      </>
    )}
  </motion.div>
)

const DashboardHome = () => {
  const [userId, setUserId] = useState(null)
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPositif, setTotalPositif] = useState(0)
  const [totalNegatif, setTotalNegatif] = useState(0)
  const navigate = useNavigate()

  const { getToken, isSignedIn } = useAuth()

  const signIntoFirebaseWithClerk = async () => {
    try {
      const token = await getToken({ template: "integration_firebase" })
      if (token) {
        await signInWithCustomToken(auth, token)
      }
    } catch (err) {
      console.error("Gagal login Firebase dengan Clerk:", err)
    }
  }

  const fetchAnalyses = async (uid) => {
    setIsLoading(true)
    try {
      const q = query(
        collection(db, "historyAnalysis"),
        where("userId", "==", uid),
        orderBy("timestamp", "desc")
      )
      const snapshot = await getDocs(q)

      const data = snapshot.docs.map((doc) => {
        const item = doc.data()
        const timestamp = item.timestamp?.toDate?.() || new Date()
        return {
          id: doc.id,
          productName: item.productName || "Produk",
          date: timestamp.toLocaleDateString("id-ID"),
          time: timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          timestamp,
          count: item.results?.totalReviews || 0,
          results: {
            reviewDetails: item.results?.reviewDetails || [],
            totalReviews: item.results?.totalReviews || 0,
          },
        }
      })

      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setRecentAnalyses(data.slice(0, 4))

      // Hitung sentimen
      const allReviews = data.flatMap((d) => d.results.reviewDetails || [])
      const positif = allReviews.filter(r => r.sentiment?.toLowerCase() === "positive").length
      const negatif = allReviews.filter(r => r.sentiment?.toLowerCase() === "negative").length
      setTotalPositif(positif)
      setTotalNegatif(negatif)
    } catch (err) {
      console.error("Gagal mengambil data analisis:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Sinkronisasi Clerk → Firebase dan fetch data
  useEffect(() => {
    const init = async () => {
      if (!isSignedIn) return
      await signIntoFirebaseWithClerk()
      const user = auth.currentUser
      if (user?.uid) {
        setUserId(user.uid)
        await fetchAnalyses(user.uid)
      }
    }
    init()
  }, [isSignedIn])

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Selamat datang kembali! Berikut ringkasan aktivitas analisis Anda</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/analysis">
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
            onClick={() => userId && fetchAnalyses(userId)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Analisis"
          value={recentAnalyses.length}
          icon={<FiBarChart2 className="text-blue-400" />}
          color="bg-blue-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Sentimen Positif"
          value={totalPositif}
          icon={<FiPieChart className="text-green-400" />}
          color="bg-green-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Sentimen Negatif"
          value={totalNegatif}
          icon={<FiPieChart className="text-red-400" />}
          color="bg-red-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Ulasan Dianalisis"
          value={recentAnalyses.reduce((sum, a) => sum + a.count, 0)}
          icon={<FiList className="text-purple-400" />}
          color="bg-purple-500"
          isLoading={isLoading}
        />
      </div>

      {/* Analisis Terbaru */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Analisis Terbaru</h2>
          <Link
            to="/dashboard/history"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Lihat Semua
            <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/10 p-6 rounded-xl animate-pulse h-48" />
              ))
            : analyses.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onView={() => {
                    const analysisData = {
                      analysisId: item.id,
                      productName: item.productName,
                      analysisType: "history",
                      timestamp: item.timestamp,
                      results: item.results,
                    }
                    navigate("/flow/analysis/results", {
                      state: analysisData,
                    })
                  }}
                  onDelete={() => alert("Penghapusan hanya tersedia di halaman Riwayat")}
                />
              ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
