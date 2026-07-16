"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThumbnailById = exports.getUserThumbnails = void 0;
const thumbnail_model_1 = __importDefault(require("../models/thumbnail.model"));
// controllers to get all user thumbnails
const getUserThumbnails = async (req, res) => {
    try {
        const { userId } = req.session;
        const thumbnail = await thumbnail_model_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json({ thumbnail });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};
exports.getUserThumbnails = getUserThumbnails;
// to get single thumbnail of user
const getThumbnailById = async (req, res) => {
    try {
        const { userId } = req.session;
        const { id } = req.params;
        const thumbnail = await thumbnail_model_1.default.findOne({ userId, _id: id });
        res.json({ thumbnail });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};
exports.getThumbnailById = getThumbnailById;
