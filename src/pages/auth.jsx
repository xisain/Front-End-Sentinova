import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import { SignIn, SignUp } from "@clerk/clerk-react"

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

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)

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

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700"
        >
          {/* Toggle Buttons */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
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

          {/* Clerk Components with Black Theme */}
          {isLogin ? (
            <SignIn 
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "bg-transparent",
                  card: "bg-gray-900 border border-gray-700 shadow-none",
                  headerTitle: "text-white",
                  headerSubtitle: "text-gray-300",
                  socialButtonsBlockButton: "bg-gray-800 hover:bg-gray-700 border-gray-600 text-white",
                  socialButtonsBlockButtonText: "text-white",
                  dividerLine: "bg-gray-600",
                  dividerText: "text-gray-400",
                  formFieldLabel: "text-gray-200",
                  formFieldInput: "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  footerActionLink: "text-blue-400 hover:text-blue-300",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
                  formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-200",
                  alertClerkError: "text-red-400 bg-red-900/20 border-red-800",
                  formFieldErrorText: "text-red-400",
                  otpCodeFieldInput: "bg-gray-800 border-gray-600 text-white",
                },
                variables: {
                  colorBackground: "#111827",
                  colorInputBackground: "#1f2937",
                  colorInputText: "#ffffff",
                  colorText: "#ffffff",
                  colorTextSecondary: "#9ca3af",
                  colorPrimary: "#2563eb",
                }
              }}
            />
          ) : (
            <SignUp 
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "bg-transparent",
                  card: "bg-gray-900 border border-gray-700 shadow-none",
                  headerTitle: "text-white",
                  headerSubtitle: "text-gray-300",
                  socialButtonsBlockButton: "bg-gray-800 hover:bg-gray-700 border-gray-600 text-white",
                  socialButtonsBlockButtonText: "text-white",
                  dividerLine: "bg-gray-600",
                  dividerText: "text-gray-400",
                  formFieldLabel: "text-gray-200",
                  formFieldInput: "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  footerActionLink: "text-blue-400 hover:text-blue-300",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
                  formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-200",
                  alertClerkError: "text-red-400 bg-red-900/20 border-red-800",
                  formFieldErrorText: "text-red-400",
                  otpCodeFieldInput: "bg-gray-800 border-gray-600 text-white",
                },
                variables: {
                  colorBackground: "#111827",
                  colorInputBackground: "#1f2937",
                  colorInputText: "#ffffff",
                  colorText: "#ffffff",
                  colorTextSecondary: "#9ca3af",
                  colorPrimary: "#2563eb",
                }
              }}
            />
          )}
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}