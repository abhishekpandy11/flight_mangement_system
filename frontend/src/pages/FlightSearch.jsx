import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import FlightCard from "../components/FlightCard";

/* ─────────────────────────────────────────────
   DATA
 ───────────────────────────────────────────── */
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
  { from: "Delhi",   to: "Mumbai",    img: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=500&q=80", duration: "2h 15m", price: "₹3,499", tag: "Most Popular" },
  { from: "Mumbai",  to: "Goa",       img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80", duration: "1h 05m", price: "₹3,199", tag: "Beach Escape" },
  { from: "Delhi",   to: "Bangalore", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&q=80", duration: "2h 45m", price: "₹5,299", tag: "Tech Hub" },
  { from: "Mumbai",  to: "Bangalore", img: "https://images.unsplash.com/photo-1580019542155-247062e19ce4?w=500&q=80", duration: "1h 40m", price: "₹4,199", tag: "Business" },
  { from: "Chennai", to: "Hyderabad", img: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=500&q=80", duration: "1h 10m", price: "₹2,999", tag: "Quick Hop" },
  { from: "Kolkata", to: "Delhi",     img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop", duration: "2h 30m", price: "₹4,799", tag: "Classic Route" },
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
  { img: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80", tip: "Book 6–8 weeks early for domestic flights to get the best rates." },
  { img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80", tip: "Travel light — most budget carriers charge for check-in baggage." },
  { img: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80", tip: "Download the airline app for real-time gate & delay notifications." },
  { img: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80", tip: "Carry snacks — budget airlines often serve meals at a premium." },
];

const DESTINATION_IMAGES = [
  { url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80", title: "Agra" },
  { url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80", title: "Goa" },
  { url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80", title: "Himachal" },
  { url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80", title: "Kerala" },
];

/* ─────────────────────────────────────────────
   COMPONENTS
 ───────────────────────────────────────────── */
function AirlineCard({ airline }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
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
          <img src={airline.url} alt={airline.name} className="w-full h-full object-contain" onError={() => setImgError(true)} referrerPolicy="no-referrer" />
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
      {imgOk ? (
        <img src={route.img} alt={`${route.from} to ${route.to}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImgOk(false)} />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)" }} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
          {route.tag}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-extrabold text-base leading-tight drop-shadow">{route.from} → {route.to}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-white/80 font-medium">⏱ {route.duration}</span>
          <span className="text-xs font-bold text-amber-300">from {route.price}</span>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "rgba(37,99,235,0.85)", backdropFilter: "blur(8px)" }}>Search Flights →</span>
      </div>
    </button>
  );
}

function DestinationSlideshow() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => { setIndex((prev) => (prev + 1) % DESTINATION_IMAGES.length); }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="mb-12 rounded-[2rem] overflow-hidden relative shadow-xl shadow-slate-200 dark:shadow-none border border-white dark:border-slate-800" style={{ height: 300 }}>
      {DESTINATION_IMAGES.map((img, i) => (
        <div key={img.url} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
          <img src={img.url} alt={img.title} className="w-full h-full object-cover transform-gpu" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-12 z-20">
        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Explore India</p>
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 drop-shadow-2xl leading-tight max-w-xl">
          Discover 100+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Indian Destinations</span>
        </h2>
        <p className="text-slate-200 text-sm max-w-md font-medium leading-relaxed opacity-95">From Goa beaches to Himachal mountains &mdash; we fly you there in premium comfort.</p>
        <div className="absolute bottom-8 left-12 flex gap-3">
          {DESTINATION_IMAGES.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBar({ count, source, destination, onClear }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm border border-gray-100 dark:border-slate-800 mb-6 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-lg">{count}</div>
        <div>
          <p className="font-bold text-gray-800 dark:text-white text-sm">Flights Found</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{source} → {destination}</p>
        </div>
      </div>
      <button onClick={onClear} className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors">← New Search</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
 ───────────────────────────────────────────── */
export default function FlightSearch() {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  const sourceRef = useRef(null);
  const searchCardRef = useRef(null);

  const shuffledRoutes = useMemo(() => [...POPULAR_ROUTES].sort(() => 0.5 - Math.random()), []);
  useEffect(() => { sourceRef.current?.focus(); }, []);

  const swap = () => { const s = source; setSource(destination); setDestination(s); };

  const searchFlights = async () => {
    if (!source.trim() || !destination.trim()) { setError("Please enter both source and destination."); return; }
    try {
      setLoading(true); setError(""); setSearched(true);
      const res = await API.get("/flights/search", { params: { source, destination } });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.flights || [];
      setFlights(list.slice(0, 10));
    } catch { setError("Failed to fetch flights. Please try again."); }
    finally { setLoading(false); }
  };

  const clearSearch = () => { setSearched(false); setFlights([]); setSource(""); setDestination(""); setError(""); };

  const handleRouteSelect = (from, to) => {
    setSource(from); setDestination(to); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      if (from.trim() && to.trim()) {
        setLoading(true); setError(""); setSearched(true);
        API.get("/flights/search", { params: { source: from, destination: to } })
          .then((res) => { const data = res.data; setFlights((Array.isArray(data) ? data : data.flights || []).slice(0, 10)); })
          .catch(() => setError("Failed to fetch flights."))
          .finally(() => setLoading(false));
      }
    }, 500);
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden" style={{ minHeight: 400 }}>
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=1920&q=80" alt="Sky" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(15,23,42,0.1) 40%, rgba(15,23,42,0.5) 100%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">Find Your Perfect <span className="text-blue-400">Flight</span></h1>
            <p className="text-slate-300 text-lg max-w-lg mx-auto font-light">Search across Top Airlines &mdash; best fares and instant booking.</p>
          </div>
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full p-1.5 gap-1 bg-slate-800/40 dark:bg-slate-900/60 backdrop-blur-md border border-slate-700/30">
              {["flights", "hotels"].map((tab) => (
                <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "hotels") navigate("/hotels"); }} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-md shadow-blue-500/25" : "text-slate-300 hover:text-white"}`}>
                  {tab === "flights" ? "Flights" : "Hotels"}
                </button>
              ))}
            </div>
          </div>
          <div ref={searchCardRef} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-5 sm:p-6 border border-white/60 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="flex-1 relative group">
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">From</label>
                <input ref={sourceRef} id="search-from" placeholder="Departure city…" value={source} onChange={(e) => setSource(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchFlights()} className="w-full border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none bg-gray-50/50 dark:bg-slate-950" />
              </div>
              <div className="flex items-end justify-center pb-0.5"><button onClick={swap} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center transition-all active:scale-90" style={{ marginTop: 18 }}>⇄</button></div>
              <div className="flex-1 relative group">
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1.5 ml-1">To</label>
                <input id="search-to" placeholder="Arrival city…" value={destination} onChange={(e) => setDestination(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchFlights()} className="w-full border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none bg-gray-50/50 dark:bg-slate-950" />
              </div>
              <div className="flex items-end"><button onClick={searchFlights} disabled={loading} className="w-full sm:w-auto whitespace-nowrap text-sm font-extrabold text-white px-8 py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", marginTop: 22 }}>Search Flights</button></div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 font-medium">⚠️ {error}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 mt-8">
        {searched && (
          <>
            <StatsBar count={loading ? "…" : flights.length} source={source} destination={destination} onClear={clearSearch} />
            {!loading && flights.length === 0 && !error && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-700 mb-2">No Flights Found</h2>
                <button onClick={clearSearch} className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl">← Try Again</button>
              </div>
            )}
            {flights.map((f, i) => <FlightCard key={i} flight={f} />)}
          </>
        )}
        {!searched && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-5">Popular Routes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{shuffledRoutes.map((route) => <RouteCard key={`${route.from}-${route.to}`} route={route} onSelect={handleRouteSelect} />)}</div>
            </section>
            <DestinationSlideshow />
            <section className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-5">Why Book With Us?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{WHY_US.map((w) => <div key={w.title} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center"><p className="font-bold text-gray-800 dark:text-white text-sm mb-1">{w.title}</p><p className="text-gray-400 text-xs">{w.desc}</p></div>)}</div>
            </section>
          </>
        )}
      </div>

      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 text-slate-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1">
              <span className="text-xl font-black text-white italic">SKYROUTE</span>
              <p className="text-sm leading-relaxed mb-6 text-slate-400 mt-4">Premium flight booking experience across all major Indian carriers.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Explore</h4>
              <ul className="space-y-4 text-sm">
                <li><button type="button" className="hover:text-blue-400 transition-colors">Popular Routes</button></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Partner Airlines</button></li>
                <li><Link to="/hotels" className="hover:text-blue-400 transition-colors">Hotels & Stays</Link></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Smart Travel Tips</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><button type="button" className="hover:text-blue-400 transition-colors">Help Center</button></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Booking Guide</button></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Refund Policy</button></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><button type="button" className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Cookie Policy</button></li>
                <li><button type="button" className="hover:text-blue-400 transition-colors">Security</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} SkyRoute Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

