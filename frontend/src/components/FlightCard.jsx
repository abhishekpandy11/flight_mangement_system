import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

// Each key maps to the airline logo key sent from backend.
// These are reliable CDN/Wikipedia URLs that correctly show the airline's own logo.
const AIRLINE_LOGOS = {
  air_india: { url: "https://images.kiwi.com/airlines/64/AI.png", bg: "#E31837", accent: "#E31837", label: "Air India" },
  indigo: { url: "https://images.kiwi.com/airlines/64/6E.png", bg: "#1A1F71", accent: "#1A1F71", label: "IndiGo" },
  spicejet: { url: "https://images.kiwi.com/airlines/64/SG.png", bg: "#E8231A", accent: "#E8231A", label: "SpiceJet" },
  vistara: { url: "https://images.kiwi.com/airlines/64/UK.png", bg: "#5C2D91", accent: "#5C2D91", label: "Vistara" },
  goair: { url: "https://images.kiwi.com/airlines/64/G8.png", bg: "#0E4194", accent: "#0E4194", label: "GoFirst" },
  airasia: { url: "https://images.kiwi.com/airlines/64/I5.png", bg: "#FF0000", accent: "#FF0000", label: "AirAsia India" },
  akasa: { url: "https://images.kiwi.com/airlines/64/QP.png", bg: "#FF6B00", accent: "#FF6B00", label: "Akasa Air" },
  air_india_express: { url: "https://images.kiwi.com/airlines/64/IX.png", bg: "#E31837", accent: "#E31837", label: "Air India Express" },
  alliance_air: { url: null, bg: "#003087", accent: "#003087", label: "Alliance Air" },
  starair: { url: null, bg: "#00529B", accent: "#00529B", label: "StarAir" },
  unknown: { url: null, bg: "#6B7280", accent: "#6B7280", label: "Airline" },
};

// Fallback colored initials badge
function AirlineBadge({ name, logoKey }) {
  const isDark = document.documentElement.classList.contains('dark');
  const [imgError, setImgError] = useState(false);
  const info = AIRLINE_LOGOS[logoKey] || AIRLINE_LOGOS.unknown;
  const logoUrl = info.url;

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (logoUrl && !imgError) {
    return (
      <div
        className="w-16 h-16 flex items-center justify-center rounded-2xl border border-gray-100 dark:border-slate-800 p-1.5 shadow-md bg-white dark:bg-slate-950"
        style={{ boxShadow: isDark ? "none" : `0 4px 14px ${info.accent}22` }}
      >
        <img
          src={logoUrl}
          alt={name || "Airline"}
          className="max-w-full max-h-full object-contain"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      className="w-16 h-16 flex items-center justify-center rounded-2xl text-white font-bold text-2xl shadow-md"
      style={{ background: info.bg }}
    >
      {initials}
    </div>
  );
}

function formatTime(isoStr) {
  if (!isoStr || isoStr === "N/A") return "—";
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoStr;
  }
}

function formatDate(isoStr) {
  if (!isoStr || isoStr === "N/A") return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function StatusBadge({ status }) {
  const cfg = {
    scheduled: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", label: "Scheduled" },
    active: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", label: "Active" },
    cancelled: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", dot: "bg-red-500", label: "Cancelled" },
    delayed: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-400", label: "Delayed" },
  };
  const s = cfg[status?.toLowerCase()] || cfg.scheduled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function FlightCard({ flight }) {
  const isDark = document.documentElement.classList.contains('dark');
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const navigate = useNavigate();

  const info = AIRLINE_LOGOS[flight.airline_logo] || AIRLINE_LOGOS.unknown;

  const handleBook = async () => {
    try {
      setLoading(true);
      const payload = {
        type: "flight",
        airline_logo: flight.airline_logo,
        reference_id: flight.flight_number || "unknown",
        description: `${flight.airline} ${flight.flight_number} (${
          flight.departure_city || flight.dep_iata || "—"
        } → ${flight.arrival_city || flight.arr_iata || "—"})`,
        seats: parseInt(seats),
      };
      await API.post("/bookings/", payload);
      setBooked(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      alert("Booking failed. Please log in and try again.");
      setLoading(false);
    }
  };

  const depCity = flight.departure_city || flight.dep_iata || "—";
  const arrCity = flight.arrival_city || flight.arr_iata || "—";
  const depTime = formatTime(flight.departure);
  const arrTime = formatTime(flight.arrival);
  const depDate = formatDate(flight.departure);

  return (
    <div
      className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden mb-5 transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-800"
      style={{
        boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : `0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Accent strip at top */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${info.accent}, ${info.accent}88)` }}
      />

      {/* Card body */}
      <div className="p-5">
        {/* Top row: airline info + price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AirlineBadge name={flight.airline} logoKey={flight.airline_logo} />
            <div>
              <p className="font-extrabold text-gray-900 dark:text-white text-base leading-tight">
                {flight.airline || "Unknown Airline"}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 font-mono tracking-wide">
                {flight.flight_number}
                {flight.airline_code && (
                  <span className="text-gray-300 dark:text-slate-700 mx-1">·</span>
                )}
                {flight.airline_code}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{depDate}</p>
            </div>
          </div>

          <div className="text-right">
            <p
              className="text-2xl font-black"
              style={{ color: info.accent || "#2563EB" }}
            >
              ₹{(flight.price || 0).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">per seat</p>
          </div>
        </div>

        {/* Route strip */}
        <div
          className="rounded-2xl px-5 py-4 mb-4 flex items-center justify-between bg-[#F8F9FF] dark:bg-slate-950/50"
        >
          {/* Departure */}
          <div className="text-center min-w-[80px]">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{depTime}</p>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mt-0.5">{depCity}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">{flight.dep_iata}</p>
          </div>

          {/* Flight path visual */}
          <div className="flex-1 flex flex-col items-center mx-4">
            <div className="flex items-center w-full gap-1">
              <div className="h-px flex-1" style={{ background: `${info.accent}55` }} />
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-sm"
                style={{ background: info.accent }}
              >
                ✈
              </div>
              <div className="h-px flex-1" style={{ background: `${info.accent}55` }} />
            </div>
            {flight.duration && flight.duration !== "N/A" && (
              <p className="text-xs text-gray-400 mt-1.5 font-medium">{flight.duration}</p>
            )}
            <p className="text-xs text-gray-300 mt-0.5">Direct</p>
          </div>

          {/* Arrival */}
          <div className="text-center min-w-[80px]">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{arrTime}</p>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mt-0.5">{arrCity}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">{flight.arr_iata}</p>
          </div>
        </div>

        {/* Bottom: status + seats + book */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={flight.status} />

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">Seats:</label>
              <input
                type="number"
                min="1"
                max="9"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg px-2 py-1 w-14 text-center text-sm font-semibold focus:outline-none focus:ring-2 text-gray-700 dark:text-slate-200"
                style={{ "--tw-ring-color": info.accent }}
              />
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={loading || booked}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 active:scale-95"
            style={{
              background: booked
                ? "#16a34a"
                : `linear-gradient(135deg, ${info.accent}, ${info.accent}CC)`,
              boxShadow: booked ? "none" : `0 4px 12px ${info.accent}44`,
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Booking…
              </span>
            ) : booked ? (
              "✓ Booked!"
            ) : (
              "Book Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
