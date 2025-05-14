import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import QuestionCard from '../../components/QuestionCard';

interface Subject {
  _id: string;
  name: string;
}

interface ExamQuestion {
  _id: string;
  question: any;
}

const ExamPractice: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examId, setExamId] = useState('');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    // 获取科目列表
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/subjects');
        setSubjects(response.data.data);
      } catch (error) {
        console.error('获取科目列表失败:', error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && questions.length > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, questions]);

  const handleStartExam = async () => {
    if (!selectedSubject) return;

    setLoading(true);
    try {
      const response = await api.post('/practice/exam/start', {
        subject: selectedSubject,
        duration: 120 // 2小时
      });
      const { data } = response.data;
      setExamId(data._id);
      setQuestions(data.questions);
      setTimeLeft(data.duration * 60); // 转换为秒
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResult(false);
    } catch (error) {
      console.error('开始考试失败:', error);
    }
    setLoading(false);
  };

  const handleAnswerSubmit = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    setLoading(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
        answerTime: 0 // 这里可以添加答题时间的记录
      }));

      const response = await api.post(`/practice/exam/${examId}/submit`, {
        answers: answersArray
      });

      setExamResult(response.data.data);
      setShowResult(true);
    } catch (error) {
      console.error('提交考试失败:', error);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (showResult && examResult) {
    return (
      <Container maxWidth="md">
        <Card sx={{ mt: 4, p: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center">
              考试结果
            </Typography>
            <Typography variant="h2" align="center" color="primary" gutterBottom>
              {examResult.score.toFixed(1)}分
            </Typography>
            <Typography variant="body1" align="center" gutterBottom>
              总题数: {examResult.totalQuestions} | 正确: {examResult.correctCount}
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                分析报告
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                按难度分布:
              </Typography>
              {Object.entries(examResult.analysis.byDifficulty).map(([difficulty, stats]: [string, any]) => (
                <Box key={difficulty} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    难度 {difficulty}: {stats.correct}/{stats.total} ({((stats.correct/stats.total)*100).toFixed(1)}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(stats.correct/stats.total)*100}
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                薄弱知识点:
              </Typography>
              <Stack spacing={1}>
                {examResult.analysis.weakPoints.map((point: string) => (
                  <Typography key={point} color="error">
                    • {point}
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Box display="flex" justifyContent="center" mt={3}>
              <Button variant="outlined" onClick={() => navigate('/practice/analysis')}>
                查看完整分析
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          模拟考试
        </Typography>

        {!questions.length ? (
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>选择科目</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary">
                考试时长：2小时
              </Typography>
              <Typography variant="body2" color="text.secondary">
                题目数量：100题
              </Typography>

              <Button
                variant="contained"
                onClick={handleStartExam}
                disabled={!selectedSubject}
                fullWidth
              >
                开始考试
              </Button>
            </Stack>
          </Card>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="primary">
                剩余时间: {formatTime(timeLeft)}
              </Typography>
              <Typography>
                {currentQuestionIndex + 1} / {questions.length}
              </Typography>
            </Box>

            <QuestionCard
              question={questions[currentQuestionIndex].question}
              onAnswer={(answer) => handleAnswerSubmit(questions[currentQuestionIndex]._id, answer)}
              selectedAnswer={answers[questions[currentQuestionIndex]._id]}
            />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                上一题
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (currentQuestionIndex === questions.length - 1) {
                    setShowConfirmSubmit(true);
                  } else {
                    handleNext();
                  }
                }}
              >
                {currentQuestionIndex === questions.length - 1 ? '提交' : '下一题'}
              </Button>
            </Box>

            {/* 答题卡 */}
            <Card sx={{ mt: 3, p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                答题卡
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={answers[questions[index]._id] ? 'contained' : 'outlined'}
                    color={answers[questions[index]._id] ? 'primary' : 'inherit'}
                    size="small"
                    onClick={() => setCurrentQuestionIndex(index)}
                    sx={{ minWidth: '40px', height: '40px' }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Box>
            </Card>
          </Box>
        )}
      </Box>

      {/* 提交确认对话框 */}
      <Dialog
        open={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
      >
        <DialogTitle>
          确认提交
        </DialogTitle>
        <DialogContent>
          <Typography>
            已答题数: {Object.keys(answers).length}/{questions.length}
          </Typography>
          <Typography color="warning.main">
            {Object.keys(answers).length < questions.length && 
              `还有 ${questions.length - Object.keys(answers).length} 题未答`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmSubmit(false)}>
            继续答题
          </Button>
          <Button onClick={handleSubmitExam} variant="contained" color="primary">
            确认提交
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamPractice; 