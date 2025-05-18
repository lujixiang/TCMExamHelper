"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.authMiddleware = exports.jwtConfig = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const config_1 = require("../config/config");
const error_1 = require("../utils/error");
// JWT选项
exports.jwtConfig = {
    secret: config_1.config.jwtSecret,
    expiresIn: '7d'
};
// 认证中间件
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_1.AppError('未提供认证令牌', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = yield user_model_1.User.findById(decoded.id);
        if (!user) {
            throw new error_1.AppError('用户不存在', 401);
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_1.AppError('无效的认证令牌', 401));
        }
        else {
            next(error);
        }
    }
});
exports.authMiddleware = authMiddleware;
// 管理员权限中间件
const adminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            throw new error_1.AppError('需要管理员权限', 403);
        }
        next();
    }
    catch (error) {
        next(new error_1.AppError('需要管理员权限', 403));
    }
});
exports.adminAuth = adminAuth;
