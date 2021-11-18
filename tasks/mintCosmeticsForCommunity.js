require("@nomiclabs/hardhat-web3");

task("mintCosmeticsForCommunity", "Mint a cosmetic Token for the community")
  .addParam("address", "The address of the TradeStand contract")
  .addParam("to", "The address of receiver")
  .addParam("expecteditemid", "The item that should be minted")
  .addParam("index", "The index of the item")
  .setAction(async ({ address, to, expecteditemid, index }) => {
    const [deployer] = await hre.ethers.getSigners();
    const cosmetics = await hre.ethers.getContractAt(
      "Cosmetics",
      address,
      deployer
    );
    const itemId = await cosmetics.callStatic.mintableItems(index);
    if (itemId.toString() === expecteditemid) {
        await cosmetics.mintForCommunity(to, index);
        console.info(`Minted a cosmetic on network >${hre.network.name}< for the address ${to}`);
    } else {
        console.error("The expected item can not be found at the given index");
    }
  });
