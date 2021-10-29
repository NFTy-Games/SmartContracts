require("@nomiclabs/hardhat-web3");

task("mintTradeStand", "Mint a trade stand NFT")
  .addParam("address", "The address of the TradeStand contract")
  .addParam("uri", "The tokenURI")
  .setAction(async ({ address, uri }) => {
    const [deployer] = await hre.ethers.getSigners();
    const tradeStand = await hre.ethers.getContractAt(
      "TradeStand",
      address,
      deployer
    );
    await tradeStand.mint(uri);
    console.info(`Minted a trade stand on network >${hre.network.name}<`);
  });
