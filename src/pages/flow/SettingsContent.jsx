import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useClerk } from "@clerk/clerk-react";
import { FiUser, FiMail, FiLogOut, FiSettings } from "react-icons/fi";

const ProfileInfoCard = ({ label, value }) => (
  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <p className="text-white font-medium">{value || '-'}</p>
  </div>
);

const SettingsContent = () => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle opening UserProfile with black appearance
  const handleOpenUserProfile = () => {
    openUserProfile({
      appearance: {
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
          navbar: "bg-gray-900 border-gray-700",
          navbarButton: "text-gray-300 hover:text-white hover:bg-gray-800",
          navbarButtonIcon: "text-gray-400",
          profileSection: "bg-gray-900",
          profileSectionTitle: "text-white",
          profileSectionContent: "text-gray-300",
          accordionTriggerButton: "text-white hover:bg-gray-800",
          accordionContent: "bg-gray-900",
          badge: "bg-gray-800 text-gray-300",
          breadcrumbs: "text-gray-400",
          breadcrumbsItem: "text-gray-400",
          breadcrumbsItemDivider: "text-gray-600",
          breadcrumbsItemCurrent: "text-white",
        },
        variables: {
          colorBackground: "#111827",
          colorInputBackground: "#1f2937",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#9ca3af",
          colorPrimary: "#2563eb",
          colorDanger: "#dc2626",
          colorSuccess: "#059669",
          colorWarning: "#d97706",
          colorNeutral: "#6b7280",
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pengaturan Akun</h1>
        <p className="text-gray-400">Kelola profil dan preferensi akun Anda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with User Info */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sticky top-6">
            <div className="flex flex-col items-center mb-6 p-4">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.username || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.firstName?.charAt(0) || "U"
                  )}
                </div>
              </div>
              <h3 className="text-white font-medium text-lg">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "User"}
              </h3>
              <p className="text-gray-400 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>

            {/* Settings Navigation */}
            <nav className="space-y-1">
              <button
                onClick={handleOpenUserProfile}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <FiSettings />
                <span>Edit Profil</span>
              </button>
            </nav>

            {/* Logout Button */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <FiLogOut />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modified Main Content */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Informasi Profil</h2>
              <button
                onClick={handleOpenUserProfile}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Edit Profil
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileInfoCard 
                label="Nama Depan"
                value={user?.firstName}
              />
              <ProfileInfoCard 
                label="Nama Belakang"
                value={user?.lastName}
              />
              <ProfileInfoCard 
                label="Username"
                value={user?.username}
              />
              <ProfileInfoCard 
                label="Email"
                value={user?.primaryEmailAddress?.emailAddress}
              />
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-sm text-gray-400">
                <p>Untuk mengubah informasi profil Anda, klik tombol "Edit Profil" di atas.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;