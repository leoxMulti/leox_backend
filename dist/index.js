"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const connectdb_1 = __importDefault(require("./config/connectdb"));
const express_graphql_1 = require("express-graphql");
const Marketplace_router_1 = __importDefault(require("./mongoDb/router/Marketplace.router"));
const marketplace_schema_1 = require("./graphql/schemas/marketplace.schema");
const listener_controlers_1 = require("./mongoDb/controllers/listener.controlers");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const allowedOrigin = "https://leox-multi.vercel.app";
// const allowedOrigin = "http://192.168.19.43:3000"; 
const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// ----- Handle Preflight for all routes -----
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "https://leox-multi.vercel.app",
        // origin: "http://192.168.19.43:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.get("/", (req, res) => res.send("Welcome to the GraphQL API!"));
app.use("/api", Marketplace_router_1.default);
app.use("/g", (0, express_graphql_1.graphqlHTTP)({ schema: marketplace_schema_1.marketplace, graphiql: true }));
const start = async () => {
    try {
        await (0, connectdb_1.default)();
        httpServer.listen({ port: PORT, host: "0.0.0.0" }, () => {
            console.log(`Server running on ${corsOptions.origin}:${PORT}`);
        });
        await (0, listener_controlers_1.startNFTListener)();
    }
    catch (error) {
        console.error("Error starting server:", error);
    }
};
start();
//# sourceMappingURL=index.js.map