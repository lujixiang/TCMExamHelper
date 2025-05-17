import mongoose, { Schema, Document } from 'mongoose';

// 题目类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false'
}

// 题目接口定义
export interface IQuestion extends Document {
  subject: string;
  chapterNo: number;
  content: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 题目模式定义
const questionSchema = new Schema<IQuestion>(
  {
    subject: { type: String, required: true },
    chapterNo: { type: Number, required: true },
    content: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, required: true },
    explanation: String,
    difficulty: { type: Number, min: 1, max: 5 },
    tags: [String]
  },
  { timestamps: true }
);

// 创建索引
questionSchema.index({ subject: 1, chapterNo: 1 });
questionSchema.index({ tags: 1 });

// 导出模型
export const Question = mongoose.model<IQuestion>('Question', questionSchema); 