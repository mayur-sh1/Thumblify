"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protect = async (req, res, next) => {
    const { isLoggedIn, userId } = req.session;
    if (!isLoggedIn || !userId) {
        return res.status(401).json({ message: "Your are not logged in" });
    }
    next();
};
exports.default = protect;
