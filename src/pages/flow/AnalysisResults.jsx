import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FiArrowLeft,
  FiDownload,
  FiClock,
  FiDatabase,
  FiTrendingUp,
  FiCpu,
  FiZap,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
} from "react-icons/fi"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const AnalysisResults = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState(null)
  const [activeModel, setActiveModel] = useState("pretrained") // "pretrained" or "naivebayes"
  const [comparisonMode, setComparisonMode] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Ubah fungsi processModelResults untuk menangani kedua model
  const processModelResults = (modelData, modelType) => ({
    productName: modelData.productName,
    analysisDate: modelData.analysisDate,
    totalReviews: modelData.totalReviews,
    processingTime: modelType === 'pretrained' 
      ? modelData.processingTime.transformer?.replace('-', '')
      : modelData.processingTime.naive_bayes?.replace('-', ''),
    accuracy: modelType === 'pretrained' ? 92 : 94,
    sentimentDistribution: modelType === 'pretrained' 
      ? modelData.sentimentDistribution.transformer.IndoBERT
      : modelData.sentimentDistribution.ml.NaiveBayes,
    topKeywords: modelData.topKeywords,
    topicDistribution: modelData.topicDistribution || [],
    reviewDetails: modelData.reviewDetails.map((review) => {
      const preds = modelType === 'pretrained'
        ? review.transformer?.IndoBERT?.predictions
        : review.ml?.NaiveBayes?.predictions || [];
      
      const topPred = preds.reduce(
        (max, cur) => (cur.score > max.score ? cur : max),
        { label: "", score: 0 }
      );

      const labelMap = {
        positive: "Positive",
        negative: "Negative",
        neutral: "Neutral",
      };

      return {
        ...review,
        sentiment: labelMap[topPred.label] || "Neutral",
        confidence: topPred.score,
        topics: review.topics || [],
        color:
          labelMap[topPred.label] === "Positive"
            ? "#10B981"
            : labelMap[topPred.label] === "Negative"
            ? "#EF4444"
            : "#6B7280",
      };
    }),
  });

  useEffect(() => {
    if (!location.state?.results) {
      navigate("/flow")
      return
    }

    const apiResults = location.state.results

    // Process results untuk kedua model
    let pretrainedResults = processModelResults(apiResults, 'pretrained')
    let naiveBayesResults = processModelResults(apiResults, 'naivebayes')

    setResults({
      pretrained: pretrainedResults,
      naivebayes: naiveBayesResults,
      summary: apiResults.summary || "Analisis sentimen telah selesai dilakukan...",
      comparison: {
        accuracyComparison: [
          { model: "Pre-trained", accuracy: pretrainedResults.accuracy },
          { model: "Naive Bayes", accuracy: naiveBayesResults.accuracy },
        ],
        processingTimeComparison: [
          { 
            name: "Pre-trained Model",
            time: Math.abs(Number(pretrainedResults.processingTime.replace('s', ''))) || 0,
            color: "#3B82F6"
          },
          { 
            name: "Naive Bayes",
            time: Math.abs(Number(naiveBayesResults.processingTime.replace('s', ''))) || 0,
            color: "#8B5CF6"
          }
        ],
      },
    })
    setIsLoading(false)
  }, [location.state, navigate])

  const handleDownload = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `analisis-comparison-${results.pretrained.productName}-${new Date().toISOString().split("T")[0]}.json`

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
            <p className="text-gray-400 text-sm mt-2">Menganalisis dengan kedua model...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentResults = results[activeModel]
  const dominantSentiment = currentResults.sentimentDistribution.reduce((prev, current) =>
    current.count > prev.count ? current : prev,
  )

  // Pagination logic
  const totalPages = Math.ceil(currentResults.reviewDetails.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReviews = currentResults.reviewDetails.slice(startIndex, endIndex)

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const ModelSelector = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
        <button
          onClick={() => setActiveModel("pretrained")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeModel === "pretrained" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <FiCpu />
          Pre-trained Model
        </button>
        <button
          onClick={() => setActiveModel("naivebayes")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeModel === "naivebayes" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <FiZap />
          Naive Bayes
        </button>
      </div>

      <button
        onClick={() => setComparisonMode(!comparisonMode)}
        className={`px-4 py-2 rounded-lg border transition-all ${
          comparisonMode
            ? "bg-green-600 border-green-600 text-white"
            : "border-white/20 text-gray-400 hover:text-white hover:border-white/40"
        }`}
      >
        {comparisonMode ? "Hide Comparison" : "Compare Models"}
      </button>
    </div>
  )

  const ModelComparisonCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Accuracy Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">Perbandingan Akurasi</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.comparison.accuracyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="model" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, "Akurasi"]}
              />
              <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Processing Time Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">Perbandingan Waktu Proses</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.comparison.processingTimeComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                height={40}
              />
              <YAxis 
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                label={{ 
                  value: 'Waktu (detik)', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: "#9CA3AF",
                  fontSize: 12
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                formatter={(value) => [`${value.toFixed(2)}s`, "Waktu Proses"]}
              />
              <Bar 
                dataKey="time" 
                radius={[4, 4, 0, 0]}
              >
                {
                  results.comparison.processingTimeComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header dengan Product Name yang lebih prominent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/flow")}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft />
            </button>
            <h1 className="text-3xl font-bold text-white">Hasil Analisis Multi-Model</h1>
          </div>

          {/* Product Name Card - More Prominent */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <FiPackage className="text-blue-400 text-2xl" />
              <div>
                <p className="text-gray-400 text-sm">Produk yang Dianalisis</p>
                <h2 className="text-2xl font-bold text-white">{currentResults.productName}</h2>
              </div>
            </div>
          </div>

          {/* Analysis Time Info */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FiClock className="text-blue-400" />
              <span className="text-gray-400">Waktu Analisis:</span>
              <span className="text-white font-medium">{currentResults.analysisDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Durasi Proses:</span>
              <span className="text-green-400 font-medium">
                Pre-trained: {results.pretrained.processingTime} | Naive Bayes: {results.naivebayes.processingTime}
              </span>
            </div>
          </div>
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

      {/* Model Selector */}
      <ModelSelector />

      {/* Model Comparison Charts */}
      {comparisonMode && <ModelComparisonCharts />}

      {/* Current Model Info */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeModel === "pretrained" ? (
              <FiCpu className="text-blue-400 text-xl" />
            ) : (
              <FiZap className="text-purple-400 text-xl" />
            )}
            <div>
              <h3 className="text-white font-medium">
                {activeModel === "pretrained" ? "Pre-trained Model" : "Naive Bayes Algorithm"}
              </h3>
              <p className="text-gray-400 text-sm">
                {activeModel === "pretrained"
                  ? "Model yang telah dilatih dengan dataset dan Menghasilkan 3 kelas sentiment, yaitu Positif, Netral, dan Negatif."
                  : "Algoritma klasifikasi probabilistik yang mengklasifikasikan ulasan menjadi 2 kelas sentiment, yaitu Positif dan Negatif."}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">{currentResults.accuracy.toFixed(1)}%</p>
            <p className="text-gray-400 text-sm">Akurasi</p>
          </div>
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
            <h3 className="text-white font-medium">Waktu Proses Model</h3>
          </div>
          <p className="text-2xl font-bold text-white">{currentResults.processingTime}</p>
          <p className="text-gray-400 text-sm">
            {activeModel === "pretrained" ? "Pre-trained Model" : "Naive Bayes Algorithm"}
          </p>
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
          <p className="text-2xl font-bold text-white">{currentResults.totalReviews}</p>
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

      {/* Summary - Satu untuk semua model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Ringkasan Analisis Produk</h2>
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
                  data={currentResults.sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {currentResults.sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {currentResults.sentimentDistribution.map((item) => (
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
              <BarChart data={currentResults.topKeywords.slice(0, 8)}>
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
                <Bar
                  dataKey="value"
                  fill={activeModel === "pretrained" ? "#3B82F6" : "#8B5CF6"}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Topic Distribution Chart - Add this new section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mt-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Distribusi Topik</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentResults.topicDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                formatter={(value) => [`${value}%`, "Persentase"]}
              />
              <Bar
                dataKey="value"
                fill={activeModel === "pretrained" ? "#3B82F6" : "#8B5CF6"}
                radius={[4, 4, 0, 0]}
              >
                {currentResults.topicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {currentResults.topicDistribution.map((topic, index) => (
            <div key={topic.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
              ></div>
              <span className="text-gray-300 text-sm">
                {topic.name}: {topic.count} ulasan
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Review Details dengan Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white mb-4 md:mb-0">
            Detail Analisis Ulasan - {activeModel === "pretrained" ? "Pre-trained Model" : "Naive Bayes"}
          </h2>

          {/* Items per page selector */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-400 text-sm">per halaman</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 backdrop-blur-sm">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">No.</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Ulasan</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Sentimen</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {currentReviews.map((review, index) => (
                <motion.tr
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4 text-gray-400 text-sm">{startIndex + index + 1}</td>
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

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-gray-400 text-sm">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, currentResults.reviewDetails.length)} dari{" "}
            {currentResults.reviewDetails.length} ulasan
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      currentPage === pageNum ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20 text-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="text-gray-400 text-sm">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AnalysisResults