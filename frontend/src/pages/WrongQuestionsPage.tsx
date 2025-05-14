import React, { useState, useEffect } from 'react';
import { wrongQuestionService } from '../services/wrongQuestionService';
import { WrongQuestion, WrongQuestionStats } from '../types/wrongQuestion';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

export const WrongQuestionsPage: React.FC = () => {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [stats, setStats] = useState<WrongQuestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [questionsResponse, statsResponse] = await Promise.all([
        wrongQuestionService.getWrongQuestions(),
        wrongQuestionService.getWrongQuestionStats()
      ]);

      setWrongQuestions(questionsResponse.data?.wrongQuestions || []);
      setStats(statsResponse.data || null);
    } catch (error) {
      console.error('获取错题数据失败:', error);
      setError('获取错题数据失败');
      setWrongQuestions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (questionId: string) => {
    try {
      await wrongQuestionService.deleteWrongQuestion(questionId);
      await fetchData(); // 重新加载数据
    } catch (error) {
      console.error('删除错题失败:', error);
      setError('删除错题失败');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 统计信息卡片 */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              错题统计
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary">
                      总错题数
                    </Typography>
                    <Typography variant="h3">
                      {stats?.totalCount || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      最常错题目
                    </Typography>
                    {stats?.mostFrequentQuestions?.slice(0, 3)?.map((question, index) => (
                      <Box key={question._id} sx={{ mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          {index + 1}. {question.question.substring(0, 30)}...
                        </Typography>
                        <Typography variant="body2" color="error">
                          错误次数: {question.attemptCount}
                        </Typography>
                      </Box>
                    )) || (
                      <Typography variant="body2" color="textSecondary">
                        暂无数据
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 错题列表 */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              错题列表
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              {wrongQuestions && wrongQuestions.length > 0 ? (
                wrongQuestions.map((question) => (
                  <React.Fragment key={question._id}>
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(question._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {question.question}
                            </Typography>
                            <Chip
                              size="small"
                              color="error"
                              label={`错误${question.attemptCount}次`}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              正确答案: {question.correctAnswer}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                            >
                              最后错误时间: {new Date(question.lastAttemptDate).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography align="center" color="textSecondary">
                        暂无错题记录
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 