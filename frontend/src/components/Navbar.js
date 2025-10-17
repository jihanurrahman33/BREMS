import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import { Home, Building2, Plus, Wallet, User, LogOut } from "lucide-react";

const Navbar = () => {
  const {
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    getTokenBalance,
  } = useWeb3();
  const location = useLocation();
  const [tokenBalance, setTokenBalance] = React.useState("0");

  React.useEffect(() => {
    if (isConnected && account) {
      getTokenBalance().then(setTokenBalance);
    }
  }, [isConnected, account, getTokenBalance]);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/properties", label: "Properties", icon: Building2 },
    { path: "/create-property", label: "Create Property", icon: Plus },
    { path: "/my-investments", label: "My Investments", icon: Wallet },
    { path: "/my-properties", label: "My Properties", icon: User },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              RealEstateCrowd
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{formatAddress(account)}</div>
                  <div className="text-xs">
                    {parseFloat(tokenBalance).toFixed(2)} RECT
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4 border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
