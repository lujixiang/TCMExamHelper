import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Paper,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Question {
  _id: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
}

interface PracticeState {
  questions: Question[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedAnswer: string | null;
  showExplanation: boolean;
}

const QuestionPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<PracticeState>({
    questions: [],
    currentPage: 1,
    totalPages: 1,
    loading: true,
    error: null,
    selectedAnswer: null,
    showExplanation: false
  });

  const fetchQuestions = async (page: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.get(`/api/questions/${subject}`, {
        params: { page, pageSize: 30 }
      });
      setState(prev => ({
        ...prev,
        questions: response.data.questions,
        totalPages: response.data.totalPages,
        currentPage: page,
        loading: false,
        selectedAnswer: null,
        showExplanation: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '获取题目失败，请重试'
      }));
    }
  };

  useEffect(() => {
    fetchQuestions(1);
  }, [subject]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchQuestions(page);
  };

  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      selectedAnswer: event.target.value,
      showExplanation: true
    }));
  };

  const currentQuestion = state.questions[state.currentPage - 1];

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{state.error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/practice')}
          sx={{ mb: 2 }}
        >
          返回科目选择
        </Button>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {`第 ${state.currentPage} 题 / 共 ${state.totalPages} 题`}
          </Typography>

          <Typography variant="body1" paragraph>
            {currentQuestion?.content}
          </Typography>

          <RadioGroup
            value={state.selectedAnswer || ''}
            onChange={handleAnswerSelect}
          >
            {Object.entries(currentQuestion?.options || {}).map(([key, value]) => (
              <FormControlLabel
                key={key}
                value={key}
                control={<Radio />}
                label={`${key}. ${value}`}
              />
            ))}
          </RadioGroup>

          {state.showExplanation && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body1"
                color={
                  state.selectedAnswer === currentQuestion?.correctAnswer
                    ? 'success.main'
                    : 'error.main'
                }
                gutterBottom
              >
                {`正确答案: ${currentQuestion?.correctAnswer}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                解析: {currentQuestion?.explanation}
              </Typography>
            </Box>
          )}
        </Paper>

        <Box display="flex" justifyContent="center">
          <Pagination
            count={state.totalPages}
            page={state.currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default QuestionPage; 