import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { registerUser } from "../js/auth"
import { useNotification } from "./NotificationContext"
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiCheck } from "react-icons/fi"

// Reuse the same color palette from home.jsx
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"]
const COLORS_BOTTOM = ["#0D4B3C", "#0A2342", "#4A1942", "#3D0E21"]

// Animated background component
const AnimatedBackground = ({ children, className, speed = 12 }) => {
  const color = useMotionValue(COLORS_TOP[0])
  const bottomColor = useMotionValue(COLORS_BOTTOM[0])

  useEffect(() => {
    animate(color, [...COLORS_TOP], {
      ease: "easeInOut",
      duration: speed,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "mirror",
    })

    animate(bottomColor, [...COLORS_BOTTOM], {
      ease: "easeInOut",
      duration: speed,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "mirror",
    })
  }, [])

  const backgroundImage = useMotionTemplate`linear-gradient(to bottom, #020617 10%, ${color} 50%, ${bottomColor} 100%)`

  return (
    <motion.div style={{ backgroundImage }} className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        <Canvas>
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        </Canvas>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[a-z]/.test(pass)) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = getStrength(password)
  const getColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getLabel = () => {
    if (strength <= 2) return "Lemah"
    if (strength <= 3) return "Sedang"
    return "Kuat"
  }

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-colors ${i <= strength ? getColor() : "bg-gray-600"}`}
            />
          ))}
        </div>
        <span
          className={`text-xs font-medium ${strength <= 2 ? "text-red-400" : strength <= 3 ? "text-yellow-400" : "text-green-400"}`}
        >
          {getLabel()}
        </span>
      </div>
    </div>
  )
}

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()
  const { addNotification } = useNotification()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      addNotification("Password tidak cocok!")
      return
    }

    if (!agreedToTerms) {
      addNotification("Harap setujui syarat dan ketentuan!")
      return
    }

    setIsLoading(true)
    try {
      await registerUser(form.username, form.email, form.password)
      addNotification("Registrasi berhasil!")
      navigate("/login")
    } catch (error) {
      addNotification("Gagal registrasi: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatedBackground className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Navbar transparan dengan tombol kembali di kiri atas */}
      <nav className="fixed top-0 left-0 w-full z-20 shadow-none">
        <div className="max-w-screen-xl flex items-center justify-start mx-auto p-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <motion.div
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              <span className="text-sm font-medium">Kembali</span>
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Floating background elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl"
        animate={{
          y: [0, -25, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Daftar
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-gray-300 text-lg"
          >
            Bergabunglah dengan Sentinova hari ini
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200 block">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 duration-300 hover:bg-black/40 focus:bg-black/40 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 duration-300 hover:bg-black/40 focus:bg-black/40 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 duration-300 hover:bg-black/40 focus:bg-black/40 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200 block">Konfirmasi Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password Anda"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 duration-300 hover:bg-black/40 focus:bg-black/40 transition-colors ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? "border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50"
                      : "border-white/20 focus:ring-blue-400/50 focus:border-blue-400/50"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-red-400 text-sm">Password tidak cocok</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-white/30 bg-transparent focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-300 leading-relaxed cursor-pointer select-none">
                Saya menyetujui{' '}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">Syarat & Ketentuan</Link>{' '}
                dan{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">Kebijakan Privasi</Link>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !agreedToTerms || form.password !== form.confirmPassword}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Daftar Sekarang
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-300">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}
