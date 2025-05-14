import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWrongQuestion extends Document {
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  subject: string;
  chapterNo: number;
  wrongCount: number;
  lastWrongTime: Date;
  isResolved: boolean;
}

const WrongQuestionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  chapterNo: {
    type: Number,
    required: true
  },
  wrongCount: {
    type: Number,
    default: 1
  },
  lastWrongTime: {
    type: Date,
    default: Date.now
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建复合索引
WrongQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const WrongQuestion = mongoose.model<IWrongQuestion>('WrongQuestion', WrongQuestionSchema); 