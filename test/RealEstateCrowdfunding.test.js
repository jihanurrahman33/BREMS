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
  let addrs;

  beforeEach(async function () {
    [owner, propertyOwner, investor1, investor2, investor3, ...addrs] =
      await ethers.getSigners();

    const RealEstateCrowdfunding = await ethers.getContractFactory(
      "RealEstateCrowdfunding"
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
    const propertyData = {
      title: "Luxury Apartment Complex",
      description: "A modern luxury apartment complex in downtown",
      location: "Downtown, City Center",
      totalValue: ethers.parseEther("1000000"),
      minInvestment: ethers.parseEther("1000"),
      maxInvestment: ethers.parseEther("50000"),
      targetFunding: ethers.parseEther("500000"),
      deadline: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
    };

    it("Should create a property successfully", async function () {
      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .createProperty(
          propertyData.title,
          propertyData.description,
          propertyData.location,
          propertyData.totalValue,
          propertyData.minInvestment,
          propertyData.maxInvestment,
          propertyData.targetFunding,
          propertyData.deadline
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "PropertyCreated"
      );

      expect(event.args.propertyId).to.equal(1);
      expect(event.args.owner).to.equal(propertyOwner.address);
      expect(event.args.title).to.equal(propertyData.title);
      expect(event.args.targetFunding).to.equal(propertyData.targetFunding);
    });

    it("Should fail to create property with invalid parameters", async function () {
      // Test with target funding greater than total value
      await expect(
        realEstateCrowdfunding.connect(propertyOwner).createProperty(
          propertyData.title,
          propertyData.description,
          propertyData.location,
          propertyData.totalValue,
          propertyData.minInvestment,
          propertyData.maxInvestment,
          ethers.parseEther("2000000"), // Greater than total value
          propertyData.deadline
        )
      ).to.be.revertedWith("Target funding cannot exceed total value");

      // Test with past deadline
      await expect(
        realEstateCrowdfunding.connect(propertyOwner).createProperty(
          propertyData.title,
          propertyData.description,
          propertyData.location,
          propertyData.totalValue,
          propertyData.minInvestment,
          propertyData.maxInvestment,
          propertyData.targetFunding,
          Math.floor(Date.now() / 1000) - 86400 // Past date
        )
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Investment", function () {
    let propertyId;
    const propertyData = {
      title: "Luxury Apartment Complex",
      description: "A modern luxury apartment complex in downtown",
      location: "Downtown, City Center",
      totalValue: ethers.parseEther("1000000"),
      minInvestment: ethers.parseEther("1000"),
      maxInvestment: ethers.parseEther("50000"),
      targetFunding: ethers.parseEther("500000"),
      deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
    };

    beforeEach(async function () {
      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .createProperty(
          propertyData.title,
          propertyData.description,
          propertyData.location,
          propertyData.totalValue,
          propertyData.minInvestment,
          propertyData.maxInvestment,
          propertyData.targetFunding,
          propertyData.deadline
        );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "PropertyCreated"
      );
      propertyId = event.args.propertyId;
    });

    it("Should allow investment within valid range", async function () {
      const investmentAmount = ethers.parseEther("10000");

      const tx = await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, {
          value: investmentAmount,
        });

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "InvestmentMade"
      );

      expect(event.args.propertyId).to.equal(propertyId);
      expect(event.args.investor).to.equal(investor1.address);
      expect(event.args.amount).to.equal(investmentAmount);
    });

    it("Should fail investment below minimum", async function () {
      const investmentAmount = ethers.parseEther("500"); // Below minimum

      await expect(
        realEstateCrowdfunding.connect(investor1).invest(propertyId, {
          value: investmentAmount,
        })
      ).to.be.revertedWith("Investment amount is below minimum");
    });

    it("Should fail investment above maximum", async function () {
      const investmentAmount = ethers.parseEther("60000"); // Above maximum

      await expect(
        realEstateCrowdfunding.connect(investor1).invest(propertyId, {
          value: investmentAmount,
        })
      ).to.be.revertedWith("Investment amount exceeds maximum");
    });

    it("Should allow multiple investments from same investor", async function () {
      const investment1 = ethers.parseEther("10000");
      const investment2 = ethers.parseEther("15000");

      await realEstateCrowdfunding.connect(investor1).invest(propertyId, {
        value: investment1,
      });

      await realEstateCrowdfunding.connect(investor1).invest(propertyId, {
        value: investment2,
      });

      const totalInvestment = await realEstateCrowdfunding.getUserInvestment(
        propertyId,
        investor1.address
      );
      expect(totalInvestment).to.equal(investment1 + investment2);
    });

    it("Should fund property when target is reached", async function () {
      const investmentAmount = ethers.parseEther("500000"); // Exact target amount

      const tx = await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, {
          value: investmentAmount,
        });

      const receipt = await tx.wait();
      const fundedEvent = receipt.logs.find(
        (log) => log.eventName === "PropertyFunded"
      );

      expect(fundedEvent.args.propertyId).to.equal(propertyId);
      expect(fundedEvent.args.totalFunding).to.equal(investmentAmount);
    });
  });

  describe("Property Completion", function () {
    let propertyId;
    const propertyData = {
      title: "Luxury Apartment Complex",
      description: "A modern luxury apartment complex in downtown",
      location: "Downtown, City Center",
      totalValue: ethers.parseEther("1000000"),
      minInvestment: ethers.parseEther("1000"),
      maxInvestment: ethers.parseEther("50000"),
      targetFunding: ethers.parseEther("500000"),
      deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
    };

    beforeEach(async function () {
      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .createProperty(
          propertyData.title,
          propertyData.description,
          propertyData.location,
          propertyData.totalValue,
          propertyData.minInvestment,
          propertyData.maxInvestment,
          propertyData.targetFunding,
          propertyData.deadline
        );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "PropertyCreated"
      );
      propertyId = event.args.propertyId;

      // Fund the property
      await realEstateCrowdfunding.connect(investor1).invest(propertyId, {
        value: ethers.parseEther("500000"),
      });
    });

    it("Should allow property owner to complete funded property", async function () {
      const initialBalance = await ethers.provider.getBalance(
        propertyOwner.address
      );

      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .completeProperty(propertyId);
      const receipt = await tx.wait();

      const completedEvent = receipt.logs.find(
        (log) => log.eventName === "PropertyCompleted"
      );
      expect(completedEvent.args.propertyId).to.equal(propertyId);
      expect(completedEvent.args.owner).to.equal(propertyOwner.address);

      // Check that funds were transferred (minus platform fee)
      const finalBalance = await ethers.provider.getBalance(
        propertyOwner.address
      );
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail completion by non-owner", async function () {
      await expect(
        realEstateCrowdfunding.connect(investor1).completeProperty(propertyId)
      ).to.be.revertedWith("Only property owner can perform this action");
    });

    it("Should fail completion of unfunded property", async function () {
      // Create another unfunded property
      const tx2 = await realEstateCrowdfunding
        .connect(propertyOwner)
        .createProperty(
          "Another Property",
          "Description",
          "Location",
          ethers.parseEther("100000"),
          ethers.parseEther("1000"),
          ethers.parseEther("50000"),
          ethers.parseEther("50000"),
          Math.floor(Date.now() / 1000) + 86400 * 30
        );
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(
        (log) => log.eventName === "PropertyCreated"
      );
      const unfundedPropertyId = event2.args.propertyId;

      await expect(
        realEstateCrowdfunding
          .connect(propertyOwner)
          .completeProperty(unfundedPropertyId)
      ).to.be.revertedWith("Property must be funded to complete");
    });
  });

  describe("Investment Withdrawal", function () {
    let propertyId;
    let investmentId;

    beforeEach(async function () {
      // Create and fund a property
      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .createProperty(
          "Test Property",
          "Description",
          "Location",
          ethers.parseEther("1000000"),
          ethers.parseEther("1000"),
          ethers.parseEther("50000"),
          ethers.parseEther("500000"),
          Math.floor(Date.now() / 1000) + 86400 * 30
        );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "PropertyCreated"
      );
      propertyId = event.args.propertyId;

      // Make investment
      const investTx = await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, {
          value: ethers.parseEther("500000"),
        });
      const investReceipt = await investTx.wait();
      const investEvent = investReceipt.logs.find(
        (log) => log.eventName === "InvestmentMade"
      );
      investmentId = investEvent.args.investmentId;

      // Complete property
      await realEstateCrowdfunding
        .connect(propertyOwner)
        .completeProperty(propertyId);
    });

    it("Should allow investor to withdraw after property completion", async function () {
      const initialBalance = await ethers.provider.getBalance(
        investor1.address
      );

      const tx = await realEstateCrowdfunding
        .connect(investor1)
        .withdrawInvestment(investmentId);
      const receipt = await tx.wait();

      const withdrawnEvent = receipt.logs.find(
        (log) => log.eventName === "InvestmentWithdrawn"
      );
      expect(withdrawnEvent.args.investmentId).to.equal(investmentId);
      expect(withdrawnEvent.args.investor).to.equal(investor1.address);

      const finalBalance = await ethers.provider.getBalance(investor1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail withdrawal by non-investor", async function () {
      await expect(
        realEstateCrowdfunding
          .connect(investor2)
          .withdrawInvestment(investmentId)
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
        realEstateCrowdfunding.connect(investor1).updatePlatformFee(5)
      ).to.be.revertedWithCustomError(
        realEstateCrowdfunding,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should fail platform fee update above 10%", async function () {
      await expect(
        realEstateCrowdfunding.connect(owner).updatePlatformFee(15)
      ).to.be.revertedWith("Platform fee cannot exceed 10%");
    });
  });

  describe("View Functions", function () {
    it("Should return correct property information", async function () {
      const propertyData = {
        title: "Test Property",
        description: "Test Description",
        location: "Test Location",
        totalValue: ethers.parseEther("1000000"),
        minInvestment: ethers.parseEther("1000"),
        maxInvestment: ethers.parseEther("50000"),
        targetFunding: ethers.parseEther("500000"),
        deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
      };

      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .createProperty(
          propertyData.title,
          propertyData.description,
          propertyData.location,
          propertyData.totalValue,
          propertyData.minInvestment,
          propertyData.maxInvestment,
          propertyData.targetFunding,
          propertyData.deadline
        );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "PropertyCreated"
      );
      const propertyId = event.args.propertyId;

      const property = await realEstateCrowdfunding.getProperty(propertyId);

      expect(property.id).to.equal(propertyId);
      expect(property.owner).to.equal(propertyOwner.address);
      expect(property.title).to.equal(propertyData.title);
      expect(property.description).to.equal(propertyData.description);
      expect(property.location).to.equal(propertyData.location);
      expect(property.totalValue).to.equal(propertyData.totalValue);
      expect(property.minInvestment).to.equal(propertyData.minInvestment);
      expect(property.maxInvestment).to.equal(propertyData.maxInvestment);
      expect(property.targetFunding).to.equal(propertyData.targetFunding);
      expect(property.deadline).to.equal(propertyData.deadline);
      expect(property.isActive).to.be.true;
      expect(property.isFunded).to.be.false;
      expect(property.isCompleted).to.be.false;
    });
  });
});
