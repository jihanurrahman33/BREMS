import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import {
  Building2,
  DollarSign,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";

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

      // Calculate stats
      const totalValue = propertiesData.reduce(
        (sum, prop) => sum + parseFloat(prop.totalValue),
        0
      );
      const totalFunding = propertiesData.reduce(
        (sum, prop) => sum + parseFloat(prop.currentFunding),
        0
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
        <p className="text-gray-600">
          Please connect your wallet to view your properties
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading your properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Properties
          </h1>
          <p className="text-gray-600">
            Manage your real estate crowdfunding campaigns
          </p>
        </div>
        <Link
          to="/create-property"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>List New Property</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalProperties}
          </div>
          <div className="text-gray-600">Total Properties</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${stats.totalValue.toLocaleString()}
          </div>
          <div className="text-gray-600">Total Value</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${stats.totalFunding.toLocaleString()}
          </div>
          <div className="text-gray-600">Total Funding</div>
        </div>
      </div>

      {/* Properties List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your Properties
        </h2>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Properties Listed
            </h3>
            <p className="text-gray-600 mb-6">
              Start your real estate crowdfunding journey by listing your first
              property
            </p>
            <Link to="/create-property" className="btn-primary">
              List Your First Property
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Image */}
                  <div className="lg:w-1/4">
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-primary-600" />
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="lg:w-3/4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {property.description}
                        </p>
                      </div>
                      {getStatusBadge(property)}
                    </div>

                    {/* Funding Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Funding Progress</span>
                        <span className="font-medium">
                          $
                          {parseFloat(property.currentFunding).toLocaleString()}{" "}
                          / $
                          {parseFloat(property.targetFunding).toLocaleString()}
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
                        {getProgressPercentage(property).toFixed(1)}% funded •{" "}
                        {property.totalInvestors} investors
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>
                          Value: $
                          {parseFloat(property.totalValue).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{property.totalInvestors} investors</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Deadline: {formatDate(property.deadline)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span>ID: #{property.id}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <Link
                        to={`/properties/${property.id}`}
                        className="btn-outline flex items-center space-x-2"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      {property.isFunded && !property.isCompleted && (
                        <button className="btn-primary flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Complete Property</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Management Tips */}
      <div className="card bg-primary-50 border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Property Management Tips
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Keep your property descriptions detailed and up-to-date to attract
              more investors
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Set realistic funding targets and investment limits based on
              market research
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Engage with your investors and provide regular updates on property
              development
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Complete properties promptly once funding targets are reached to
              maintain trust
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProperties;
