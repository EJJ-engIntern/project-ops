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
    let query = db_1.default
        .from('tasks')
        .select('*, users(name), projects(name)');
    if (req.user.role === 'Developer') {
        query = query.eq('assignee_id', req.user.id);
    }
    const { data } = await query;
    res.json((_a = data === null || data === void 0 ? void 0 : data.map(t => {
        var _a, _b;
        return ({
            ...t,
            assignee_name: (_a = t.users) === null || _a === void 0 ? void 0 : _a.name,
            project_name: (_b = t.projects) === null || _b === void 0 ? void 0 : _b.name
        });
    })) !== null && _a !== void 0 ? _a : []);
});
router.post('/', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    const { project_id, assignee_id, title, estimated_hours } = req.body;
    const { error } = await db_1.default.from('tasks').insert({ project_id, assignee_id, title, estimated_hours });
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(201).json({ message: 'Task created' });
});
router.patch('/:id', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (req, res) => {
    const { status } = req.body;
    const { data: task } = await db_1.default.from('tasks').select('assignee_id').eq('id', Number(req.params.id)).single();
    if (req.user.role === 'Developer' && (task === null || task === void 0 ? void 0 : task.assignee_id) !== req.user.id) {
        res.status(403).json({ message: 'Not your task' });
        return;
    }
    await db_1.default.from('tasks').update({ status }).eq('id', Number(req.params.id));
    res.json({ message: 'Updated' });
});
exports.default = router;
