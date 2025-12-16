const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Integration", function () {
  let realEstateCrowdfunding;
  let realEstateToken;
  let owner;
  let investor;
  let addrs;

  beforeEach(async function () {
    [owner, investor, ...addrs] = await ethers.getSigners();

    // Deploy Token
    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    realEstateToken = await RealEstateToken.deploy();
    await realEstateToken.waitForDeployment();

    // Deploy Crowdfunding
    const RealEstateCrowdfunding = await ethers.getContractFactory("RealEstateCrowdfunding");
    realEstateCrowdfunding = await RealEstateCrowdfunding.deploy();
    await realEstateCrowdfunding.waitForDeployment();

    // Link contracts
    const tokenAddress = await realEstateToken.getAddress();
    const crowdfundingAddress = await realEstateCrowdfunding.getAddress();

    await realEstateCrowdfunding.setToken(tokenAddress);
    await realEstateToken.authorizeMinter(crowdfundingAddress);
  });

  it("Should reward tokens on investment", async function () {
    // Create property
    await realEstateCrowdfunding.createProperty(
      "Test Property", 
      "Description", 
      "QmHash", // ipfsHash
      "Location", 
      ethers.parseEther("100"), 
      ethers.parseEther("1"), 
      ethers.parseEther("100"), 
      ethers.parseEther("100"), 
      Math.floor(Date.now() / 1000) + 86400
    );

    const investmentAmount = ethers.parseEther("1");
    
    // Initial token balance should be 0
    expect(await realEstateToken.balanceOf(investor.address)).to.equal(0n);

    // Invest
    const tx = await realEstateCrowdfunding.connect(investor).invest(1, { value: investmentAmount });
    await tx.wait();

    // Check balance
    // 1 ETH = 1000 RECT (from logic: msg.value * 1000)
    // 1e18 wei * 1000 = 1000 * 1e18 wei
    const expectedTokens = ethers.parseEther("1000"); 
    expect(await realEstateToken.balanceOf(investor.address)).to.equal(expectedTokens);
  });
  
  it("Should emit TokenRewardPaid event", async function () {
      // Create property
      await realEstateCrowdfunding.createProperty(
        "Test Property", 
        "Description", 
        "QmHash", // ipfsHash
        "Location", 
        ethers.parseEther("100"), 
        ethers.parseEther("1"), 
        ethers.parseEther("100"), 
        ethers.parseEther("100"), 
        Math.floor(Date.now() / 1000) + 86400
      );
  
      const investmentAmount = ethers.parseEther("1");
      const expectedTokens = ethers.parseEther("1000");

      await expect(realEstateCrowdfunding.connect(investor).invest(1, { value: investmentAmount }))
        .to.emit(realEstateCrowdfunding, "TokenRewardPaid")
        .withArgs(investor.address, expectedTokens);
  });
});
