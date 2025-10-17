import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import {
  Wallet,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const MyInvestments = () => {
  const { isConnected, account, getUserInvestments, getProperty } = useWeb3();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvested: 0,
    totalProperties: 0,
    activeInvestments: 0,
  });

  useEffect(() => {
    if (isConnected && account) {
      loadInvestments();
    }
  }, [isConnected, account]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const investmentIds = await getUserInvestments();

      // For now, we'll create mock investment data since we don't have the full investment details
      // In a real implementation, you'd fetch investment details from the contract
      const mockInvestments = investmentIds.map((id, index) => ({
        id: id,
        propertyId: Math.floor(Math.random() * 10) + 1, // Mock property ID
        amount: (Math.random() * 10 + 1).toFixed(2), // Mock amount
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random date within 30 days
        status: ["active", "completed", "pending"][
          Math.floor(Math.random() * 3)
        ],
      }));

      setInvestments(mockInvestments);

      // Calculate portfolio stats
      const totalInvested = mockInvestments.reduce(
        (sum, inv) => sum + parseFloat(inv.amount),
        0
      );
      const activeInvestments = mockInvestments.filter(
        (inv) => inv.status === "active"
      ).length;

      setPortfolioStats({
        totalInvested,
        totalProperties: mockInvestments.length,
        activeInvestments,
      });
    } catch (error) {
      console.error("Error loading investments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to view your investments
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading your investments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Investments
        </h1>
        <p className="text-gray-600">
          Track your real estate investment portfolio
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${portfolioStats.totalInvested.toLocaleString()}
          </div>
          <div className="text-gray-600">Total Invested</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {portfolioStats.totalProperties}
          </div>
          <div className="text-gray-600">Properties Invested</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {portfolioStats.activeInvestments}
          </div>
          <div className="text-gray-600">Active Investments</div>
        </div>
      </div>

      {/* Investments List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Investment History
        </h2>

        {investments.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Investments Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your real estate portfolio by investing in
              properties
            </p>
            <Link to="/properties" className="btn-primary">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((investment) => (
              <div
                key={investment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        Property #{investment.propertyId}
                      </h3>
                      {getStatusBadge(investment.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Invested on {formatDate(investment.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${parseFloat(investment.amount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Investment Amount
                    </div>
                  </div>
                  <Link
                    to={`/properties/${investment.propertyId}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investment Tips */}
      <div className="card bg-primary-50 border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Investment Tips
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Diversify your portfolio by investing in different types of
              properties and locations
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Research the property location, market trends, and potential
              returns before investing
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Monitor your investments regularly and stay updated on property
              developments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInvestments;
