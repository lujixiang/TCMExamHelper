import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  subject: string;      // 科目名称
  chapterNo: number;    // 章节序号
  title: string;        // 章节标题
  description: string;   // 章节描述
  questionCount: number;// 题目数量
}

const ChapterSchema: Schema = new Schema({
  subject: {
    type: String,
    required: true,
    index: true
  },
  chapterNo: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 创建复合索引
ChapterSchema.index({ subject: 1, chapterNo: 1 }, { unique: true });

export const Chapter = mongoose.model<IChapter>('Chapter', ChapterSchema); 