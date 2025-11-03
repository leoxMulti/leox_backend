"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBidRefunded = exports.handleAuctionClaimed = exports.changeHigestBiderInfo = exports.bids = exports.findAuctionNft = void 0;
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const nft_controlers_1 = require("./nft.controlers");
const userInfo_controlers_1 = require("./userInfo.controlers");
//find the current nft with bids
const findAuctionNft = async ({ tokenId, seller }) => await marketplace_schema_1.Bid.findOne({ tokenId, seller: seller.toLowerCase() }).lean();
exports.findAuctionNft = findAuctionNft;
const bids = async ({ tokenId, seller, bidder, totalBid, claim, txHash, }) => {
    const lowerSeller = seller.toLowerCase();
    const lowerBidder = bidder.toLowerCase();
    const alreadyBids = await marketplace_schema_1.Bid.findOne({
        tokenId,
        seller: lowerSeller,
        'bids.bidder': lowerBidder,
    });
    console.log('alreadyBids', alreadyBids);
    if (alreadyBids) {
        await marketplace_schema_1.Bid.updateOne({ tokenId, seller: lowerSeller, 'bids.bidder': lowerBidder }, {
            $set: {
                'bids.$.bid': totalBid,
                'bids.$.claim': claim,
                'bids.$.createdAt': new Date(),
                'bids.$.txHash': txHash,
            },
        });
    }
    else {
        await marketplace_schema_1.Bid.findOneAndUpdate({ tokenId, seller: lowerSeller }, {
            $push: {
                bids: {
                    bidder: lowerBidder,
                    bid: totalBid,
                    claim,
                    txHash,
                    createdAt: new Date(),
                },
            },
        }, { upsert: true, new: true });
    }
};
exports.bids = bids;
//when bid change check is it highestbid then update
const changeHigestBiderInfo = async (tokenId, seller, totalBid, bidder) => {
    try {
        const result = await marketplace_schema_1.NFT.findOneAndUpdate({
            tokenId,
            seller: seller.toLowerCase(),
            $or: [{ highestBid: { $lt: totalBid } }],
        }, {
            $set: {
                highestBid: totalBid.toString(),
                highestBidder: bidder.toLowerCase(),
                updatedAt: new Date(),
            },
        }, { new: true });
        if (result) {
            console.log(`🏆 Updated highest bid for token ${tokenId} (${seller}): ${totalBid} from ${bidder}`);
        }
        else {
            console.log(`⚠️ Bid ${totalBid} not higher than current highest for token ${tokenId}`);
        }
    }
    catch (error) {
        console.error('❌ Error updating highest bidder info:', error);
    }
};
exports.changeHigestBiderInfo = changeHigestBiderInfo;
const handleAuctionClaimed = async (tokenId, seller, highestBidder, caller, io) => {
    try {
        const tokenStr = tokenId.toString();
        const lowerSeller = seller.toLowerCase();
        const lowerHighestBidder = highestBidder.toLowerCase();
        const lowerCaller = caller.toLowerCase();
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
        // Fetch NFT data
        const nft = await (0, userInfo_controlers_1.findNFT)({ tokenId: tokenStr, seller: lowerSeller });
        if (!nft) {
            console.warn(`⚠️ NFT not found: tokenId ${tokenId}, seller ${seller}`);
            return;
        }
        const hasWinner = lowerHighestBidder !== ZERO_ADDRESS;
        let buyerNFT = null;
        // ✅ Claim permission check
        const canClaim = hasWinner
            ? lowerCaller === lowerSeller || lowerCaller === lowerHighestBidder
            : lowerCaller === lowerSeller;
        if (!canClaim) {
            console.warn(`🚫 Unauthorized claim attempt: ${caller} for token ${tokenId}`);
            return;
        }
        // ✅ Update NFT as claimed/unlisted
        await marketplace_schema_1.NFT.findOneAndUpdate({ tokenId: tokenStr, seller: lowerSeller }, { $set: { claimed: true, updatedAt: new Date(), isListed: false } });
        if (hasWinner) {
            // ✅ Refund and transfer to winner
            await (0, exports.handleBidRefunded)(tokenId, lowerSeller, lowerHighestBidder, io);
            buyerNFT = await (0, nft_controlers_1.newBuyer)({
                tokenId: tokenStr,
                seller: lowerSeller,
                buyer: lowerHighestBidder,
                quantity: 1,
            });
            console.log(`✅ Auction claimed: token ${tokenId}, winner ${highestBidder}`);
        }
        else {
            console.log(`⚠️ Auction ended with no bids, seller reclaimed NFT ${tokenId}`);
        }
        // ✅ Always emit event so frontend updates
        io.emit("AuctionClaimed", {
            tokenId: tokenStr,
            seller: lowerSeller,
            caller: lowerCaller,
            highestBidder: hasWinner ? lowerHighestBidder : null,
            buyerNFT: buyerNFT || null,
            hasWinner,
        });
    }
    catch (error) {
        console.error('❌ Error handling AuctionClaimed:', error);
    }
};
exports.handleAuctionClaimed = handleAuctionClaimed;
const handleBidRefunded = async (tokenId, seller, caller, io) => {
    try {
        const tokenStr = tokenId.toString();
        const lowerSeller = seller.toLowerCase();
        const lowerCaller = caller.toLowerCase();
        const updatedBid = await marketplace_schema_1.Bid.findOneAndUpdate({
            tokenId: tokenStr,
            seller: lowerSeller,
            'bids.bidder': lowerCaller,
        }, {
            $set: {
                'bids.$.bid': 0,
                'bids.$.updatedAt': new Date(),
                'bids.$.claim': true,
            },
        }, { new: true });
        if (!updatedBid) {
            console.warn(`⚠️ No bid found for token ${tokenStr}, seller ${lowerSeller}, bidder ${lowerCaller}`);
            return;
        }
        io.emit('BidRefunded', {
            tokenId: tokenStr,
            seller: lowerSeller,
            caller: lowerCaller,
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.handleBidRefunded = handleBidRefunded;
//# sourceMappingURL=AuctionBid.controlers.js.map