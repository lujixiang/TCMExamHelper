import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Divider,
  Alert,
  Chip
} from '@mui/material';

export interface QuestionCardProps {
  question: {
    _id: string;
    questionid: string;
    content: string;  // 这里实际上是 description 字段
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
      E: string;
    };
    correctAnswer?: string;  // 实际上是 answer 字段
    subject?: string;
  };
  selectedAnswer?: string;
  showResult?: boolean;
  onAnswerSelect: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  showResult = false,
  onAnswerSelect
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerSelect(event.target.value);
  };

  const isCorrect = showResult && selectedAnswer === question.correctAnswer;
  
  // 修改选项处理逻辑
  const optionsArray = question.options
    ? Object.entries(question.options)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => ({
          key,
          value: value.trim()
        }))
    : [];

  console.log('选项数组:', optionsArray); // 添加日志

  // 格式化题目内容，处理可能的换行符
  const formatContent = (content?: string) => {
    if (!content) return null;
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography 
            variant="body1" 
            gutterBottom 
            sx={{ 
              whiteSpace: 'pre-line',
              flex: 1
            }}
          >
            {question?.content ? formatContent(question.content) : '加载中...'}
          </Typography>
          {question?.subject && (
            <Chip 
              label={question.subject} 
              color="primary" 
              variant="outlined" 
              size="small" 
              sx={{ ml: 2, flexShrink: 0 }}
            />
          )}
        </Box>
        <Box my={2}>
          <RadioGroup
            value={selectedAnswer || ''}
            onChange={handleChange}
          >
            {optionsArray.map(({ key, value }) => (
              <FormControlLabel
                key={key}
                value={key}
                control={<Radio />}
                label={`${key}. ${value}`}
                disabled={showResult}
                sx={{
                  color: showResult
                    ? key === question.correctAnswer
                      ? 'success.main'
                      : key === selectedAnswer
                      ? 'error.main'
                      : 'text.primary'
                    : 'text.primary',
                  mb: 1,
                  '& .MuiFormControlLabel-label': {
                    whiteSpace: 'pre-line' // 保留选项中的换行符
                  }
                }}
              />
            ))}
          </RadioGroup>
        </Box>
        
        {showResult && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mb: 2 }}>
              {isCorrect ? '回答正确！' : '回答错误'}
            </Alert>
            {!isCorrect && (
              <Box mt={2}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  正确答案: {question.correctAnswer}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard; 