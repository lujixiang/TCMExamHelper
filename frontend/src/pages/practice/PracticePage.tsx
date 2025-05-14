import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Paper
} from '@mui/material';
import {
  QuestionAnswer as QuestionIcon,
  Shuffle as ShuffleIcon,
  Category as CategoryIcon,
  Error as ErrorIcon,
  MenuBook as MenuBookIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const practiceOptions = [
    {
      title: '科目练习',
      description: '按照科目进行针对性练习，可选择难度和题目数量',
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      path: '/practice/subject',
      color: '#2196F3'
    },
    {
      title: '章节练习',
      description: '按照具体章节进行练习，巩固知识点',
      icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
      path: '/practice/chapter',
      color: '#4CAF50'
    },
    {
      title: '模拟考试',
      description: '完整模拟真实考试环境，限时答题',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      path: '/practice/exam',
      color: '#FF9800'
    },
    {
      title: '错题练习',
      description: '复习之前做错的题目，查漏补缺',
      icon: <ErrorIcon sx={{ fontSize: 40 }} />,
      path: '/wrong-questions',
      color: '#F44336'
    }
  ];

  const handleModeSelect = (path: string) => {
    setSelectedMode(path);
    navigate(path);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          选择练习模式
        </Typography>
        <Typography variant="body1" color="text.secondary">
          请选择一种练习模式开始学习
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {practiceOptions.map((option) => (
          <Grid item xs={12} sm={6} md={3} key={option.title}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleModeSelect(option.path)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${option.color}15`,
                      color: option.color,
                      mb: 2
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 最近练习记录 */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          最近练习
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                上次练习
              </Typography>
              <Typography variant="body1">
                随机练习 - 2024-01-20
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                完成题目
              </Typography>
              <Typography variant="body1">
                30题
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                正确率
              </Typography>
              <Typography variant="body1">
                85%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PracticePage; 