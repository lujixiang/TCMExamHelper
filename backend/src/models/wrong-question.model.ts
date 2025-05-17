import mongoose, { Document, Schema, Types } from 'mongoose';

interface ReviewHistory {
  date: Date;
  isCorrect: boolean;
  answerTime: number;
  userAnswer: string;
}

export interface IWrongQuestion extends Document {
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
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
  userAnswer: string;
  wrongCount: number;
  lastWrongDate: Date;
  lastReviewDate?: Date;
  masteryLevel: number;
  status: 'pending' | 'reviewing' | 'mastered';
  chapterNo: number;
  difficulty?: number;
  reviewHistory: ReviewHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const wrongQuestionSchema = new Schema<IWrongQuestion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    options: {
      A: String,
      B: String,
      C: String,
      D: String,
      E: String
    },
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String, required: true },
    wrongCount: { type: Number, default: 1 },
    lastWrongDate: { type: Date, default: Date.now },
    lastReviewDate: Date,
    masteryLevel: { type: Number, default: 1, min: 1, max: 5 },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'mastered'],
      default: 'pending'
    },
    chapterNo: { type: Number, required: true },
    difficulty: Number,
    reviewHistory: [{
      date: { type: Date, default: Date.now },
      isCorrect: Boolean,
      answerTime: Number,
      userAnswer: String
    }]
  },
  { timestamps: true }
);

// 创建复合索引
wrongQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true });
wrongQuestionSchema.index({ userId: 1, subject: 1 });

// 导出模型
export const WrongQuestion = mongoose.model<IWrongQuestion>('WrongQuestion', wrongQuestionSchema);
export const WrongQuestionModel = WrongQuestion; 