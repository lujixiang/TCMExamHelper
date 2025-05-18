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
exports.statsController = void 0;
const user_model_1 = require("../models/user.model");
const wrong_question_model_1 = require("../models/wrong-question.model");
const error_1 = require("../utils/error");
class StatsController {
    // 获取学习统计
    getStudyStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield user_model_1.User.findById(userId);
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                res.json({
                    success: true,
                    data: {
                        totalQuestions: user.stats.totalQuestions,
                        correctCount: user.stats.correctCount,
                        wrongCount: user.stats.wrongCount,
                        streak: user.stats.streak,
                        lastLoginAt: user.stats.lastLoginAt,
                        lastAnswerAt: user.stats.lastAnswerAt
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取每日统计
    getDailyStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dailyStats = yield wrong_question_model_1.WrongQuestion.aggregate([
                    {
                        $match: {
                            userId,
                            lastWrongDate: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalWrong: { $sum: 1 },
                            resolvedCount: {
                                $sum: { $cond: [{ $eq: ['$isResolved', true] }, 1, 0] }
                            }
                        }
                    }
                ]);
                res.json({
                    success: true,
                    data: Object.assign({ date: today }, dailyStats[0])
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取科目统计
    getSubjectStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const subjectStats = yield wrong_question_model_1.WrongQuestion.aggregate([
                    { $match: { userId } },
                    {
                        $group: {
                            _id: '$subject',
                            totalWrong: { $sum: 1 },
                            resolvedCount: {
                                $sum: { $cond: [{ $eq: ['$isResolved', true] }, 1, 0] }
                            }
                        }
                    }
                ]);
                res.json({
                    success: true,
                    data: subjectStats
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 重置统计
    resetStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield user_model_1.User.findById(userId);
                if (!user) {
                    throw new error_1.AppError('用户不存在', 404);
                }
                user.stats = {
                    totalQuestions: 0,
                    correctCount: 0,
                    wrongCount: 0,
                    streak: 0,
                    lastLoginAt: user.stats.lastLoginAt,
                    lastAnswerAt: null
                };
                yield user.save();
                res.json({
                    success: true,
                    message: '统计已重置'
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.statsController = new StatsController();
