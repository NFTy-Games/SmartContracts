require("@nomiclabs/hardhat-web3");

task("toggleCosmeticsSaleState", "Toggle the sale state")
  .addParam("address", "The address of the TradeStand contract")
  .setAction(async ({ address }) => {
      const [deployer] = await hre.ethers.getSigners();
      const cosmetics = await hre.ethers.getContractAt(
        "Cosmetics",
        address,
        deployer
      );
      const receipt = await cosmetics.toggleSaleState();
      await receipt.wait();

      console.info(
        `The sale state for contract at ${cosmetics.address} on network >${hre.network.name}< is now ${await cosmetics.callStatic.saleIsActive()}`
      );
  });
