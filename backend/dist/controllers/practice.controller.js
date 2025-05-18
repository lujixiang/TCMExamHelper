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
exports.getRandomQuestions = exports.getQuestionsByChapter = exports.getSubjects = exports.practiceController = exports.PracticeController = void 0;
const mongoose_1 = require("mongoose");
const practice_service_1 = require("../services/practice.service");
const question_model_1 = require("../models/question.model");
const error_1 = require("../utils/error");
class PracticeController {
    // 获取科目的所有章节
    getChapters(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject } = req.params;
                const chapters = yield practice_service_1.PracticeService.getChapters(subject);
                res.json({
                    success: true,
                    data: chapters
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取章节的题目（添加分页支持）
    getChapterQuestions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject, chapterNo } = req.params;
                const { page = 1, limit = 20 } = req.query;
                const result = yield practice_service_1.PracticeService.getChapterQuestions(subject, Number(chapterNo), Number(page), Number(limit));
                res.json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取每日练习题目
    getDailyQuestions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questions = yield practice_service_1.PracticeService.getDailyQuestions();
                res.json({
                    success: true,
                    data: questions
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取专项练习题目
    getTopicQuestions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject } = req.params;
                const { count = 20, difficulty } = req.query;
                const questions = yield practice_service_1.PracticeService.getTopicQuestions(subject, Number(count), difficulty ? Number(difficulty) : undefined);
                if (questions.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: '未找到该科目的题目'
                    });
                }
                res.json({
                    success: true,
                    data: questions
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取模拟考试题目
    getExamQuestions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questions = yield practice_service_1.PracticeService.getExamQuestions();
                res.json({
                    success: true,
                    data: questions
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取强化训练题目
    getEnhanceQuestions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: '未授权访问'
                    });
                }
                const questions = yield practice_service_1.PracticeService.getEnhanceQuestions(new mongoose_1.Types.ObjectId(userId));
                res.json({
                    success: true,
                    data: questions
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取智能推荐题目
    getRecommendedQuestions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: '未授权访问'
                    });
                }
                const questions = yield practice_service_1.PracticeService.getRecommendedQuestions(new mongoose_1.Types.ObjectId(userId));
                res.json({
                    success: true,
                    data: questions
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 提交答案
    submitAnswer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { questionId, answer } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const question = yield question_model_1.Question.findById(questionId);
                if (!question) {
                    throw new error_1.AppError('题目不存在', 404);
                }
                const isCorrect = question.correctAnswer === answer;
                // TODO: 更新用户答题统计
                // TODO: 如果答错，添加到错题本
                res.json({
                    success: true,
                    data: {
                        isCorrect,
                        correctAnswer: question.correctAnswer,
                        explanation: question.explanation
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取练习统计
    getExerciseStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: '未授权访问'
                    });
                }
                const stats = yield practice_service_1.PracticeService.getExerciseStats(new mongoose_1.Types.ObjectId(userId));
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.PracticeController = PracticeController;
exports.practiceController = new PracticeController();
// 获取科目列表
const getSubjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subjects = yield question_model_1.Question.distinct('subject');
        res.json({
            success: true,
            data: subjects
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getSubjects = getSubjects;
// 获取章节题目
const getQuestionsByChapter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject, chapterNo } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const questions = yield question_model_1.Question.find({ subject, chapterNo })
            .skip(skip)
            .limit(limit);
        const total = yield question_model_1.Question.countDocuments({ subject, chapterNo });
        res.json({
            success: true,
            data: {
                questions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getQuestionsByChapter = getQuestionsByChapter;
// 获取随机题目
const getRandomQuestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject } = req.params;
        const count = parseInt(req.query.count) || 20;
        const difficulty = parseInt(req.query.difficulty);
        const query = { subject };
        if (difficulty) {
            query.difficulty = difficulty;
        }
        const questions = yield question_model_1.Question.aggregate([
            { $match: query },
            { $sample: { size: count } }
        ]);
        res.json({
            success: true,
            data: questions
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getRandomQuestions = getRandomQuestions;
