import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import { getIPFSUrl } from "../utils/ipfs";
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
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
      // Fetch user's investment in this property
      if (account && contract) {
        try {
          const inv = await contract.getUserInvestment(id, account);
          const { ethers } = await import("ethers");
          setUserInvestment(ethers.formatEther(inv));
        } catch (e) {
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

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      return;
    }

    try {
      await investInProperty(id, investmentAmount);
      setShowInvestmentModal(false);
      setInvestmentAmount("");
      loadProperty(); // Reload property data
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

  const getStatusIcon = () => {
    if (property.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (property.isCancelled) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    } else if (property.isFunded) {
      return <Clock className="h-5 w-5 text-blue-600" />;
    } else if (isExpired) {
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    } else {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    if (property.isCompleted) {
      return "Completed";
    } else if (property.isCancelled) {
      return "Cancelled";
    } else if (property.isFunded) {
      return "Funded";
    } else if (isExpired) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  const getStatusColor = () => {
    if (property.isCompleted) {
      return "bg-green-100 text-green-800";
    } else if (property.isCancelled) {
      return "bg-red-100 text-red-800";
    } else if (property.isFunded) {
      return "bg-blue-100 text-blue-800";
    } else if (isExpired) {
      return "bg-orange-100 text-orange-800";
    } else {
      return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

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
    !isExpired;
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

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to view property details
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Property Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The property you're looking for doesn't exist
        </p>
        <Link to="/properties" className="btn-primary">
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/properties"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Properties
      </Link>

      {/* Property Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Property Image */}
          <div className="lg:w-1/3">
            {property.ipfsHash ? (
              <img
                src={getIPFSUrl(property.ipfsHash)}
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <Building2 className="h-16 w-16 text-primary-600" />
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="lg:w-2/3 space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">
                {property.title}
              </h1>
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
            </div>

            <p className="text-gray-600 text-lg">{property.description}</p>

            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{property.location}</span>
            </div>

            {/* Funding Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Funding Progress</span>
                <span className="font-medium">
                  ${parseFloat(property.currentFunding).toLocaleString()} / $
                  {parseFloat(property.targetFunding).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(getProgressPercentage(), 100)}%`,
                  }}
                ></div>
              </div>
              <div className="text-sm text-gray-500">
                {getProgressPercentage().toFixed(1)}% funded •{" "}
                {property.totalInvestors} investors
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {canInvest && (
                <button
                  onClick={() => setShowInvestmentModal(true)}
                  className="btn-primary flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Invest Now</span>
                </button>
              )}

              {canComplete && (
                <button
                  onClick={handleCompleteProperty}
                  className="btn-outline flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Property</span>
                </button>
              )}

              {canCancel && (
                <button
                  onClick={handleCancelProperty}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
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
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Claim Refund ({userInvestment} ETH)</span>
                </button>
              )}
            </div>

            {/* Expired / Cancelled Notice */}
            {isExpired && !property.isCancelled && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">
                      Funding Deadline Expired
                    </p>
                    <p className="text-sm text-orange-700">
                      This property did not reach its funding target before the
                      deadline. Cancel the property to enable investor refunds.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {property.isCancelled && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Property Cancelled
                    </p>
                    <p className="text-sm text-red-700">
                      This property has been cancelled. Investors can claim full
                      refunds of their contributions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Information
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Property Value</span>
              <span className="font-medium">
                ${parseFloat(property.totalValue).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target Funding</span>
              <span className="font-medium">
                ${parseFloat(property.targetFunding).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Funding</span>
              <span className="font-medium">
                ${parseFloat(property.currentFunding).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minimum Investment</span>
              <span className="font-medium">
                ${parseFloat(property.minInvestment).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maximum Investment</span>
              <span className="font-medium">
                ${parseFloat(property.maxInvestment).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Campaign Information
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Property Owner</span>
              <span className="font-mono text-sm">{property.owner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Investors</span>
              <span className="font-medium">{property.totalInvestors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Funding Deadline</span>
              <span className="font-medium">
                {formatDate(property.deadline)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Property ID</span>
              <span className="font-medium">#{property.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Invest in Property
            </h3>

            <form onSubmit={handleInvest} className="space-y-4">
              <div>
                <label htmlFor="amount" className="form-label">
                  Investment Amount (ETH)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={`${property.minInvestment} - ${property.maxInvestment}`}
                  step="0.01"
                  min={property.minInvestment}
                  max={property.maxInvestment}
                  className="input-field"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Min: ${parseFloat(property.minInvestment).toLocaleString()} |
                  Max: ${parseFloat(property.maxInvestment).toLocaleString()}
                </p>
                {investmentAmount && parseFloat(investmentAmount) > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-800 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Estimated Reward:{" "}
                      <span className="font-bold ml-1">
                        {(parseFloat(investmentAmount) * 1000).toLocaleString()}{" "}
                        RECT
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowInvestmentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Investing..." : "Invest"}
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
