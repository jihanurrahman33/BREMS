import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context.jsx";
import {
  Building2,
  Users,
  Shield,
  TrendingUp,
  ArrowRight,
  Wallet,
  Layers,
  Zap,
} from "lucide-react";

const Home = () => {
  const { isConnected, getAllProperties, connectWallet } = useWeb3();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalInvestments: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const properties = await getAllProperties();
        const totalValue = properties.reduce(
          (sum, prop) => sum + parseFloat(prop.totalValue),
          0,
        );
        const totalInvestments = properties.reduce(
          (sum, prop) => sum + parseInt(prop.totalInvestors),
          0,
        );

        setStats({
          totalProperties: properties.length,
          totalInvestments,
          totalValue,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    if (isConnected) {
      loadStats();
    }
  }, [isConnected, getAllProperties]);

  const features = [
    {
      icon: Layers,
      title: "Fractional Ownership",
      description:
        "Own a fraction of premium real estate properties starting from as little as 1 ETH.",
      color: "bg-primary-50 text-primary-600",
    },
    {
      icon: Shield,
      title: "Smart Contract Security",
      description:
        "Funds are secured by auditable smart contracts with built-in reentrancy protection.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: TrendingUp,
      title: "Earn RECT Tokens",
      description:
        "Receive 1,000 RECT reward tokens for every ETH you invest in a property.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: Users,
      title: "Community Governed",
      description:
        "Transparent platform fees, deadline-based cancellation, and full refund guarantees.",
      color: "bg-blue-50 text-blue-600",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Connect Wallet",
      description: "Link your MetaMask or compatible wallet to the platform.",
    },
    {
      num: "02",
      title: "Browse & Invest",
      description:
        "Discover properties and invest ETH within the allowed range.",
    },
    {
      num: "03",
      title: "Track & Earn",
      description:
        "Monitor your portfolio and claim returns when properties complete.",
    },
  ];

  return (
    <div className="space-y-20 animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6 ring-1 ring-primary-200">
            <Zap className="h-3.5 w-3.5" />
            <span>Powered by Ethereum Blockchain</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Real Estate Investing,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
              Decentralized
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Invest in premium real estate properties with fractional ownership.
            Transparent, secure, and accessible to everyone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/properties"
              className="btn-primary text-base px-8 py-3 flex items-center justify-center space-x-2"
            >
              <span>Explore Properties</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="btn-outline text-base px-8 py-3 flex items-center justify-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isConnected && (
        <section className="animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                value: stats.totalProperties,
                label: "Listed Properties",
                icon: Building2,
              },
              {
                value: stats.totalInvestments,
                label: "Total Investors",
                icon: Users,
              },
              {
                value: `${stats.totalValue.toLocaleString()} ETH`,
                label: "Total Value Locked",
                icon: TrendingUp,
              },
            ].map((stat, i) => (
              <div key={i} className="card flex items-center space-x-4 p-5">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <stat.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="section-heading">Why Choose BREMS?</h2>
          <p className="section-subheading">
            A fully on-chain crowdfunding platform built for transparency and
            trust.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card-hover group p-6 text-center sm:text-left"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0 ${feature.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="card p-8 sm:p-12">
        <div className="text-center mb-12">
          <h2 className="section-heading">How It Works</h2>
          <p className="section-subheading">
            Three simple steps to start investing in real estate.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center relative">
              <div className="text-5xl font-extrabold text-primary-100 mb-3">
                {step.num}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-8 -right-6 h-5 w-5 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 sm:p-12 text-center text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Build Your Portfolio?
          </h2>
          <p className="text-base sm:text-lg text-primary-100 mb-8 leading-relaxed">
            Join a growing community of investors accessing real estate
            opportunities through blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/properties"
              className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Browse Properties</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/create-property"
              className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-xl transition-all duration-200"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
