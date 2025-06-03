import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiUpload, FiFileText, FiArrowRight, FiX, FiCheck } from "react-icons/fi"

const AnalysisNew = () => {
  const [analysisType, setAnalysisType] = useState("file") // 'file' or 'text'
  const [productName, setProductName] = useState("")
  const [textInput, setTextInput] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()

  const handleFileSelect = (file) => {
    if (file && (file.type === "text/csv" || file.type.includes("sheet"))) {
      setSelectedFile(file)
    } else {
      alert("Please select a CSV or Excel file")
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

    if (!productName.trim()) {
      alert("Nama produk harus diisi")
      return
    }

    if (analysisType === "file" && !selectedFile) {
      alert("Pilih file untuk dianalisis")
      return
    }

    if (analysisType === "text" && !textInput.trim()) {
      alert("Masukkan teks untuk dianalisis")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      const formData = new FormData()
      formData.append("productName", productName)
      formData.append("analysisType", analysisType)

      if (analysisType === "file") {
        formData.append("file", selectedFile)
      } else {
        formData.append("textData", textInput)
      }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/analysis/create', {
      //   method: 'POST',
      //   body: formData
      // })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Navigate to results page with mock data
      navigate("/dashboard/analysis/results", {
        state: {
          analysisId: "mock-analysis-id",
          productName: productName,
          analysisType: analysisType,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Analisis gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
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
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all resize-none"
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

export default AnalysisNew