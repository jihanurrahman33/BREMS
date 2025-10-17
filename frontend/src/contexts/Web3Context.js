import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Contract addresses - Force Sepolia addresses
  const CONTRACT_ADDRESS = "0xe53E7A0377BDAe41d045e8FFB74d54F2dd28A607";
  const TOKEN_ADDRESS = "0x2D1380724794d34bAdb6Ec33D53D850B3A6978F3";

  // Debug logging
  console.log("Environment variables:", {
    CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS,
    TOKEN_ADDRESS: process.env.REACT_APP_TOKEN_ADDRESS,
    NETWORK_ID: process.env.REACT_APP_NETWORK_ID,
    NETWORK_NAME: process.env.REACT_APP_NETWORK_NAME,
  });

  // Contract ABIs (simplified for demo - in production, these would be imported from artifacts)
  const CONTRACT_ABI = [
    "function createProperty(string _title, string _description, string _location, uint256 _totalValue, uint256 _minInvestment, uint256 _maxInvestment, uint256 _targetFunding, uint256 _deadline) external returns (uint256)",
    "function invest(uint256 _propertyId) external payable",
    "function getProperty(uint256 _propertyId) external view returns (uint256 id, address owner, string title, string description, string location, uint256 totalValue, uint256 minInvestment, uint256 maxInvestment, uint256 currentFunding, uint256 targetFunding, uint256 deadline, bool isActive, bool isFunded, bool isCompleted, uint256 totalInvestors)",
    "function getTotalProperties() external view returns (uint256)",
    "function getUserInvestments(address _user) external view returns (uint256[])",
    "function getUserProperties(address _user) external view returns (uint256[])",
    "function completeProperty(uint256 _propertyId) external",
    "function withdrawInvestment(uint256 _investmentId) external",
    "function getPropertyInvestors(uint256 _propertyId) external view returns (address[])",
    "function getUserInvestment(uint256 _propertyId, address _investor) external view returns (uint256)",
    "function getTotalInvestments() external view returns (uint256)",
    "function withdrawPlatformFees() external",
    "function updatePlatformFee(uint256 _newFee) external",
    "event PropertyCreated(uint256 indexed propertyId, address indexed owner, string title, uint256 targetFunding)",
    "event InvestmentMade(uint256 indexed investmentId, uint256 indexed propertyId, address indexed investor, uint256 amount)",
    "event PropertyFunded(uint256 indexed propertyId, uint256 totalFunding)",
    "event PropertyCompleted(uint256 indexed propertyId, address indexed owner)",
    "event InvestmentWithdrawn(uint256 indexed investmentId, address indexed investor, uint256 amount)",
  ];

  const TOKEN_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];

  const connectWallet = async () => {
    try {
      setIsLoading(true);

      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        toast.error("No accounts found!");
        return;
      }

      // Check network
      const network = await provider.getNetwork();
      const expectedNetworkId = "11155111"; // Sepolia

      console.log("Network check:", {
        currentChainId: network.chainId.toString(),
        expectedChainId: expectedNetworkId,
        isCorrectNetwork: network.chainId.toString() === expectedNetworkId,
      });

      if (network.chainId.toString() !== expectedNetworkId) {
        toast.error(`Please switch to Sepolia testnet in MetaMask`);

        // Try to switch network
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              { chainId: `0x${parseInt(expectedNetworkId).toString(16)}` },
            ],
          });
        } catch (switchError) {
          console.error("Failed to switch network:", switchError);
        }
        return;
      }

      const signer = await provider.getSigner();

      // Create contracts (skip validation for now)
      console.log("Creating contracts with addresses:", {
        CONTRACT_ADDRESS,
        TOKEN_ADDRESS,
      });

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer
      );

      // Test contract calls (optional - don't fail if they don't work)
      try {
        await contract.platformFee();
        console.log("✅ Contract validation successful");
      } catch (contractError) {
        console.warn(
          "⚠️ Contract validation failed, but continuing:",
          contractError.message
        );
        // Don't fail the connection, just warn
      }

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setTokenContract(tokenContract);
      setIsConnected(true);

      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setTokenContract(null);
    setIsConnected(false);
    toast.success("Wallet disconnected");
  };

  const createProperty = async (propertyData) => {
    try {
      setIsLoading(true);

      // Add a buffer of 1 hour to ensure deadline is always in the future
      const deadline =
        Math.floor(Date.now() / 1000) +
        parseInt(propertyData.days) * 24 * 60 * 60 +
        3600;

      const tx = await contract.createProperty(
        propertyData.title,
        propertyData.description,
        propertyData.location,
        ethers.parseEther(propertyData.totalValue.toString()),
        ethers.parseEther(propertyData.minInvestment.toString()),
        ethers.parseEther(propertyData.maxInvestment.toString()),
        ethers.parseEther(propertyData.targetFunding.toString()),
        deadline
      );

      const receipt = await tx.wait();

      // Parse the PropertyCreated event from the transaction receipt
      const event = receipt.logs.find((log) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog && parsedLog.name === "PropertyCreated";
        } catch (e) {
          return false;
        }
      });

      if (!event) {
        throw new Error(
          "PropertyCreated event not found in transaction receipt"
        );
      }

      const parsedEvent = contract.interface.parseLog(event);
      toast.success("Property created successfully!");
      return parsedEvent.args.propertyId;
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Failed to create property");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const investInProperty = async (propertyId, amount) => {
    try {
      setIsLoading(true);

      const tx = await contract.invest(propertyId, {
        value: ethers.parseEther(amount.toString()),
      });

      await tx.wait();
      toast.success("Investment successful!");
    } catch (error) {
      console.error("Error investing:", error);
      toast.error("Failed to invest");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProperty = async (propertyId) => {
    try {
      const property = await contract.getProperty(propertyId);
      return {
        id: property[0].toString(),
        owner: property[1],
        title: property[2],
        description: property[3],
        location: property[4],
        totalValue: ethers.formatEther(property[5]),
        minInvestment: ethers.formatEther(property[6]),
        maxInvestment: ethers.formatEther(property[7]),
        currentFunding: ethers.formatEther(property[8]),
        targetFunding: ethers.formatEther(property[9]),
        deadline: property[10].toString(),
        isActive: property[11],
        isFunded: property[12],
        isCompleted: property[13],
        totalInvestors: property[14].toString(),
      };
    } catch (error) {
      console.error("Error getting property:", error);
      throw error;
    }
  };

  const getAllProperties = async () => {
    try {
      const totalProperties = await contract.getTotalProperties();
      const properties = [];

      for (let i = 1; i <= totalProperties; i++) {
        try {
          const property = await getProperty(i);
          properties.push(property);
        } catch (error) {
          console.error(`Error getting property ${i}:`, error);
        }
      }

      return properties;
    } catch (error) {
      console.error("Error getting all properties:", error);
      throw error;
    }
  };

  const getUserInvestments = async (userAddress = account) => {
    try {
      const investmentIds = await contract.getUserInvestments(userAddress);
      return investmentIds.map((id) => id.toString());
    } catch (error) {
      console.error("Error getting user investments:", error);
      throw error;
    }
  };

  const getUserProperties = async (userAddress = account) => {
    try {
      const propertyIds = await contract.getUserProperties(userAddress);
      return propertyIds.map((id) => id.toString());
    } catch (error) {
      console.error("Error getting user properties:", error);
      throw error;
    }
  };

  const completeProperty = async (propertyId) => {
    try {
      setIsLoading(true);

      const tx = await contract.completeProperty(propertyId);
      await tx.wait();

      toast.success("Property completed successfully!");
    } catch (error) {
      console.error("Error completing property:", error);
      toast.error("Failed to complete property");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenBalance = async (userAddress = account) => {
    try {
      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const value = {
    account,
    provider,
    signer,
    contract,
    tokenContract,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    createProperty,
    investInProperty,
    getProperty,
    getAllProperties,
    getUserInvestments,
    getUserProperties,
    completeProperty,
    getTokenBalance,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
