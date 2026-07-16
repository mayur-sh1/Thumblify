"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const thumbnail_controllers_1 = require("../controllers/thumbnail.controllers");
const auth_1 = __importDefault(require("../middlewares/auth"));
const thumbnailRouter = express_1.default.Router();
thumbnailRouter.post('/generate', auth_1.default, thumbnail_controllers_1.generateThumbnail);
thumbnailRouter.delete('/delete/:id', auth_1.default, thumbnail_controllers_1.deleteThumbnail);
exports.default = thumbnailRouter;
