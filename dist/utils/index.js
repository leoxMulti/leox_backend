"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNameByNftAddress = void 0;
const userInfo_controlers_1 = require("../mongoDb/controllers/userInfo.controlers");
const findNameByNftAddress = async (address) => {
    const sellerAddress = address.toLowerCase();
    const user = await (0, userInfo_controlers_1.findUser)(sellerAddress);
    return user?.name;
};
exports.findNameByNftAddress = findNameByNftAddress;
//# sourceMappingURL=index.js.map