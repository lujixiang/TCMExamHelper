import { Question } from '../store/slices/questionSlice';

export const sampleQuestions: Question[] = [
  {
    id: 1,
    question: '以下哪个不是中医的四诊方法？',
    options: ['望诊', '闻诊', '问诊', '切诊', '测诊'],
    correctAnswer: 4
  },
  {
    id: 2,
    question: '中医学"脏腑"理论中，五脏不包括：',
    options: ['心', '肝', '脾', '肺', '胆'],
    correctAnswer: 4
  },
  {
    id: 3,
    question: '以下哪个不属于中医"气血津液"理论中的基本物质？',
    options: ['气', '血', '津液', '精', '痰'],
    correctAnswer: 4
  }
]; 