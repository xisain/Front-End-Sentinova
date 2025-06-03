import React, { useEffect, useState } from "react";
import { auth, db } from "../js/firebase-init";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Sentiment() {
  const [username, setUsername] = useState("");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [wordFreq, setWordFreq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [greetingLoading, setGreetingLoading] = useState(true);
  const [greetingError, setGreetingError] = useState("");

  useEffect(() => {
    const greetingUser = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          window.location.href = "/login";
          return;
        }
        const uid = user.uid;
        try {
          const docSnap = await getDoc(doc(db, "users", uid));
          if (docSnap.exists() && docSnap.data().username) {
            setUsername(docSnap.data().username);
          } else {
            setUsername("User");
          }
          setGreetingError("");
        } catch (err) {
          setGreetingError("Gagal mengambil data user.");
          setUsername("User");
        }
        setGreetingLoading(false);
      });
    };
    greetingUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lines = inputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    if (lines.length === 0) {
      alert("Tolong masukkan minimal satu review.");
      return;
    }
    setLoading(true);
    setResults([]);
    setSummary(null);
    setWordFreq(null);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texts: lines }),
      });
      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);
      setWordFreq(data.word_freq);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Gagal menghubungi server.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-20 bg-slate-900/40 backdrop-blur-md shadow-none">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/image/Sentinova.png" className="h-9" alt="Sentinova Logo" />
          </Link>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex">
              <li>
                <span className="text-white font-poppins rounded-lg px-5 py-2.5">
                  {greetingLoading
                    ? "Loading..."
                    : greetingError
                      ? greetingError
                      : `Halo, ${username}`}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <section className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white font-poppins px-2 pb-10 mt-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center mt-8">Sentiment Analysis</h2>
        <p className="mb-6 text-center text-slate-300 max-w-xl">Masukkan beberapa review (1 baris 1 review), lalu klik submit untuk melihat hasil analisis sentimen, distribusi, dan kata yang sering muncul.</p>

        {/* Form Input */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl mx-auto mb-6"
        >
          <div className="relative">
            <textarea
              rows="4"
              placeholder="Tulis beberapa review, 1 baris 1 review..."
              className="w-full px-4 py-3 pr-32 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-400 text-white resize-none shadow-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              style={{ paddingBottom: "3.5rem" }}
            />
            <button
              type="submit"
              className="absolute right-4 bottom-4 bg-blue-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-600 transition duration-200 shadow-md disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Loading...</span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 mb-4 font-semibold bg-red-900/30 px-4 py-2 rounded-lg">{error}</div>
        )}

        {/* Hasil Analisis */}
        {results.length > 0 && (
          <div className="bg-slate-800/80 rounded-lg p-6 mt-4 w-full max-w-4xl text-white shadow-xl mb-8 col-span-2 animate-fade-in border border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-blue-300">Hasil Analisis Review</h3>
            <div className="divide-y divide-slate-700">
              {results.map((item, idx) => (
                <div className="py-3" key={idx}>
                  <div className="flex flex-row items-start gap-2">
                    <span className="font-semibold text-slate-200 whitespace-nowrap">Text {idx + 1}:</span>
                    <span className="text-slate-400 break-words flex-1">{item.text}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="bg-slate-700 px-3 py-1 rounded text-sm">Sentiment: <span className={
                      item.predicted_sentiment === 'Positive' ? 'text-green-400' : item.predicted_sentiment === 'Negative' ? 'text-red-400' : 'text-yellow-300'
                    }>{item.predicted_sentiment}</span></span>
                    <span className="bg-slate-700 px-3 py-1 rounded text-sm">Negative: {item.negative}%</span>
                    <span className="bg-slate-700 px-3 py-1 rounded text-sm">Neutral: {item.netral}%</span>
                    <span className="bg-slate-700 px-3 py-1 rounded text-sm">Positive: {item.positive}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {(summary || wordFreq) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-4">
            {/* Card 1: Bar Chart */}
            {summary && (
              <div className="bg-slate-800/80 p-6 rounded-lg shadow-xl flex flex-col items-center animate-slide-up border border-slate-700">
                <h3 className="text-lg font-bold mb-2 text-blue-300">Distribusi Sentimen (Bar)</h3>
                <Bar
                  data={{
                    labels: ['Negative', 'Neutral', 'Positive'],
                    datasets: [
                      {
                        label: 'Jumlah Review',
                        data: [summary.Negative, summary.Netral, summary.Positive],
                        backgroundColor: ['#ef4444', '#facc15', '#22c55e'],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    animation: {
                      duration: 1200,
                      easing: 'easeOutQuart',
                    },
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                  }}
                  className="w-full"
                />
                <div className="mt-4 flex justify-around text-lg font-semibold w-full">
                  <div className="text-red-400">Negative: {summary.Negative}</div>
                  <div className="text-yellow-300">Neutral: {summary.Netral}</div>
                  <div className="text-green-400">Positive: {summary.Positive}</div>
                </div>
              </div>
            )}

            {/* Card 2: Word Frequency (Tag Cloud) */}
            {wordFreq && (
              <div className="bg-slate-800/80 p-6 rounded-lg shadow-xl flex flex-col items-center animate-slide-up delay-100 border border-slate-700">
                <h3 className="text-lg font-bold mb-2 text-blue-300">Word Frequency</h3>
                <div className="flex flex-wrap gap-2 justify-center max-h-64 overflow-y-auto w-full">
                  {Object.entries(wordFreq).map(([word, freq], idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded bg-blue-900/40 px-3 py-1 text-blue-200 font-semibold shadow text-sm"
                      style={{ fontSize: `${Math.min(2.2, 1 + freq / 10)}rem` }}
                    >
                      {word} <span className="text-blue-400">({freq})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pie Chart di bawah, kecil dan center */}
        {summary && (
          <div className="flex justify-center mt-8">
            <div className="bg-slate-800/80 p-6 rounded-lg shadow-xl flex flex-col items-center max-w-xs w-full animate-fade-in border border-slate-700">
              <h3 className="text-lg font-bold mb-2 text-blue-300">Distribusi Sentimen (Pie)</h3>
              <Pie
                data={{
                  labels: ['Negative', 'Neutral', 'Positive'],
                  datasets: [
                    {
                      data: [summary.Negative, summary.Netral, summary.Positive],
                      backgroundColor: ['#ef4444', '#facc15', '#22c55e'],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1400,
                    easing: 'easeOutBack',
                  },
                  plugins: {
                    legend: { display: true, position: 'bottom' },
                    title: { display: false },
                  },
                }}
                className="w-full"
              />
            </div>
            <div className="h-32 md:h-48" />
          </div>    
        )}
      </section>
    </>
  );
}