import { useState, useEffect, useRef } from "react"; // Import useRef for file input
import { motion, AnimatePresence } from "framer-motion"; // Add AnimatePresence for notification
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiSave,
  FiCamera,
  FiTrash2,
  FiLogOut,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiArrowRight,
  FiUploadCloud // New icon for upload
} from "react-icons/fi";

const SettingsContent = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut, frontendApi } = useClerk(); // Get frontendApi from useClerk
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation
  const fileInputRef = useRef(null); // Ref for hidden file input

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
  });

  // Load user data when available
  useEffect(() => {
    if (userLoaded && user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.unsafeMetadata?.bio || "",
      });

      setEmailForm({
        newEmail: "", // newEmail should always be empty initially
      });
    }
  }, [user, userLoaded]);

  // Notification helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await user.update({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        username: profileForm.username,
        // Update unsafeMetadata (for custom fields like bio)
        unsafeMetadata: {
          ...user.unsafeMetadata, // Keep existing metadata
          bio: profileForm.bio,
        },
      });

      showNotification("success", "Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Clerk errors can have different structures, try to get a user-friendly message
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal memperbarui profil. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Add Email Address
  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.newEmail) {
      showNotification("error", "Alamat email tidak boleh kosong.");
      return;
    }

    setIsLoading(true);
    try {
      // Clerk's createEmailAddress method for adding new emails
      await user.createEmailAddress({
        email: emailForm.newEmail,
      });

      showNotification("success", "Email berhasil ditambahkan. Silakan verifikasi email Anda.");
      setEmailForm({ newEmail: "" }); // Clear input field
    } catch (error) {
      console.error("Error adding email:", error);
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal menambahkan email. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Change Primary Email Address
  const handlePrimaryEmailChange = async (emailId) => {
    setIsLoading(true);
    try {
      // Clerk's setPrimaryEmailAddress method
      await user.setPrimaryEmailAddress({ id: emailId });
      showNotification("success", "Email utama berhasil diubah!");
    } catch (error) {
      console.error("Error changing primary email:", error);
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal mengubah email utama. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Remove Email Address
  const handleRemoveEmail = async (emailId) => {
    setIsLoading(true);
    try {
      // Clerk's deleteEmailAddress method
      await user.deleteEmailAddress({ id: emailId });
      showNotification("success", "Email berhasil dihapus!");
    } catch (error) {
      console.error("Error removing email:", error);
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal menghapus email. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Avatar Upload (Trigger hidden file input)
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Clerk's setProfileImage method for uploading avatar
      await user.setProfileImage({ file });
      showNotification("success", "Foto profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal mengunggah foto profil. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Remove Avatar
  const handleRemoveAvatar = async () => {
    setIsLoading(true);
    try {
      // Clerk's deleteProfileImage method
      await user.deleteProfileImage();
      showNotification("success", "Foto profil berhasil dihapus!");
    } catch (error) {
      console.error("Error removing avatar:", error);
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal menghapus foto profil. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await signOut(); // Clerk's signOut function
      // Redirection is handled by Clerk's `afterSignOutUrl` in UserButton or implicitly by DashboardLayout.
    } catch (error) {
      console.error("Error signing out:", error);
      showNotification("error", "Gagal keluar. Silakan coba lagi.");
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await user.destroy(); // Clerk's destroy method to delete user account
      showNotification("success", "Akun Anda berhasil dihapus.");
      // Clerk will typically handle redirection after account deletion (e.g., to sign-out page)
    } catch (error) {
      console.error("Error deleting account:", error);
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal menghapus akun. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false); // Close confirmation modal
    }
  };

  // Render loading state while user data is not loaded
  if (!userLoaded) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-white ml-4">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pengaturan Akun</h1>
        <p className="text-gray-400">Kelola profil dan preferensi akun Anda</p>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {notification.type === "success" ? <FiCheck /> : <FiAlertCircle />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-auto text-gray-400 hover:text-white">
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sticky top-6">
            <div className="flex flex-col items-center mb-6 p-4">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                  {/* Display profile image or initial */}
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl} // Use user.imageUrl for Clerk profile picture
                      alt={user.username || user.firstName || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => { // Fallback for broken images
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/96x96/60A5FA/FFFFFF?text=${user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}`;
                      }}
                    />
                  ) : (
                    user.firstName?.charAt(0) || user.username?.charAt(0) || "U"
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 backdrop-blur-sm p-2 rounded-full text-white transition-colors flex items-center justify-center text-lg"
                  aria-label="Ubah foto profil"
                >
                  <FiCamera />
                </motion.button>
                {user.imageUrl && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveAvatar}
                    className="absolute bottom-0 left-0 bg-red-600 hover:bg-red-700 backdrop-blur-sm p-2 rounded-full text-white transition-colors flex items-center justify-center text-lg"
                    aria-label="Hapus foto profil"
                  >
                    <FiTrash2 />
                  </motion.button>
                )}
              </div>
              <h3 className="text-white font-medium text-lg">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username || "User"}
              </h3>
              <p className="text-gray-400 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "profile"
                    ? "bg-blue-600/30 text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FiUser />
                <span>Profil</span>
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "email"
                    ? "bg-blue-600/30 text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FiMail />
                <span>Email</span>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "password"
                    ? "bg-blue-600/30 text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FiLock />
                <span>Password</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "security"
                    ? "bg-blue-600/30 text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FiShield />
                <span>Keamanan</span>
              </button>
            </nav>

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

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Informasi Profil</h2>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="firstName">Nama Depan</label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="lastName">Nama Belakang</label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all resize-none"
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  />
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <FiSave />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Kelola Email</h2>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Email Terdaftar</h3>
                <div className="space-y-4">
                  {/* Ensure user.emailAddresses is an array before mapping */}
                  {user.emailAddresses && user.emailAddresses.length > 0 ? (
                    user.emailAddresses.map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FiMail className="text-gray-400" />
                          <div>
                            <div className="text-white">{email.emailAddress}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {email.id === user.primaryEmailAddressId && (
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                  Utama
                                </span>
                              )}
                              {email.verification?.status === "verified" ? ( // Check for verification status
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <FiCheck className="text-xs" />
                                  Terverifikasi
                                </span>
                              ) : (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                  Belum Terverifikasi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Enable "Jadikan Utama" only if not primary and verified */}
                          {email.id !== user.primaryEmailAddressId && email.verification?.status === "verified" && (
                            <button
                              onClick={() => handlePrimaryEmailChange(email.id)}
                              disabled={isLoading}
                              className="text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Jadikan Utama
                            </button>
                          )}
                           {/* Enable "Verifikasi" if not verified and not primary */}
                           {email.id !== user.primaryEmailAddressId && email.verification?.status !== "verified" && (
                            <button
                               onClick={async () => {
                                  try {
                                      await email.prepareVerification(); // Clerk method to send verification email
                                      showNotification("success", `Link verifikasi telah dikirim ke ${email.emailAddress}.`);
                                  } catch (error) {
                                      console.error("Error sending verification email:", error);
                                      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].longMessage : "Gagal mengirim link verifikasi.";
                                      showNotification("error", errorMessage);
                                  }
                              }}
                              disabled={isLoading}
                              className="text-sm bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Verifikasi
                            </button>
                           )}
                          {/* Disable "Hapus" button if it's the only email address or if it's the primary email */}
                          {user.emailAddresses.length > 1 && email.id !== user.primaryEmailAddressId && (
                            <button
                              onClick={() => handleRemoveEmail(email.id)}
                              disabled={isLoading}
                              className="text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Tidak ada alamat email terdaftar.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Tambah Email Baru</h3>
                <form onSubmit={handleAddEmail} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    placeholder="Masukkan alamat email baru"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !emailForm.newEmail}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Menambahkan..." : "Tambah Email"}
                  </motion.button>
                </form>
                <p className="text-gray-400 text-sm mt-2">
                  Email baru akan memerlukan verifikasi sebelum dapat digunakan sebagai email utama.
                </p>
              </div>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Ubah Password</h2>

              <div className="text-center py-8">
                <button
                  onClick={() => window.open(`${frontendApi}/user`, "_blank")} // Use frontendApi for general Clerk URLs
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <FiLock />
                  Reset Password
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  Anda akan diarahkan ke halaman pengaturan akun Clerk untuk mengubah password Anda.
                </p>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Keamanan Akun</h2>

              <div className="space-y-8">
                {/* 2FA Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Autentikasi Dua Faktor</h3>
                    {user.twoFactorEnabled ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Aktif</span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">Tidak Aktif</span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-4">
                    Tingkatkan keamanan akun Anda dengan mengaktifkan autentikasi dua faktor.
                  </p>
                  <button
                    onClick={() => window.open(`${frontendApi}/user`, "_blank")} // Link to user settings page
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <FiShield />
                    {user.twoFactorEnabled ? "Kelola 2FA" : "Aktifkan 2FA"}
                  </button>
                </div>

                {/* Sessions Section */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">Sesi Aktif</h3>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Sesi Saat Ini</p>
                        <p className="text-gray-400 text-sm">
                          {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          (Browser ini)
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Aktif</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.open(`${frontendApi}/user`, "_blank")} // Link to user settings page
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                    >
                      Kelola semua sesi aktif
                      <FiArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Account Deletion */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">Hapus Akun</h3>
                  <p className="text-gray-400 mb-4">
                    Menghapus akun Anda akan menghapus semua data dan tidak dapat dikembalikan.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)} // Open confirmation modal
                    className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <FiTrash2 />
                    Hapus Akun Saya
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-sm w-full text-center shadow-lg"
            >
              <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Konfirmasi Penghapusan Akun</h3>
              <p className="text-gray-400 mb-6">
                Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Hapus Akun"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsContent;