require("@nomiclabs/hardhat-web3");

task("deployCosmetics", "Deploys the cosmetics ERC1155 contract")
  .addParam("uri", "The token uri with id placeholder")
  .setAction(async ({ uri }) => {
    const Cosmetics = await hre.ethers.getContractFactory("Cosmetics");
    const cosmetics = await Cosmetics.deploy(uri);
    await cosmetics.deployed();
    console.info(
      `Deployed contract at ${cosmetics.address} on network >${hre.network.name}<`
    );
  }
);
