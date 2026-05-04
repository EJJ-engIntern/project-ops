"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (req, res) => {
    var _a;
    let query = db_1.default.from('timesheets').select('*, users(name), tasks(title)');
    if (req.user.role === 'Developer') {
        query = query.eq('user_id', req.user.id);
    }
    const { data } = await query;
    res.json((_a = data === null || data === void 0 ? void 0 : data.map(t => {
        var _a, _b;
        return ({
            ...t,
            user_name: (_a = t.users) === null || _a === void 0 ? void 0 : _a.name,
            task_title: (_b = t.tasks) === null || _b === void 0 ? void 0 : _b.title
        });
    })) !== null && _a !== void 0 ? _a : []);
});
router.post('/', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (req, res) => {
    const { task_id, log_date, hours_logged } = req.body;
    const { error } = await db_1.default.from('timesheets').insert({ task_id, user_id: req.user.id, log_date, hours_logged });
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(201).json({ message: 'Hours logged' });
});
exports.default = router;
