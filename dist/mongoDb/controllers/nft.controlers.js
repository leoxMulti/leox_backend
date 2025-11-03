"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNFTs = exports.newBuyer = exports.syncSingleNFT = void 0;
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const bsc_service_1 = require("../../config/bsc.service");
const ipfs_service_1 = require("../../config/ipfs.service");
const ethers_1 = require("ethers");
const userInfo_controlers_1 = require("./userInfo.controlers");
const utils_1 = require("../../utils");
const syncSingleNFT = async ({ tokenId, address }) => {
    const contract = await (0, bsc_service_1.createEthContract)();
    try {
        const nft = await contract.Listings(tokenId, address);
        const tokenURI = await contract.uri(tokenId);
        const meta = await (0, ipfs_service_1.fetchMetadata)(tokenURI);
        const username = await (0, utils_1.findNameByNftAddress)(nft[2]);
        const transformedNFT = {
            tokenId,
            owner: nft[1],
            seller: nft[2],
            username,
            name: meta.name || `Token #${tokenId}`,
            description: meta.description || '',
            image: meta.image || '',
            price: parseFloat(ethers_1.ethers.formatEther(nft[3])),
            supply: nft[4].toString(),
            remainingSupply: Number(nft[5]),
            isListed: nft[6],
            saleType: Number(nft[7]),
            auctionStartTime: Math.floor(Number(nft[8]) - (Number(nft[8]) - Date.now() / 1000)),
            auctionEndTime: Math.floor(Number(nft[8])),
            highestBidder: nft[9],
            highestBid: parseFloat(ethers_1.ethers.formatEther(nft[10])),
            claimed: nft[11],
            tokenURI,
            updatedAt: new Date(),
        };
        await marketplace_schema_1.NFT.updateOne({ tokenId: transformedNFT.tokenId, seller: transformedNFT.seller }, { $set: transformedNFT }, { upsert: true });
        return transformedNFT;
    }
    catch (error) {
        console.error(`❌ Failed to sync NFT ${tokenId}:`, error);
    }
};
exports.syncSingleNFT = syncSingleNFT;
const newBuyer = async ({ tokenId, buyer, seller, quantity }) => {
    const contract = await (0, bsc_service_1.createEthContract)();
    const balanceOfBuyer = await contract.balanceOf(buyer, Number(tokenId));
    const lowerBuyer = buyer.toLowerCase();
    const tokenStr = tokenId.toString();
    const { owner, name, description, image, tokenURI } = await (0, userInfo_controlers_1.findNFT)({
        tokenId: tokenStr,
        seller: seller.toLowerCase(),
    });
    const buyerNft = await (0, userInfo_controlers_1.findNFT)({ tokenId: tokenStr, seller: buyer });
    const username = await (0, utils_1.findNameByNftAddress)(lowerBuyer);
    let resultNFT;
    if (!buyerNft) {
        const newBuyerNFT = {
            tokenId: tokenStr,
            owner: owner,
            seller: lowerBuyer,
            username,
            name,
            description,
            image,
            price: '0',
            supply: quantity,
            remainingSupply: Number(balanceOfBuyer),
            isListed: false,
            saleType: 0,
            auctionStartTime: 0,
            auctionEndTime: 0,
            highestBidder: '0x0000000000000000000000000000000000000000',
            highestBid: 0,
            claimed: false,
            tokenURI,
            updatedAt: new Date(),
        };
        resultNFT = await marketplace_schema_1.NFT.create(newBuyerNFT);
        console.log(`🟢 Created buyer record for ${buyer} (tokenId: ${tokenStr})`);
    }
    else {
        const newSupply = Number(buyerNft.remainingSupply || 0) + quantity;
        buyerNft.remainingSupply = newSupply;
        buyerNft.updatedAt = new Date();
        resultNFT = await buyerNft.save();
        console.log(`🟢 Updated buyer record for ${buyer} (tokenId: ${tokenStr})`);
    }
    return resultNFT.toObject ? resultNFT.toObject() : resultNFT;
};
exports.newBuyer = newBuyer;
const getNFTs = async (start, limit, sortBy) => {
    const sortOptions = {};
    switch (sortBy) {
        case 'highestPrice':
            sortOptions.price = -1;
            break;
        case 'lowestPrice':
            sortOptions.price = 1;
            break;
        case 'recent':
        default:
            sortOptions.updatedAt = -1;
            break;
        case 'oldest':
            sortOptions.updatedAt = 1;
            break;
    }
    const nfts = await marketplace_schema_1.NFT.find({}).sort(sortOptions).skip(start).limit(limit).lean().exec();
    const normalized = nfts.map((n) => ({
        ...n,
        updatedAt: n.updatedAt instanceof Date ? n.updatedAt.toISOString() : new Date(n.updatedAt).toISOString(),
    }));
    return normalized;
};
exports.getNFTs = getNFTs;
//# sourceMappingURL=nft.controlers.js.map