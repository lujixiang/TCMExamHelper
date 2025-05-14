import React, { useState } from 'react';
import { Card, Radio, Space, Button, Typography, message } from 'antd';
import { Question, SubmitAnswerResponse } from '../../types/exercise';
import { exerciseService } from '../../services/exercise.service';

const { Title, Text, Paragraph } = Typography;

interface QuestionCardProps {
  question: Question;
  onNext?: () => void;
  onAnswer?: (isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onNext,
  onAnswer 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      message.warning('请选择一个答案');
      return;
    }

    try {
      const response = await exerciseService.submitAnswer(question._id, selectedAnswer);
      setResult(response);
      setSubmitted(true);
      onAnswer?.(response.isCorrect);
    } catch (error) {
      console.error('提交答案失败:', error);
      message.error('提交答案失败，请重试');
    }
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setSubmitted(false);
    setResult(null);
    onNext?.();
  };

  return (
    <Card className="question-card">
      {/* 题目内容 */}
      <div className="question-content" style={{ marginBottom: '20px' }}>
        <Title level={4}>{question.content}</Title>
        <Text type="secondary">
          {question.subject} - 第{question.chapterNo}章
        </Text>
      </div>

      {/* 选项 */}
      <div className="question-options" style={{ marginBottom: '20px' }}>
        <Radio.Group
          value={selectedAnswer}
          onChange={e => setSelectedAnswer(e.target.value)}
          disabled={submitted}
        >
          <Space direction="vertical">
            {question.options.map((option, index) => (
              <Radio key={index} value={String.fromCharCode(65 + index)}>
                {String.fromCharCode(65 + index)}. {option}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>

      {/* 答案反馈 */}
      {submitted && result && (
        <div className="question-feedback" style={{ marginBottom: '20px' }}>
          <Paragraph
            style={{
              color: result.isCorrect ? '#52c41a' : '#f5222d',
              fontWeight: 'bold'
            }}
          >
            {result.isCorrect ? '回答正确！' : '回答错误'}
          </Paragraph>
          <Paragraph>
            <Text strong>正确答案：</Text> {result.correctAnswer}
          </Paragraph>
          <Paragraph>
            <Text strong>解析：</Text> {result.explanation}
          </Paragraph>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="question-actions">
        {!submitted ? (
          <Button type="primary" onClick={handleSubmit}>
            提交答案
          </Button>
        ) : (
          <Button type="primary" onClick={handleNext}>
            下一题
          </Button>
        )}
      </div>
    </Card>
  );
}; 