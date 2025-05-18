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
exports.subjectController = void 0;
const question_model_1 = require("../models/question.model");
class SubjectController {
    // 获取所有科目列表
    getSubjects(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subjects = yield question_model_1.Question.distinct('subject');
                // 获取每个科目的题目数量
                const subjectsWithCount = yield Promise.all(subjects.map((subject) => __awaiter(this, void 0, void 0, function* () {
                    const questionCount = yield question_model_1.Question.countDocuments({ subject });
                    return {
                        _id: subject,
                        name: subject,
                        questionCount
                    };
                })));
                res.json({
                    success: true,
                    data: subjectsWithCount
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取特定科目的题目数量
    getQuestionCount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject } = req.params;
                const count = yield question_model_1.Question.countDocuments({ subject });
                res.json({
                    success: true,
                    data: { count }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取科目详情
    getSubjectDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject } = req.params;
                const totalQuestions = yield question_model_1.Question.countDocuments({ subject });
                const questionsByDifficulty = yield question_model_1.Question.aggregate([
                    { $match: { subject } },
                    {
                        $group: {
                            _id: '$difficulty',
                            count: { $sum: 1 }
                        }
                    }
                ]);
                res.json({
                    success: true,
                    data: {
                        subject,
                        totalQuestions,
                        questionsByDifficulty
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // 获取科目章节
    getSubjectChapters(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject } = req.params;
                const chapters = yield question_model_1.Question.aggregate([
                    { $match: { subject } },
                    {
                        $group: {
                            _id: '$chapterNo',
                            questionCount: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]);
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
}
exports.subjectController = new SubjectController();
