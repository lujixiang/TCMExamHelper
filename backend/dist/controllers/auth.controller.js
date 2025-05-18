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
exports.updateProfile = exports.getCurrentUser = exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const config_1 = require("../config/config");
const error_1 = require("../utils/error");
// 格式化用户响应
const formatUserResponse = (user) => ({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    profile: user.profile,
    stats: {
        totalQuestions: user.stats.totalQuestions,
        correctCount: user.stats.correctCount,
        wrongCount: user.stats.wrongCount,
        streak: user.stats.streak,
        lastLoginAt: user.stats.lastLoginAt,
        lastAnswerAt: user.stats.lastAnswerAt
    }
});
// 生成token的辅助函数，将config.jwtExpiresIn转换为数字类型
const getJwtExpiresIn = () => {
    const expiresIn = config_1.config.jwtExpiresIn;
    if (typeof expiresIn === 'number') {
        return expiresIn;
    }
    // 解析字符串格式的过期时间，如 "7d", "24h", "60m" 等
    const matchDays = expiresIn.match(/^(\d+)d$/);
    if (matchDays) {
        return parseInt(matchDays[1]) * 24 * 60 * 60; // 转换为秒
    }
    const matchHours = expiresIn.match(/^(\d+)h$/);
    if (matchHours) {
        return parseInt(matchHours[1]) * 60 * 60; // 转换为秒
    }
    const matchMinutes = expiresIn.match(/^(\d+)m$/);
    if (matchMinutes) {
        return parseInt(matchMinutes[1]) * 60; // 转换为秒
    }
    const matchSeconds = expiresIn.match(/^(\d+)s$/);
    if (matchSeconds) {
        return parseInt(matchSeconds[1]); // 秒
    }
    // 默认为7天
    return 7 * 24 * 60 * 60;
};
class AuthController {
    // 用户注册
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                // 检查用户是否已存在
                const existingUser = yield user_model_1.User.findOne({ $or: [{ email }, { username }] });
                if (existingUser) {
                    throw new error_1.AppError('用户名或邮箱已存在', 400);
                }
                // 创建新用户
                const user = yield user_model_1.User.create({
                    username,
                    email,
                    password,
                    name: username // 默认使用用户名作为姓名
                });
                // 生成 JWT
                const token = jsonwebtoken_1.default.sign({ id: user._id.toString() }, config_1.config.jwtSecret, { expiresIn: getJwtExpiresIn() });
                res.status(201).json({
                    success: true,
                    data: {
                        token,
                        user: formatUserResponse(user)
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 用户登录
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = req.body;
                // 查找用户（支持通过email或username登录）
                const user = yield user_model_1.User.findOne({
                    $or: [
                        { email: username },
                        { username: username }
                    ]
                }).select('+password');
                if (!user) {
                    throw new error_1.AppError('用户不存在', 401);
                }
                // 验证密码
                const isMatch = yield user.comparePassword(password);
                if (!isMatch) {
                    throw new error_1.AppError('密码错误', 401);
                }
                // 更新最后登录时间
                user.lastLoginAt = new Date();
                yield user.save();
                // 生成 JWT
                const token = jsonwebtoken_1.default.sign({ id: user._id.toString() }, config_1.config.jwtSecret, { expiresIn: getJwtExpiresIn() });
                res.json({
                    success: true,
                    data: {
                        token,
                        user: formatUserResponse(user)
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 刷新令牌
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    throw new error_1.AppError('未提供刷新令牌', 400);
                }
                const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwtSecret);
                const user = yield user_model_1.User.findById(decoded.id);
                if (!user) {
                    throw new error_1.AppError('用户不存在', 401);
                }
                const token = jsonwebtoken_1.default.sign({ id: user._id.toString() }, config_1.config.jwtSecret, { expiresIn: getJwtExpiresIn() });
                res.json({
                    success: true,
                    data: { token }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 修改密码
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { currentPassword, newPassword } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const user = yield user_model_1.User.findById(userId).select('+password');
                if (!user) {
                    throw new error_1.AppError('用户不存在', 401);
                }
                // 验证当前密码
                const isMatch = yield user.comparePassword(currentPassword);
                if (!isMatch) {
                    throw new error_1.AppError('当前密码错误', 401);
                }
                // 更新密码
                user.password = newPassword;
                yield user.save();
                res.json({
                    success: true,
                    message: '密码修改成功'
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 重置密码请求
    resetPasswordRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const user = yield user_model_1.User.findOne({ email });
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                // TODO: 发送重置密码邮件
                res.json({
                    success: true,
                    message: '重置密码链接已发送到您的邮箱'
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 重置密码
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword } = req.body;
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
                const user = yield user_model_1.User.findById(decoded.id);
                if (!user) {
                    throw new error_1.AppError('无效的重置令牌', 400);
                }
                user.password = newPassword;
                yield user.save();
                res.json({
                    success: true,
                    message: '密码重置成功'
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取当前用户信息
    getCurrentUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const user = yield user_model_1.User.findById(userId);
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                res.json({
                    success: true,
                    data: {
                        user: formatUserResponse(user)
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 更新用户资料
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const user = yield user_model_1.User.findByIdAndUpdate(userId, {
                    $set: {
                        'profile.nickname': req.body.nickname,
                        'profile.avatar': req.body.avatar
                    }
                }, { new: true });
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                res.json({
                    success: true,
                    data: {
                        user: formatUserResponse(user)
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.authController = new AuthController();
// 获取当前用户信息
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            throw new error_1.AppError('用户不存在', 404);
        }
        res.json({
            success: true,
            data: {
                user: formatUserResponse(user)
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
// 更新用户资料
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_model_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, {
            $set: {
                'profile.nickname': req.body.nickname,
                'profile.avatar': req.body.avatar
            }
        }, { new: true });
        if (!user) {
            throw new error_1.AppError('用户不存在', 404);
        }
        res.json({
            success: true,
            data: {
                user: formatUserResponse(user)
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
