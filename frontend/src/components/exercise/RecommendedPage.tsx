import React, { useState, useEffect } from 'react';
import { Card, Button, Empty, Spin, Typography, message } from 'antd';
import { Question } from '../../types/exercise';
import { exerciseService } from '../../services/exercise.service';
import { QuestionCard } from './QuestionCard';

const { Title, Text } = Typography;

export const RecommendedPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    correctCount: 0,
    wrongCount: 0,
    streak: 0
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getRecommendedQuestions(10);
      setQuestions(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('加载推荐题目失败:', error);
      message.error('加载推荐题目失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setStats(prevStats => ({
      correctCount: isCorrect ? prevStats.correctCount + 1 : prevStats.correctCount,
      wrongCount: isCorrect ? prevStats.wrongCount : prevStats.wrongCount + 1,
      streak: isCorrect ? prevStats.streak + 1 : 0
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 如果是最后一题，重新加载新的题目
      loadQuestions();
    }
  };

  return (
    <div className="recommended-page" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>智能推荐练习</Title>
        <Text type="secondary">
          基于您的错题记录，为您推荐最适合的练习题目
        </Text>
      </div>

      {/* 统计信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div>
            <Text type="secondary">正确</Text>
            <div>
              <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                {stats.correctCount}
              </Text>
            </div>
          </div>
          <div>
            <Text type="secondary">错误</Text>
            <div>
              <Text strong style={{ fontSize: '24px', color: '#f5222d' }}>
                {stats.wrongCount}
              </Text>
            </div>
          </div>
          <div>
            <Text type="secondary">连对</Text>
            <div>
              <Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                {stats.streak}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* 题目展示区域 */}
      <div className="question-area">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : questions.length > 0 ? (
          <>
            <QuestionCard
              question={questions[currentIndex]}
              onNext={handleNext}
              onAnswer={handleAnswer}
            />
            {/* 练习进度 */}
            <Card style={{ marginTop: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                进度：{currentIndex + 1} / {questions.length}
              </div>
            </Card>
          </>
        ) : (
          <Empty
            description={
              <span>
                暂无推荐题目
                <br />
                请先完成一些练习，系统会根据您的表现推荐合适的题目
              </span>
            }
          >
            <Button type="primary" onClick={() => window.history.back()}>
              返回
            </Button>
          </Empty>
        )}
      </div>
    </div>
  );
}; 