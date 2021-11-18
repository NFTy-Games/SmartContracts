const { expect } = require("chai");

describe("Cosmetics", function () {
  let deployer, user1, user2;
  let cosmetics;

  before(async function () {
    [deployer, user1, user2] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const Cosmetics = await hre.ethers.getContractFactory("Cosmetics");
    cosmetics = await Cosmetics.deploy(
      "https://gateway.pinata.cloud/ipfs/a/{id}.json"
    );
    await cosmetics.deployed();
  });

  describe("Minting", function () {
    it("should be possible to mint after the sale has started", async function () {
      await cosmetics.toggleSaleState();
      const contractFromUser = await hre.ethers.getContractAt(
        "Cosmetics",
        cosmetics.address,
        user1
      );
      const prevTotalBalance = await cosmetics.totalSupplyLeft();
      await contractFromUser.mint(1, {
        value: hre.ethers.BigNumber.from("50000000000000000"),
      });
      expect((await cosmetics.totalSupplyLeft()).toNumber()).to.equal(
        prevTotalBalance.sub(1).toNumber()
      );
    });

    it("should not be possible to mint if the sale has not started yet", async function () {
      await expect(
        cosmetics.mint(1, {
          value: hre.ethers.BigNumber.from("50000000000000000"),
        })
      ).to.be.revertedWith("Sale is not active");
    });

    it("should not be possible to mint with less than the required eth value", async function () {
      await cosmetics.toggleSaleState();
      await expect(
        cosmetics.mint(2, {
          value: hre.ethers.BigNumber.from("49000000000000000").mul(2),
        })
      ).to.be.revertedWith("Ether value sent is not correct");
    });

    it("should be possible to mint for the community", async function () {
      await cosmetics.mintForCommunity(user1.address, 5);
      expect((await cosmetics.balanceOf(user1.address, 1)).toNumber()).to.equal(
        1
      );
    });

    it("should not be possible to mint for the community to the 0 address", async function () {
      await expect(
        cosmetics.mintForCommunity(
          "0x0000000000000000000000000000000000000000",
          5
        )
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("should not be possible to mint for the community out of range", async function () {
      await expect(
        cosmetics.mintForCommunity(
          "0x0000000000000000000000000000000000000000",
          2000
        )
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("should only be possible to mint for the community as the owner", async function () {
      const contractFromUser = await hre.ethers.getContractAt(
        "Cosmetics",
        cosmetics.address,
        user1
      );
      await expect(
        contractFromUser.mintForCommunity(user1.address, 5)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  it("should work the whole way", async function () {
    // Mint for airdrops
    await cosmetics.mintForCommunity(deployer.address, 0);
    await cosmetics.mintForCommunity(deployer.address, 4);

    // Mint rest
    await cosmetics.toggleSaleState();
    for (let i = 0; i < 1090 / 5; i++) {
      await cosmetics.mint(5, {
        value: hre.ethers.BigNumber.from("50000000000000000").mul(5),
      });
    }

    await expect(
      cosmetics.mint(1, {
        value: hre.ethers.BigNumber.from("50000000000000000"),
      })
    ).to.be.revertedWith("Minting would exceed cap");

    // Check if all cosmetics have been minted
    for (let i = 0; i < 156; i++) {
      const numOfItems = await cosmetics.balanceOf(deployer.address, i);
      if (i < 60 || i >= 138) {
        expect(numOfItems.toNumber()).to.equal(4);
      } else {
        expect(numOfItems.toNumber()).to.equal(10);
      }
    }

    // check balance
    const prevBalance = await user1.getBalance();
    await cosmetics.withdraw(user1.address);
    expect(await user1.getBalance()).to.equal(
      prevBalance.add(hre.ethers.BigNumber.from("50000000000000000").mul(1090))
    );
  });

  it("should be possible to change the uri", async function () {
    await cosmetics.setURI("https://gateway.pinata.cloud/ipfs/b/{id}.json");
    expect(await cosmetics.uri(0)).to.equal(
      "https://gateway.pinata.cloud/ipfs/b/{id}.json"
    );
  });

  it("should only be possible to change the uri for the owner", async function () {
    const contractFromUser = await hre.ethers.getContractAt(
      "Cosmetics",
      cosmetics.address,
      user1
    );
    await expect(
      contractFromUser.setURI("https://gateway.pinata.cloud/ipfs/b/{id}.json")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should be possible to withdraw eth", async function () {
    await cosmetics.toggleSaleState();
    await cosmetics.mint(1, { value: "50000000000000000" });
    const prevBalance = await user1.getBalance();
    await cosmetics.withdraw(user1.address);
    expect(await user1.getBalance()).to.equal(
      prevBalance.add("50000000000000000")
    );
  });

  it("should only be possible to withdraw eth for the owner", async function () {
    const contractFromUser = await hre.ethers.getContractAt(
      "Cosmetics",
      cosmetics.address,
      user1
    );
    await expect(contractFromUser.withdraw(user1.address)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should only be possible to withdraw eth to the 0 address", async function () {
    await cosmetics.toggleSaleState();
    await cosmetics.mint(1, { value: "50000000000000000" });
    await expect(
      cosmetics.withdraw("0x0000000000000000000000000000000000000000")
    ).to.be.revertedWith("Cannot recover tokens to the 0 address");
  });

  it("should be possible to recover ETH", async function () {
    await cosmetics.toggleSaleState();
    await cosmetics.mint(1, { value: "60000000000000000" });
    const prevBalance = await user1.getBalance();
    await cosmetics.emergencyRecoverETH(user1.address, "10000000000000000");
    expect(await user1.getBalance()).to.equal(
      prevBalance.add("10000000000000000")
    );
  });

  it("should be not be possible to recover ETH to the 0 address", async function () {
    await expect(
      cosmetics.emergencyRecoverETH(
        "0x0000000000000000000000000000000000000000",
        10
      )
    ).to.be.revertedWith("Cannot recover ETH to the 0 address");
  });

  it("should only be possible to recover ETH as the owner", async function () {
    const contractFromUser = await hre.ethers.getContractAt(
      "Cosmetics",
      cosmetics.address,
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

    await mockERC20.transfer(cosmetics.address, 100);

    expect((await mockERC20.balanceOf(user1.address)).toString()).to.equal("0");

    cosmetics.emergencyRecoverTokens(mockERC20.address, user1.address, 50);

    expect((await mockERC20.balanceOf(user1.address)).toString()).to.equal(
      "50"
    );
  });

  it("should be not be possible to recover tokens to the 0 address", async function () {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy();
    await mockERC20.deployed();

    await expect(
      cosmetics.emergencyRecoverTokens(
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
      "Cosmetics",
      cosmetics.address,
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
