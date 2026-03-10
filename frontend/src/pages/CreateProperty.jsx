import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context.jsx";
import { uploadToIPFS } from "../utils/ipfs";
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  Image,
  TrendingUp,
  Wallet,
  Upload,
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
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.length < 50)
      newErrors.description = "Description must be at least 50 characters";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.totalValue || parseFloat(formData.totalValue) <= 0)
      newErrors.totalValue = "Total value must be greater than 0";
    if (!formData.minInvestment || parseFloat(formData.minInvestment) <= 0)
      newErrors.minInvestment = "Minimum investment must be greater than 0";
    if (!formData.maxInvestment || parseFloat(formData.maxInvestment) <= 0)
      newErrors.maxInvestment = "Maximum investment must be greater than 0";
    if (!formData.targetFunding || parseFloat(formData.targetFunding) <= 0)
      newErrors.targetFunding = "Target funding must be greater than 0";
    if (parseFloat(formData.minInvestment) > parseFloat(formData.maxInvestment))
      newErrors.maxInvestment =
        "Maximum investment must be greater than minimum";
    if (parseFloat(formData.targetFunding) > parseFloat(formData.totalValue))
      newErrors.targetFunding = "Target funding cannot exceed total value";
    if (parseFloat(formData.days) < 1 || parseFloat(formData.days) > 365)
      newErrors.days = "Funding period must be between 1 and 365 days";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let ipfsHash = "";
      if (file) ipfsHash = await uploadToIPFS(file);
      const propertyId = await createProperty({ ...formData, ipfsHash });
      navigate(`/properties/${propertyId}`);
    } catch (error) {
      console.error("Error creating property:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const FieldError = ({ msg }) =>
    msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;

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
          Connect your wallet to list a property.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          List New Property
        </h1>
        <p className="text-sm text-gray-500">
          Create a crowdfunding campaign for your real estate property.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <Image className="h-4 w-4 mr-2 text-primary-600" />
            Property Image
          </h2>

          <label htmlFor="image" className="block cursor-pointer group">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl border-2 border-dashed border-gray-200 group-hover:border-primary-300 transition-colors"
              />
            ) : (
              <div className="w-full h-48 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-primary-300 flex flex-col items-center justify-center transition-colors">
                <Upload className="h-8 w-8 text-gray-300 mb-2" />
                <span className="text-sm text-gray-400">
                  Click to upload an image
                </span>
                <span className="text-xs text-gray-300 mt-1">
                  PNG, JPG up to 5 MB
                </span>
              </div>
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </div>

        {/* Basic Information */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-primary-600" />
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Property Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Luxury Downtown Apartment Complex"
                className={`input-field text-sm ${
                  errors.title ? "border-red-400 ring-1 ring-red-200" : ""
                }`}
              />
              <FieldError msg={errors.title} />
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the property, its features, and investment potential…"
                rows={4}
                className={`input-field text-sm ${
                  errors.description ? "border-red-400 ring-1 ring-red-200" : ""
                }`}
              />
              <div className="flex justify-between mt-1">
                <FieldError msg={errors.description} />
                <span className="text-xs text-gray-400 ml-auto">
                  {formData.description.length}/50 min
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="form-label flex items-center"
              >
                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Downtown, New York, NY"
                className={`input-field text-sm ${
                  errors.location ? "border-red-400 ring-1 ring-red-200" : ""
                }`}
              />
              <FieldError msg={errors.location} />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
            Financial Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: "totalValue",
                label: "Total Value (ETH)",
                placeholder: "100",
              },
              {
                id: "targetFunding",
                label: "Target Funding (ETH)",
                placeholder: "50",
              },
              {
                id: "minInvestment",
                label: "Min Investment (ETH)",
                placeholder: "1",
              },
              {
                id: "maxInvestment",
                label: "Max Investment (ETH)",
                placeholder: "10",
              },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="form-label">
                  {field.label}
                </label>
                <input
                  type="number"
                  id={field.id}
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  step="0.01"
                  min="0"
                  className={`input-field text-sm ${
                    errors[field.id] ? "border-red-400 ring-1 ring-red-200" : ""
                  }`}
                />
                <FieldError msg={errors[field.id]} />
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Settings */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
            Campaign Duration
          </h2>

          <div>
            <label htmlFor="days" className="form-label">
              Funding Period (Days)
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
              className={`input-field text-sm max-w-[160px] ${
                errors.days ? "border-red-400 ring-1 ring-red-200" : ""
              }`}
            />
            <FieldError msg={errors.days} />
            <p className="text-xs text-gray-400 mt-1">
              Between 1 and 365 days. Default is 30.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate("/properties")}
            className="btn-secondary text-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2 text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                <span>Creating…</span>
              </span>
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
