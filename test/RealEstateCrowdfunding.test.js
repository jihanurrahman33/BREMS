const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstateCrowdfunding", function () {
  let realEstateCrowdfunding;
  let realEstateToken;
  let owner;
  let propertyOwner;
  let investor1;
  let investor2;
  let investor3;

  const IPFS_HASH = "QmTestHash123456789";

  async function createTestProperty(signer, overrides = {}) {
    const defaults = {
      title: "Luxury Apartment Complex",
      description: "A modern luxury apartment complex in downtown",
      ipfsHash: IPFS_HASH,
      location: "Downtown, City Center",
      totalValue: ethers.parseEther("100"),
      minInvestment: ethers.parseEther("1"),
      maxInvestment: ethers.parseEther("50"),
      targetFunding: ethers.parseEther("50"),
      deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
    };
    const data = { ...defaults, ...overrides };

    const tx = await realEstateCrowdfunding
      .connect(signer)
      .createProperty(
        data.title,
        data.description,
        data.ipfsHash,
        data.location,
        data.totalValue,
        data.minInvestment,
        data.maxInvestment,
        data.targetFunding,
        data.deadline,
      );
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log) => log.eventName === "PropertyCreated",
    );
    return { tx, receipt, event, propertyId: event.args.propertyId };
  }

  beforeEach(async function () {
    [owner, propertyOwner, investor1, investor2, investor3] =
      await ethers.getSigners();

    const RealEstateCrowdfunding = await ethers.getContractFactory(
      "RealEstateCrowdfunding",
    );
    realEstateCrowdfunding = await RealEstateCrowdfunding.deploy();

    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    realEstateToken = await RealEstateToken.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await realEstateCrowdfunding.owner()).to.equal(owner.address);
    });

    it("Should have correct initial platform fee", async function () {
      expect(await realEstateCrowdfunding.platformFee()).to.equal(2);
    });
  });

  describe("Property Creation", function () {
    it("Should create a property successfully", async function () {
      const { event } = await createTestProperty(propertyOwner);

      expect(event.args.propertyId).to.equal(1);
      expect(event.args.owner).to.equal(propertyOwner.address);
      expect(event.args.title).to.equal("Luxury Apartment Complex");
    });

    it("Should fail with target funding exceeding total value", async function () {
      await expect(
        createTestProperty(propertyOwner, {
          targetFunding: ethers.parseEther("200"),
        }),
      ).to.be.revertedWith("Target funding cannot exceed total value");
    });

    it("Should fail with past deadline", async function () {
      await expect(
        createTestProperty(propertyOwner, {
          deadline: Math.floor(Date.now() / 1000) - 86400,
        }),
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Investment", function () {
    let propertyId;

    beforeEach(async function () {
      const result = await createTestProperty(propertyOwner);
      propertyId = result.propertyId;
    });

    it("Should allow investment within valid range", async function () {
      const amount = ethers.parseEther("10");

      const tx = await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: amount });
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "InvestmentMade",
      );

      expect(event.args.propertyId).to.equal(propertyId);
      expect(event.args.investor).to.equal(investor1.address);
      expect(event.args.amount).to.equal(amount);
    });

    it("Should fail investment below minimum", async function () {
      await expect(
        realEstateCrowdfunding
          .connect(investor1)
          .invest(propertyId, { value: ethers.parseEther("0.5") }),
      ).to.be.revertedWith("Investment amount is below minimum");
    });

    it("Should fail investment above maximum", async function () {
      await expect(
        realEstateCrowdfunding
          .connect(investor1)
          .invest(propertyId, { value: ethers.parseEther("60") }),
      ).to.be.revertedWith("Investment amount exceeds maximum");
    });

    it("Should accumulate multiple investments from same investor", async function () {
      const amount1 = ethers.parseEther("10");
      const amount2 = ethers.parseEther("15");

      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: amount1 });
      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: amount2 });

      const total = await realEstateCrowdfunding.getUserInvestment(
        propertyId,
        investor1.address,
      );
      expect(total).to.equal(amount1 + amount2);
    });

    it("Should mark property as funded when target is reached", async function () {
      const amount = ethers.parseEther("50");

      const tx = await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: amount });
      const receipt = await tx.wait();
      const fundedEvent = receipt.logs.find(
        (log) => log.eventName === "PropertyFunded",
      );

      expect(fundedEvent.args.propertyId).to.equal(propertyId);
      expect(fundedEvent.args.totalFunding).to.equal(amount);
    });
  });

  describe("Property Completion", function () {
    let propertyId;

    beforeEach(async function () {
      const result = await createTestProperty(propertyOwner);
      propertyId = result.propertyId;

      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: ethers.parseEther("50") });
    });

    it("Should allow property owner to complete funded property", async function () {
      const initialBalance = await ethers.provider.getBalance(
        propertyOwner.address,
      );

      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .completeProperty(propertyId);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.eventName === "PropertyCompleted",
      );
      expect(event.args.propertyId).to.equal(propertyId);
      expect(event.args.owner).to.equal(propertyOwner.address);

      const finalBalance = await ethers.provider.getBalance(
        propertyOwner.address,
      );
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail completion by non-owner", async function () {
      await expect(
        realEstateCrowdfunding.connect(investor1).completeProperty(propertyId),
      ).to.be.revertedWith("Only property owner can perform this action");
    });

    it("Should fail completion of unfunded property", async function () {
      const { propertyId: unfundedId } = await createTestProperty(
        propertyOwner,
        { targetFunding: ethers.parseEther("50") },
      );

      await expect(
        realEstateCrowdfunding
          .connect(propertyOwner)
          .completeProperty(unfundedId),
      ).to.be.revertedWith("Property must be funded to complete");
    });
  });

  describe("Investment Withdrawal", function () {
    let propertyId;
    let investmentId;

    beforeEach(async function () {
      const result = await createTestProperty(propertyOwner);
      propertyId = result.propertyId;

      const investTx = await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: ethers.parseEther("50") });
      const investReceipt = await investTx.wait();
      const investEvent = investReceipt.logs.find(
        (log) => log.eventName === "InvestmentMade",
      );
      investmentId = investEvent.args.investmentId;

      await realEstateCrowdfunding
        .connect(propertyOwner)
        .completeProperty(propertyId);
    });

    it("Should fail withdrawal by non-investor", async function () {
      await expect(
        realEstateCrowdfunding
          .connect(investor2)
          .withdrawInvestment(investmentId),
      ).to.be.revertedWith("Only investor can withdraw");
    });
  });

  describe("Platform Management", function () {
    it("Should allow owner to update platform fee", async function () {
      await realEstateCrowdfunding.connect(owner).updatePlatformFee(5);
      expect(await realEstateCrowdfunding.platformFee()).to.equal(5);
    });

    it("Should fail platform fee update by non-owner", async function () {
      await expect(
        realEstateCrowdfunding.connect(investor1).updatePlatformFee(5),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail platform fee update above 10%", async function () {
      await expect(
        realEstateCrowdfunding.connect(owner).updatePlatformFee(15),
      ).to.be.revertedWith("Platform fee cannot exceed 10%");
    });
  });

  describe("View Functions", function () {
    it("Should return correct property data via mapping", async function () {
      const { propertyId } = await createTestProperty(propertyOwner, {
        title: "Test Property",
        description: "Test Description",
        location: "Test Location",
      });

      const property = await realEstateCrowdfunding.properties(propertyId);

      expect(property.id).to.equal(propertyId);
      expect(property.owner).to.equal(propertyOwner.address);
      expect(property.title).to.equal("Test Property");
      expect(property.isActive).to.be.true;
      expect(property.isFunded).to.be.false;
      expect(property.isCompleted).to.be.false;
    });

    it("Should track total properties count", async function () {
      await createTestProperty(propertyOwner);
      await createTestProperty(propertyOwner, { title: "Second Property" });

      expect(await realEstateCrowdfunding.getTotalProperties()).to.equal(2);
    });
  });
});
