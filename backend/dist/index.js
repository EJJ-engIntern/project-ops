"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const timesheets_1 = __importDefault(require("./routes/timesheets"));
const users_1 = __importDefault(require("./routes/users"));
const resources_1 = __importDefault(require("./routes/resources"));
const milestones_1 = __importDefault(require("./routes/milestones"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/timesheets', timesheets_1.default);
app.use('/api/users', users_1.default);
app.use('/api/resources', resources_1.default);
app.use('/api/milestones', milestones_1.default);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
