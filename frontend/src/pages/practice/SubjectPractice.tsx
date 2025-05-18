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
  Grid,
  CircularProgress,
  Slider,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import QuestionCard from '../../components/QuestionCard';
import { Question } from '../../types/question';

interface Subject {
  _id: string;
  name: string;
  questionCount: number;
}

interface QuestionResponse {
  _id: string;
  questionId: number;
  subject: string;
  description: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  answer: string;
  explanation?: string;
}

const SubjectPractice: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [difficulty, setDifficulty] = useState<number>(3);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [maxQuestionCount, setMaxQuestionCount] = useState<number>(50);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    accuracy: 0
  });

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

  // 当选择科目变化时更新最大题目数
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s.name === selectedSubject);
      if (subject) {
        setMaxQuestionCount(subject.questionCount);
        // 如果当前选择的题目数量超过了最大值，则调整为最大值
        if (questionCount > subject.questionCount) {
          setQuestionCount(subject.questionCount);
        }
      }
    }
  }, [selectedSubject, subjects]);

  const handleStartPractice = async () => {
    if (!selectedSubject) {
      alert('请选择科目');
      return;
    }

    // 检查认证状态
    const token = localStorage.getItem('token');
    console.log('开始练习 - 认证状态:', {
      hasToken: !!token,
      token: token
    });

    setLoading(true);
    try {
      console.log('开始获取题目，参数:', {
        subject: selectedSubject,
        count: questionCount
      });

      const encodedSubject = encodeURIComponent(selectedSubject);
      const response = await api.get(`/practice/${encodedSubject}/topic`, {
        params: {
          count: questionCount
        }
      });

      console.log('获取题目响应:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        if (response.data.data.length === 0) {
          alert('当前条件下没有找到题目，请更换科目');
          return;
        }

        // 处理题目数据
        const processedQuestions = response.data.data.map((q: QuestionResponse) => ({
          _id: q._id,
          content: q.description || '题目加载失败',
          options: {
            A: q.options?.A || '',
            B: q.options?.B || '',
            C: q.options?.C || '',
            D: q.options?.D || '',
            E: q.options?.E || ''
          },
          correctAnswer: q.answer || '',
          explanation: q.explanation || '',
          subject: q.subject
        }));

        console.log('处理后的题目数据:', processedQuestions[0]);
        
        setQuestions(processedQuestions);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setShowResult(false);
        setShowAnswer(false);
        setStats({
          total: processedQuestions.length,
          correct: 0,
          incorrect: 0,
          accuracy: 0
        });
      } else {
        console.error('题目数据格式错误:', response.data);
        alert('获取题目失败：' + (response.data.message || '请稍后重试'));
      }
    } catch (error: any) {
      console.error('获取练习题目失败:', error);
      
      // 处理不同的错误情况
      if (error.response) {
        // 服务器返回了错误响应
        const message = error.response.data?.message || '未知错误';
        switch (error.response.status) {
          case 400:
            alert('参数错误：' + message);
            break;
          case 401:
            alert('请先登录');
            navigate('/login');
            break;
          case 404:
            alert(message);
            break;
          case 503:
            alert('数据库服务暂时不可用，请稍后重试');
            break;
          default:
            alert('获取题目失败：' + message);
        }
      } else if (error.request) {
        // 请求发出但没有收到响应
        alert('无法连接到服务器，请检查网络连接');
      } else {
        // 请求设置时发生错误
        alert('发送请求时出错：' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    setShowAnswer(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    // 提交答案到后端
    api.post('/practice/submit', {
      questionId: currentQuestion._id,
      answer: answer,
      isCorrect: isCorrect
    }).catch(error => {
      console.error('提交答案失败:', error);
    });

    setStats(prev => {
      const newCorrect = prev.correct + (isCorrect ? 1 : 0);
      const newIncorrect = prev.incorrect + (isCorrect ? 0 : 1);
      const newTotal = newCorrect + newIncorrect;
      return {
        total: newTotal,
        correct: newCorrect,
        incorrect: newIncorrect,
        accuracy: (newCorrect / newTotal) * 100
      };
    });
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        correctCount++;
      }
    });
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
  };

  const handleRetry = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setShowAnswer(false);
    setStats({
      total: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 0
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (showResult) {
    return (
      <Container maxWidth="md">
        <Card sx={{ mt: 4, p: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center">
              练习结果
            </Typography>
            <Typography variant="h2" align="center" color="primary" gutterBottom>
              {stats.accuracy.toFixed(1)}%
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" align="center" gutterBottom>
                详细统计
              </Typography>
              <Typography variant="body1" align="center" gutterBottom>
                总题数: {stats.total} | 正确: {stats.correct} | 错误: {stats.incorrect}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                科目: {selectedSubject} | 难度: {difficulty}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button variant="contained" onClick={handleRetry}>
                重新练习
              </Button>
              <Button variant="outlined" onClick={() => navigate('/practice/analysis')}>
                查看分析
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
          科目练习
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
                    <MenuItem key={subject._id} value={subject.name}>
                      {subject.name} ({subject.questionCount}题)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography gutterBottom>
                  题目数量: {questionCount} {selectedSubject && `(总题数: ${maxQuestionCount})`}
                </Typography>
                <Slider
                  value={questionCount}
                  onChange={(_, value) => setQuestionCount(value as number)}
                  min={5}
                  max={maxQuestionCount}
                  step={Math.max(1, Math.floor(maxQuestionCount / 10))}
                  marks
                  disabled={!selectedSubject}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleStartPractice}
                disabled={!selectedSubject}
                fullWidth
              >
                开始练习
              </Button>
            </Stack>
          </Card>
        ) : (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="primary">
                    当前进度: {currentQuestionIndex + 1} / {questions.length}
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    正确率: {stats.total > 0 ? stats.accuracy.toFixed(1) : 0}%
                  </Typography>
                </Box>
                <Box display="flex" gap={2} mt={1}>
                  <Typography color="text.secondary">
                    已答: {stats.total}题
                  </Typography>
                  <Typography color="success.main">
                    正确: {stats.correct}题
                  </Typography>
                  <Typography color="error.main">
                    错误: {stats.incorrect}题
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <QuestionCard
              question={questions[currentQuestionIndex]}
              selectedAnswer={answers[questions[currentQuestionIndex]._id]}
              showResult={showAnswer}
              onAnswerSelect={(answer) => handleAnswerSubmit(questions[currentQuestionIndex]._id, answer)}
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                上一题
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!answers[questions[currentQuestionIndex]._id] || !showAnswer}
              >
                {currentQuestionIndex === questions.length - 1 ? '完成' : '下一题'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SubjectPractice; 