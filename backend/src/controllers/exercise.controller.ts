import { Request, Response } from 'express';
import { Question } from '../models/question.model';

// 获取练习题目列表
export const getExerciseQuestions = async (req: Request, res: Response) => {
  try {
    const { subject, chapter } = req.query;
    const filter: any = {};
    
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    
    const questions = await Question.find(filter);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: '获取练习题目失败', error });
  }
};

// 获取单个练习题目
export const getExerciseQuestion = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: '题目不存在' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: '获取题目失败', error });
  }
}; 