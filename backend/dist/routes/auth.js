"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const { name, email, password, role, target_hours } = req.body;
    const { error } = await db_1.default
        .from('users')
        .insert({ name, email, password_hash: password, role: role !== null && role !== void 0 ? role : 'Developer', target_hours: target_hours !== null && target_hours !== void 0 ? target_hours : 40 });
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(201).json({ message: 'User created' });
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await db_1.default
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    if (error || !data || data.password_hash !== password) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: data.id, name: data.name, email: data.email, role: data.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: data.id, name: data.name, role: data.role } });
});
exports.default = router;
