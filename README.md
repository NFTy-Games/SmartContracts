# Smart Contracts

## Deploy trade stand on rinkeby

```
npx hardhat deployTradeStand --network rinkeby
```

## Mint token on rinkeby

```
npx hardhat mintTradeStand --address <contract address> --uri <URI> --network rinkeby
```

## Deploy cosmetics on rinkeby

```
npx hardhat deployCosmetics --uri <URI> --network rinkeby
```

## Mint cosmetics for the community on rinkeby

The cosmetics for the community should be minted before sale.

```
npx hardhat mintCosmeticsForCommunity --address <contract address> --to <receiver address> --expecteditemid <item id to check the index> --index <item index in mintableItems> --network rinkeby
```

## Toggle the sale state for the cosmetics on rinkeby

```
npx hardhat toggleCosmeticsSaleState --address <contract address> --network rinkeby
```