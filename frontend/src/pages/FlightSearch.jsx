import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import FlightCard from "../components/FlightCard";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
// Kiwi.com CDN serves airline logos reliably by IATA code — no CORS issues
const FEATURED_AIRLINES = [
  { key: "air_india",        name: "Air India",       iata: "AI", bg: "#E31837", url: "https://images.kiwi.com/airlines/64/AI.png",  tagline: "The Maharaja Experience" },
  { key: "indigo",           name: "IndiGo",          iata: "6E", bg: "#1A1F71", url: "https://images.kiwi.com/airlines/64/6E.png",  tagline: "On Time, Every Time" },
  { key: "spicejet",         name: "SpiceJet",        iata: "SG", bg: "#E8231A", url: "https://images.kiwi.com/airlines/64/SG.png",  tagline: "Red Hot Fares" },
  { key: "vistara",          name: "Vistara",         iata: "UK", bg: "#5C2D91", url: "https://images.kiwi.com/airlines/64/UK.png",  tagline: "Fly the New Feeling" },
  { key: "akasa",            name: "Akasa Air",       iata: "QP", bg: "#FF6B00", url: "https://images.kiwi.com/airlines/64/QP.png",  tagline: "Low Cost, High Comfort" },
  { key: "airasia",          name: "AirAsia India",   iata: "I5", bg: "#FF0000", url: "https://images.kiwi.com/airlines/64/I5.png",  tagline: "Now Everyone Can Fly" },
  { key: "air_india_express",name: "AI Express",      iata: "IX", bg: "#C01A2B", url: "https://images.kiwi.com/airlines/64/IX.png",  tagline: "Value International Flying" },
  { key: "goair",            name: "GoFirst",         iata: "G8", bg: "#0E4194", url: "https://images.kiwi.com/airlines/64/G8.png",  tagline: "Budget Bliss" },
];

const POPULAR_ROUTES = [
  { from: "Delhi",   to: "Mumbai",    img: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80", duration: "2h 15m", price: "₹3,499", tag: "Most Popular" },
  { from: "Mumbai",  to: "Goa",       img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80", duration: "1h 05m", price: "₹3,199", tag: "Beach Escape" },
  { from: "Delhi",   to: "Bangalore", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80", duration: "2h 45m", price: "₹5,299", tag: "Tech Hub" },
  { from: "Mumbai",  to: "Bangalore", img: "https://images.unsplash.com/photo-1580019542155-247062e19ce4?w=400&q=80", duration: "1h 40m", price: "₹4,199", tag: "Business" },
  { from: "Chennai", to: "Hyderabad", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80", duration: "1h 10m", price: "₹2,999", tag: "Quick Hop" },
  { from: "Kolkata", to: "Delhi",     img: "/kolkata.png", duration: "2h 30m", price: "₹4,799", tag: "Classic Route" },
];

const WHY_US = [
  { icon: (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  ), title: "Secure Booking", desc: "Bank-grade encryption for every transaction." },
  { icon: (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ), title: "Best Price Guarantee", desc: "We match any lower fare you find elsewhere." },
  { icon: (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  ), title: "Instant Confirmation", desc: "Receive your e-ticket in under 60 seconds." },
  { icon: (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9 9-4.03 9-9z" /></svg>
  ), title: "24/7 Support", desc: "Our team is always on call for you." },
];

const TRAVEL_TIPS = [
  { img: "https://images.unsplash.com/photo-1435527173128-983b87201f4d?w=400&q=80", tip: "Book 6–8 weeks early for domestic flights to get the best rates." },
  { img: "https://images.unsplash.com/photo-1551525212-a1dc18bef82c?w=400&q=80", tip: "Travel light — most budget carriers charge for check-in baggage." },
  { img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&q=80", tip: "Download the airline app for real-time gate & delay notifications." },
  { img: "https://images.unsplash.com/photo-1512152596508-05e811c7594b?w=400&q=80", tip: "Carry snacks — budget airlines often serve meals at a premium." },
];

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

function AirlineCard({ airline }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className="flex flex-col items-center p-4 rounded-2xl cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 overflow-hidden group-hover:scale-110 transition-transform duration-300"
        style={{
          background: imgError ? airline.bg : `${airline.bg}14`,
          border: `2px solid ${airline.bg}33`,
          boxShadow: `0 4px 14px ${airline.bg}25`,
          padding: imgError ? 0 : "6px",
        }}
      >
        {!imgError ? (
          <img
            src={airline.url}
            alt={airline.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-white font-bold text-xl">{airline.iata}</span>
        )}
      </div>
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200 text-center leading-tight">{airline.name}</p>
      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 text-center italic leading-tight">{airline.tagline}</p>
    </div>
  );
}

function RouteCard({ route, onSelect }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <button
      onClick={() => onSelect(route.from, route.to)}
      className="relative group rounded-3xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none border border-gray-200 dark:border-slate-800"
      style={{ height: 180 }}
    >
      {/* Background image */}
      {imgOk ? (
        <img
          src={route.img}
          alt={`${route.from} to ${route.to}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)" }} />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />

      {/* Tag badge */}
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
          {route.tag}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-extrabold text-base leading-tight drop-shadow">
          {route.from} → {route.to}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-white/80 font-medium">⏱ {route.duration}</span>
          <span className="text-xs font-bold text-amber-300">from {route.price}</span>
        </div>
      </div>

      {/* Hover CTA */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "rgba(37,99,235,0.85)", backdropFilter: "blur(8px)" }}>
          Search Flights →
        </span>
      </div>
    </button>
  );
}

/* Search result stats bar */
function StatsBar({ count, source, destination, onClear }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm border border-gray-100 dark:border-slate-800 mb-6 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-lg">
          {count}
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-white text-sm">Flights Found</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{source} → {destination}</p>
        </div>
      </div>
      <button onClick={onClear} className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors">
        ← New Search
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function FlightSearch() {
  const navigate                      = useNavigate();
  const [source, setSource]           = useState("");
  const [destination, setDestination] = useState("");
  const [flights, setFlights]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [searched, setSearched]       = useState(false);
  const [activeTab, setActiveTab]     = useState("flights"); // flights | hotels
  const sourceRef     = useRef(null);
  const searchCardRef = useRef(null); // used to scroll-into-view when route card clicked

  // Shuffle popular routes dynamically on component mount
  const shuffledRoutes = useMemo(() => {
    return [...POPULAR_ROUTES].sort(() => 0.5 - Math.random());
  }, []);

  // Auto-focus source on mount
  useEffect(() => { sourceRef.current?.focus(); }, []);

  // Enhanced swap using functional state updates to avoid React async closure bugs
  const swap = () => {
    setSource((prevSource) => {
      setDestination(prevSource);
      return destination;
    });
  };

  const searchFlights = async () => {
    if (!source.trim() || !destination.trim()) {
      setError("Please enter both source and destination.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSearched(true);
      const res = await API.get("/flights/search", { params: { source, destination } });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.flights || [];
      setFlights(list.slice(0, 10));
    } catch {
      setError("Failed to fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearched(false);
    setFlights([]);
    setSource("");
    setDestination("");
    setError("");
  };

  const handleRouteSelect = (from, to) => {
    setSource(from);
    setDestination(to);
    setError("");
    // Scroll to the very top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Small delay so state updates propagate before search fires
    setTimeout(() => {
      if (from.trim() && to.trim()) {
        setLoading(true);
        setError("");
        setSearched(true);
        API.get("/flights/search", { params: { source: from, destination: to } })
          .then((res) => {
            const data = res.data;
            const list = Array.isArray(data) ? data : data.flights || [];
            setFlights(list.slice(0, 10));
          })
          .catch(() => setError("Failed to fetch flights. Please try again."))
          .finally(() => setLoading(false));
      }
    }, 500); // give enough time for the smooth scroll
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300 bg-slate-50 dark:bg-slate-950">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 400 }}>
        {/* Background image */}
        <img
          src="/hero-bg.png"
          alt="Sky"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(15,23,90,0.85) 0%, rgba(37,99,235,0.75) 60%, rgba(96,165,250,0.40) 100%)" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-12">

          {/* Headline */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
              Find Your Perfect{" "}
              <span className="text-blue-400">Flight</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg mx-auto font-light">
              Search across Top Airlines &mdash; real-time availability, best fares, and instant booking.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full p-1.5 gap-1 bg-slate-800/40 dark:bg-slate-900/60 backdrop-blur-md border border-slate-700/30 dark:border-slate-800/50">
              {["flights", "hotels"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "hotels") navigate("/hotels");
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {tab === "flights" ? "Flights" : "Hotels"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Search Card ── */}
          <div ref={searchCardRef} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-5 sm:p-6 border border-white/60 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">

              {/* From */}
              <div className="flex-1 relative group">
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">From</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                  </div>
                  <input
                    ref={sourceRef}
                    id="search-from"
                    placeholder="Departure city…"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchFlights()}
                    className="w-full border border-gray-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-800 dark:focus:border-blue-500 transition-colors bg-gray-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-950"
                  />
                </div>
              </div>

              {/* Swap button */}
              <div className="flex items-end justify-center pb-0.5">
                <button
                  onClick={swap}
                  title="Swap cities"
                  className="w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-slate-700 flex items-center justify-center transition-all duration-200 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-90"
                  style={{ marginTop: 18 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              {/* To */}
              <div className="flex-1 relative group">
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">To</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                  </div>
                  <input
                    id="search-to"
                    placeholder="Arrival city…"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchFlights()}
                    className="w-full border border-gray-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-800 dark:focus:border-blue-500 transition-colors bg-gray-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-950"
                  />
                </div>
              </div>

              {/* Search button */}
              <div className="flex items-end">
                <button
                  id="search-flights-btn"
                  onClick={searchFlights}
                  disabled={loading}
                  className="w-full sm:w-auto whitespace-nowrap text-sm font-extrabold text-white px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", marginTop: 22 }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                       <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      Searching
                    </span>
                  ) : (
                    "Search Flights"
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mt-3 flex items-center gap-1.5 font-medium">
                <span>⚠️</span> {error}
              </p>
            )}

            {/* Quick city pills */}
            {!searched && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 dark:text-slate-500 font-medium self-center">Popular:</span>
                {["Delhi", "Mumbai", "Bangalore", "Goa", "Hyderabad", "Chennai"].map((city) => (
                  <button
                    key={city}
                    onClick={() => !source ? setSource(city) : setDestination(city)}
                    className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all duration-150 font-medium"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-white/70 font-medium">
            {["🔒 Secure Payment", "✅ 8 Airlines", "⚡ Instant Booking", "🎧 24/7 Support"].map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-4xl mx-auto px-4 pb-20 mt-8">

        {/* ── SEARCH RESULTS ── */}
        {searched && (
          <>
            <StatsBar count={loading ? "…" : flights.length} source={source} destination={destination} onClear={clearSearch} />

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                        <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
                      </div>
                      <div className="h-8 w-24 bg-gray-100 rounded-xl" />
                    </div>
                    <div className="h-16 bg-gray-50 rounded-2xl" />
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && flights.length === 0 && !error && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-gray-300 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">No Flights Found</h2>
                <p className="text-gray-400 text-sm mb-6">Try different city names or check the spelling.</p>
                <button onClick={clearSearch} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md text-sm">
                  ← Try Again
                </button>
              </div>
            )}

            {/* Flight cards */}
            {!loading && flights.length > 0 && (
              <div>
                {/* Sort/filter bar */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Sort by:</span>
                  {["Price ↑", "Duration", "Departure"].map((f) => (
                    <button key={f} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap font-medium">
                      {f}
                    </button>
                  ))}
                </div>
                {flights.map((f, i) => (
                  <FlightCard key={`${f.flight_number}-${i}`} flight={f} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PRE-SEARCH CONTENT ── */}
        {!searched && (
          <>
            {/* Popular Routes */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Popular Routes</h2>
                  <p className="text-gray-400 dark:text-slate-500 text-sm mt-0.5">Click any card to auto-fill your search</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                  Trending
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shuffledRoutes.map((route) => (
                  <RouteCard
                    key={`${route.from}-${route.to}`}
                    route={route}
                    onSelect={handleRouteSelect}
                  />
                ))}
              </div>
            </section>

            {/* Airline Partner Showcase */}
            <section className="mb-12 overflow-hidden relative">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Partner Airlines</h2>
                  <p className="text-gray-400 dark:text-slate-500 text-sm mt-0.5">We search across all major Indian carriers</p>
                </div>
                <span className="text-xs bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold px-3 py-1.5 rounded-full border border-blue-100 dark:border-slate-800">
                  8 Airlines
                </span>
              </div>
              <div 
                className="relative w-full flex overflow-hidden py-4"
                style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
              >
                <div className="flex gap-4 animate-scroll-x w-max hover:[animation-play-state:paused]">
                  {[...FEATURED_AIRLINES, ...FEATURED_AIRLINES, ...FEATURED_AIRLINES].map((a, i) => (
                    <div key={`${a.key}-${i}`} className="w-32 sm:w-40 flex-shrink-0">
                      <AirlineCard airline={a} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Destination Image Banner */}
            <section className="mb-12 rounded-3xl overflow-hidden relative" style={{ height: 260 }}>
              <img
                src="/destinations.png"
                alt="India Destinations"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,90,0.75) 0%, rgba(37,99,235,0.40) 50%, transparent 100%)" }} />
              <div className="absolute inset-0 flex flex-col justify-center px-10">
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Explore India</p>
                <h2 className="text-3xl font-black text-white mb-3 drop-shadow">
                  Discover 100+<br />Indian Destinations
                </h2>
                <p className="text-blue-100 text-sm max-w-xs">
                  From the beaches of Goa to the mountains of Himachal — we fly you there.
                </p>
              </div>
            </section>

            {/* Why Choose Us */}
            <section className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-5">Why Book With Us?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {WHY_US.map((w) => (
                  <div
                    key={w.title}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center text-gray-800 dark:text-slate-100"
                  >
                    <div className="text-3xl mb-3">{w.icon}</div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm mb-1">{w.title}</p>
                    <p className="text-gray-400 dark:text-slate-500 text-xs leading-snug">{w.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Travel Tips */}
            <section className="mb-4">
              <div
                className="rounded-3xl p-6 sm:p-8 shadow-xl"
                style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" }}
              >
                <h2 className="text-xl font-extrabold text-white mb-5 flex items-center gap-2">
                  Smart Travel Tips
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TRAVEL_TIPS.map((t, i) => (
                    <div
                      key={i}
                      className="relative rounded-2xl overflow-hidden group min-h-[160px] flex items-end p-4 hover:-translate-y-1 transition-all"
                      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    >
                      <img src={t.img} alt="tip" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 100%)" }} />
                      <div className="relative z-10 w-full">
                        <p className="text-white text-sm font-medium leading-snug drop-shadow-md">{t.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Global animation styles */}
      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.333% - 5.33px)); }
        }
        .animate-scroll-x {
          animation: scroll-x 80s linear infinite;
        }
      `}</style>
    </div>
  );
}