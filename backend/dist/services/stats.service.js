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
exports.StatsService = void 0;
const user_model_1 = require("../models/user.model");
const wrong_question_model_1 = require("../models/wrong-question.model");
const question_model_1 = require("../models/question.model");
class StatsService {
    // 获取用户统计信息
    static getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            const totalQuestions = yield question_model_1.Question.countDocuments();
            const completedQuestions = yield wrong_question_model_1.WrongQuestion.distinct('questionId', { userId });
            const wrongQuestions = yield wrong_question_model_1.WrongQuestion.find({ userId, isResolved: false });
            const stats = {
                totalQuestions,
                correctCount: completedQuestions.length - wrongQuestions.length,
                wrongCount: wrongQuestions.length,
                streak: user.stats.streak || 0,
                lastLoginAt: user.stats.lastLoginAt || new Date(),
                lastAnswerAt: user.stats.lastAnswerAt || new Date()
            };
            return stats;
        });
    }
    // 更新用户统计信息
    static updateUserStats(userId, isCorrect) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            const now = new Date();
            const lastDate = user.stats.lastAnswerAt || now;
            const isNewDay = now.getDate() !== lastDate.getDate() ||
                now.getMonth() !== lastDate.getMonth() ||
                now.getFullYear() !== lastDate.getFullYear();
            let streak = user.stats.streak || 0;
            if (isNewDay) {
                streak = isCorrect ? streak + 1 : 0;
            }
            yield user_model_1.User.findByIdAndUpdate(userId, {
                $inc: {
                    [`stats.${isCorrect ? 'correctCount' : 'wrongCount'}`]: 1
                },
                $set: {
                    'stats.streak': streak,
                    'stats.lastAnswerAt': now
                }
            });
            return {
                streak,
                lastAnswerAt: now
            };
        });
    }
    // 获取用户学习进度
    static getLearningProgress(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            const totalQuestions = yield question_model_1.Question.countDocuments();
            const completedQuestions = yield wrong_question_model_1.WrongQuestion.distinct('questionId', { userId });
            const wrongQuestions = yield wrong_question_model_1.WrongQuestion.find({ userId, isResolved: false });
            const progress = {
                totalQuestions,
                completedCount: completedQuestions.length,
                correctCount: completedQuestions.length - wrongQuestions.length,
                wrongCount: wrongQuestions.length,
                accuracy: completedQuestions.length ?
                    ((completedQuestions.length - wrongQuestions.length) / completedQuestions.length * 100).toFixed(2) :
                    0,
                streak: user.stats.streak || 0,
                lastAnswerAt: user.stats.lastAnswerAt || new Date()
            };
            return progress;
        });
    }
}
exports.StatsService = StatsService;
