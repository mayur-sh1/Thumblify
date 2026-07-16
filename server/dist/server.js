"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const thumbnail_routes_1 = __importDefault(require("./routes/thumbnail.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_DB_URL,
        collectionName: 'session'
    })
}));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Server is Live!');
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/thumbnail', thumbnail_routes_1.default);
app.use('/api/user', user_routes_1.default);
const port = process.env.PORT || 3000;
// Connect DB on cold start either way
(0, db_1.default)().catch((error) => {
    console.error("Failed to connect to DB:", error);
});
// Only listen on a port when running locally — Vercel handles the HTTP layer itself
if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}
exports.default = app;
