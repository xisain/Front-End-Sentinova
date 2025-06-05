function ReportsContent() {
  const monthlySummary = {
    positive: 65,
    neutral: 20,
    negative: 15,
    total: 500,
  };

  const topCategories = ["Harga", "Kualitas Produk", "Pengiriman", "Layanan", "UI/UX"];

  return (
    <div className="p-6 text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Laporan Bulanan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ringkasan Sentimen */}
        <div className="bg-white/10 p-6 rounded-lg backdrop-blur-md border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Ringkasan Sentimen</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>Positif: {monthlySummary.positive}%</li>
            <li>Netral: {monthlySummary.neutral}%</li>
            <li>Negatif: {monthlySummary.negative}%</li>
            <li>Total Ulasan: {monthlySummary.total}</li>
          </ul>
        </div>

        {/* Kategori Teratas */}
        <div className="bg-white/10 p-6 rounded-lg backdrop-blur-md border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Topik/Kategori Terpopuler</h3>
          <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
            {topCategories.map((cat, index) => (
              <li key={index}>{cat}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ReportsContent