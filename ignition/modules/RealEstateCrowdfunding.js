const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RealEstateCrowdfunding", (m) => {
  // Deploy the RealEstateToken first
  const realEstateToken = m.contract("RealEstateToken");

  // Deploy the main RealEstateCrowdfunding contract
  const realEstateCrowdfunding = m.contract("RealEstateCrowdfunding");

  // Authorize the RealEstateCrowdfunding contract to mint tokens
  m.call(realEstateToken, "authorizeMinter", [realEstateCrowdfunding]);

  return { realEstateToken, realEstateCrowdfunding };
});
