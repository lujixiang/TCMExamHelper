"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = exports.QuestionType = void 0;
const mongoose_1 = require("mongoose");
// 题目类型枚举
var QuestionType;
(function (QuestionType) {
    QuestionType["SINGLE_CHOICE"] = "single_choice";
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["TRUE_FALSE"] = "true_false";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
// 题目模式定义
const questionSchema = new mongoose_1.Schema({
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    options: {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true },
        E: String
    },
    correctAnswer: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D', 'E']
    },
    explanation: {
        type: String
    },
    chapterNo: {
        type: Number,
        required: true
    },
    difficulty: {
        type: Number,
        default: 3,
        min: 1,
        max: 5
    },
    tags: [{
            type: String
        }]
}, {
    timestamps: true
});
// 创建索引
questionSchema.index({ subject: 1, chapterNo: 1 });
questionSchema.index({ tags: 1 });
// 导出模型
exports.Question = (0, mongoose_1.model)('Question', questionSchema);
