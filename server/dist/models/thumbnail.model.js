"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ThumbnailSchema = new mongoose_1.default.Schema({
    userId: { type: String, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    style: { type: String, required: true, enum: ["Bold & Graphic", "Tech/Futuristic", "Minimalist", "Photorealistic", "Illustrated"] },
    aspect_ratio: { type: String, enum: ["16:9", "1:1", "9:16"], default: '16:9' },
    color_scheme: { type: String, enum: ["vibrant", "sunset", "forest", "neon", "purple", "monochrome", "ocean", "pastel"] },
    text_overlay: { type: Boolean, default: false },
    image_url: { type: String, default: '' },
    prompt_used: { type: String },
    user_prompt: { type: String },
    isGenerating: { type: Boolean, default: true }
}, { timestamps: true });
const Thumbnail = mongoose_1.default.models.Thumbnail || mongoose_1.default.model("Thumbnail", ThumbnailSchema);
exports.default = Thumbnail;
