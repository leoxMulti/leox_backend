"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNFTListener = startNFTListener;
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const bsc_service_1 = require("../../config/bsc.service");
const index_1 = require("../../index");
const nft_controlers_1 = require("./nft.controlers");
const userInfo_controlers_1 = require("./userInfo.controlers");
const AuctionBid_controlers_1 = require("./AuctionBid.controlers");
const ethers_1 = require("ethers");
async function startNFTListener() {
    const contract = await (0, bsc_service_1.createEthContract)();
    contract.on('TokenListed', async (tokenId, seller, price, event) => {
        try {
            console.log(`🎨 New NFT Listed! Token ID: ${tokenId}, Seller: ${seller}, Price: ${price}`);
            const transformedNFT = await (0, nft_controlers_1.syncSingleNFT)({
                tokenId: tokenId.toString(),
                address: seller,
            });
            index_1.io.emit('newNFTListed', transformedNFT);
        }
        catch (error) {
            console.error('❌ Error syncing new NFT:', error);
        }
    });
    //  update fee listen
    contract.on('UpdateFee', async (newFee, timestamp, event) => {
        try {
            const savedFee = await marketplace_schema_1.Fee.create({
                fee: Number(newFee) / 10,
                updateAt: new Date(Number(timestamp) * 1000),
                txHash: event.transactionHash,
            });
            index_1.io.emit('updateFee', savedFee.toObject());
            console.log('✅ Fee updated:', savedFee);
        }
        catch (error) {
            console.warn('Failed to update fee in MongoDB:', error.message);
        }
    });
    //update Bid
    contract.on('NewBid', async (tokenId, seller, bidder, bid, event) => {
        try {
            await (0, AuctionBid_controlers_1.bids)({
                tokenId: tokenId.toString(),
                seller,
                bidder,
                claim: false,
                totalBid: parseFloat(ethers_1.ethers.formatEther(bid)),
                txHash: event.transactionHash,
            });
            await (0, AuctionBid_controlers_1.changeHigestBiderInfo)(tokenId, seller, bid, bidder);
            const updatedBidDoc = await marketplace_schema_1.Bid.findOne({
                tokenId: tokenId.toString(),
                seller: seller.toLowerCase(),
            }).lean();
            index_1.io.emit('NewBid', {
                tokenId: tokenId.toString(),
                seller: seller.toLowerCase(),
                bids: updatedBidDoc?.bids || [],
            });
            console.log(`💰 New/Updated bid for Token ${tokenId}: ${bidder} bid ${ethers_1.ethers.formatEther(bid)}`);
        }
        catch (error) {
            console.warn('Failed to update bid :', error.message);
        }
    });
    // Buy Nft
    contract.on('TokenBought', async (tokenId, buyer, seller, quantity, totalPrice, event) => {
        try {
            const nft = await (0, userInfo_controlers_1.findNFT)({ tokenId, seller });
            if (!nft) {
                console.warn(`⚠️ NFT not found for tokenId: ${tokenId}, seller: ${seller}`);
                return; // exit early so you don't try to access null
            }
            const tokenStr = tokenId.toString();
            const newRemaining = nft.remainingSupply - Number(quantity);
            const update = {
                $set: {
                    remainingSupply: newRemaining,
                    updatedAt: new Date(),
                    isListed: true,
                },
            };
            if (newRemaining <= 0) {
                update.$set.isListed = false;
            }
            const updatedNFT = await marketplace_schema_1.NFT.findOneAndUpdate({ tokenId: tokenStr, seller: seller.toLowerCase() }, update, { new: true });
            const buyerNFT = await (0, nft_controlers_1.newBuyer)({ tokenId, buyer, seller, quantity });
            index_1.io.emit('TokenBought', {
                tokenId: tokenStr,
                buyer: buyer.toLowerCase(),
                seller: seller.toLowerCase(),
                quantity: quantity.toString(),
                totalPrice: totalPrice.toString(),
                remainingSupply: newRemaining,
                buyerNFT,
            });
            console.log('updatedNFT', updatedNFT);
        }
        catch (error) {
            console.error('❌ Error handling TokenBought:', error);
        }
    });
    contract.on('AuctionClaimed', async (tokenId, seller, winner, amount, event) => {
        const caller = (await event.getTransaction()).from.toLowerCase();
        await (0, AuctionBid_controlers_1.handleAuctionClaimed)(tokenId, seller, winner, caller, index_1.io);
    });
    contract.on('BidRefunded', async (tokenId, seller, bidder) => {
        await (0, AuctionBid_controlers_1.handleBidRefunded)(tokenId, seller, bidder, index_1.io);
    });
}
//# sourceMappingURL=listener.controlers.js.map