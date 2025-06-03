import { useRef } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"

const ROTATION_RANGE = 32.5
const HALF_ROTATION_RANGE = 32.5 / 2

const TiltCard = ({ icon, title, description, className }) => {
  const ref = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x)
  const ySpring = useSpring(y)

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE

    const rX = (mouseY / rect.height - HALF_ROTATION_RANGE) * -1
    const rY = mouseX / rect.width - HALF_ROTATION_RANGE

    x.set(rX)
    y.set(rY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className={
        className ? className : "relative h-96 w-72 rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300"
      }
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          background: "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          filter: "blur(1px)",
        }}
        whileHover={{ opacity: 1 }}
      />

      {/* Main content card */}
      <motion.div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-4 flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-md p-6 shadow-2xl text-center border border-white/20 hover:bg-white/90 transition-all duration-300"
        whileHover={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Icon with enhanced styling */}
        {icon && (
          <motion.div
            className="text-5xl mb-6 p-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg"
            style={{ transform: "translateZ(60px)" }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
            }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}

        {/* Title with gradient text */}
        <motion.h3
          className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
          style={{ transform: "translateZ(50px)" }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.h3>

        {/* Description with better typography */}
        <motion.p
          className="text-gray-700 text-sm leading-relaxed px-2 font-medium"
          style={{ transform: "translateZ(40px)" }}
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {description}
        </motion.p>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
          style={{ transform: "translateZ(30px)" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
          style={{ transform: "translateZ(30px)" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </motion.div>

      {/* Enhanced shadow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.05))",
          transform: "translateZ(-10px)",
        }}
        whileHover={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.15), rgba(0,0,0,0.08))",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default TiltCard
