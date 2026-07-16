"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// controller for user auth
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // find user by email
        const user = await user_model_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exist" });
        }
        // Encrypt the password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const newUser = new user_model_1.default({ name, email, password: hashedPassword });
        await newUser.save();
        //setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = newUser._id;
        return res.json({
            message: 'Account created successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
//  controllers for user log in 
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // find user by email
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "invalid email or password" });
        }
        const isPasswordCorrect = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "invalid email or password" });
        }
        //setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        return res.json({
            message: 'login successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.loginUser = loginUser;
//  controllers for user log out 
const logoutUser = async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: error.message });
        }
    });
    return res.json({ message: "Log out successfully" });
};
exports.logoutUser = logoutUser;
//  controllers for user verify
const verifyUser = async (req, res) => {
    try {
        const { userId } = req.session;
        const user = await user_model_1.default.findById(userId).select('-password');
        if (!user) {
            return res.status(400).json({ message: "invalid user" });
        }
        return res.json({ user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.verifyUser = verifyUser;
