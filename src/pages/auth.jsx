import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser } from "react-icons/fi"
import { useSignIn, useSignUp, useUser } from "@clerk/clerk-react"

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

// Social Login Button Component
const SocialButton = ({ icon, label, onClick, isLoading }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/15 transition-all duration-300 disabled:opacity-50"
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  )
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const navigate = useNavigate()
  const { isLoaded: userLoaded, isSignedIn } = useUser()
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()

  // Redirect jika sudah login
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      navigate("/")
    }
  }, [userLoaded, isSignedIn, navigate])

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!signInLoaded) return

    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      })

      if (result.status === "complete") {
        await signIn.setActive({ session: result.createdSessionId })
        navigate("/")
      }
    } catch (err) {
      console.error("Error signing in:", err)
      setErrorMessage(err.errors?.[0]?.message || "Login gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!signUpLoaded) return

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Password tidak cocok!")
      return
    }

    if (!agreedToTerms) {
      setErrorMessage("Harap setujui syarat dan ketentuan!")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await signUp.create({
        username: form.username,
        emailAddress: form.email,
        password: form.password,
      })

      if (result.status === "complete") {
        await signUp.setActive({ session: result.createdSessionId })
        navigate("/")
      } else {
        // Handle email verification if needed
        console.log("Sign up result:", result)
      }
    } catch (err) {
      console.error("Error signing up:", err)
      setErrorMessage(err.errors?.[0]?.message || "Registrasi gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (strategy) => {
    if (!signInLoaded) return

    setSocialLoading(strategy)

    try {
      const result = await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      })
      console.log("Social login result:", result)
    } catch (err) {
      console.error(`Error with ${strategy} login:`, err)
      setErrorMessage(`Login dengan ${strategy} gagal. Silakan coba lagi.`)
      setSocialLoading("")
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setForm({ username: "", email: "", password: "", confirmPassword: "" })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAgreedToTerms(false)
    setErrorMessage("")
  }

  return (
    <AnimatedBackground className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Navbar transparan dengan tombol kembali di kiri atas */}
      <nav className="fixed top-0 left-0 w-full z-20 shadow-none">
        <div className="max-w-screen-xl flex items-center justify-start mx-auto p-3">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
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
              {isLogin ? "Masuk" : "Daftar"}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-gray-300 text-lg"
          >
            {isLogin ? "Selamat datang kembali di Sentinova" : "Bergabunglah dengan Sentinova hari ini"}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          {/* Toggle Buttons */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:text-white"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:text-white"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <SocialButton
              icon={
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              }
              label="Lanjutkan dengan Google"
              onClick={() => handleSocialLogin("oauth_google")}
              isLoading={socialLoading === "oauth_google"}
            />
            <SocialButton
              icon={
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              }
              label="Lanjutkan dengan GitHub"
              onClick={() => handleSocialLogin("oauth_github")}
              isLoading={socialLoading === "oauth_github"}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-sm text-gray-400">atau</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-6">
            {/* Username Input - hanya untuk register */}
            {!isLogin && (
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
            )}

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
              {!isLogin && <PasswordStrength password={form.password} />}
            </div>

            {/* Confirm Password Input - hanya untuk register */}
            {!isLogin && (
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
            )}

            {/* Forgot Password Link - hanya untuk login */}
            {isLogin && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Lupa password?
                </Link>
              </div>
            )}

            {/* Terms Agreement - hanya untuk register */}
            {!isLogin && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-2 border-white/30 bg-transparent focus:ring-2 focus:ring-blue-400/50 transition-all"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-sm text-gray-300 leading-relaxed cursor-pointer select-none"
                >
                  Saya menyetujui{" "}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Kebijakan Privasi
                  </Link>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || (!isLogin && (!agreedToTerms || form.password !== form.confirmPassword))}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Masuk" : "Daftar Sekarang"}
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-white text-sm">
            Dengan {isLogin ? "masuk" : "mendaftar"}, Anda menyetujui{" "}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
              Kebijakan Privasi
            </Link>
          </p>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}