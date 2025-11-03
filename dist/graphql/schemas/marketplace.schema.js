"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplace = void 0;
const graphql_1 = require("graphql");
const nft_type_1 = require("../types/nft.type");
const nft_controlers_1 = require("../../mongoDb/controllers/nft.controlers");
const userInfo_controlers_1 = require("../../mongoDb/controllers/userInfo.controlers");
const AuctionBid_controlers_1 = require("../../mongoDb/controllers/AuctionBid.controlers");
const marketplace_schema_1 = require("../../mongoDb/schemas/marketplace.schema");
const RootQuery = new graphql_1.GraphQLObjectType({
    name: 'Query',
    fields: {
        nfts: {
            type: new graphql_1.GraphQLList(nft_type_1.NftType),
            args: {
                start: { type: graphql_1.GraphQLInt },
                limit: { type: graphql_1.GraphQLInt },
                sortBy: { type: graphql_1.GraphQLString },
            },
            resolve: async (_, args) => {
                const start = Number.isInteger(args?.start) ? args.start : 0;
                const limit = Number.isInteger(args?.limit) ? args.limit : 10;
                const sortBy = args?.sortBy || 'recent';
                return await (0, nft_controlers_1.getNFTs)(start, limit, sortBy);
            },
        },
        getUserInfo: {
            type: nft_type_1.UserInfoType,
            args: { address: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) } },
            resolve: async (_, { address }) => {
                const normalizedAddress = address.toLowerCase();
                let user = await (0, userInfo_controlers_1.findUser)(normalizedAddress);
                if (!user) {
                    user = await (0, userInfo_controlers_1.createUser)({
                        name: 'Anonymous',
                        address: normalizedAddress,
                        roles: ['Buyer'],
                        isFirstTime: true,
                        follower: 0,
                        following: 0,
                    });
                }
                console.log('User', user);
                return user.toObject ? user.toObject() : user;
            },
        },
        getBids: {
            type: nft_type_1.BidType,
            args: {
                tokenId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                seller: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            },
            resolve: async (_, { tokenId, seller }) => {
                const bidDoc = await (0, AuctionBid_controlers_1.findAuctionNft)({ tokenId, seller });
                return bidDoc;
            },
        },
        userProfile: {
            type: nft_type_1.userProfile,
            args: {
                name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            },
            resolve: async (_, { name }) => await (0, userInfo_controlers_1.userProfileInfo)(name),
        },
    },
});
const Mutation = new graphql_1.GraphQLObjectType({
    name: 'mutation',
    fields: {
        updateInfo: {
            type: nft_type_1.UserInfoType,
            args: {
                address: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                name: { type: graphql_1.GraphQLString },
                gmail: { type: graphql_1.GraphQLString },
                roles: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
            },
            resolve: async (_, { address, name, gmail, roles }) => {
                let user = await (0, userInfo_controlers_1.findUser)(address.toLowerCase());
                if (!user) {
                    // create new user
                    user = await (0, userInfo_controlers_1.createUser)({
                        address,
                        name: name || 'Anonymous',
                        gmail: gmail || null,
                        roles: roles?.length ? roles : ['Buyer'],
                    });
                }
                else {
                    // update existing user
                    if (name)
                        user.name = name;
                    if (gmail)
                        user.gmail = gmail;
                    if ((name && name !== 'Anonymous') || gmail)
                        user.isFirstTime = false;
                    if (roles?.length) {
                        user.roles = roles;
                    }
                    if (!user.roles?.length)
                        user.roles.push('Buyer');
                }
                await user.save();
                if (name) {
                    await marketplace_schema_1.NFT.updateMany({ seller: address.toLowerCase() }, { $set: { username: name } });
                    console.log(`✅ Updated NFTs for ${address} with new username ${name}`);
                }
                return user.toObject ? user.toObject() : user;
            },
        },
    },
});
exports.marketplace = new graphql_1.GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
//# sourceMappingURL=marketplace.schema.js.map