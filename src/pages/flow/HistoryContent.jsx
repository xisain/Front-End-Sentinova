import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const DUMMY_HISTORY = [
  {
    id: "dummy-product-2025-05-21-pretrained",
    title: "Produk Dummy (Pre-trained)",
    date: "2025-05-21",
    count: 99,
    model: "pretrained",
    details: {
      productName: "Produk Dummy",
      analysisDate: "2025-05-21",
      totalReviews: 99,
      processingTime: "2.1",
      accuracy: 88,
      sentimentDistribution: [
        { name: "Positif", value: 70, count: 69, color: "#10B981" },
        { name: "Netral", value: 20, count: 20, color: "#6B7280" },
        { name: "Negatif", value: 10, count: 10, color: "#EF4444" }
      ],
      topKeywords: [
        { text: "bagus", value: 20 },
        { text: "murah", value: 15 },
        { text: "cepat", value: 10 }
      ],
      reviewDetails: [
        { id: 1, text: "Produk sangat bagus!", sentiment: "Positif", confidence: 0.95, color: "#10B981" },
        { id: 2, text: "Cukup baik, tapi pengiriman lama.", sentiment: "Netral", confidence: 0.7, color: "#6B7280" },
        { id: 3, text: "Tidak sesuai deskripsi.", sentiment: "Negatif", confidence: 0.8, color: "#EF4444" }
      ]
    }
  }
]

function HistoryContent() {
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  const loadHistory = () => {
    let data = JSON.parse(localStorage.getItem("analysis_history") || "[]")
    if (data.length === 0) {
      localStorage.setItem("analysis_history", JSON.stringify(DUMMY_HISTORY))
      data = DUMMY_HISTORY
    }
    setHistory(data)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleDetail = (item) => {
    if (item.details) {
      navigate("/flow/analysis/results", { state: { results: item.details, fromHistory: true } })
    } else {
      alert("Data detail tidak tersedia untuk riwayat ini.")
    }
  }

  const handleDelete = (id) => {
    const filtered = history.filter(item => item.id !== id)
    localStorage.setItem("analysis_history", JSON.stringify(filtered))
    setHistory(filtered)
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Riwayat Analisis</h2>
      </div>
      {history.length === 0 ? (
        <div className="text-gray-400">Belum ada riwayat analisis.</div>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li
              key={item.id}
              className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 flex justify-between items-center hover:bg-white/20 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="cursor-pointer" onClick={() => handleDetail(item)}>
                  <h3 className="font-semibold">{item.title.replace(/ \(Pre-trained\)| \(Naive Bayes\)/, "")}</h3>
                  <p className="text-sm text-gray-300">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">{item.count} ulasan</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="ml-2 text-red-400 hover:text-red-600 transition text-sm font-medium"
                  title="Hapus riwayat ini"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HistoryContent