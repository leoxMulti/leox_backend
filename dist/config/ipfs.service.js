"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMetadata = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchMetadata = async (tokenURI) => {
    if (!tokenURI)
        return { name: "", description: "", image: "" };
    try {
        const ipfsCID = tokenURI.replace("ipfs://", "");
        const { data } = await axios_1.default.get(`https://crimson-odd-woodpecker-368.mypinata.cloud/ipfs/${ipfsCID}`);
        const imageUrl = data.image?.startsWith("ipfs://")
            ? `https://crimson-odd-woodpecker-368.mypinata.cloud/ipfs/${data.image.replace("ipfs://", "")}`
            : data.image || "";
        console.log("cid", `https://crimson-odd-woodpecker-368.mypinata.cloud/ipfs/${ipfsCID}`);
        console.log(`https://crimson-odd-woodpecker-368.mypinata.cloud/ipfs/${data.image.replace("ipfs://", "")}`, "img");
        return {
            name: data.name,
            description: data.description || "No description available",
            image: imageUrl,
        };
    }
    catch (error) {
        console.warn("Failed to fetch metadata", tokenURI, error.message);
        return { name: "", description: "", image: "" };
    }
};
exports.fetchMetadata = fetchMetadata;
//# sourceMappingURL=ipfs.service.js.map