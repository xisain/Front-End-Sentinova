import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiUpload, FiFileText, FiArrowRight, FiX, FiCheck } from "react-icons/fi"
import { api } from "../../services/api"
import { useAuth } from '@clerk/clerk-react'
import { collection, addDoc } from "firebase/firestore"
import { signInWithCustomToken } from "firebase/auth"
import { db, auth } from "../../firebaseConfig/config"
import { useNotification } from "./NotificationContext"

const AnalysisContent = () => {
  const [analysisType, setAnalysisType] = useState("file")
  const [productName, setProductName] = useState("")
  const [textInput, setTextInput] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()
  
  // Clerk authentication
  const { getToken, userId } = useAuth()
  const { addNotification } = useNotification()

  // Function to authenticate with Firebase using Clerk token
  const signIntoFirebaseWithClerk = async () => {
    const token = await getToken({ template: 'integration_firebase' })
    const userCredentials = await signInWithCustomToken(auth, token || '')
    return userCredentials
  }

  // Function to store analysis results in Firestore
  const storeAnalysisInFirestore = async (analysisData) => {
    if (!userId) return null
    
    try {
      await signIntoFirebaseWithClerk()
      
      const historyRef = collection(db, 'historyAnalysis')
      const docRef = await addDoc(historyRef, {
        userId: userId, // Clerk user ID
        productName: analysisData.productName,
        analysisType: analysisData.analysisType,
        timestamp: new Date(),
        analysisId: analysisData.analysisId,
        results: analysisData.results,
        createdAt: new Date().toISOString()
      })
      
      console.log("Analysis stored with ID: ", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error storing analysis:", error)
      return null
    }
  }

  const handleFileSelect = (file) => {
    if (file && (file.type === "text/csv" || file.type.includes("sheet"))) {
      setSelectedFile(file)
    } else {
      addNotification("Please select a CSV or Excel file", "error")
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userId) {
      addNotification("You need to sign in with Clerk to access this page.", "error")
      return
    }

    if (!productName.trim()) {
      addNotification("Nama produk harus diisi", "error")
      return
    }

    if (analysisType === "file" && !selectedFile) {
      addNotification("Pilih file untuk dianalisis", "error")
      return
    }

    if (analysisType === "text" && !textInput.trim()) {
      addNotification("Masukkan teks untuk dianalisis", "error")
      return
    }

    setIsLoading(true)

    try {
      let analysisResults = []
      const analysisId = Date.now().toString()
      const timestamp = new Date().toISOString()
      
      if (analysisType === "text") {
        const payload = {
          texts: textInput.split(/\n+/).filter(text => text.trim()),
        }
        console.log(JSON.stringify(payload))
        const results = await api.post('/analyze_texts', payload)
        // console.log("Analysis result:", result)
        const analysisData = {
          analysisId,
          productName,
          analysisType,
          timestamp,
          results: {
            productName,
            analysisDate: new Date().toLocaleString("id-ID"),
            totalReviews: results.total_reviews,
            processingTime: "Selesai",
            summary: results.overall_summary,
            sentimentDistribution: results.sentiment_distribution,
            topKeywords: results.top_keywords,
            reviewDetails: results.review_details.map(review => ({
              text: review.text,
              transformer: review.transformer,
              ml: review.ml,
              keywords: review.keywords
            }))
          }
        }

        // Store in Firestore
        await storeAnalysisInFirestore(analysisData)

        // Navigate to results
        navigate("/flow/analysis/results", { state: analysisData })

      } else {
        const formData = new FormData()
        formData.append("file", selectedFile)
        const data = await api.postFormData('/analyze_csv', formData);
        
        if (data.error) {
          throw new Error(data.error)
        }

        const analysisData = {
          analysisId,
          productName,
          analysisType,
          timestamp,
          results: {
            productName,
            analysisDate: new Date().toLocaleString("id-ID"),
            totalReviews: data.total_reviews,
            processingTime: "Selesai",
            summary: data.overall_summary,
            sentimentDistribution: data.sentiment_distribution,
            topKeywords: data.top_keywords,
            reviewDetails: data.review_details.map(review => ({
              text: review.text,
              transformer: review.transformer,
              ml: review.ml,
              keywords: review.keywords
            }))
          }
        }

        // Store in Firestore
        await storeAnalysisInFirestore(analysisData)

        // Navigate to results
        navigate("/flow/analysis/results", { state: analysisData })
      }
    } catch (error) {
      console.error("Error during analysis:", error)
      addNotification("Terjadi kesalahan saat menganalisis data. Silakan coba lagi.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user is signed in
  if (!userId) {
    return <p>You need to sign in with Clerk to access this page.</p>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Rest of your existing JSX remains the same */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analisis Baru</h1>
        <p className="text-gray-400">Upload file atau masukkan teks untuk menganalisis sentimen ulasan produk</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Name Input */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Informasi Produk</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nama Produk *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Masukkan nama produk yang akan dianalisis"
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 duration-300 shadow-md hover:bg-black/40 focus:bg-black/40 transition-colors"
              required
            />
          </div>
        </div>

        {/* Analysis Type Selection */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Pilih Metode Input</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnalysisType("file")}
              className={`p-6 rounded-xl border-2 transition-all ${
                analysisType === "file"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              <FiUpload className={`text-3xl mb-3 ${analysisType === "file" ? "text-blue-400" : "text-gray-400"}`} />
              <h3 className="text-lg font-medium text-white mb-2">Upload File</h3>
              <p className="text-gray-400 text-sm">Upload file CSV atau Excel berisi ulasan</p>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnalysisType("text")}
              className={`p-6 rounded-xl border-2 transition-all ${
                analysisType === "text"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              <FiFileText className={`text-3xl mb-3 ${analysisType === "text" ? "text-blue-400" : "text-gray-400"}`} />
              <h3 className="text-lg font-medium text-white mb-2">Input Manual</h3>
              <p className="text-gray-400 text-sm">Ketik atau paste teks ulasan secara manual</p>
            </motion.button>
          </div>
        </div>

        {/* File Upload Section */}
        {analysisType === "file" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Upload File</h2>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 hover:bg-black/40 ${
                dragActive
                  ? "border-blue-400 bg-blue-400/10"
                  : selectedFile
                    ? "border-green-400 bg-green-400/10"
                    : "border-white/30 hover:border-white/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <FiCheck className="text-green-400 text-4xl mb-4" />
                  <p className="text-white font-medium mb-2">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FiX />
                    Hapus File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FiUpload className="text-blue-400 text-4xl mb-4" />
                  <p className="text-white mb-2">Drag & drop file di sini atau</p>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
                    Pilih File
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-400 text-sm mt-4">Format yang didukung: CSV, XLSX, XLS (Maks. 10MB)</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Text Input Section */}
        {analysisType === "text" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Input Teks Manual</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teks Ulasan *<span className="text-gray-500 font-normal">({textInput.length}/5000 karakter)</span>
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Masukkan ulasan produk yang ingin dianalisis. Pisahkan setiap ulasan dengan baris baru atau tanda pemisah yang jelas..."
                rows={12}
                maxLength={5000}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 duration-300 shadow-md hover:bg-black/40 focus:bg-black/40 transition-colors resize-none"
                required
              />
              <p className="text-gray-400 text-sm mt-2">
                Tip: Pisahkan setiap ulasan dengan baris baru untuk hasil analisis yang lebih akurat
              </p>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-8 py-4 rounded-xl text-lg font-medium flex items-center gap-3 transition-all duration-300 disabled:cursor-not-allowed min-w-[200px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : (
              <>
                Mulai Analisis
                <FiArrowRight />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}

export default AnalysisContent