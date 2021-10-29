const { expect } = require("chai");

describe("TradeStand", function () {
  let deployer, user1, user2;
  let tradeStand;

  before(async function () {
    [deployer, user1, user2] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const TradeStand = await hre.ethers.getContractFactory("TradeStand");
    tradeStand = await TradeStand.deploy();
    await tradeStand.deployed();
  });

  describe("Minting", function () {
    it("should not be possible to mint for any other than the owner", async function () {
      const contractFromUser = await hre.ethers.getContractAt(
        "TradeStand",
        tradeStand.address,
        user1
      );
      await expect(
        contractFromUser.mint("https://gateway.pinata.cloud/ipfs/a/helm1.json")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should give the first minted token the id of 1 & the minter should be the owner", async function () {
      await tradeStand.mint("https://gateway.pinata.cloud/ipfs/a/helm1.json");
      const tokens = await tradeStand.tokensOfOwner(deployer.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0].toString()).to.equal("1");
    });

    it("should set the tokenUri to the baseUrl + tokenId + .json", async function () {
      await tradeStand.mint("https://gateway.pinata.cloud/ipfs/a/helm1.json");
      await tradeStand.mint("https://gateway.pinata.cloud/ipfs/b/shoe4.json");
      const tokens = await tradeStand.tokensOfOwner(deployer.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0].toString()).to.equal("1");
      expect(tokens[1].toString()).to.equal("2");

      expect(await tradeStand.tokenURI(tokens[0].toString())).to.equal(
        "https://gateway.pinata.cloud/ipfs/a/helm1.json"
      );
      expect(await tradeStand.tokenURI(tokens[1].toString())).to.equal(
        "https://gateway.pinata.cloud/ipfs/b/shoe4.json"
      );
    });
  });

  it("should be possible to check if a token exists", async function () {
    await tradeStand.mint("https://gateway.pinata.cloud/ipfs/a/helm1.json");
    expect(await tradeStand.exists(1)).to.be.true;
    expect(await tradeStand.exists(2)).to.be.false;
  });

  it("should be possible to change the tokenUri", async function () {
    await tradeStand.mint("https://gateway.pinata.cloud/ipfs/a/helm1.json");
    await tradeStand.setTokenURI(
      1,
      "https://gateway.pinata.cloud/ipfs/b/helm1.json"
    );
    expect(await tradeStand.tokenURI(1)).to.equal(
      "https://gateway.pinata.cloud/ipfs/b/helm1.json"
    );
  });

  it("should only be possible to change the tokenUri as the owner", async function () {
    const contractFromUser = await hre.ethers.getContractAt(
      "TradeStand",
      tradeStand.address,
      user1
    );
    await expect(
      contractFromUser.setTokenURI(
        1,
        "https://gateway.pinata.cloud/ipfs/b/helm1.json"
      )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should be not be possible to recover ETH to the 0 address", async function () {
    await expect(
      tradeStand.emergencyRecoverETH(
        "0x0000000000000000000000000000000000000000",
        10
      )
    ).to.be.revertedWith("Cannot recover ETH to the 0 address");
  });

  it("should only be possible to recover ETH as the owner", async function () {
    const contractFromUser = await hre.ethers.getContractAt(
      "TradeStand",
      tradeStand.address,
      user1
    );
    await expect(
      contractFromUser.emergencyRecoverETH(user2.address, 10)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should be possible to recover tokens", async function () {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy();
    await mockERC20.deployed();

    await mockERC20.transfer(tradeStand.address, 100);

    expect((await mockERC20.balanceOf(user1.address)).toString()).to.equal("0");

    tradeStand.emergencyRecoverTokens(mockERC20.address, user1.address, 50);

    expect((await mockERC20.balanceOf(user1.address)).toString()).to.equal(
      "50"
    );
  });

  it("should be not be possible to recover tokens to the 0 address", async function () {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy();
    await mockERC20.deployed();

    await expect(
      tradeStand.emergencyRecoverTokens(
        mockERC20.address,
        "0x0000000000000000000000000000000000000000",
        10
      )
    ).to.be.revertedWith("Cannot recover tokens to the 0 address");
  });

  it("should only be possible to recover tokens as the owner", async function () {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy();
    await mockERC20.deployed();

    const contractFromUser = await hre.ethers.getContractAt(
      "TradeStand",
      tradeStand.address,
      user1
    );
    await expect(
      contractFromUser.emergencyRecoverTokens(
        mockERC20.address,
        user1.address,
        10
      )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
