import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Statistic, List, Typography } from 'antd';
import { BookOutlined, CheckCircleOutlined, CloseCircleOutlined, FireOutlined } from '@ant-design/icons';
import { ExerciseStats } from '../../types/exercise';
import { exerciseService } from '../../services/exercise.service';

const { Title, Text } = Typography;

export const ExercisePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ExerciseStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await exerciseService.getStats();
      setStats(data);
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  return (
    <div className="exercise-page" style={{ padding: '24px' }}>
      <Title level={2}>练习模式</Title>
      
      {/* 练习模式选择 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable onClick={() => navigate('/exercise/practice')}>
            <div style={{ textAlign: 'center' }}>
              <BookOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
              <Title level={4}>普通练习</Title>
              <Text>按科目和章节练习，打好基础</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable onClick={() => navigate('/exercise/recommended')}>
            <div style={{ textAlign: 'center' }}>
              <FireOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
              <Title level={4}>智能推荐</Title>
              <Text>基于错题记录的个性化推荐</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable onClick={() => navigate('/exercise/mock')}>
            <div style={{ textAlign: 'center' }}>
              <BookOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
              <Title level={4}>模拟测试</Title>
              <Text>全真模拟，检验学习成果</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 练习统计 */}
      {stats && (
        <>
          <Title level={3}>练习统计</Title>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="总题数"
                  value={stats.totalQuestions}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="正确数"
                  value={stats.correctCount}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="错误数"
                  value={stats.wrongCount}
                  prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="正确率"
                  value={stats.accuracy}
                  suffix="%"
                  precision={1}
                />
              </Card>
            </Col>
          </Row>

          {/* 错题统计 */}
          <Title level={3}>错题分布</Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            dataSource={stats.wrongQuestionStats}
            renderItem={item => (
              <List.Item>
                <Card>
                  <Statistic
                    title={`${item.subject}错题数`}
                    value={item.totalCount}
                    suffix={`次 / ${item.averageWrongCount.toFixed(1)}平均`}
                  />
                </Card>
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
}; 