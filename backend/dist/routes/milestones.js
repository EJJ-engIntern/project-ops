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
    var _a;
    const { data } = await db_1.default
        .from('milestones')
        .select('*, projects(name)')
        .order('due_date');
    res.json((_a = data === null || data === void 0 ? void 0 : data.map(m => { var _a; return ({ ...m, project_name: (_a = m.projects) === null || _a === void 0 ? void 0 : _a.name }); })) !== null && _a !== void 0 ? _a : []);
});
router.get('/project/:projectId', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (req, res) => {
    const { data } = await db_1.default
        .from('milestones')
        .select('*')
        .eq('project_id', Number(req.params.projectId))
        .order('due_date');
    res.json(data !== null && data !== void 0 ? data : []);
});
router.post('/', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    const { project_id, title, due_date } = req.body;
    const { error } = await db_1.default.from('milestones').insert({ project_id, title, due_date });
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(201).json({ message: 'Milestone created' });
});
router.patch('/:id', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    const { status } = req.body;
    await db_1.default.from('milestones').update({ status }).eq('id', Number(req.params.id));
    res.json({ message: 'Updated' });
});
router.delete('/:id', (0, auth_1.auth)(['Admin']), async (req, res) => {
    await db_1.default.from('milestones').delete().eq('id', Number(req.params.id));
    res.json({ message: 'Deleted' });
});
exports.default = router;
