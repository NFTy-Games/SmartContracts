require("@nomiclabs/hardhat-web3");

task("deployTradeStand", "Deploys the trade stand ERC721 contract").setAction(
  async () => {
    const TradeStand = await hre.ethers.getContractFactory("TradeStand");
    const tradeStand = await TradeStand.deploy();
    await tradeStand.deployed();
    console.info(
      `Deployed contract at ${tradeStand.address} on network >${hre.network.name}<`
    );
  }
);
