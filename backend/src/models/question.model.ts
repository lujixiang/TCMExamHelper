import { Schema, model, Document } from 'mongoose';

// 题目类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false'
}

// 题目接口定义
export interface IQuestion extends Document {
  subject: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  correctAnswer: string;
  explanation?: string;
  chapterNo: number;
  difficulty: number;
  tags: string[];
}

// 题目模式定义
const questionSchema = new Schema<IQuestion>({
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
export const Question = model<IQuestion>('Question', questionSchema); 