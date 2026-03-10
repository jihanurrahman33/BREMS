import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context.jsx";
import { getIPFSUrl } from "../utils/ipfs";
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Coins,
  TrendingUp,
  ShieldCheck,
  Wallet,
  ExternalLink,
} from "lucide-react";

const PropertyDetail = () => {
  const { id } = useParams();
  const {
    isConnected,
    account,
    getProperty,
    investInProperty,
    completeProperty,
    cancelProperty,
    claimRefund,
    contract,
    isLoading,
  } = useWeb3();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [userInvestment, setUserInvestment] = useState("0");

  useEffect(() => {
    if (isConnected && id) {
      loadProperty();
    }
  }, [isConnected, id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const propertyData = await getProperty(id);
      setProperty(propertyData);
      if (account && contract) {
        try {
          const inv = await contract.getUserInvestment(id, account);
          const { ethers } = await import("ethers");
          setUserInvestment(ethers.formatEther(inv));
        } catch {
          setUserInvestment("0");
        }
      }
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) return;
    try {
      await investInProperty(id, investmentAmount);
      setShowInvestmentModal(false);
      setInvestmentAmount("");
      loadProperty();
    } catch (error) {
      console.error("Error investing:", error);
    }
  };

  const handleCompleteProperty = async () => {
    try {
      await completeProperty(id);
      loadProperty();
    } catch (error) {
      console.error("Error completing property:", error);
    }
  };

  const handleCancelProperty = async () => {
    try {
      await cancelProperty(id);
      loadProperty();
    } catch (error) {
      console.error("Error cancelling property:", error);
    }
  };

  const handleClaimRefund = async () => {
    try {
      await claimRefund(id);
      loadProperty();
    } catch (error) {
      console.error("Error claiming refund:", error);
    }
  };

  const getProgressPercentage = () => {
    if (!property) return 0;
    return (
      (parseFloat(property.currentFunding) /
        parseFloat(property.targetFunding)) *
      100
    );
  };

  const formatDate = (timestamp) =>
    new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const daysUntil = (timestamp) => {
    const diff = parseInt(timestamp) * 1000 - Date.now();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  const shortAddr = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  const isOwner =
    property &&
    account &&
    property.owner.toLowerCase() === account.toLowerCase();
  const isExpired =
    property &&
    !property.isFunded &&
    !property.isCompleted &&
    !property.isCancelled &&
    parseInt(property.deadline) * 1000 < Date.now();
  const canInvest =
    property &&
    property.isActive &&
    !property.isFunded &&
    !property.isCancelled &&
    !isExpired &&
    !isOwner;
  const canComplete =
    property && property.isFunded && !property.isCompleted && isOwner;
  const canCancel =
    property &&
    !property.isFunded &&
    !property.isCompleted &&
    !property.isCancelled &&
    (isOwner || isExpired);
  const canClaimRefund =
    property && property.isCancelled && parseFloat(userInvestment) > 0;

  const statusMap = {
    completed: {
      label: "Completed",
      cls: "badge-green",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      cls: "badge-red",
      icon: XCircle,
    },
    funded: {
      label: "Funded",
      cls: "badge-blue",
      icon: TrendingUp,
    },
    expired: {
      label: "Expired",
      cls: "badge-orange",
      icon: AlertTriangle,
    },
    active: {
      label: "Active",
      cls: "badge-yellow",
      icon: Clock,
    },
  };

  const getStatus = () => {
    if (!property) return statusMap.active;
    if (property.isCompleted) return statusMap.completed;
    if (property.isCancelled) return statusMap.cancelled;
    if (property.isFunded) return statusMap.funded;
    if (isExpired) return statusMap.expired;
    return statusMap.active;
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
        <p className="text-gray-500 text-sm">
          Connect your wallet to view property details.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-200 border-t-primary-600 mb-4" />
        <p className="text-sm text-gray-500">Loading property…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
          <XCircle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Property Not Found
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          The property you're looking for doesn't exist.
        </p>
        <Link to="/properties" className="btn-primary text-sm">
          Browse Properties
        </Link>
      </div>
    );
  }

  const status = getStatus();
  const StatusIcon = status.icon;
  const progress = getProgressPercentage();
  const remaining = daysUntil(property.deadline);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        to="/properties"
        className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Properties
      </Link>

      {/* ===== Hero Section ===== */}
      <div className="card overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="lg:w-5/12 relative">
            {property.ipfsHash ? (
              <img
                src={getIPFSUrl(property.ipfsHash)}
                alt={property.title}
                className="w-full h-64 lg:h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=No+Image";
                }}
              />
            ) : (
              <div className="w-full h-64 lg:h-full min-h-[280px] bg-gradient-to-br from-primary-50 via-primary-100 to-blue-50 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-primary-200" />
              </div>
            )}
            <span
              className={`${status.cls} absolute top-4 left-4 flex items-center space-x-1.5 text-xs`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{status.label}</span>
            </span>
          </div>

          {/* Info panel */}
          <div className="lg:w-7/12 p-6 sm:p-8 flex flex-col">
            {/* Title row */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
              {property.description}
            </p>

            {/* Funding progress */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">
                    Raised of {parseFloat(property.targetFunding)} ETH goal
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {parseFloat(property.currentFunding).toLocaleString()} ETH
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary-600">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{property.totalInvestors} investors</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {remaining > 0
                      ? `${remaining} day${remaining > 1 ? "s" : ""} left`
                      : `Ended ${formatDate(property.deadline)}`}
                  </span>
                </span>
              </div>
            </div>

            {/* My investment callout */}
            {parseFloat(userInvestment) > 0 && (
              <div className="flex items-center space-x-3 bg-primary-50 rounded-xl px-4 py-3 mb-6 ring-1 ring-primary-100">
                <ShieldCheck className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-primary-700">Your investment: </span>
                  <span className="font-semibold text-primary-800">
                    {userInvestment} ETH
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-auto">
              {canInvest && (
                <button
                  onClick={() => setShowInvestmentModal(true)}
                  className="btn-primary flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <Coins className="h-4 w-4" />
                  <span>Invest Now</span>
                </button>
              )}

              {canComplete && (
                <button
                  onClick={handleCompleteProperty}
                  className="btn-outline flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Property</span>
                </button>
              )}

              {canCancel && (
                <button
                  onClick={handleCancelProperty}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors text-sm shadow-sm"
                  disabled={isLoading}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {isExpired ? "Cancel Expired Property" : "Cancel Property"}
                  </span>
                </button>
              )}

              {canClaimRefund && (
                <button
                  onClick={handleClaimRefund}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors text-sm shadow-sm"
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Claim Refund ({userInvestment} ETH)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Alert banners ===== */}
      {isExpired && !property.isCancelled && (
        <div className="flex items-start space-x-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-orange-800 text-sm">
              Funding Deadline Expired
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              This property didn't reach its funding target. Cancel the property
              to enable investor refunds.
            </p>
          </div>
        </div>
      )}

      {property.isCancelled && (
        <div className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 text-sm">
              Property Cancelled
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              This property has been cancelled. Investors can claim full refunds
              of their contributions.
            </p>
          </div>
        </div>
      )}

      {/* ===== Detail Grid ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Financial Information */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
            Financial Information
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Total Property Value",
                value: `${parseFloat(
                  property.totalValue,
                ).toLocaleString()} ETH`,
              },
              {
                label: "Target Funding",
                value: `${parseFloat(
                  property.targetFunding,
                ).toLocaleString()} ETH`,
              },
              {
                label: "Current Funding",
                value: `${parseFloat(
                  property.currentFunding,
                ).toLocaleString()} ETH`,
              },
              {
                label: "Min Investment",
                value: `${parseFloat(
                  property.minInvestment,
                ).toLocaleString()} ETH`,
              },
              {
                label: "Max Investment",
                value: `${parseFloat(
                  property.maxInvestment,
                ).toLocaleString()} ETH`,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Information */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
            Campaign Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500">Property Owner</span>
              <span className="text-sm font-medium text-gray-900 font-mono flex items-center space-x-1">
                <span>{shortAddr(property.owner)}</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500">Total Investors</span>
              <span className="text-sm font-medium text-gray-900">
                {property.totalInvestors}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500">Funding Deadline</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(property.deadline)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">Property ID</span>
              <span className="text-sm font-medium text-gray-900">
                #{property.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Investment Modal ===== */}
      {showInvestmentModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setShowInvestmentModal(false)
          }
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Invest in Property
              </h3>
              <p className="text-xs text-gray-500 mt-1">{property.title}</p>
            </div>

            <form onSubmit={handleInvest} className="px-6 py-5 space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Investment Amount (ETH)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={`${property.minInvestment} – ${property.maxInvestment}`}
                  step="0.01"
                  min={property.minInvestment}
                  max={property.maxInvestment}
                  className="input-field text-sm"
                  required
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Range: {parseFloat(property.minInvestment)} –{" "}
                  {parseFloat(property.maxInvestment)} ETH
                </p>
              </div>

              {investmentAmount && parseFloat(investmentAmount) > 0 && (
                <div className="bg-primary-50 rounded-xl px-4 py-3 ring-1 ring-primary-100">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-primary-600" />
                    <span className="text-sm text-primary-700">
                      Estimated reward:{" "}
                      <span className="font-bold">
                        {(parseFloat(investmentAmount) * 1000).toLocaleString()}{" "}
                        RECT
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvestmentModal(false)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                      <span>Processing…</span>
                    </span>
                  ) : (
                    "Confirm Investment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
