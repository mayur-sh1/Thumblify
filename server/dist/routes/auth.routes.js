"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controllers_1 = require("../controllers/auth.controllers");
const auth_1 = __importDefault(require("../middlewares/auth"));
const authRouter = express_1.default.Router();
authRouter.post('/register', auth_controllers_1.registerUser);
authRouter.post('/login', auth_controllers_1.loginUser);
authRouter.get('/verify', auth_1.default, auth_controllers_1.verifyUser);
authRouter.post('/logout', auth_1.default, auth_controllers_1.logoutUser);
exports.default = authRouter;
