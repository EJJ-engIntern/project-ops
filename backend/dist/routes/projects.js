"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.get('/summary', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (_req, res) => {
    var _a;
    const { count: activeProjects } = await db_1.default.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Active');
    const { count: openTasks } = await db_1.default.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'Done');
    const { count: pendingApprovals } = await db_1.default.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Draft');
    const { data: hoursData } = await db_1.default
        .from('timesheets')
        .select('hours_logged')
        .gte('log_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const hoursThisWeek = (_a = hoursData === null || hoursData === void 0 ? void 0 : hoursData.reduce((sum, r) => sum + r.hours_logged, 0)) !== null && _a !== void 0 ? _a : 0;
    res.json({ activeProjects, openTasks, hoursThisWeek, pendingApprovals });
});
router.get('/', (0, auth_1.auth)(['Admin', 'PM', 'Developer']), async (req, res) => {
    var _a, _b, _c;
    if (req.user.role === 'Developer') {
        const { data: taskData } = await db_1.default
            .from('tasks')
            .select('project_id')
            .eq('assignee_id', req.user.id);
        const projectIds = [...new Set((_a = taskData === null || taskData === void 0 ? void 0 : taskData.map(t => t.project_id)) !== null && _a !== void 0 ? _a : [])];
        const { data } = await db_1.default
            .from('projects')
            .select('*, users(name)')
            .in('id', projectIds);
        res.json((_b = data === null || data === void 0 ? void 0 : data.map(p => { var _a; return ({ ...p, pm_name: (_a = p.users) === null || _a === void 0 ? void 0 : _a.name }); })) !== null && _b !== void 0 ? _b : []);
        return;
    }
    const { data } = await db_1.default.from('projects').select('*, users(name)');
    res.json((_c = data === null || data === void 0 ? void 0 : data.map(p => { var _a; return ({ ...p, pm_name: (_a = p.users) === null || _a === void 0 ? void 0 : _a.name }); })) !== null && _c !== void 0 ? _c : []);
});
router.post('/', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    const { name, start_date, pm_id } = req.body;
    const pid = req.user.role === 'PM' ? req.user.id : pm_id;
    const { data, error } = await db_1.default
        .from('projects')
        .insert({ name, start_date, pm_id: pid })
        .select('id')
        .single();
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const PA_WEBHOOK_URL = process.env.PA_WEBHOOK_URL;
    if (PA_WEBHOOK_URL) {
        fetch(PA_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: data.id,
                projectName: name,
                submittedBy: req.user.name,
                startDate: start_date,
                approvalCallbackUrl: `${process.env.BACKEND_URL}/api/projects/webhooks/approval`
            })
        }).catch(err => console.error('PA webhook failed:', err));
    }
    res.status(201).json({ message: 'Project created', projectId: data.id });
});
router.patch('/:id', (0, auth_1.auth)(['Admin', 'PM']), async (req, res) => {
    const { status, health } = req.body;
    const { error } = await db_1.default.from('projects').update({ status, health }).eq('id', Number(req.params.id));
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.json({ message: 'Updated' });
});
router.delete('/:id', (0, auth_1.auth)(['Admin']), async (req, res) => {
    const { error } = await db_1.default.from('projects').delete().eq('id', Number(req.params.id));
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.json({ message: 'Deleted' });
});
router.post('/webhooks/approval', async (req, res) => {
    const { projectId, action } = req.body;
    const status = action === 'approve' ? 'Active' : 'Draft';
    await db_1.default.from('projects').update({ status }).eq('id', projectId);
    res.json({ message: `Project ${action}d` });
});
exports.default = router;
