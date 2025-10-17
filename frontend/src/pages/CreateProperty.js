import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";

const CreateProperty = () => {
  const navigate = useNavigate();
  const { isConnected, createProperty, isLoading } = useWeb3();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    totalValue: "",
    minInvestment: "",
    maxInvestment: "",
    targetFunding: "",
    days: "30",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.totalValue || parseFloat(formData.totalValue) <= 0) {
      newErrors.totalValue = "Total value must be greater than 0";
    }

    if (!formData.minInvestment || parseFloat(formData.minInvestment) <= 0) {
      newErrors.minInvestment = "Minimum investment must be greater than 0";
    }

    if (!formData.maxInvestment || parseFloat(formData.maxInvestment) <= 0) {
      newErrors.maxInvestment = "Maximum investment must be greater than 0";
    }

    if (!formData.targetFunding || parseFloat(formData.targetFunding) <= 0) {
      newErrors.targetFunding = "Target funding must be greater than 0";
    }

    if (
      parseFloat(formData.minInvestment) > parseFloat(formData.maxInvestment)
    ) {
      newErrors.maxInvestment =
        "Maximum investment must be greater than minimum investment";
    }

    if (parseFloat(formData.targetFunding) > parseFloat(formData.totalValue)) {
      newErrors.targetFunding = "Target funding cannot exceed total value";
    }

    if (parseFloat(formData.days) < 1 || parseFloat(formData.days) > 365) {
      newErrors.days = "Funding period must be between 1 and 365 days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const propertyId = await createProperty(formData);
      navigate(`/properties/${propertyId}`);
    } catch (error) {
      console.error("Error creating property:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to create a property
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Property
        </h1>
        <p className="text-gray-600">
          List your real estate property for crowdfunding
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Property Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Luxury Downtown Apartment Complex"
                className={`input-field ${
                  errors.title ? "border-red-500" : ""
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of the property, its features, and investment potential..."
                rows={4}
                className={`input-field ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="form-label flex items-center"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Downtown, New York, NY"
                className={`input-field ${
                  errors.location ? "border-red-500" : ""
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalValue" className="form-label">
                Total Property Value (ETH) *
              </label>
              <input
                type="number"
                id="totalValue"
                name="totalValue"
                value={formData.totalValue}
                onChange={handleInputChange}
                placeholder="1000"
                step="0.01"
                min="0"
                className={`input-field ${
                  errors.totalValue ? "border-red-500" : ""
                }`}
              />
              {errors.totalValue && (
                <p className="text-red-500 text-sm mt-1">{errors.totalValue}</p>
              )}
            </div>

            <div>
              <label htmlFor="targetFunding" className="form-label">
                Target Funding (ETH) *
              </label>
              <input
                type="number"
                id="targetFunding"
                name="targetFunding"
                value={formData.targetFunding}
                onChange={handleInputChange}
                placeholder="500"
                step="0.01"
                min="0"
                className={`input-field ${
                  errors.targetFunding ? "border-red-500" : ""
                }`}
              />
              {errors.targetFunding && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.targetFunding}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="minInvestment" className="form-label">
                Minimum Investment (ETH) *
              </label>
              <input
                type="number"
                id="minInvestment"
                name="minInvestment"
                value={formData.minInvestment}
                onChange={handleInputChange}
                placeholder="1"
                step="0.01"
                min="0"
                className={`input-field ${
                  errors.minInvestment ? "border-red-500" : ""
                }`}
              />
              {errors.minInvestment && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.minInvestment}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="maxInvestment" className="form-label">
                Maximum Investment (ETH) *
              </label>
              <input
                type="number"
                id="maxInvestment"
                name="maxInvestment"
                value={formData.maxInvestment}
                onChange={handleInputChange}
                placeholder="50"
                step="0.01"
                min="0"
                className={`input-field ${
                  errors.maxInvestment ? "border-red-500" : ""
                }`}
              />
              {errors.maxInvestment && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.maxInvestment}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Campaign Settings
          </h2>

          <div>
            <label htmlFor="days" className="form-label">
              Funding Period (Days) *
            </label>
            <input
              type="number"
              id="days"
              name="days"
              value={formData.days}
              onChange={handleInputChange}
              placeholder="30"
              min="1"
              max="365"
              className={`input-field ${errors.days ? "border-red-500" : ""}`}
            />
            {errors.days && (
              <p className="text-red-500 text-sm mt-1">{errors.days}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Choose between 1 and 365 days
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/properties")}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Create Property</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProperty;
