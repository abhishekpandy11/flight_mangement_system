import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function HotelCard({ hotel }) {
  const [rooms, setRooms] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBook = async () => {
    try {
      setLoading(true);
      const payload = {
        type: "hotel",
        reference_id: hotel.name,
        description: `${hotel.name} in ${hotel.city}`,
        seats: parseInt(rooms) // reusing the seats field for rooms
      };
      await API.post("/bookings/", payload);
      navigate("/dashboard");
    } catch {
      alert("Booking failed. Please log in and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl mb-4 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {hotel.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            City: <span className="font-medium">{hotel.city}</span>
          </p>
          {hotel.rating && (
            <p className="text-sm mt-1 text-gray-600 dark:text-slate-500">
              Rating: <span className="font-semibold text-yellow-600 dark:text-yellow-500">{hotel.rating} / 10</span>
            </p>
          )}
        </div>

        <div className="mt-4 sm:mt-0 text-right">
          {hotel.price && (
            <p className="text-blue-600 dark:text-blue-400 font-extrabold text-2xl mb-2">₹{hotel.price}</p>
          )}
          <div className="flex items-center gap-2 mb-3 justify-end">
            <label className="text-sm text-gray-600 dark:text-slate-400 font-medium">Rooms:</label>
            <input 
              type="number" 
              min="1" 
              max="5" 
              value={rooms} 
              onChange={(e) => setRooms(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg px-2 py-1 w-16 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200"
            />
          </div>
          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
