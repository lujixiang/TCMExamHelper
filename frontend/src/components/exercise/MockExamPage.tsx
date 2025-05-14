import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, Modal, Typography, Progress, Space, Row, Col, Badge } from 'antd';
import { Question, ExerciseFilters, QuestionType } from '../../types/exercise';
import { exerciseService } from '../../services/exercise.service';
import { QuestionCard } from './QuestionCard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ExamResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  timeSpent: number;
}

interface QuestionStatus {
  isAnswered: boolean;
  isCorrect?: boolean;
}

export const MockExamPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState(90 * 60); // 90分钟，以秒为单位
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, remainingTime]);

  const startExam = async (values: ExerciseFilters) => {
    setLoading(true);
    try {
      const data = await exerciseService.getQuestions({
        ...values,
        limit: 50
      });
      setQuestions(data);
      setCurrentIndex(0);
      setExamStarted(true);
      setStartTime(new Date());
      setQuestionStatus(new Array(data.length).fill({ isAnswered: false }));
    } catch (error) {
      console.error('加载试题失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setQuestionStatus(prev => {
      const newStatus = [...prev];
      newStatus[currentIndex] = { isAnswered: true, isCorrect };
      return newStatus;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishExam();
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const finishExam = () => {
    if (!startTime) return;

    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // 分钟

    const correctCount = questionStatus.filter(q => q.isCorrect).length;
    const wrongCount = questionStatus.filter(q => q.isAnswered && !q.isCorrect).length;

    const result: ExamResult = {
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      accuracy: (correctCount / questions.length) * 100,
      timeSpent
    };

    setExamResult(result);
  };

  const resetExam = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setExamStarted(false);
    setExamResult(null);
    setStartTime(null);
    setRemainingTime(90 * 60);
    setQuestionStatus([]);
    form.resetFields();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mock-exam-page" style={{ padding: '24px' }}>
      {!examStarted ? (
        <>
          <Title level={2}>模拟测试</Title>
          <Paragraph type="secondary">
            本次测试共50题，限时90分钟，满分100分，及格分数60分
          </Paragraph>

          <Card style={{ marginTop: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={startExam}
            >
              <Form.Item
                name="subject"
                label="考试科目"
                rules={[{ required: true, message: '请选择考试科目' }]}
              >
                <Select>
                  <Option value="中医基础">中医基础</Option>
                  <Option value="中医诊断">中医诊断</Option>
                  <Option value="中药学">中药学</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="type"
                label="题型"
                rules={[{ required: true, message: '请选择题型' }]}
              >
                <Select>
                  <Option value={QuestionType.SINGLE_CHOICE}>单选题</Option>
                  <Option value={QuestionType.MULTIPLE_CHOICE}>多选题</Option>
                  <Option value={QuestionType.TRUE_FALSE}>判断题</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  开始测试
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      ) : (
        <div className="exam-area">
          {/* 顶部信息栏 */}
          <Card style={{ marginBottom: '24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong>剩余时间：</Text>
                <Text 
                  style={{ 
                    color: remainingTime < 300 ? '#f5222d' : '#1890ff',
                    fontSize: '18px'
                  }}
                >
                  {formatTime(remainingTime)}
                </Text>
              </Col>
              <Col>
                <Progress
                  percent={((currentIndex + 1) / questions.length) * 100}
                  format={() => `${currentIndex + 1}/${questions.length}`}
                />
              </Col>
              <Col>
                <Button type="primary" danger onClick={finishExam}>
                  交卷
                </Button>
              </Col>
            </Row>
          </Card>

          <Row gutter={24}>
            {/* 题目区域 */}
            <Col xs={24} lg={18}>
              <QuestionCard
                question={questions[currentIndex]}
                onNext={handleNext}
                onAnswer={handleAnswer}
              />
            </Col>

            {/* 题目导航 */}
            <Col xs={24} lg={6}>
              <Card title="题目导航">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '8px' 
                }}>
                  {questions.map((_, index) => (
                    <Badge
                      key={index}
                      count={index + 1}
                      style={{
                        backgroundColor: questionStatus[index]?.isAnswered
                          ? questionStatus[index]?.isCorrect
                            ? '#52c41a'
                            : '#f5222d'
                          : '#1890ff'
                      }}
                    >
                      <Button
                        type={currentIndex === index ? 'primary' : 'default'}
                        onClick={() => jumpToQuestion(index)}
                        style={{ width: '100%' }}
                      >
                        {index + 1}
                      </Button>
                    </Badge>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 考试结果弹窗 */}
      <Modal
        title="考试结果"
        open={examResult !== null}
        footer={[
          <Button key="back" onClick={resetExam}>
            返回
          </Button>,
          <Button key="again" type="primary" onClick={resetExam}>
            再考一次
          </Button>
        ]}
        closable={false}
      >
        {examResult && (
          <>
            <Paragraph>
              <Text strong>总题数：</Text> {examResult.totalQuestions}
            </Paragraph>
            <Paragraph>
              <Text strong>正确题数：</Text> {examResult.correctCount}
            </Paragraph>
            <Paragraph>
              <Text strong>错误题数：</Text> {examResult.wrongCount}
            </Paragraph>
            <Paragraph>
              <Text strong>正确率：</Text> {examResult.accuracy.toFixed(1)}%
            </Paragraph>
            <Paragraph>
              <Text strong>用时：</Text> {examResult.timeSpent}分钟
            </Paragraph>
            <Progress
              percent={examResult.accuracy}
              status={examResult.accuracy >= 60 ? 'success' : 'exception'}
              format={percent => `${percent?.toFixed(1)}%`}
            />
          </>
        )}
      </Modal>
    </div>
  );
}; 