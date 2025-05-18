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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_model_1 = require("../models/user.model");
const error_1 = require("../utils/error");
class UserController {
    // 注册新用户
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password, name } = req.body;
                const existingUser = yield user_model_1.User.findOne({
                    $or: [{ email }, { username }]
                });
                if (existingUser) {
                    throw new error_1.AppError('用户名或邮箱已被使用', 400);
                }
                const user = yield user_model_1.User.create({
                    username,
                    email,
                    password,
                    name
                });
                res.status(201).json({
                    success: true,
                    data: {
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email
                        }
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
                const { email, password } = req.body;
                const user = yield user_model_1.User.findOne({ email }).select('+password');
                if (!user) {
                    throw new error_1.AppError('用户不存在', 401);
                }
                const isMatch = yield user.comparePassword(password);
                if (!isMatch) {
                    throw new error_1.AppError('密码错误', 401);
                }
                // 更新最后登录时间
                user.lastLoginAt = new Date();
                yield user.save();
                res.json({
                    success: true,
                    data: {
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取当前登录用户信息
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
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            profile: user.profile
                        }
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
                const { nickname, avatar } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const user = yield user_model_1.User.findByIdAndUpdate(userId, {
                    $set: {
                        'profile.nickname': nickname,
                        'profile.avatar': avatar
                    }
                }, { new: true });
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                res.json({
                    success: true,
                    data: {
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            profile: user.profile
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 修改密码
    updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { currentPassword, newPassword } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const user = yield user_model_1.User.findById(userId).select('+password');
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                const isMatch = yield user.comparePassword(currentPassword);
                if (!isMatch) {
                    throw new error_1.AppError('当前密码错误', 401);
                }
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
    // 获取用户详情
    getUserById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield user_model_1.User.findById(id);
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                res.json({
                    success: true,
                    data: {
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            profile: user.profile
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取学习统计
    getStudyStats(req, res, next) {
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
                        stats: {
                            totalQuestions: user.stats.totalQuestions,
                            correctCount: user.stats.correctCount,
                            wrongCount: user.stats.wrongCount,
                            streak: user.stats.streak || 0
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取学习统计详情
    getStudyStatsDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // TODO: 实现详细统计数据查询
                res.json({
                    success: true,
                    data: {
                        stats: {
                        // 详细统计数据
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 更新学习进度
    updateStudyProgress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { subject, chapterNo, completedQuestions } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const user = yield user_model_1.User.findById(userId);
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                // 初始化进度数据结构
                if (!user.studyProgress) {
                    user.studyProgress = new Map();
                }
                if (!user.studyProgress.has(subject)) {
                    user.studyProgress.set(subject, new Map());
                }
                const subjectProgress = user.studyProgress.get(subject);
                if (!subjectProgress)
                    return;
                if (!subjectProgress.has(chapterNo)) {
                    subjectProgress.set(chapterNo, {
                        completedQuestions: [],
                        lastStudyTime: new Date()
                    });
                }
                const chapterProgress = subjectProgress.get(chapterNo);
                if (!chapterProgress)
                    return;
                // 更新完成的题目和学习时间
                chapterProgress.completedQuestions = [
                    ...new Set([...chapterProgress.completedQuestions, ...completedQuestions])
                ];
                chapterProgress.lastStudyTime = new Date();
                yield user.save();
                res.json({
                    success: true,
                    message: '学习进度已更新'
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取学习进度
    getStudyProgress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { subject } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const user = yield user_model_1.User.findById(userId);
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                if (!user.studyProgress) {
                    return res.json({
                        success: true,
                        data: {
                            progress: {}
                        }
                    });
                }
                if (subject) {
                    const subjectProgress = user.studyProgress.get(subject);
                    if (!subjectProgress) {
                        return res.json({
                            success: true,
                            data: {
                                progress: {}
                            }
                        });
                    }
                    const formattedProgress = {};
                    subjectProgress.forEach((value, key) => {
                        formattedProgress[key] = value;
                    });
                    return res.json({
                        success: true,
                        data: {
                            progress: formattedProgress
                        }
                    });
                }
                // 返回所有科目的学习进度
                const formattedProgress = {};
                user.studyProgress.forEach((subjectMap, subjectKey) => {
                    const subjectProgress = {};
                    subjectMap.forEach((value, key) => {
                        subjectProgress[key] = value;
                    });
                    formattedProgress[subjectKey] = subjectProgress;
                });
                res.json({
                    success: true,
                    data: {
                        progress: formattedProgress
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.userController = new UserController();
