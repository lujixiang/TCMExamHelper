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
exports.PracticeService = void 0;
const mongoose_1 = require("mongoose");
const question_model_1 = require("../models/question.model");
const wrong_question_model_1 = require("../models/wrong-question.model");
const chapter_model_1 = require("../models/chapter.model");
class PracticeService {
    // 获取科目的所有章节
    static getChapters(subject) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chapter_model_1.Chapter.find({ subject }).sort('chapterNo');
        });
    }
    // 获取章节的题目
    static getChapterQuestions(subject_1, chapterNo_1) {
        return __awaiter(this, arguments, void 0, function* (subject, chapterNo, page = 1, limit = 20) {
            const questions = yield question_model_1.Question.find({ subject, chapterNo: Number(chapterNo) })
                .sort('questionNo')
                .skip((page - 1) * limit)
                .limit(limit);
            const total = yield question_model_1.Question.countDocuments({ subject, chapterNo: Number(chapterNo) });
            return {
                questions,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        });
    }
    // 获取每日练习题目
    static getDailyQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield question_model_1.Question.aggregate([
                { $sample: { size: 30 } }
            ]);
        });
    }
    // 获取专项练习题目
    static getTopicQuestions(subject_1) {
        return __awaiter(this, arguments, void 0, function* (subject, count = 20, difficulty) {
            const query = { subject: decodeURIComponent(subject) };
            if (difficulty) {
                query.difficulty = Number(difficulty);
            }
            return yield question_model_1.Question.aggregate([
                { $match: query },
                { $sample: { size: Number(count) } }
            ]);
        });
    }
    // 获取模拟考试题目
    static getExamQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield question_model_1.Question.aggregate([
                { $sample: { size: 100 } }
            ]);
        });
    }
    // 获取强化训练题目
    static getEnhanceQuestions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wrong_question_model_1.WrongQuestion.find({
                userId,
                isResolved: false
            })
                .sort('-wrongCount')
                .limit(20)
                .populate('questionId');
        });
    }
    // 获取智能推荐题目
    static getRecommendedQuestions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrongStats = yield wrong_question_model_1.WrongQuestion.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: '$chapterNo',
                        wrongCount: { $sum: 1 }
                    }
                }
            ]);
            const recommendations = yield Promise.all(wrongStats.map((stat) => __awaiter(this, void 0, void 0, function* () {
                return yield question_model_1.Question.find({
                    chapterNo: stat._id,
                    difficulty: { $gte: 3 }
                })
                    .limit(Math.ceil(stat.wrongCount * 0.3))
                    .select('-correctAnswer -explanation');
            })));
            return recommendations.flat();
        });
    }
    // 提交答案
    static submitAnswer(userId, questionId, answer) {
        return __awaiter(this, void 0, void 0, function* () {
            const question = yield question_model_1.Question.findById(questionId);
            if (!question) {
                throw new Error('题目不存在');
            }
            const isCorrect = question.correctAnswer === answer;
            if (!isCorrect) {
                const existingWrongQuestion = yield wrong_question_model_1.WrongQuestion.findOne({
                    userId,
                    questionId: new mongoose_1.Types.ObjectId(questionId)
                });
                if (existingWrongQuestion) {
                    yield wrong_question_model_1.WrongQuestion.findByIdAndUpdate(existingWrongQuestion._id, {
                        $inc: { wrongCount: 1 },
                        lastWrongDate: new Date(),
                        isResolved: false
                    });
                }
                else {
                    yield wrong_question_model_1.WrongQuestion.create({
                        userId,
                        questionId: new mongoose_1.Types.ObjectId(questionId),
                        subject: question.subject,
                        chapterNo: question.chapterNo || 0,
                        wrongCount: 1,
                        lastWrongDate: new Date(),
                        isResolved: false
                    });
                }
            }
            return {
                isCorrect,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation
            };
        });
    }
    // 获取练习统计
    static getExerciseStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalQuestions = yield question_model_1.Question.countDocuments();
            const completedQuestions = yield wrong_question_model_1.WrongQuestion.distinct('questionId', { userId });
            const wrongQuestions = yield wrong_question_model_1.WrongQuestion.find({ userId, isResolved: false });
            return {
                totalQuestions,
                completedCount: completedQuestions.length,
                wrongCount: wrongQuestions.length,
                accuracy: completedQuestions.length ?
                    ((completedQuestions.length - wrongQuestions.length) / completedQuestions.length * 100).toFixed(2) :
                    0
            };
        });
    }
}
exports.PracticeService = PracticeService;
