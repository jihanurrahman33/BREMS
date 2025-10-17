const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Mock data for demonstration
const mockProperties = [
  {
    id: 1,
    title: "Luxury Downtown Apartment Complex",
    description:
      "A modern luxury apartment complex in the heart of downtown with premium amenities and stunning city views.",
    location: "Downtown, New York, NY",
    totalValue: 5000000,
    currentFunding: 2500000,
    targetFunding: 3000000,
    minInvestment: 1000,
    maxInvestment: 50000,
    totalInvestors: 45,
    isActive: true,
    isFunded: false,
    isCompleted: false,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
    owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
  {
    id: 2,
    title: "Beachfront Condo Development",
    description:
      "Exclusive beachfront condominium development with private beach access and luxury amenities.",
    location: "Miami Beach, FL",
    totalValue: 8000000,
    currentFunding: 8000000,
    targetFunding: 6000000,
    minInvestment: 2000,
    maxInvestment: 100000,
    totalInvestors: 120,
    isActive: false,
    isFunded: true,
    isCompleted: false,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 15,
    owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
  {
    id: 3,
    title: "Tech Hub Office Building",
    description:
      "Modern office building designed for tech companies with flexible workspaces and cutting-edge facilities.",
    location: "San Francisco, CA",
    totalValue: 12000000,
    currentFunding: 4000000,
    targetFunding: 8000000,
    minInvestment: 5000,
    maxInvestment: 200000,
    totalInvestors: 25,
    isActive: true,
    isFunded: false,
    isCompleted: false,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 45,
    owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
];

const mockInvestments = [
  {
    id: 1,
    propertyId: 1,
    investor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    amount: 10000,
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
    status: "active",
  },
  {
    id: 2,
    propertyId: 2,
    investor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    amount: 25000,
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 10,
    status: "completed",
  },
];

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Get all properties
app.get("/api/properties", (req, res) => {
  try {
    const { status, search, limit = 10, offset = 0 } = req.query;

    let filteredProperties = [...mockProperties];

    // Filter by status
    if (status && status !== "all") {
      filteredProperties = filteredProperties.filter((property) => {
        switch (status) {
          case "active":
            return property.isActive && !property.isFunded;
          case "funded":
            return property.isFunded && !property.isCompleted;
          case "completed":
            return property.isCompleted;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProperties = filteredProperties.filter(
        (property) =>
          property.title.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower) ||
          property.location.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const paginatedProperties = filteredProperties.slice(
      offset,
      offset + limit
    );

    res.json({
      properties: paginatedProperties,
      total: filteredProperties.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get property by ID
app.get("/api/properties/:id", (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const property = mockProperties.find((p) => p.id === propertyId);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user investments
app.get("/api/investments/:userAddress", (req, res) => {
  try {
    const userAddress = req.params.userAddress.toLowerCase();
    const userInvestments = mockInvestments.filter(
      (inv) => inv.investor.toLowerCase() === userAddress
    );

    res.json(userInvestments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user properties
app.get("/api/user-properties/:userAddress", (req, res) => {
  try {
    const userAddress = req.params.userAddress.toLowerCase();
    const userProperties = mockProperties.filter(
      (prop) => prop.owner.toLowerCase() === userAddress
    );

    res.json(userProperties);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get platform statistics
app.get("/api/stats", (req, res) => {
  try {
    const totalProperties = mockProperties.length;
    const totalValue = mockProperties.reduce(
      (sum, prop) => sum + prop.totalValue,
      0
    );
    const totalFunding = mockProperties.reduce(
      (sum, prop) => sum + prop.currentFunding,
      0
    );
    const totalInvestors = mockProperties.reduce(
      (sum, prop) => sum + prop.totalInvestors,
      0
    );
    const activeProperties = mockProperties.filter(
      (prop) => prop.isActive
    ).length;
    const fundedProperties = mockProperties.filter(
      (prop) => prop.isFunded
    ).length;

    res.json({
      totalProperties,
      totalValue,
      totalFunding,
      totalInvestors,
      activeProperties,
      fundedProperties,
      averageInvestment: totalFunding / totalInvestors || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get recent activities
app.get("/api/activities", (req, res) => {
  try {
    const activities = [
      {
        id: 1,
        type: "investment",
        propertyId: 1,
        propertyTitle: "Luxury Downtown Apartment Complex",
        user: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        amount: 10000,
        timestamp: Math.floor(Date.now() / 1000) - 3600,
      },
      {
        id: 2,
        type: "property_created",
        propertyId: 3,
        propertyTitle: "Tech Hub Office Building",
        user: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        timestamp: Math.floor(Date.now() / 1000) - 7200,
      },
      {
        id: 3,
        type: "property_funded",
        propertyId: 2,
        propertyTitle: "Beachfront Condo Development",
        user: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        timestamp: Math.floor(Date.now() / 1000) - 86400,
      },
    ];

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});

module.exports = app;
