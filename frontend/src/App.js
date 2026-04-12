import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ChatWidget from "./components/Chatbot/ChatWidget";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FlightSearch from "./pages/FlightSearch";
import HotelSearch from "./pages/HotelSearch";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PrivateRoute><FlightSearch /></PrivateRoute>} />
        <Route path="/hotels" element={<PrivateRoute><HotelSearch /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;
