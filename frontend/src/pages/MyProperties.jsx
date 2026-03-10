import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context.jsx";
import {
  Building2,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle,
  Wallet,
  TrendingUp,
  Coins,
} from "lucide-react";
import { getIPFSUrl } from "../utils/ipfs";

const MyProperties = () => {
  const { isConnected, account, getUserProperties, getProperty } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalValue: 0,
    totalFunding: 0,
  });

  useEffect(() => {
    if (isConnected && account) {
      loadProperties();
    }
  }, [isConnected, account]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const propertyIds = await getUserProperties();
      const propertiesData = [];

      for (const id of propertyIds) {
        try {
          const property = await getProperty(id);
          propertiesData.push(property);
        } catch (error) {
          console.error(`Error loading property ${id}:`, error);
        }
      }

      setProperties(propertiesData);

      const totalValue = propertiesData.reduce(
        (sum, prop) => sum + parseFloat(prop.totalValue),
        0,
      );
      const totalFunding = propertiesData.reduce(
        (sum, prop) => sum + parseFloat(prop.currentFunding),
        0,
      );

      setStats({
        totalProperties: propertiesData.length,
        totalValue,
        totalFunding,
      });
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
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
    new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
        <p className="text-gray-500 text-sm">
          Connect your wallet to manage your properties.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-200 border-t-primary-600 mb-4" />
        <p className="text-sm text-gray-500">Loading your properties…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your crowdfunding campaigns
          </p>
        </div>
        <Link
          to="/create-property"
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>List New Property</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Building2,
            value: stats.totalProperties,
            label: "Properties",
            color: "bg-primary-50 text-primary-600",
          },
          {
            icon: TrendingUp,
            value: `${stats.totalValue.toLocaleString()} ETH`,
            label: "Total Value",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: Coins,
            value: `${stats.totalFunding.toLocaleString()} ETH`,
            label: "Funding Raised",
            color: "bg-amber-50 text-amber-600",
          },
        ].map((stat, i) => (
          <div key={i} className="card flex items-center space-x-4 p-5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No Properties Listed
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Start your journey by listing your first property.
          </p>
          <Link to="/create-property" className="btn-primary text-sm">
            List Your First Property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => {
            const progress = getProgressPercentage(property);
            const status = getStatusInfo(property);

            return (
              <div
                key={property.id}
                className="card overflow-hidden p-0 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 flex-shrink-0 relative">
                    {property.ipfsHash ? (
                      <img
                        src={getIPFSUrl(property.ipfsHash)}
                        alt={property.title}
                        className="w-full h-40 sm:h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-primary-200" />
                      </div>
                    )}
                    <span
                      className={`${status.cls} absolute top-3 left-3 text-[11px]`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {property.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">
                          {progress.toFixed(0)}% funded
                        </span>
                        <span className="font-medium text-gray-700">
                          {parseFloat(property.currentFunding).toLocaleString()}{" "}
                          /{" "}
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

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 mb-4">
                      <span className="flex items-center space-x-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{property.totalInvestors} investors</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(property.deadline)}</span>
                      </span>
                      <span>ID #{property.id}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto">
                      <Link
                        to={`/properties/${property.id}`}
                        className="btn-outline text-xs flex items-center space-x-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      {property.isFunded && !property.isCompleted && (
                        <Link
                          to={`/properties/${property.id}`}
                          className="btn-primary text-xs flex items-center space-x-1.5"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Complete</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
