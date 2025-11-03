"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fee_controlers_1 = require("../controllers/fee.controlers");
const express_1 = __importDefault(require("express"));
const userInfo_controlers_1 = require("../controllers/userInfo.controlers");
const router = express_1.default.Router();
router.post("/findByAddress", async (req, res) => {
    try {
        const { address } = req.body;
        console.log("role", address);
        if (!address)
            res.status(400).json({ message: "address is required" });
        const data = await (0, userInfo_controlers_1.findUser)(address);
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in /findByAddress:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/findByRole", async (req, res) => {
    try {
        const { role } = req.body;
        console.log("role", role);
        if (!role)
            res.status(400).json({ message: "Role is required" });
        const data = await (0, userInfo_controlers_1.findByRole)(role);
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in /findByRole:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/latestFees", async (_, res) => {
    try {
        const feehistory = await (0, fee_controlers_1.feeHistory)();
        console.log("feehistory", feehistory);
        res.status(200).json(feehistory);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/findNFT", async (req, res) => {
    try {
        const { tokenId, seller } = req.body;
        if (!tokenId && !seller)
            res.status(400).json({ message: "Role is required" });
        const data = await (0, userInfo_controlers_1.findNFT)({ tokenId, seller });
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in /findNft:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=Marketplace.router.js.map