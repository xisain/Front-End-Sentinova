import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiArrowLeft, FiDownload, FiClock, FiDatabase, FiTrendingUp } from "react-icons/fi"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const AnalysisResults = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (!location.state?.results) {
      navigate("/flow")
      return
    }

    const apiResults = location.state.results
    setResults({
      productName: apiResults.productName,
      analysisDate: apiResults.analysisDate,
      totalReviews: apiResults.totalReviews,
      processingTime: apiResults.processingTime,
      summary: apiResults.summary,
      sentimentDistribution: apiResults.sentimentDistribution,
      topKeywords: apiResults.topKeywords,
      reviewDetails: apiResults.reviewDetails.map(review => ({
        ...review,
        color: review.sentiment === "Positive" ? "#10B981" : 
               review.sentiment === "Negative" ? "#EF4444" : "#6B7280"
      }))
    })
    setIsLoading(false)
  }, [location.state, navigate])

  const handleDownload = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `analisis-${results.productName}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Memproses hasil analisis...</p>
            <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    )
  }

  // Find dominant sentiment
  const dominantSentiment = results.sentimentDistribution.reduce((prev, current) => 
    (current.count > prev.count) ? current : prev
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate("/flow")}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft />
            </button>
            <h1 className="text-3xl font-bold text-white">Hasil Analisis Produk</h1>
          </div>
          <p className="text-gray-400">Analisis sentimen untuk produk: {results.productName}</p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiDownload />
            Download Hasil
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/flow")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Kembali ke Dashboard
          </motion.button>
        </div>
      </div>

      {/* Analysis Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <FiClock className="text-blue-400" />
            <h3 className="text-white font-medium">Waktu Analisis</h3>
          </div>
          <p className="text-gray-300">{results.analysisDate}</p>
          <p className="text-gray-400 text-sm">Diproses dalam {results.processingTime}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <FiDatabase className="text-green-400" />
            <h3 className="text-white font-medium">Data Dianalisis</h3>
          </div>
          <p className="text-2xl font-bold text-white">{results.totalReviews}</p>
          <p className="text-gray-400 text-sm">Total ulasan</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="text-purple-400" />
            <h3 className="text-white font-medium">Sentimen Dominan</h3>
          </div>
          <p className="text-2xl font-bold" style={{ color: dominantSentiment.color }}>
            {dominantSentiment.name}
          </p>
          <p className="text-gray-400 text-sm">{dominantSentiment.value}% dari total</p>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Ringkasan Produk</h2>
        <p className="text-gray-300 leading-relaxed">{results.summary}</p>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Distribusi Sentimen</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={results.sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {results.sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {results.sentimentDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-300 text-sm">
                  {item.name}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Kata Kunci Populer</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.topKeywords.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="text" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Review Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Detail Analisis Ulasan</h2>
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-black/50 backdrop-blur-sm">
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Ulasan</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Sentimen</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {results.reviewDetails.map((review, index) => (
                  <motion.tr
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 px-4 text-gray-300 max-w-md">
                      <p className="line-clamp-2">{review.text}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${review.color}20`,
                          color: review.color,
                        }}
                      >
                        {review.sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{Math.round(review.confidence * 100)}%</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Menampilkan {results.reviewDetails.length} dari {results.totalReviews} ulasan. 
            Download hasil lengkap untuk melihat semua data.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default AnalysisResults