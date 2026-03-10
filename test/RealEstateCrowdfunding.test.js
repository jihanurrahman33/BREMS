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

    it("Should prevent property owner from investing in own property", async function () {
      await expect(
        realEstateCrowdfunding
          .connect(propertyOwner)
          .invest(propertyId, { value: ethers.parseEther("10") }),
      ).to.be.revertedWith("Owner cannot invest in own property");
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

    it("Should not have withdrawInvestment anymore (replaced by claimRefund)", async function () {
      expect(realEstateCrowdfunding.withdrawInvestment).to.be.undefined;
    });
  });

  describe("Property Cancellation & Refunds", function () {
    let propertyId;

    beforeEach(async function () {
      const result = await createTestProperty(propertyOwner);
      propertyId = result.propertyId;
    });

    it("Should allow property owner to cancel before deadline", async function () {
      const tx = await realEstateCrowdfunding
        .connect(propertyOwner)
        .cancelProperty(propertyId);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "PropertyCancelled",
      );

      expect(event.args.propertyId).to.equal(propertyId);

      const property = await realEstateCrowdfunding.properties(propertyId);
      expect(property.isCancelled).to.be.true;
      expect(property.isActive).to.be.false;
    });

    it("Should prevent non-owner from cancelling before deadline", async function () {
      await expect(
        realEstateCrowdfunding.connect(investor1).cancelProperty(propertyId),
      ).to.be.revertedWith("Only owner can cancel before deadline");
    });

    it("Should allow anyone to cancel after deadline has passed", async function () {
      // Get the current block timestamp from the blockchain (not Date.now)
      const block = await ethers.provider.getBlock("latest");
      const { propertyId: shortId } = await createTestProperty(propertyOwner, {
        deadline: block.timestamp + 60,
      });

      // Advance time past the deadline
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine", []);

      // Non-owner can cancel expired property
      await expect(
        realEstateCrowdfunding.connect(investor1).cancelProperty(shortId),
      ).to.not.be.reverted;

      const property = await realEstateCrowdfunding.properties(shortId);
      expect(property.isCancelled).to.be.true;
    });

    it("Should prevent cancelling a funded property", async function () {
      // Fund the property fully
      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: ethers.parseEther("50") });

      await expect(
        realEstateCrowdfunding
          .connect(propertyOwner)
          .cancelProperty(propertyId),
      ).to.be.revertedWith("Funded property cannot be cancelled");
    });

    it("Should prevent double cancellation", async function () {
      await realEstateCrowdfunding
        .connect(propertyOwner)
        .cancelProperty(propertyId);

      await expect(
        realEstateCrowdfunding
          .connect(propertyOwner)
          .cancelProperty(propertyId),
      ).to.be.revertedWith("Property is already cancelled");
    });

    it("Should allow investor to claim refund after cancellation", async function () {
      const investAmount = ethers.parseEther("10");

      // Invest
      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: investAmount });

      // Cancel
      await realEstateCrowdfunding
        .connect(propertyOwner)
        .cancelProperty(propertyId);

      // Claim refund
      const balanceBefore = await ethers.provider.getBalance(investor1.address);

      const tx = await realEstateCrowdfunding
        .connect(investor1)
        .claimRefund(propertyId);
      const receipt = await tx.wait();

      const refundEvent = receipt.logs.find(
        (log) => log.eventName === "RefundClaimed",
      );
      expect(refundEvent.args.propertyId).to.equal(propertyId);
      expect(refundEvent.args.investor).to.equal(investor1.address);
      expect(refundEvent.args.amount).to.equal(investAmount);

      const balanceAfter = await ethers.provider.getBalance(investor1.address);
      // Balance should increase (minus gas)
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should allow multiple investors to claim refunds independently", async function () {
      // Two investors
      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: ethers.parseEther("10") });
      await realEstateCrowdfunding
        .connect(investor2)
        .invest(propertyId, { value: ethers.parseEther("15") });

      // Cancel
      await realEstateCrowdfunding
        .connect(propertyOwner)
        .cancelProperty(propertyId);

      // Investor1 claims
      await expect(
        realEstateCrowdfunding.connect(investor1).claimRefund(propertyId),
      ).to.not.be.reverted;

      // Investor2 claims
      await expect(
        realEstateCrowdfunding.connect(investor2).claimRefund(propertyId),
      ).to.not.be.reverted;
    });

    it("Should prevent double refund claim", async function () {
      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: ethers.parseEther("10") });

      await realEstateCrowdfunding
        .connect(propertyOwner)
        .cancelProperty(propertyId);

      // First claim succeeds
      await realEstateCrowdfunding.connect(investor1).claimRefund(propertyId);

      // Second claim fails
      await expect(
        realEstateCrowdfunding.connect(investor1).claimRefund(propertyId),
      ).to.be.revertedWith("No investment to refund");
    });

    it("Should prevent refund on non-cancelled property", async function () {
      await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: ethers.parseEther("10") });

      await expect(
        realEstateCrowdfunding.connect(investor1).claimRefund(propertyId),
      ).to.be.revertedWith("Property must be cancelled for refund");
    });

    it("Should prevent refund if user has no investment", async function () {
      await realEstateCrowdfunding
        .connect(propertyOwner)
        .cancelProperty(propertyId);

      await expect(
        realEstateCrowdfunding.connect(investor1).claimRefund(propertyId),
      ).to.be.revertedWith("No investment to refund");
    });

    it("Should mark investment records as inactive after refund", async function () {
      const tx = await realEstateCrowdfunding
        .connect(investor1)
        .invest(propertyId, { value: ethers.parseEther("10") });
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.eventName === "InvestmentMade",
      );
      const investmentId = event.args.investmentId;

      await realEstateCrowdfunding
        .connect(propertyOwner)
        .cancelProperty(propertyId);

      await realEstateCrowdfunding.connect(investor1).claimRefund(propertyId);

      const investment = await realEstateCrowdfunding.investments(investmentId);
      expect(investment.isActive).to.be.false;
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
