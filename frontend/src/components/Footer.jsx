import React from "react";
import { Link } from "react-router-dom";
import { Building2, Github, Shield, Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">BREMS</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Blockchain-based Real Estate Management System. Invest in premium
              properties through decentralized crowdfunding.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/properties"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/create-property"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  List Property
                </Link>
              </li>
              <li>
                <Link
                  to="/my-investments"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  My Investments
                </Link>
              </li>
              <li>
                <Link
                  to="/my-properties"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  My Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Technology
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="h-3.5 w-3.5" />
                <span>Smart Contracts</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Zap className="h-3.5 w-3.5" />
                <span>Ethereum Network</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>IPFS Storage</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Github className="h-3.5 w-3.5" />
                <span>Open Source</span>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Info
            </h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-gray-400">2% Platform Fee</li>
              <li className="text-sm text-gray-400">
                1,000 RECT per ETH invested
              </li>
              <li className="text-sm text-gray-400">
                Full refund on cancellation
              </li>
              <li className="text-sm text-gray-400">Non-custodial platform</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} BREMS. Built on Ethereum
            blockchain.
          </p>
          <p className="text-xs text-gray-500">
            Decentralized &middot; Transparent &middot; Secure
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
