import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import QuestionCard from '../../components/QuestionCard';
import { Question } from '../../types/question';

// 从数据库获取的实际科目列表
const SUBJECTS = [
  '全部科目',
  '中医儿科学',
  '中医内科',
  '中医基础理论',
  '中医外科',
  '中医诊断学',
  '中药学',
  '方剂学',
  '针灸学'
];

const RandomPractice: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('全部科目');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchRandomQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      setStartTime(new Date()); // 记录开始答题时间

      const question = await questionService.getRandomQuestion(
        selectedSubject === '全部科目' ? undefined : selectedSubject
      );

      // 转换数据结构以匹配前端接口
      const transformedQuestion: Question = {
        _id: question._id,
        content: question.description || question.content,
        options: question.options,
        correctAnswer: question.answer || question.correctAnswer,
        explanation: question.explanation || '',
        subject: question.subject,
        difficulty: question.difficulty || 3,
        createdAt: question.createdAt || new Date().toISOString(),
        updatedAt: question.updatedAt || new Date().toISOString()
      };

      setCurrentQuestion(transformedQuestion);
      setSelectedAnswer('');
      setShowResult(false);
    } catch (error) {
      console.error('获取随机题目失败:', error);
      setError('获取题目失败，请稍后重试');
      setCurrentQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuestion();
  }, [selectedSubject]);

  const handleAnswerSelect = (answer: string) => {
    if (!showResult) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubjectChange = (event: SelectChangeEvent<string>) => {
    setSelectedSubject(event.target.value);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedAnswer || !startTime) return;

    setShowResult(true);
    const endTime = new Date();
    const answerTime = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // 计算答题用时（秒）

    // 如果答错了，添加到错题本
    if (selectedAnswer !== currentQuestion.correctAnswer) {
      try {
        await questionService.addToMistakes({
          questionId: currentQuestion._id,
          userAnswer: selectedAnswer,
          answerTime
        });
      } catch (error) {
        console.error('添加错题失败:', error);
      }
    }
  };

  const handleNext = () => {
    fetchRandomQuestion();
  };

  const handleExit = () => {
    navigate('/practice');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              随机练习
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>选择科目</InputLabel>
              <Select
                value={selectedSubject}
                label="选择科目"
                onChange={handleSubjectChange}
              >
                {SUBJECTS.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            onAnswerSelect={handleAnswerSelect}
          />
        ) : (
          <Alert severity="info">暂无可用的题目</Alert>
        )}

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" color="primary" onClick={handleExit}>
            退出练习
          </Button>
          {!error && currentQuestion && (
            !showResult ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!selectedAnswer}
              >
                提交答案
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleNext}>
                下一题
              </Button>
            )
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RandomPractice; 