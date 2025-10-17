import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import {
  Building2,
  Users,
  DollarSign,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  const { isConnected, getAllProperties } = useWeb3();
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
          0
        );
        const totalInvestments = properties.reduce(
          (sum, prop) => sum + parseInt(prop.totalInvestors),
          0
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
      icon: Building2,
      title: "Fractional Ownership",
      description:
        "Invest in high-value real estate properties with small amounts through fractional ownership.",
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description:
        "All transactions are recorded on the blockchain, ensuring transparency and security.",
    },
    {
      icon: TrendingUp,
      title: "High Returns",
      description:
        "Access to premium real estate investments that traditionally require large capital.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Join a community of investors and property owners in the decentralized real estate market.",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Decentralized Real Estate
            <span className="text-primary-600"> Crowdfunding</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Invest in premium real estate properties with fractional ownership.
            Join the future of real estate investment powered by blockchain
            technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <span>Explore Properties</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            {!isConnected && (
              <button className="btn-outline text-lg px-8 py-3">
                Connect Wallet to Start
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isConnected && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalProperties}
              </div>
              <div className="text-gray-600">Total Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalInvestments}
              </div>
              <div className="text-gray-600">Total Investments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                ${stats.totalValue.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Value</div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Why Choose RealEstateCrowd?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Wallet
            </h3>
            <p className="text-gray-600">
              Connect your MetaMask wallet to access the platform
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Browse Properties
            </h3>
            <p className="text-gray-600">
              Explore available real estate investment opportunities
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Invest & Earn
            </h3>
            <p className="text-gray-600">
              Invest in properties and earn returns on your investment
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of investors who are already earning returns on real
          estate investments
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/properties"
            className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Browse Properties</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/create-property"
            className="border border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
          >
            List Your Property
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
