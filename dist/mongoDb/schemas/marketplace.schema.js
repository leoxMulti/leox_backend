"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bid = exports.UsersInfo = exports.Fee = exports.NFT = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const nftSchema = new mongoose_1.default.Schema({
    tokenId: { type: String, required: true },
    seller: { type: String, lowercase: true },
    username: String,
    owner: { type: String, lowercase: true },
    name: String,
    description: String,
    image: String,
    price: String,
    supply: String,
    remainingSupply: Number,
    isListed: Boolean,
    saleType: Number,
    auctionStartTime: Number,
    auctionEndTime: Number,
    highestBidder: String,
    highestBid: String,
    claimed: Boolean,
    tokenURI: String,
    updatedAt: { type: Date, default: Date.now },
});
nftSchema.index({ tokenId: 1, seller: 1 }, { unique: true });
nftSchema.index({ owner: 1 });
nftSchema.index({ seller: 1, isListed: 1 });
const feeSchema = new mongoose_1.default.Schema({
    fee: { type: Number, required: true },
    updateAt: { type: Date, default: Date.now },
    txhase: { type: Number, required: true },
});
const UserInfo = new mongoose_1.default.Schema({
    name: { type: String, trim: true, lowercase: true },
    gmail: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true,
    },
    address: { type: String, required: true, lowercase: true, unique: true },
    roles: {
        type: [String],
        enum: ["Buyer", "Seller", "Admin", "Moderator", "Ban"],
        default: ["Buyer"],
    },
    isFirstTime: {
        type: Boolean,
        default: true,
    },
    follower: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
}, { timestamps: true });
const BidSchema = new mongoose_1.default.Schema({
    tokenId: { type: String, required: true },
    seller: { type: String, lowercase: true, required: true },
    bids: [
        {
            bidder: { type: String, lowercase: true },
            bid: { type: Number },
            txHash: { type: String },
            claim: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
});
BidSchema.index({ tokenId: 1, seller: 1, 'bids.bidder': 1 });
exports.NFT = mongoose_1.default.model("Nfts", nftSchema);
exports.Fee = mongoose_1.default.model("MarketplaceFee", feeSchema);
exports.UsersInfo = mongoose_1.default.model("UserInfos", UserInfo);
exports.Bid = mongoose_1.default.model("Bid", BidSchema);
//# sourceMappingURL=marketplace.schema.js.map