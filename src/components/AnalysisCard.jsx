import { motion } from "framer-motion"
import { FiArrowRight } from "react-icons/fi"

const AnalysisCard = ({ analysis, isLoading, onView, cardClassName = "" }) => {

  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        backgroundColor: { duration: 0.1 },
      }}
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 transition-all duration-300 hover:bg-black/70 ${cardClassName}`}
    >
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
          <div className="flex justify-between mt-4">
            <div className="h-6 bg-white/20 rounded w-1/4"></div>
            <div className="h-6 bg-white/20 rounded w-1/4"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-white line-clamp-1">{analysis.title}</h3>
            <span className="text-gray-400 text-sm">{analysis.date}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-3 h-3 rounded-full bg-blue-500`}></span>
            <span className="text-gray-300 text-sm">
              Newest Analysis
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{analysis.count} ulasan</span>
            {onView && (
              <button
                onClick={() => onView(analysis)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
              >
                Lihat Detail
                <FiArrowRight className="text-xs" />
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

export default AnalysisCard
