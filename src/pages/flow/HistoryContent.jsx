import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { getAnalysisHistory } from "../../services/analysisService";
import { FiClock, FiPackage, FiBarChart2, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

const HistoryContent = () => {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysisHistory = async () => {
      if (!user) return;

      try {
        const history = await getAnalysisHistory(user.id);
        setAnalysisHistory(history);
        setError(null);
      } catch (error) {
        console.error("Error fetching analysis history:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisHistory();
  }, [user]);

  const handleViewAnalysis = (analysis) => {
    navigate("/flow/analysis/results", {
      state: {
        analysisId: analysis.id,
        productName: analysis.productName,
        analysisType: "history",
        timestamp: analysis.timestamp,
        results: analysis
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Memuat riwayat analisis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 text-red-500 mx-auto mb-4">
              <FiBarChart2 className="w-full h-full" />
            </div>
            <p className="text-white text-lg mb-2">Gagal memuat riwayat analisis</p>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (analysisHistory.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 text-gray-400 mx-auto mb-4">
              <FiBarChart2 className="w-full h-full" />
            </div>
            <p className="text-white text-lg mb-2">Belum ada riwayat analisis</p>
            <p className="text-gray-400">Mulai analisis baru untuk melihat hasilnya di sini</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Riwayat Analisis</h1>
        <p className="text-gray-400">Lihat hasil analisis yang telah dilakukan sebelumnya</p>
      </div>

      <div className="grid gap-6">
        {analysisHistory.map((analysis) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => handleViewAnalysis(analysis)}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{analysis.productName}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{new Date(analysis.timestamp).toLocaleDateString("id-ID", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiPackage className="w-4 h-4" />
                    <span>{analysis.totalReviews} ulasan</span>
                  </div>
                </div>
              </div>
              <FiChevronRight className="w-6 h-6 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HistoryContent;