import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "./contexts/Web3Context";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import CreateProperty from "./pages/CreateProperty";
import MyInvestments from "./pages/MyInvestments";
import MyProperties from "./pages/MyProperties";
import "./index.css";

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/create-property" element={<CreateProperty />} />
              <Route path="/my-investments" element={<MyInvestments />} />
              <Route path="/my-properties" element={<MyProperties />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
