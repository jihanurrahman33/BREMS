import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import { getIPFSUrl } from "../utils/ipfs";

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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((property) => {
        switch (statusFilter) {
          case "active":
            return property.isActive && !property.isFunded;
          case "funded":
            return property.isFunded && !property.isCompleted;
          case "completed":
            return property.isCompleted;
          default:
            return true;
        }
      });
    }

    setFilteredProperties(filtered);
  };

  const getStatusBadge = (property) => {
    if (property.isCompleted) {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Completed
        </span>
      );
    } else if (property.isFunded) {
      return (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          Funded
        </span>
      );
    } else {
      return (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
          Active
        </span>
      );
    }
  };

  const getProgressPercentage = (property) => {
    return (
      (parseFloat(property.currentFunding) /
        parseFloat(property.targetFunding)) *
      100
    );
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-8">
          Please connect your wallet to view available properties
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">
            Discover real estate investment opportunities
          </p>
        </div>
        <Link
          to="/create-property"
          className="btn-primary flex items-center space-x-2"
        >
          <Building2 className="h-4 w-4" />
          <span>List Property</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="funded">Funded</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Properties Found
          </h2>
          <p className="text-gray-600 mb-8">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No properties are currently listed"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link to="/create-property" className="btn-primary">
              List the First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Link
              key={property.id}
              to={`/properties/${property.id}`}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              {/* Property Image Placeholder */}
              {property.ipfsHash ? (
                <img
                  src={getIPFSUrl(property.ipfsHash)}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-primary-600" />
                </div>
              )}

              {/* Property Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {property.title}
                  </h3>
                  {getStatusBadge(property)}
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.location}</span>
                </div>

                {/* Funding Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Funding Progress</span>
                    <span className="font-medium">
                      ${parseFloat(property.currentFunding).toLocaleString()} /
                      ${parseFloat(property.targetFunding).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          getProgressPercentage(property),
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {getProgressPercentage(property).toFixed(1)}% funded
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>
                      Min: $
                      {parseFloat(property.minInvestment).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{property.totalInvestors} investors</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Deadline: {formatDate(property.deadline)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
