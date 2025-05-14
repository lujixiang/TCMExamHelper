import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  // 这里可以从 Redux store 获取实际数据
  const stats = {
    totalQuestions: 1000,
    completedQuestions: 150,
    wrongQuestions: 30,
    accuracy: 80
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        仪表盘
      </Typography>
      
      <Grid container spacing={3}>
        {/* 总题数 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总题数"
            value={stats.totalQuestions}
            icon={<AssignmentIcon color="primary" />}
            color="primary"
          />
        </Grid>

        {/* 已完成 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="已完成"
            value={stats.completedQuestions}
            icon={<TimelineIcon color="success" />}
            color="success"
          />
        </Grid>

        {/* 错题数 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="错题数"
            value={stats.wrongQuestions}
            icon={<ErrorIcon color="error" />}
            color="error"
          />
        </Grid>

        {/* 正确率 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="正确率"
            value={`${stats.accuracy}%`}
            icon={<TrendingUpIcon color="info" />}
            color="info"
          />
        </Grid>

        {/* 进度概览 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              学习进度
            </Typography>
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(stats.completedQuestions / stats.totalQuestions) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                已完成 {((stats.completedQuestions / stats.totalQuestions) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 