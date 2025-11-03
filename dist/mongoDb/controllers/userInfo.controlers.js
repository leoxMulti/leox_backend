"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userProfileInfo = exports.findNFT = exports.findByRole = exports.createUser = exports.findUser = void 0;
const s = __importStar(require("../schemas/marketplace.schema"));
const findUser = async (address) => {
    return await s.UsersInfo.findOne({ address });
};
exports.findUser = findUser;
const createUser = async ({ name, gmail, address, roles, isFirstTime, follower, following }) => {
    return await s.UsersInfo.create({ name, gmail, address, roles, isFirstTime, follower, following });
};
exports.createUser = createUser;
const findByRole = async (role) => {
    return await s.UsersInfo.find({ roles: role }, { name: 1, address: 1, _id: 0 });
};
exports.findByRole = findByRole;
const findNFT = async ({ tokenId, seller }) => await s.NFT.findOne({ tokenId, seller: seller.toLowerCase() });
exports.findNFT = findNFT;
const userProfileInfo = async (name) => {
    const userDoc = await s.UsersInfo.findOne({ name });
    if (!userDoc)
        return false; // username not found
    const { address } = userDoc;
    const user = await (0, exports.findUser)(address);
    if (!user)
        return null;
    const result = await Promise.allSettled([
        s.NFT.find({ seller: address }).lean(), //owned
        s.NFT.find({ seller: address, isListed: true }).lean(), //sale
        s.NFT.find({ owner: address }).lean(), //created
        s.NFT.find({ seller: address, isListed: true, claimed: true }).lean(), // sold
    ]);
    const [owned, sale, created, sold] = result.map((e) => e.status === 'fulfilled' ? e.value : []);
    return {
        user: {
            name: user.name,
            address: user.address,
            roles: user.roles,
            follower: user.follower,
            following: user.following,
        },
        nfts: { owned, sale, created, sold },
    };
};
exports.userProfileInfo = userProfileInfo;
//# sourceMappingURL=userInfo.controlers.js.map