import { motion } from "framer-motion"

const StatCard = ({ title, value, icon, color, change, isLoading, cardClassName = "" }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)", backgroundColor: "rgba(0,0,0,0.7)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30, backgroundColor: { duration: 0.1 } }}
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 relative overflow-hidden transition-colors duration-300 hover:bg-black/70 ${cardClassName}`}
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
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  change.startsWith("+") ? "text-green-400" : change.startsWith("-") ? "text-red-400" : "text-gray-400"
                }`}
              >
                {change}
              </span>
              <span className="text-gray-400 text-sm">dari bulan lalu</span>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

export default StatCard