"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongQuestionModel = exports.WrongQuestion = void 0;
const mongoose_1 = require("mongoose");
const wrongQuestionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    options: {
        A: String,
        B: String,
        C: String,
        D: String,
        E: String
    },
    correctAnswer: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        required: true
    },
    wrongCount: {
        type: Number,
        default: 1
    },
    lastWrongDate: {
        type: Date,
        default: Date.now
    },
    lastReviewDate: {
        type: Date
    },
    masteryLevel: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'mastered'],
        default: 'pending'
    },
    chapterNo: {
        type: Number,
        required: true
    },
    difficulty: {
        type: Number
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    reviewHistory: [{
            date: {
                type: Date,
                default: Date.now
            },
            isCorrect: Boolean,
            answerTime: Number,
            userAnswer: String
        }],
    resolvedDate: {
        type: Date
    }
}, {
    timestamps: true
});
// 创建复合索引
wrongQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true });
wrongQuestionSchema.index({ userId: 1, subject: 1 });
// 导出模型
exports.WrongQuestion = (0, mongoose_1.model)('WrongQuestion', wrongQuestionSchema);
exports.WrongQuestionModel = exports.WrongQuestion;
