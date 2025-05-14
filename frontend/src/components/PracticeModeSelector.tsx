import React from 'react';
import { Box, Container, Paper, Grid, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';

const PracticeModeSelector: React.FC = () => {
  const navigate = useNavigate();

  const practiceOptions = [
    {
      title: '随机练习',
      description: '从题库中随机抽取题目进行练习',
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      path: '/practice'
    },
    {
      title: '专项练习',
      description: '按照不同科目和类型进行针对性练习',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      path: '/practice/topic'
    },
    {
      title: '错题本',
      description: '复习之前做错的题目',
      icon: <BookmarkIcon sx={{ fontSize: 40 }} />,
      path: '/practice/mistakes'
    },
    {
      title: '练习历史',
      description: '查看历史练习记录和分析',
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      path: '/practice/history'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        选择练习模式
      </Typography>
      <Grid container spacing={3}>
        {practiceOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate(option.path)}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }}
              >
                {option.icon}
              </Box>
              <Typography variant="h6" component="h2" align="center" gutterBottom>
                {option.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ flexGrow: 1 }}
              >
                {option.description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                fullWidth
              >
                开始练习
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PracticeModeSelector; 