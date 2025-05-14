import mongoose, { Schema, Document } from 'mongoose';

interface ReviewHistory {
  date: Date;
  isCorrect: boolean;
  answerTime: number;
  userAnswer: string;
}

export interface IWrongQuestion extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: string;
  subject: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: string;
  userAnswer: string;
  createdAt: Date;
  wrongCount: number;
  lastWrongDate: Date;
  lastReviewDate: Date;
  masteryLevel: number;
  status: 'pending' | 'reviewing' | 'mastered';
  chapterNo: number;
  difficulty?: number;
  reviewHistory: ReviewHistory[];
}

const WrongQuestionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: String,
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
  createdAt: {
    type: Date,
    default: Date.now
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
  difficulty: Number,
  reviewHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    isCorrect: Boolean,
    answerTime: Number,
    userAnswer: String
  }]
});

// 创建复合索引确保每个用户的每道题只记录一次
WrongQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const WrongQuestionModel = mongoose.model<IWrongQuestion>('WrongQuestion', WrongQuestionSchema); 