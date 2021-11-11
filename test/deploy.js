const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(nftMarket.address);
    await nft.deployed();

    let listingPrice = await nftMarket.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    await nft.createToken("https://mytokenlocation.com");
    await nft.createToken("https://mytokenlocation2.com");

    await nftMarket.createMarketItem(nft.address, 1, auctionPrice, {
      value: listingPrice,
    });
    await nftMarket.createMarketItem(nft.address, 2, auctionPrice, {
      value: listingPrice,
    });

    const [_, buyerAddress] = await ethers.getSigners();

    await nftMarket.connect(buyerAddress).createMarketSale(nft.address, 1, {
      value: auctionPrice,
    });

    let items = await nftMarket.fetchMarketItems();

    items = await Promise.all(
      items.map(async (i) => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
        };

        return item;
      })
    );
    console.log("items:", items);
  });
});
