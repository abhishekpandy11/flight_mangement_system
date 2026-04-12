import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import HotelCard from "../components/HotelCard";

export default function HotelSearch() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchHotels = async () => {
    if (!city.trim()) {
      setError("Please enter a city.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/hotels", {
        params: { city },
      });
      setHotels(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to fetch hotels. Please check if your RapidAPI key is active and valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchHotels();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Tab switcher */}
        <div className="flex justify-center mb-8 mt-2">
          <div className="inline-flex rounded-full p-1.5 gap-1 bg-slate-800/10 dark:bg-slate-900/40 backdrop-blur-md border border-slate-700/10 dark:border-slate-800/50">
            {["flights", "hotels"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "flights") navigate("/");
                }}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  tab === "hotels"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab === "flights" ? "Flights" : "Hotels"}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-500 mb-2">Search Hotels 🏨</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-6 font-medium">Find and book your next stay anywhere in the world</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <input
            placeholder="City (e.g. Mumbai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors bg-gray-50/50 dark:bg-slate-950 flex-1"
          />
          <button
            onClick={searchHotels}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-500/20"
          >
            {loading ? "Searching..." : "Search Hotels"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mb-4 font-medium flex items-center gap-1.5">
            <span>⚠️</span> {error}
          </p>
        )}

        {hotels.length === 0 && !loading && !error && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm mt-8">
            <p className="text-gray-400 dark:text-slate-500 font-medium">
              No hotels found. Enter a city to discover accommodations.
            </p>
          </div>
        )}

        <div className="mt-6">
          {hotels.map((h, i) => (
            <HotelCard key={i} hotel={h} />
          ))}
        </div>
      </div>
    </div>
  );
}
