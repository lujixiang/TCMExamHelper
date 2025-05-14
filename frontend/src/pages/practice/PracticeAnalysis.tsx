import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  LinearProgress,
  Stack,
  Divider,
  Paper
} from '@mui/material';
import { api } from '../../utils/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PracticeAnalysis {
  totalPractices: number;
  averageScore: number;
  subjectPerformance: {
    [key: string]: {
      correctRate: number;
      averageTime: number;
      totalQuestions: number;
    };
  };
  weakPoints: string[];
  strongPoints: string[];
  recentProgress: {
    date: string;
    score: number;
  }[];
}

const PracticeAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<PracticeAnalysis | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get('/practice/analysis');
        setAnalysis(response.data.data);
      } catch (error) {
        console.error('获取练习分析失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          暂无练习数据
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          练习分析
        </Typography>

        <Grid container spacing={3}>
          {/* 总体统计 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        总练习次数
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {analysis.totalPractices}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        平均分数
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {analysis.averageScore.toFixed(1)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        已练习题目
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {Object.values(analysis.subjectPerformance).reduce(
                          (sum, subject) => sum + subject.totalQuestions,
                          0
                        )}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 科目表现 */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  科目表现
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(analysis.subjectPerformance).map(([subject, performance]) => (
                    <Box key={subject}>
                      <Typography variant="subtitle1">
                        {subject}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={performance.correctRate}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {performance.correctRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        平均用时: {performance.averageTime.toFixed(1)}秒 | 
                        总题数: {performance.totalQuestions}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 强弱项分析 */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="error">
                    薄弱项
                  </Typography>
                  <Stack spacing={1}>
                    {analysis.weakPoints.map((point, index) => (
                      <Typography key={index} color="error">
                        • {point}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    强项
                  </Typography>
                  <Stack spacing={1}>
                    {analysis.strongPoints.map((point, index) => (
                      <Typography key={index} color="success.main">
                        • {point}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* 进度趋势 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  最近练习趋势
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analysis.recentProgress}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PracticeAnalysis; 