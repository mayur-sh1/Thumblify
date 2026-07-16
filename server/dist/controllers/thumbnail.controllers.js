"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteThumbnail = exports.generateThumbnail = void 0;
const thumbnail_model_1 = __importDefault(require("../models/thumbnail.model"));
const genai_1 = require("@google/genai");
const ai_1 = __importDefault(require("../config/ai"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
const stylePrompts = {
    'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
};
const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
};
const generateThumbnail = async (req, res) => {
    let thumbnail;
    let filePath;
    try {
        const { userId } = req.session;
        const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
        thumbnail = await thumbnail_model_1.default.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        });
        const model = 'gemini-3-pro-image-preview';
        const generationConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspect_ratio || '16:9',
                imageSize: '1K'
            },
            safetySettings: [
                { category: genai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: genai_1.HarmBlockThreshold.OFF },
                { category: genai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: genai_1.HarmBlockThreshold.OFF },
                { category: genai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: genai_1.HarmBlockThreshold.OFF },
                { category: genai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: genai_1.HarmBlockThreshold.OFF },
            ]
        };
        let prompt = `Create a ${stylePrompts[style]} for: "${title}"`;
        if (color_scheme) {
            prompt += `Use a ${colorSchemeDescriptions[color_scheme]} color scheme.`;
        }
        if (user_prompt) {
            prompt += `Additional Details: ${user_prompt}`;
        }
        prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;
        // generate the image using ai model
        const response = await ai_1.default.models.generateContent({
            model,
            contents: [prompt],
            config: generationConfig,
        });
        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error('Unexpected response from image generation service');
        }
        const parts = response.candidates[0].content.parts;
        let finalBuffer = null;
        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64');
            }
        }
        if (!finalBuffer) {
            throw new Error('No image data returned from generation service');
        }
        const filename = `final-output-${Date.now()}.png`;
        filePath = path_1.default.join('images', filename);
        fs_1.default.mkdirSync('images', { recursive: true });
        fs_1.default.writeFileSync(filePath, finalBuffer);
        const uploadResult = await cloudinary_1.v2.uploader.upload(filePath, { resource_type: 'image' });
        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save();
        res.json({ message: "Thumbnail Generated", thumbnail });
    }
    catch (error) {
        console.error(error);
        // mark the thumbnail as failed instead of leaving it stuck "generating"
        if (thumbnail) {
            thumbnail.isGenerating = false;
            thumbnail.failed = true; // add this field to your schema if you want to track failures
            await thumbnail.save().catch((e) => console.error("Failed to update thumbnail status:", e));
        }
        // detect quota/rate-limit errors specifically
        const isQuotaError = error?.status === 429 ||
            error?.message?.includes('RESOURCE_EXHAUSTED') ||
            error?.message?.includes('quota');
        if (isQuotaError) {
            return res.status(503).json({
                message: "Image generation is temporarily unavailable due to API quota limits. Please try again later or contact support."
            });
        }
        return res.status(500).json({ message: "Failed to generate thumbnail. Please try again." });
    }
    finally {
        // always clean up the temp file, even if something threw after it was written
        if (filePath && fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
};
exports.generateThumbnail = generateThumbnail;
const deleteThumbnail = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;
        await thumbnail_model_1.default.findByIdAndDelete({ _id: id, userId });
        res.json({ message: "thumbnail deleted successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};
exports.deleteThumbnail = deleteThumbnail;
