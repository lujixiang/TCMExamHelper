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
exports.wrongQuestionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wrong_question_model_1 = require("../models/wrong-question.model");
const wrong_question_service_1 = require("../services/wrong-question.service");
const error_1 = require("../utils/error");
exports.wrongQuestionController = {
    // 获取错题列表
    getWrongQuestions: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { subject, chapterNo, isResolved, page = 1, limit = 20 } = req.query;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            const query = { userId };
            if (subject)
                query.subject = subject;
            if (chapterNo)
                query.chapterNo = Number(chapterNo);
            if (isResolved !== undefined)
                query.isResolved = isResolved === 'true';
            console.log('错题查询条件:', query);
            const wrongQuestions = yield wrong_question_model_1.WrongQuestion.find(query)
                .sort('-lastWrongTime')
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit))
                .populate({
                path: 'questionId',
                model: 'Question',
                select: 'questionId description options answer subject chapterNo'
            })
                .lean();
            console.log('查询到的错题:', JSON.stringify(wrongQuestions, null, 2));
            const total = yield wrong_question_model_1.WrongQuestion.countDocuments(query);
            // 处理返回数据的格式
            const formattedWrongQuestions = wrongQuestions.map(wq => {
                const question = wq.questionId;
                console.log('处理单个错题数据:', {
                    wrongQuestion: wq,
                    populatedQuestion: question
                });
                if (!question) {
                    console.log('题目不存在，错题ID:', wq._id);
                    // 如果题目不存在，尝试删除这条错题记录
                    wrong_question_model_1.WrongQuestion.findByIdAndDelete(wq._id).catch(err => console.error('删除无效错题记录失败:', err));
                }
                return {
                    _id: wq._id,
                    questionId: question === null || question === void 0 ? void 0 : question._id,
                    originalQuestionId: question === null || question === void 0 ? void 0 : question.questionId,
                    subject: (question === null || question === void 0 ? void 0 : question.subject) || wq.subject,
                    content: (question === null || question === void 0 ? void 0 : question.description) || '题目不存在',
                    options: (question === null || question === void 0 ? void 0 : question.options) || {
                        A: '',
                        B: '',
                        C: '',
                        D: ''
                    },
                    correctAnswer: (question === null || question === void 0 ? void 0 : question.answer) || '',
                    wrongCount: wq.wrongCount,
                    lastWrongDate: wq.lastWrongDate,
                    isResolved: wq.isResolved,
                    chapterNo: (question === null || question === void 0 ? void 0 : question.chapterNo) || wq.chapterNo
                };
            });
            // 过滤掉没有关联题目的记录
            const validWrongQuestions = formattedWrongQuestions.filter(wq => wq.content !== '题目不存在');
            console.log('格式化后的错题数据:', JSON.stringify(validWrongQuestions, null, 2));
            res.json({
                success: true,
                data: {
                    wrongQuestions: validWrongQuestions,
                    pagination: {
                        total: validWrongQuestions.length,
                        page: Number(page),
                        limit: Number(limit),
                        pages: Math.ceil(validWrongQuestions.length / Number(limit))
                    }
                }
            });
        }
        catch (error) {
            console.error('获取错题列表出错:', error);
            next(error);
        }
    }),
    // 获取错题统计
    getWrongQuestionStats: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            const stats = yield wrong_question_model_1.WrongQuestion.aggregate([
                { $match: { userId } },
                { $group: {
                        _id: {
                            subject: '$subject',
                            chapterNo: '$chapterNo'
                        },
                        totalCount: { $sum: 1 },
                        resolvedCount: {
                            $sum: { $cond: ['$isResolved', 1, 0] }
                        },
                        unresolvedCount: {
                            $sum: { $cond: ['$isResolved', 0, 1] }
                        }
                    } },
                { $sort: { '_id.subject': 1, '_id.chapterNo': 1 } }
            ]);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            next(error);
        }
    }),
    // 删除错题记录
    deleteWrongQuestion: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { questionId } = req.params;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            console.log('删除错题记录:', { userId, questionId });
            const wrongQuestion = yield wrong_question_model_1.WrongQuestion.findOne({
                userId,
                $or: [
                    { _id: questionId },
                    { questionId: questionId }
                ]
            });
            if (!wrongQuestion) {
                return res.status(404).json({
                    success: false,
                    message: '错题记录不存在'
                });
            }
            yield wrongQuestion.deleteOne();
            res.json({
                success: true,
                message: '删除成功'
            });
        }
        catch (error) {
            console.error('删除错题记录出错:', error);
            next(error);
        }
    }),
    // 批量删除错题记录
    batchDeleteWrongQuestions: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { questionIds } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            if (!Array.isArray(questionIds) || questionIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '请提供有效的题目ID列表'
                });
            }
            console.log('批量删除错题记录:', { userId, questionIds });
            const result = yield wrong_question_model_1.WrongQuestion.deleteMany({
                userId,
                $or: [
                    { _id: { $in: questionIds } },
                    { questionId: { $in: questionIds } }
                ]
            });
            res.json({
                success: true,
                message: `成功删除${result.deletedCount}条记录`
            });
        }
        catch (error) {
            console.error('批量删除错题记录出错:', error);
            next(error);
        }
    }),
    // 更新错题状态
    updateStatus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { questionId } = req.params;
            const { isResolved } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            const wrongQuestion = yield wrong_question_model_1.WrongQuestion.findOneAndUpdate({ userId, questionId }, { isResolved }, { new: true });
            if (!wrongQuestion) {
                return res.status(404).json({
                    success: false,
                    message: '错题记录不存在'
                });
            }
            res.json({
                success: true,
                data: wrongQuestion
            });
        }
        catch (error) {
            next(error);
        }
    }),
    // 批量更新错题状态
    batchUpdateStatus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { questionIds, isResolved } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            if (!Array.isArray(questionIds) || questionIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '请提供有效的题目ID列表'
                });
            }
            yield wrong_question_model_1.WrongQuestion.updateMany({
                userId,
                questionId: { $in: questionIds.map(id => new mongoose_1.default.Types.ObjectId(id)) }
            }, {
                $set: { isResolved }
            });
            res.json({
                success: true,
                message: '批量更新成功'
            });
        }
        catch (error) {
            next(error);
        }
    }),
    // 清空错题记录
    clearWrongQuestions: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            const { subject } = req.query;
            yield wrong_question_service_1.WrongQuestionService.clearAllWrongQuestions(userId, subject);
            res.json({
                success: true,
                message: subject ? `${subject}科目的错题记录已清空` : '所有错题记录已清空'
            });
        }
        catch (error) {
            next(error);
        }
    }),
    // 获取高频错题
    getFrequentWrongQuestions: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            const { limit } = req.query;
            const questions = yield wrong_question_service_1.WrongQuestionService.getFrequentWrongQuestions(userId, limit ? Number(limit) : 10);
            res.json({
                success: true,
                data: questions
            });
        }
        catch (error) {
            next(error);
        }
    }),
    // 获取最近错题
    getRecentWrongQuestions: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
            }
            const { limit } = req.query;
            const questions = yield wrong_question_service_1.WrongQuestionService.getRecentWrongQuestions(userId, limit ? Number(limit) : 10);
            res.json({
                success: true,
                data: questions
            });
        }
        catch (error) {
            next(error);
        }
    }),
    // 获取错题详情
    getWrongQuestionById: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const question = yield wrong_question_model_1.WrongQuestion.findOne({ _id: id, userId });
            if (!question) {
                throw new error_1.AppError('错题不存在', 404);
            }
            res.json({
                success: true,
                data: question
            });
        }
        catch (error) {
            next(error);
        }
    }),
    // 更新错题状态
    updateWrongQuestion: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { status, isResolved } = req.body;
            const question = yield wrong_question_model_1.WrongQuestion.findOneAndUpdate({ _id: id, userId }, {
                $set: {
                    status,
                    isResolved,
                    resolvedDate: isResolved ? new Date() : undefined
                }
            }, { new: true });
            if (!question) {
                throw new error_1.AppError('错题不存在', 404);
            }
            res.json({
                success: true,
                data: question
            });
        }
        catch (error) {
            next(error);
        }
    })
};
