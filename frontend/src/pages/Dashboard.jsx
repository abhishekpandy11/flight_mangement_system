import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

// Reliable CDN/Wikipedia URLs for airline logos
const AIRLINE_LOGOS = {
  air_india: { url: "https://images.kiwi.com/airlines/64/AI.png", bg: "#E31837", accent: "#E31837", label: "Air India" },
  indigo: { url: "https://images.kiwi.com/airlines/64/6E.png", bg: "#1A1F71", accent: "#1A1F71", label: "IndiGo" },
  spicejet: { url: "https://images.kiwi.com/airlines/64/SG.png", bg: "#E8231A", accent: "#E8231A", label: "SpiceJet" },
  vistara: { url: "https://images.kiwi.com/airlines/64/UK.png", bg: "#5C2D91", accent: "#5C2D91", label: "Vistara" },
  goair: { url: "https://images.kiwi.com/airlines/64/G8.png", bg: "#0E4194", accent: "#0E4194", label: "GoFirst" },
  airasia: { url: "https://images.kiwi.com/airlines/64/I5.png", bg: "#FF0000", accent: "#FF0000", label: "AirAsia India" },
  akasa: { url: "https://images.kiwi.com/airlines/64/QP.png", bg: "#FF6B00", accent: "#FF6B00", label: "Akasa Air" },
  air_india_express: { url: "https://images.kiwi.com/airlines/64/IX.png", bg: "#E31837", accent: "#E31837", label: "Air India Express" },
  unknown: { url: null, bg: "#6B7280", accent: "#6B7280", label: "Airline" },
};

function AirlineLogo({ logoKey, description }) {
  const [imgError, setImgError] = useState(false);
  const info = AIRLINE_LOGOS[logoKey] || AIRLINE_LOGOS.unknown;

  if (info.url && !imgError) {
    return (
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-1 shadow-sm transition-colors">
        <img
          src={info.url}
          alt="Airline"
          className="max-w-full max-h-full object-contain"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const initials = description?.split(" ")[0]?.slice(0, 2).toUpperCase() || "??";
  return (
    <div
      className="w-12 h-12 flex items-center justify-center rounded-xl text-white font-bold text-lg shadow-sm transition-colors"
      style={{ background: info.bg }}
    >
      {initials}
    </div>
  );
}

function StatusChip({ status }) {
  const cfg = {
    confirmed: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    pending: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    cancelled: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${cfg[status] || cfg.pending}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
    </span>
  );
}

/* ── Inline Confirm Modal ── */
function ConfirmModal({ onConfirm, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in border border-slate-100 dark:border-slate-800">
        <div className="text-5xl mb-4">🗑️</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Cancel Booking?</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
          This will permanently remove the booking from the database. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            id="cancel-modal-no"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-150"
          >
            Keep It
          </button>
          <button
            id="cancel-modal-yes"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-150 shadow-md"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast Notification ── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-600",
    error: "bg-red-500",
  };
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-white font-semibold text-sm shadow-xl flex items-center gap-2 ${styles[type]}`}
      style={{ animation: "slideUp 0.3s ease" }}
    >
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [cancelledHistory, setCancelledHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null); // which booking to confirm-cancel
  const [toast, setToast] = useState(null); // { message, type }

  const fetchBookings = () => {
    API.get("/bookings")
      .then((res) => setBookings(res.data))
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();

    // Listen for refresh signals from Chatbot
    const handleRefresh = () => {
      console.log("Refreshing bookings due to AI action...");
      fetchBookings();
    };

    window.addEventListener("refresh-bookings", handleRefresh);
    return () => window.removeEventListener("refresh-bookings", handleRefresh);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Step 1: user clicks Cancel → show confirm modal
  const requestCancel = (bookingId) => {
    setConfirmingId(bookingId);
  };

  // Step 2: user confirms in modal → actually cancel
  const handleCancel = async () => {
    const bookingId = confirmingId;
    setConfirmingId(null);
    try {
      setCancellingId(bookingId);
      await API.post(`/bookings/cancel/${bookingId}`);

      // Move to cancelled history
      const cancelledBooking = bookings.find((b) => b.id === bookingId);
      if (cancelledBooking) {
        setCancelledHistory((prev) => [{ ...cancelledBooking, status: "cancelled" }, ...prev]);
      }

      // Remove from active bookings
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      showToast("Booking cancelled successfully.", "success");
    } catch (err) {
      const detail = err?.response?.data?.detail || "Failed to cancel booking. Please try again.";
      showToast(detail, "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Confirm Modal */}
      {confirmingId !== null && (
        <ConfirmModal
          onConfirm={handleCancel}
          onClose={() => setConfirmingId(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md"
              style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
            >
              🗂️
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Bookings</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Manage and track all your reservations</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {!loading && !error && (bookings.length > 0 || cancelledHistory.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active", value: bookings.length, icon: "✅", color: "#16a34a", darkColor: "#22c55e" },
              { label: "Cancelled (Session)", value: cancelledHistory.length, icon: "❌", color: "#dc2626", darkColor: "#ef4444" },
              { label: "Total Handled", value: bookings.length + cancelledHistory.length, icon: "📋", color: "#2563eb", darkColor: "#3b82f6" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-center shadow-sm border border-gray-100 dark:border-slate-800 transition-colors"
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-2xl font-extrabold" style={{ color: document.documentElement.classList.contains('dark') ? s.darkColor : s.color }}>
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading / Error states */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-blue-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 dark:text-slate-500 font-medium tracking-wide">Loading your bookings…</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl p-4 text-center text-sm mb-4 font-medium">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && cancelledHistory.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="text-6xl mb-4">🛫</div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-white mb-2">No bookings yet</h2>
            <p className="text-gray-400 dark:text-slate-500 mb-6">Search and book your first flight or hotel!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🔍 Search Flights
            </Link>
          </div>
        )}

        {/* Active Bookings List */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
              Active Reservations
            </h2>
            <div className="space-y-4">
              {bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  b={b}
                  onCancel={() => requestCancel(b.id)}
                  cancellingId={cancellingId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cancelled History Section */}
        {!loading && !error && cancelledHistory.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-lg font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-6 bg-gray-300 dark:bg-slate-700 rounded-full" />
              Cancelled Flights (Recent)
            </h2>
            <div className="space-y-4 opacity-75 grayscale-[0.5]">
              {cancelledHistory.map((b) => (
                <BookingCard key={`cancel-${b.id}`} b={b} isCancelled />
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-slate-500 italic">
              Note: Cancelled records are removed from the database and will clear on refresh.
            </p>
          </div>
        )}

        {/* Footer CTA */}
        {!loading && (
          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm transition-colors"
            >
              ← Search more flights
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>
    </div>
  );
}

function BookingCard({ b, onCancel, cancellingId, isCancelled }) {
  const isFlightBooking = b.type === "flight";
  const bgImg = isFlightBooking 
    ? "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80" 
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";

  return (
    <div
      className={`rounded-3xl overflow-hidden shadow-sm transition-all duration-300 border flex flex-col sm:flex-row ${
        isCancelled 
          ? "border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30" 
          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      {/* Dynamic Image Section */}
      <div className="relative w-full sm:w-1/3 h-48 sm:h-auto overflow-hidden flex-shrink-0">
        <img 
          src={bgImg} 
          alt="Booking context" 
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${isCancelled ? "grayscale opacity-30" : "opacity-80 dark:opacity-60"}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-slate-900/90 via-black/40 to-transparent sm:bg-gradient-to-r" />
        <div className="absolute bottom-4 left-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-6 flex flex-row sm:flex-col items-center sm:items-start gap-4">
            <div className="shadow-2xl rounded-xl bg-white/10 dark:bg-white/5 p-2 backdrop-blur-md border border-white/20 dark:border-white/10">
               {isFlightBooking ? (
                 <AirlineLogo logoKey={b.airline_logo} description={b.description} />
               ) : (
                 <div className="w-12 h-12 bg-white dark:bg-slate-950 text-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                   🏨
                 </div>
               )}
            </div>
            <div className="text-white drop-shadow-lg">
               <p className="font-extrabold text-xl tracking-tight leading-none mb-1">{isFlightBooking ? "Flight" : "Stay"}</p>
               <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">{b.status || "Confirmed"}</p>
            </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between relative bg-white dark:bg-slate-900 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          {/* Main info */}
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono bg-gray-100 dark:bg-slate-950 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-800">ID: #{b.id}</span>
              <StatusChip status={b.status} />
            </div>

            <p className={`text-xl font-black leading-snug mb-3 tracking-tight ${isCancelled ? "text-gray-500 dark:text-slate-600" : "text-gray-900 dark:text-white"}`}>
              {b.description}
            </p>
            
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-gray-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="opacity-50">🔖</span> 
                <span>Ref: <strong className="font-mono text-gray-800 dark:text-slate-200">{b.reference_id}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-50">💺</span>
                <span>Seats: <strong className="text-gray-800 dark:text-slate-200">{b.seats}</strong></span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="opacity-50">📅</span>
                <span>Booked on: <strong className="text-gray-800 dark:text-slate-200 font-bold">
                  {new Date(b.date_booked).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right/Bottom: cancel button & actions */}
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/60">
          {!isCancelled && (
            <button
              id={`cancel-btn-${b.id}`}
              onClick={onCancel}
              disabled={cancellingId === b.id}
              className="w-full sm:w-auto text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-6 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200 font-black disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {cancellingId === b.id ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  Cancelling…
                </span>
              ) : (
                "Cancel Booking"
              )}
            </button>
          )}
          {isCancelled && (
             <span className="text-sm font-semibold text-gray-400 dark:text-slate-600 italic">This booking has been cancelled and removed.</span>
          )}
        </div>
      </div>
    </div>
  );
}
