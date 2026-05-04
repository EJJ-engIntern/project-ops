"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.auth)(['Admin', 'PM']), async (_req, res) => {
    const { data } = await db_1.default.from('users').select('id, name, email, role, target_hours');
    res.json(data !== null && data !== void 0 ? data : []);
});
router.delete('/:id', (0, auth_1.auth)(['Admin']), async (req, res) => {
    await db_1.default.from('users').delete().eq('id', Number(req.params.id));
    res.json({ message: 'Deleted' });
});
exports.default = router;
