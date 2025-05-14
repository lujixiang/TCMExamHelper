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
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import QuestionCard from '../../components/QuestionCard';

interface Subject {
  _id: string;
  name: string;
}

interface Chapter {
  _id: string;
  title: string;
  subject: string;
}

const ChapterPractice: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

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
    // 获取章节列表
    const fetchChapters = async () => {
      if (!selectedSubject) {
        setChapters([]);
        return;
      }

      try {
        const response = await api.get(`/chapters/subject/${selectedSubject}`);
        setChapters(response.data.data);
      } catch (error) {
        console.error('获取章节列表失败:', error);
      }
    };

    fetchChapters();
  }, [selectedSubject]);

  const handleStartPractice = async () => {
    if (!selectedChapter) return;

    setLoading(true);
    try {
      const response = await api.get('/practice/chapter', {
        params: {
          chapterId: selectedChapter,
          count: 10
        }
      });
      setQuestions(response.data.data);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResult(false);
    } catch (error) {
      console.error('获取练习题目失败:', error);
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
    setScore(0);
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
              {score.toFixed(1)}分
            </Typography>
            <Typography variant="body1" align="center" gutterBottom>
              总题数: {questions.length} | 正确: {
                questions.filter(q => answers[q._id] === q.correctAnswer).length
              }
            </Typography>
            <Box display="flex" justifyContent="center" mt={3}>
              <Button variant="contained" onClick={handleRetry} sx={{ mr: 2 }}>
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
          章节练习
        </Typography>

        {!questions.length ? (
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>选择科目</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedChapter('');
                  }}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!selectedSubject}>
                <InputLabel>选择章节</InputLabel>
                <Select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  {chapters.map((chapter) => (
                    <MenuItem key={chapter._id} value={chapter._id}>
                      {chapter.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleStartPractice}
                disabled={!selectedChapter}
                fullWidth
              >
                开始练习
              </Button>
            </Stack>
          </Card>
        ) : (
          <Box>
            <QuestionCard
              question={questions[currentQuestionIndex]}
              onAnswer={(answer) => handleAnswerSubmit(questions[currentQuestionIndex]._id, answer)}
              selectedAnswer={answers[questions[currentQuestionIndex]._id]}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography>
                {currentQuestionIndex + 1} / {questions.length}
              </Typography>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!answers[questions[currentQuestionIndex]._id]}
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

export default ChapterPractice; 