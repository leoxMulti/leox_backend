"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEthContract = void 0;
const ethers_1 = require("ethers");
const abi_json_1 = __importDefault(require("../ABI/abi.json"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const contract_address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const createEthContract = async () => {
    const provider = new ethers_1.ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BSC_RPC);
    const contract = new ethers_1.ethers.Contract(contract_address, abi_json_1.default, provider);
    return contract;
};
exports.createEthContract = createEthContract;
//# sourceMappingURL=bsc.service.js.map