import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context.jsx";
import {
  Search,
  Building2,
  MapPin,
  Users,
  Calendar,
  Plus,
  Wallet,
  SlidersHorizontal,
} from "lucide-react";
import { getIPFSUrl } from "../utils/ipfs";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "funded", label: "Funded" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const Properties = () => {
  const { isConnected, getAllProperties } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadProperties();
  }, [isConnected]);

  const loadProperties = async () => {
    if (!isConnected) return;
    try {
      setLoading(true);
      const allProperties = await getAllProperties();
      setProperties(allProperties);
      setFilteredProperties(allProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, statusFilter]);

  const filterProperties = () => {
    let filtered = properties;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((property) => {
        const isExpired =
          !property.isFunded &&
          !property.isCompleted &&
          !property.isCancelled &&
          parseInt(property.deadline) * 1000 < Date.now();
        switch (statusFilter) {
          case "active":
            return property.isActive && !property.isFunded && !isExpired;
          case "funded":
            return property.isFunded && !property.isCompleted;
          case "completed":
            return property.isCompleted;
          case "cancelled":
            return property.isCancelled;
          case "expired":
            return isExpired;
          default:
            return true;
        }
      });
    }

    setFilteredProperties(filtered);
  };

  const getStatusInfo = (property) => {
    const isExpired =
      !property.isFunded &&
      !property.isCompleted &&
      !property.isCancelled &&
      parseInt(property.deadline) * 1000 < Date.now();
    if (property.isCompleted) return { label: "Completed", cls: "badge-green" };
    if (property.isCancelled) return { label: "Cancelled", cls: "badge-red" };
    if (property.isFunded) return { label: "Funded", cls: "badge-blue" };
    if (isExpired) return { label: "Expired", cls: "badge-orange" };
    return { label: "Active", cls: "badge-yellow" };
  };

  const getProgressPercentage = (property) =>
    (parseFloat(property.currentFunding) / parseFloat(property.targetFunding)) *
    100;

  const formatDate = (timestamp) =>
    new Date(parseInt(timestamp) * 1000).toLocaleDateString();

  const daysUntil = (timestamp) => {
    const diff = parseInt(timestamp) * 1000 - Date.now();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  /* ---------- empty / loading states ---------- */
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <Wallet className="h-7 w-7 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-500 text-sm max-w-xs text-center">
          Please connect your wallet to browse available investment properties.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-200 border-t-primary-600 mb-4" />
        <p className="text-sm text-gray-500">Loading properties…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "listing" : "listings"} available
          </p>
        </div>
        <Link
          to="/create-property"
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>List Property</span>
        </Link>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 flex-shrink-0 hidden sm:block" />
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === opt.value
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Grid ---------- */}
      {filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No Properties Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "No properties are currently listed."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link to="/create-property" className="btn-primary text-sm">
              List the First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => {
            const progress = getProgressPercentage(property);
            const status = getStatusInfo(property);
            const remaining = daysUntil(property.deadline);

            return (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="card-hover group overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative">
                  {property.ipfsHash ? (
                    <img
                      src={getIPFSUrl(property.ipfsHash)}
                      alt={property.title}
                      className="w-full h-44 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-primary-300" />
                    </div>
                  )}
                  <span
                    className={`${status.cls} absolute top-3 left-3 text-[11px]`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1 space-y-3">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {property.title}
                  </h3>

                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">
                        {progress.toFixed(0)}% funded
                      </span>
                      <span className="font-medium text-gray-700">
                        {parseFloat(property.currentFunding).toLocaleString()} /{" "}
                        {parseFloat(property.targetFunding).toLocaleString()}{" "}
                        ETH
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                    <span className="flex items-center space-x-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{property.totalInvestors} investors</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {remaining > 0
                          ? `${remaining}d left`
                          : formatDate(property.deadline)}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Properties;
