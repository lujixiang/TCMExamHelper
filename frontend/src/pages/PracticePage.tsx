import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import {
  Timer as TimerIcon,
  School as SchoolIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();

  const practiceTypes = [
    {
      title: '每日练习',
      description: '每天30道题目，巩固知识点',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      path: '/practice/daily'
    },
    {
      title: '专项练习',
      description: '按照知识点分类练习',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#2196F3',
      path: '/practice/topic'
    },
    {
      title: '模拟考试',
      description: '完整模拟考试体验',
      icon: <BookmarkIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      path: '/practice/exam'
    },
    {
      title: '强化训练',
      description: '针对性提高薄弱环节',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#E91E63',
      path: '/practice/enhance'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          选择练习模式
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          选择适合您的练习模式，开始TCM考试备考之旅
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {practiceTypes.map((type, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: `${type.color}15`,
                      borderRadius: '50%',
                      p: 2,
                      color: type.color
                    }}
                  >
                    {type.icon}
                  </Box>
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {type.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {type.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained"
                  onClick={() => navigate(type.path)}
                  sx={{
                    backgroundColor: type.color,
                    '&:hover': {
                      backgroundColor: type.color,
                      opacity: 0.9
                    }
                  }}
                >
                  开始练习
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}; 