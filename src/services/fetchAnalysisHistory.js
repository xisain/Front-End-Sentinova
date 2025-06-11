import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "../firebaseConfig/config"

export const fetchAnalysisHistory = async (userId) => {
  if (!userId) return []

  const q = query(
    collection(db, "historyAnalysis"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate?.() || null,
      date: data.timestamp?.toDate()?.toISOString().split("T")[0] || "",
      time: data.timestamp?.toDate()?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) || "",
    }
  })
}