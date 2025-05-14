import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../utils/api';

interface WrongQuestion {
  _id: string;
  questionId: string;
  subject: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
  wrongCount: number;
  lastWrongTime: string;
  isResolved: boolean;
}

const WrongQuestions: React.FC = () => {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchWrongQuestions();
  }, []);

  const fetchWrongQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wrong-questions');
      console.log('错题本数据:', response.data);
      if (response.data.success) {
        const wrongQuestions = response.data.data.wrongQuestions;
        console.log('处理后的错题数据:', wrongQuestions);
        setWrongQuestions(wrongQuestions);
      } else {
        setError('获取错题列表失败');
      }
    } catch (error) {
      console.error('获取错题列表失败:', error);
      setError('获取错题列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      const response = await api.delete(`/wrong-questions/${questionId}`);
      if (response.data.success) {
        setSnackbarMessage('删除成功');
        setSnackbarOpen(true);
        fetchWrongQuestions();
      } else {
        setSnackbarMessage('删除失败：' + response.data.message);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('删除错题记录失败:', error);
      setSnackbarMessage('删除失败，请稍后重试');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          错题本
        </Typography>

        {wrongQuestions.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                暂无错题记录
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {wrongQuestions.map((question) => (
              <Grid item xs={12} key={question._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {question.subject}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {question.content || '题目不存在'}
                        </Typography>
                        <Box mt={2}>
                          {question.options && Object.entries(question.options).map(([key, value]) => (
                            <Typography
                              key={key}
                              variant="body2"
                              color={
                                key === question.correctAnswer
                                  ? 'success.main'
                                  : 'text.secondary'
                              }
                              sx={{ mb: 1 }}
                            >
                              {key}: {value || ''}
                            </Typography>
                          ))}
                        </Box>
                        <Box mt={2} display="flex" gap={1}>
                          <Chip
                            label={`错误次数: ${question.wrongCount}`}
                            color="error"
                            size="small"
                          />
                          <Chip
                            label={question.isResolved ? '已掌握' : '待复习'}
                            color={question.isResolved ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => handleDelete(question._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default WrongQuestions; 