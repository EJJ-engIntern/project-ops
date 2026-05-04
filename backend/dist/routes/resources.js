"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (_req, res) => {
    const { data } = await db_1.default.from('resources').select('*').order('type').order('name');
    res.json(data !== null && data !== void 0 ? data : []);
});
router.post('/', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    const { name, type, description } = req.body;
    const { error } = await db_1.default.from('resources').insert({ name, type, description: description !== null && description !== void 0 ? description : '' });
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(201).json({ message: 'Resource created' });
});
// DELETE single allocation
router.delete('/allocate/:id', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    await db_1.default.from('project_resources').delete().eq('id', Number(req.params.id));
    res.json({ message: 'Allocation removed' });
});
// DELETE all resources
router.delete('/', (0, auth_1.auth)(['Admin']), async (_req, res) => {
    await db_1.default.from('project_resources').delete().neq('id', 0);
    await db_1.default.from('resources').delete().neq('id', 0);
    res.json({ message: 'All resources deleted' });
});
// DELETE single resource
router.delete('/:id', (0, auth_1.auth)(['Admin']), async (req, res) => {
    await db_1.default.from('project_resources').delete().eq('resource_id', Number(req.params.id));
    await db_1.default.from('resources').delete().eq('id', Number(req.params.id));
    res.json({ message: 'Resource deleted' });
});
// GET allocations for a project
router.get('/project/:projectId', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (req, res) => {
    var _a;
    const { data } = await db_1.default
        .from('project_resources')
        .select('*, resources(name, type, description)')
        .eq('project_id', Number(req.params.projectId));
    res.json((_a = data === null || data === void 0 ? void 0 : data.map(r => {
        var _a, _b, _c;
        return ({
            ...r,
            name: (_a = r.resources) === null || _a === void 0 ? void 0 : _a.name,
            type: (_b = r.resources) === null || _b === void 0 ? void 0 : _b.type,
            description: (_c = r.resources) === null || _c === void 0 ? void 0 : _c.description
        });
    })) !== null && _a !== void 0 ? _a : []);
});
// POST allocate
router.post('/allocate', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    const { project_id, resource_id, notes } = req.body;
    const { error } = await db_1.default.from('project_resources').insert({ project_id, resource_id, notes: notes !== null && notes !== void 0 ? notes : '' });
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(201).json({ message: 'Resource allocated' });
});
exports.default = router;
