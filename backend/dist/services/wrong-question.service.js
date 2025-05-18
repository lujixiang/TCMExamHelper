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
exports.WrongQuestionService = void 0;
const mongoose_1 = require("mongoose");
const wrong_question_model_1 = require("../models/wrong-question.model");
const question_model_1 = require("../models/question.model");
const stats_service_1 = require("./stats.service");
class WrongQuestionService {
    // 添加或更新错题记录
    static addOrUpdateWrongQuestion(userId, questionId, wrongAnswer) {
        return __awaiter(this, void 0, void 0, function* () {
            const question = yield question_model_1.Question.findById(questionId);
            if (!question) {
                throw new Error('题目不存在');
            }
            const existingRecord = yield wrong_question_model_1.WrongQuestion.findOne({
                userId,
                questionId
            });
            if (existingRecord) {
                // 更新已存在的错题记录
                yield wrong_question_model_1.WrongQuestion.findByIdAndUpdate(existingRecord._id, {
                    $inc: { attemptCount: 1 },
                    wrongAnswer,
                    lastAttemptDate: new Date()
                });
            }
            else {
                // 创建新的错题记录
                yield wrong_question_model_1.WrongQuestion.create({
                    userId,
                    questionId,
                    subject: question.subject,
                    chapterNo: question.chapterNo,
                    wrongAnswer,
                    attemptCount: 1,
                    lastAttemptDate: new Date()
                });
            }
            // 更新用户统计信息
            yield stats_service_1.StatsService.updateUserStats(userId, false);
        });
    }
    // 获取用户的错题列表
    static getWrongQuestions(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, options = {}) {
            const { subject, chapterNo, sortBy = 'lastAttemptDate', order = 'desc', page = 1, limit = 10 } = options;
            // 构建查询条件
            const query = { userId };
            if (subject)
                query.subject = subject;
            if (chapterNo)
                query.chapterNo = chapterNo;
            // 计算总数
            const total = yield wrong_question_model_1.WrongQuestion.countDocuments(query);
            // 获取错题记录
            const wrongQuestions = yield wrong_question_model_1.WrongQuestion.find(query)
                .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('questionId');
            return {
                total,
                page,
                limit,
                data: wrongQuestions.map(record => (Object.assign(Object.assign({}, record.toObject()), { question: record.questionId })))
            };
        });
    }
    // 获取错题统计信息
    static getWrongQuestionStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield wrong_question_model_1.WrongQuestion.aggregate([
                { $match: { userId: new mongoose_1.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: '$subject',
                        count: { $sum: 1 },
                        avgAttempts: { $avg: '$attemptCount' }
                    }
                }
            ]);
            return stats.map(stat => ({
                subject: stat._id,
                count: stat.count,
                avgAttempts: Number(stat.avgAttempts.toFixed(2))
            }));
        });
    }
    // 删除错题记录
    static removeWrongQuestion(userId, questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield wrong_question_model_1.WrongQuestion.deleteOne({
                userId,
                questionId
            });
            if (result.deletedCount === 0) {
                throw new Error('错题记录不存在');
            }
        });
    }
    // 清空用户的所有错题记录
    static clearAllWrongQuestions(userId, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { userId };
            if (subject)
                query.subject = subject;
            yield wrong_question_model_1.WrongQuestion.deleteMany(query);
        });
    }
    // 获取高频错题
    static getFrequentWrongQuestions(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10) {
            return wrong_question_model_1.WrongQuestion.find({ userId })
                .sort({ attemptCount: -1 })
                .limit(limit)
                .populate('questionId');
        });
    }
    // 获取最近的错题
    static getRecentWrongQuestions(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10) {
            return wrong_question_model_1.WrongQuestion.find({ userId })
                .sort({ lastAttemptDate: -1 })
                .limit(limit)
                .populate('questionId');
        });
    }
}
exports.WrongQuestionService = WrongQuestionService;
