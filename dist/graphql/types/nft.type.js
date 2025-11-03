"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userProfile = exports.BidType = exports.UserInfoType = exports.NftType = void 0;
const graphql_1 = require("graphql");
exports.NftType = new graphql_1.GraphQLObjectType({
    name: "nft",
    fields: {
        tokenId: { type: graphql_1.GraphQLString },
        seller: { type: graphql_1.GraphQLString },
        username: { type: graphql_1.GraphQLString },
        owner: { type: graphql_1.GraphQLString },
        name: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        image: { type: graphql_1.GraphQLString },
        price: { type: graphql_1.GraphQLString },
        isListed: { type: graphql_1.GraphQLBoolean },
        supply: { type: graphql_1.GraphQLString },
        remainingSupply: { type: graphql_1.GraphQLInt },
        saleType: { type: graphql_1.GraphQLInt },
        auctionStartTime: { type: graphql_1.GraphQLInt },
        auctionEndTime: { type: graphql_1.GraphQLInt },
        highestBidder: { type: graphql_1.GraphQLString },
        highestBid: { type: graphql_1.GraphQLString },
        claimed: { type: graphql_1.GraphQLBoolean },
        tokenURI: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString }
    },
});
exports.UserInfoType = new graphql_1.GraphQLObjectType({
    name: "user",
    fields: {
        name: { type: graphql_1.GraphQLString },
        gmail: { type: graphql_1.GraphQLString },
        address: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        roles: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        isFirstTime: { type: graphql_1.GraphQLBoolean },
        follower: { type: graphql_1.GraphQLInt },
        following: { type: graphql_1.GraphQLInt },
    },
});
const SingleBidType = new graphql_1.GraphQLObjectType({
    name: "SingleBid",
    fields: {
        bidder: { type: graphql_1.GraphQLString },
        bid: { type: graphql_1.GraphQLFloat },
        txHash: { type: graphql_1.GraphQLString },
        claim: { type: graphql_1.GraphQLBoolean },
        createdAt: { type: graphql_1.GraphQLString },
    },
});
exports.BidType = new graphql_1.GraphQLObjectType({
    name: "bid",
    fields: {
        tokenId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        seller: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        bids: { type: new graphql_1.GraphQLList(SingleBidType) }
    }
});
const minimalUserType = new graphql_1.GraphQLObjectType({
    name: "MinimalUser",
    fields: {
        name: { type: graphql_1.GraphQLString },
        address: { type: graphql_1.GraphQLString },
        roles: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        follower: { type: graphql_1.GraphQLInt },
        following: { type: graphql_1.GraphQLInt },
    },
});
const ProfileNFTsType = new graphql_1.GraphQLObjectType({
    name: "ProfileNFTsType",
    fields: {
        owned: { type: new graphql_1.GraphQLList(exports.NftType) },
        sale: { type: new graphql_1.GraphQLList(exports.NftType) },
        created: { type: new graphql_1.GraphQLList(exports.NftType) },
        sold: { type: new graphql_1.GraphQLList(exports.NftType) },
    },
});
exports.userProfile = new graphql_1.GraphQLObjectType({
    name: "userProfile",
    fields: {
        user: { type: minimalUserType },
        nfts: { type: ProfileNFTsType }
    }
});
//# sourceMappingURL=nft.type.js.map