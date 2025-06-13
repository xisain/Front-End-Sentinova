import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiCalendar,
  FiCpu,
  FiZap,
  FiTrash2,
  FiEye,
  FiChevronRight,
  FiClock,
  FiPackage,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { useAuth } from '@clerk/clerk-react';
import { db, auth } from "../../firebaseConfig/config";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signInWithCustomToken } from "firebase/auth";

const HistoryCard = ({ item, onView, onDelete }) => {
  const displayDate = item.date;
  const displayTime = item.time;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
    >
      {/* Konten Utama Kartu */}
      <div className="p-6">
        {/* Nama Produk */}
        <h3 className="text-xl font-semibold text-white mb-4 line-clamp-2">{item.productName}</h3>

        {/* Informasi Utama: Jumlah Ulasan, Tanggal, Waktu */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <FiPackage className="text-blue-400 text-lg" />
            <span>Jumlah Ulasan: <span className="font-semibold text-white">{item.results.totalReviews}</span></span>
          </div>
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <FiCalendar className="text-green-400 text-lg" />
            <span>Tanggal: <span className="font-semibold text-white">{displayDate}</span></span>
          </div>
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <FiClock className="text-orange-400 text-lg" />
            <span>Waktu: <span className="font-semibold text-white">{displayTime}</span></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
          <button
            onClick={() => onView(item)} // Mengirim item lengkap untuk detail
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FiEye />
            <span>Lihat Detail</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation(); // Mencegah event click pada kartu induk
              onDelete(item.id); // Mengirim ID dokumen Firestore untuk dihapus
            }}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
            title="Hapus"
          >
            <FiTrash2 />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Komponen utama HistoryContent
function HistoryContent() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { userId, getToken, isLoaded, isSignedIn } = useAuth();

  // Fungsi untuk mengautentikasi Firebase menggunakan token Clerk
  const signIntoFirebaseWithClerk = async () => {
    try {
      const token = await getToken({ template: 'integration_firebase' });
      if (token) {
        await signInWithCustomToken(auth, token);
      } else {
        console.warn("Clerk token not available. Cannot authenticate Firebase.");
      }
    } catch (error) {
      console.error("Error signing into Firebase with Clerk token:", error);
    }
  };

  // Fungsi untuk mengambil riwayat analisis dari Firestore
  const fetchHistoryFromFirestore = async () => {
    if (!isLoaded || !isSignedIn || !userId) {
      setIsLoading(false);
      setHistory([]);
      return;
    }

    setIsLoading(true);
    try {
      await signIntoFirebaseWithClerk(); // Pastikan Firebase Auth sudah terautentikasi dengan Clerk

      const q = query(
        collection(db, "historyAnalysis"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);

      const fetchedHistory = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      const processedHistory = fetchedHistory.map(item => ({
        ...item,
        timestamp: item.timestamp && item.timestamp.toDate ? item.timestamp.toDate() : item.timestamp,
        date: item.date || (item.timestamp && item.timestamp.toDate ? item.timestamp.toDate().toISOString().split('T')[0] : ''),
        time: item.time || (item.timestamp && item.timestamp.toDate ? item.timestamp.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''),
      }));

      setHistory(processedHistory);
    } catch (error) {
      console.error("Error fetching history from Firestore:", error);
      alert("Gagal memuat riwayat analisis dari Firestore. Silakan coba lagi. Pastikan aturan keamanan Firestore sudah benar."); // TODO: Ganti dengan modal UI kustom
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryFromFirestore();
  }, [userId, isLoaded, isSignedIn]);

  const filteredHistory = history.filter((item) => {
    const productMatch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const summaryMatch = item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    return productMatch || summaryMatch;
  });

  const handleViewDetail = (item) => {
    const analysisData = {
      analysisId: item.id,
      productName: item.productName,
      analysisType: "history",
      timestamp: item.timestamp,
      results: item.results
    };

    navigate("/flow/analysis/results", { 
      state: analysisData 
    });
  };

  const handleDelete = async (docId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat analisis ini?")) {
      try {
        await signIntoFirebaseWithClerk();
        await deleteDoc(doc(db, "historyAnalysis", docId));
        console.log("Document successfully deleted!");
        fetchHistoryFromFirestore();
      } catch (error) {
        console.error("Error removing document: ", error);
        alert("Gagal menghapus riwayat analisis. Silakan coba lagi.");
      }
    }
  };

  const handleRefresh = () => {
    fetchHistoryFromFirestore();
  };

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
    );
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

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
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
  );
}

export default HistoryContent;