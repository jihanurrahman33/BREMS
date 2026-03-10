import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context.jsx";
import {
  Wallet,
  Building2,
  TrendingUp,
  ArrowRight,
  Coins,
  BarChart3,
  Lightbulb,
} from "lucide-react";

const MyInvestments = () => {
  const {
    isConnected,
    account,
    getUserInvestments,
    getInvestment,
    getProperty,
  } = useWeb3();
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
      const investmentsData = [];

      for (const id of investmentIds) {
        try {
          const inv = await getInvestment(id);
          let propertyTitle = `Property #${inv.propertyId}`;
          try {
            const prop = await getProperty(inv.propertyId);
            propertyTitle = prop.title;
          } catch {
            // fallback
          }
          investmentsData.push({
            ...inv,
            propertyTitle,
            status: inv.isActive ? "active" : "completed",
          });
        } catch (error) {
          console.error(`Error loading investment ${id}:`, error);
        }
      }

      setInvestments(investmentsData);

      const totalInvested = investmentsData.reduce(
        (sum, inv) => sum + parseFloat(inv.amount),
        0,
      );
      const activeInvestments = investmentsData.filter(
        (inv) => inv.status === "active",
      ).length;

      setPortfolioStats({
        totalInvested,
        totalProperties: investmentsData.length,
        activeInvestments,
      });
    } catch (error) {
      console.error("Error loading investments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const ms = parseInt(timestamp) * 1000;
    if (isNaN(ms) || ms <= 0) return "N/A";
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          Connect your wallet to view your investment portfolio.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-200 border-t-primary-600 mb-4" />
        <p className="text-sm text-gray-500">Loading your investments…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track your real estate investment portfolio
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Coins,
            value: `${portfolioStats.totalInvested.toLocaleString()} ETH`,
            label: "Total Invested",
            color: "bg-primary-50 text-primary-600",
          },
          {
            icon: Building2,
            value: portfolioStats.totalProperties,
            label: "Properties",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: BarChart3,
            value: portfolioStats.activeInvestments,
            label: "Active",
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

      {/* Investments List */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
          Investment History
        </h2>

        {investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No Investments Yet
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Start building your portfolio by investing in properties.
            </p>
            <Link to="/properties" className="btn-primary text-sm">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((investment) => (
              <Link
                key={investment.id}
                to={`/properties/${investment.propertyId}`}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {investment.propertyTitle}
                      </h3>
                      <span
                        className={
                          investment.status === "active"
                            ? "badge-green text-[10px]"
                            : "badge-blue text-[10px]"
                        }
                      >
                        {investment.status === "active"
                          ? "Active"
                          : "Completed"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(investment.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {parseFloat(investment.amount).toLocaleString()} ETH
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      {investments.length > 0 && (
        <div className="card bg-primary-50/50 border-primary-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-primary-600" />
            Investment Tips
          </h3>
          <ul className="space-y-2 text-xs text-gray-600">
            {[
              "Diversify your portfolio across different property types and locations.",
              "Research market trends and potential returns before investing.",
              "Monitor your investments regularly for property updates.",
            ].map((tip, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-1 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyInvestments;
