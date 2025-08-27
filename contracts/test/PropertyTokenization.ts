import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { viem } from "hardhat";
import type { Address } from "viem";

describe("PropertyTokenization", function () {
  async function deployPropertyTokenizationFixture() {
    const [owner, otherAccount, buyer] = await viem.getWalletClients();

    const propertyTokenization = await viem.deployContract(
      "PropertyTokenization"
    );

    const publicClient = await viem.getPublicClient();

    return {
      propertyTokenization,
      owner,
      otherAccount,
      buyer,
      publicClient,
    };
  }

  describe("Property Registration", function () {
    it("Should register a new property", async function () {
      const { propertyTokenization, owner } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      const hash = await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);

      // Get the token ID from the event
      const logs = await propertyTokenization.getEvents.PropertyRegistered();
      expect(logs).to.have.lengthOf(1);

      const tokenId = logs[0].args.tokenId!;
      expect(tokenId).to.equal(1n);

      // Check property details
      const property = await propertyTokenization.read.getProperty([tokenId]);
      expect(property.propertyId).to.equal(propertyId);
      expect(property.owner.toLowerCase()).to.equal(
        owner.account.address.toLowerCase()
      );
      expect(property.totalSupply).to.equal(0n);
      expect(property.tokenPrice).to.equal(0n);
      expect(property.exists).to.be.true;
      expect(property.metadataURI).to.equal(metadataURI);
    });

    it("Should not allow duplicate property registration", async function () {
      const { propertyTokenization } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);

      await expect(
        propertyTokenization.write.registerProperty([propertyId, metadataURI])
      ).to.be.rejectedWith("Property already registered");
    });

    it("Should not allow empty property ID", async function () {
      const { propertyTokenization } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      await expect(
        propertyTokenization.write.registerProperty([
          "",
          "https://ipfs.io/ipfs/QmTest123",
        ])
      ).to.be.rejectedWith("Property ID cannot be empty");
    });
  });

  describe("Property Tokenization", function () {
    it("Should tokenize a property successfully", async function () {
      const { propertyTokenization, owner } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      // Register property first
      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);
      const tokenId = 1n;

      // Tokenize the property
      const amount = 1000n;
      const tokenPrice = viem.parseEther("0.1");

      const hash = await propertyTokenization.write.tokenizeProperty([
        tokenId,
        amount,
        tokenPrice,
      ]);

      // Check events
      const logs = await propertyTokenization.getEvents.PropertyTokenized();
      expect(logs).to.have.lengthOf(1);
      expect(logs[0].args.tokenId).to.equal(tokenId);
      expect(logs[0].args.amount).to.equal(amount);
      expect(logs[0].args.tokenPrice).to.equal(tokenPrice);

      // Check balances
      const balance = await propertyTokenization.read.balanceOf([
        owner.account.address,
        tokenId,
      ]);
      expect(balance).to.equal(amount);

      // Check property details
      const property = await propertyTokenization.read.getProperty([tokenId]);
      expect(property.totalSupply).to.equal(amount);
      expect(property.tokenPrice).to.equal(tokenPrice);
    });

    it("Should not allow non-owner to tokenize property", async function () {
      const { propertyTokenization, otherAccount } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      // Register property as owner
      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);
      const tokenId = 1n;

      // Try to tokenize as other account
      await expect(
        propertyTokenization.write.tokenizeProperty(
          [tokenId, 1000n, viem.parseEther("0.1")],
          {
            account: otherAccount.account,
          }
        )
      ).to.be.rejectedWith("Only property owner can tokenize");
    });

    it("Should not tokenize unregistered property", async function () {
      const { propertyTokenization } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      await expect(
        propertyTokenization.write.tokenizeProperty([
          999n,
          1000n,
          viem.parseEther("0.1"),
        ])
      ).to.be.rejectedWith("Property not registered");
    });
  });

  describe("Token Trading", function () {
    it("Should allow buying tokens", async function () {
      const { propertyTokenization, owner, buyer } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      // Setup: Register and tokenize property
      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);
      const tokenId = 1n;
      const totalTokens = 1000n;
      const tokenPrice = viem.parseEther("0.1");

      await propertyTokenization.write.tokenizeProperty([
        tokenId,
        totalTokens,
        tokenPrice,
      ]);

      // Set approval for the contract to transfer tokens
      await propertyTokenization.write.setApprovalForAll([
        propertyTokenization.address,
        true,
      ]);

      // Buy tokens
      const tokensToBuy = 100n;
      const totalPrice = tokenPrice * tokensToBuy;

      const initialOwnerBalance = await propertyTokenization.read.balanceOf([
        owner.account.address,
        tokenId,
      ]);
      const initialBuyerBalance = await propertyTokenization.read.balanceOf([
        buyer.account.address,
        tokenId,
      ]);

      await propertyTokenization.write.buyTokens([tokenId, tokensToBuy], {
        account: buyer.account,
        value: totalPrice,
      });

      // Check balances after purchase
      const finalOwnerBalance = await propertyTokenization.read.balanceOf([
        owner.account.address,
        tokenId,
      ]);
      const finalBuyerBalance = await propertyTokenization.read.balanceOf([
        buyer.account.address,
        tokenId,
      ]);

      expect(finalOwnerBalance).to.equal(initialOwnerBalance - tokensToBuy);
      expect(finalBuyerBalance).to.equal(initialBuyerBalance + tokensToBuy);
    });

    it("Should not allow buying with insufficient payment", async function () {
      const { propertyTokenization, buyer } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      // Setup: Register and tokenize property
      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);
      const tokenId = 1n;
      const tokenPrice = viem.parseEther("0.1");

      await propertyTokenization.write.tokenizeProperty([
        tokenId,
        1000n,
        tokenPrice,
      ]);
      await propertyTokenization.write.setApprovalForAll([
        propertyTokenization.address,
        true,
      ]);

      // Try to buy with insufficient payment
      const tokensToBuy = 100n;
      const insufficientPayment = viem.parseEther("5"); // Less than required

      await expect(
        propertyTokenization.write.buyTokens([tokenId, tokensToBuy], {
          account: buyer.account,
          value: insufficientPayment,
        })
      ).to.be.rejectedWith("Insufficient payment");
    });
  });

  describe("Utility Functions", function () {
    it("Should get property by token ID", async function () {
      const { propertyTokenization } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);
      const tokenId = 1n;

      const tokenIdFromPropertyId =
        await propertyTokenization.read.getTokenIdByPropertyId([propertyId]);
      expect(tokenIdFromPropertyId).to.equal(tokenId);
    });

    it("Should update token price", async function () {
      const { propertyTokenization } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);
      const tokenId = 1n;

      const newPrice = viem.parseEther("0.2");
      await propertyTokenization.write.updateTokenPrice([tokenId, newPrice]);

      const property = await propertyTokenization.read.getProperty([tokenId]);
      expect(property.tokenPrice).to.equal(newPrice);
    });

    it("Should return correct URI", async function () {
      const { propertyTokenization } = await loadFixture(
        deployPropertyTokenizationFixture
      );

      const propertyId = "prop-123";
      const metadataURI = "https://ipfs.io/ipfs/QmTest123";

      await propertyTokenization.write.registerProperty([
        propertyId,
        metadataURI,
      ]);
      const tokenId = 1n;

      const uri = await propertyTokenization.read.uri([tokenId]);
      expect(uri).to.equal(metadataURI);
    });
  });
});
