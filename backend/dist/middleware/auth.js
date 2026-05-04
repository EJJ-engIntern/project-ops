"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(roles = []) {
    return (req, res, next) => {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'No token' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (roles.length && !roles.includes(decoded.role)) {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            req.user = decoded;
            next();
        }
        catch {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
}
