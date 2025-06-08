import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useClerk } from "@clerk/clerk-react"

export default function SSOCallback() {
  const navigate = useNavigate()
  const { handleRedirectCallback } = useClerk()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback()
        navigate("/")
      } catch (error) {
        console.error("Error handling SSO callback:", error)
        navigate("/auth")
      }
    }

    handleCallback()
  }, [handleRedirectCallback, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Menyelesaikan login...</p>
      </div>
    </div>
  )
}