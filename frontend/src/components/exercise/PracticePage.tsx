import React, { useState, useEffect } from 'react';
import { Card, Form, Select, InputNumber, Switch, Button, Empty, Spin } from 'antd';
import { Question, ExerciseFilters, QuestionType } from '../../types/exercise';
import { exerciseService } from '../../services/exercise.service';
import { QuestionCard } from './QuestionCard';

const { Option } = Select;

export const PracticePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [form] = Form.useForm();

  const loadQuestions = async (values: ExerciseFilters) => {
    setLoading(true);
    try {
      const data = await exerciseService.getQuestions(values);
      setQuestions(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('加载题目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (values: ExerciseFilters) => {
    await loadQuestions(values);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="practice-page" style={{ padding: '24px' }}>
      {/* 筛选表单 */}
      <Card style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ gap: '16px' }}
        >
          <Form.Item name="subject" label="科目">
            <Select style={{ width: 120 }}>
              <Option value="中医基础">中医基础</Option>
              <Option value="中医诊断">中医诊断</Option>
              <Option value="中药学">中药学</Option>
              {/* 添加更多科目选项 */}
            </Select>
          </Form.Item>

          <Form.Item name="chapterNo" label="章节">
            <InputNumber min={1} style={{ width: 100 }} />
          </Form.Item>

          <Form.Item name="type" label="题型">
            <Select style={{ width: 120 }}>
              <Option value={QuestionType.SINGLE_CHOICE}>单选题</Option>
              <Option value={QuestionType.MULTIPLE_CHOICE}>多选题</Option>
              <Option value={QuestionType.TRUE_FALSE}>判断题</Option>
            </Select>
          </Form.Item>

          <Form.Item name="excludeAnswered" label="排除已答" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              开始练习
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 题目展示区域 */}
      <div className="question-area">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : questions.length > 0 ? (
          <QuestionCard
            question={questions[currentIndex]}
            onNext={handleNext}
          />
        ) : (
          <Empty description="请选择练习参数开始练习" />
        )}
      </div>

      {/* 练习进度 */}
      {questions.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            进度：{currentIndex + 1} / {questions.length}
          </div>
        </Card>
      )}
    </div>
  );
}; 