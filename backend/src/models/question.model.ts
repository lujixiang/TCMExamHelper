import mongoose, { Schema, Document } from 'mongoose';

// 题目类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false'
}

// 题目接口定义
export interface IQuestion extends Document {
  questionId: number;
  subject: string;
  chapterNo: number;
  description: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  answer: string;
  explanation?: string;
  difficulty?: number;
  tags?: string[];
}

// 题目模式定义
const QuestionSchema = new Schema({
  questionId: {
    type: Number,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  chapterNo: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  options: {
    A: {
      type: String,
      required: true
    },
    B: {
      type: String,
      required: true
    },
    C: {
      type: String,
      required: true
    },
    D: {
      type: String,
      required: true
    },
    E: String
  },
  answer: {
    type: String,
    required: true
  },
  explanation: String,
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  tags: [String]
}, {
  timestamps: true
});

// 创建索引
QuestionSchema.index({ subject: 1, chapterNo: 1 });
QuestionSchema.index({ tags: 1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema); 