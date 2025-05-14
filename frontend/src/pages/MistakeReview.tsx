import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { selectAllMistakes, toggleReviewed } from '../store/slices/mistakes';

const MistakeReview: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mistakes = useSelector(selectAllMistakes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentMistake = mistakes[currentIndex];
  const progress = (reviewedCount / mistakes.length) * 100;

  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(event.target.value);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setReviewedCount(prev => prev + 1);
    dispatch(toggleReviewed(currentMistake.id));
  };

  const handleNextQuestion = () => {
    if (currentIndex < mistakes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
    } else {
      // 复习完成，返回错题本
      navigate('/mistakes');
    }
  };

  const handleBack = () => {
    navigate('/mistakes');
  };

  if (!mistakes.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">暂无错题可供复习</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">错题复习</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          进度: {reviewedCount}/{mistakes.length}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {currentMistake.question}
            </Typography>
            {currentMistake.category && (
              <Chip 
                label={currentMistake.category} 
                size="small" 
                color="primary" 
                sx={{ mb: 2 }} 
              />
            )}
          </Box>

          <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
            <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
              {Object.entries(currentMistake.options).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={`${key}. ${value}`}
                  sx={{
                    mb: 1,
                    ...(showAnswer && {
                      color: key === currentMistake.correctAnswer ? 'success.main' : 
                             key === selectedAnswer ? 'error.main' : 'text.primary'
                    })
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {showAnswer ? (
            <Box>
              <Alert 
                severity={selectedAnswer === currentMistake.correctAnswer ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {selectedAnswer === currentMistake.correctAnswer ? 
                  '回答正确！' : 
                  `正确答案是: ${currentMistake.correctAnswer}. ${currentMistake.options[currentMistake.correctAnswer]}`
                }
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                解释：{currentMistake.explanation}
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleNextQuestion}
                fullWidth
              >
                {currentIndex < mistakes.length - 1 ? '下一题' : '完成复习'}
              </Button>
            </Box>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleShowAnswer}
              fullWidth
              disabled={!selectedAnswer}
            >
              检查答案
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MistakeReview; 