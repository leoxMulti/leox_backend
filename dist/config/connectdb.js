"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connetdb = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        await mongoose_1.default.connect(mongoUri);
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = connetdb;
//# sourceMappingURL=connectdb.js.map