"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeHistory = void 0;
const marketplace_schema_1 = require("../schemas/marketplace.schema");
const bsc_service_1 = require("../../config/bsc.service");
const feeHistory = async () => {
    let history = await marketplace_schema_1.Fee.find().sort({ updateAt: -1 }).limit(6).lean();
    if (!history.length) {
        console.log("there is no fee");
        const contract = await (0, bsc_service_1.createEthContract)();
        const feeBigNumber = await contract.marketplaceFee();
        const fee = Number(feeBigNumber) / 10;
        const newFee = await marketplace_schema_1.Fee.create({
            fee,
            updateAt: new Date(),
            txHash: null,
        });
        history = [newFee.toObject()];
    }
    return history;
};
exports.feeHistory = feeHistory;
//# sourceMappingURL=fee.controlers.js.map