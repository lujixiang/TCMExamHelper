# TCM Exam Helper (中医考试助手)

一个帮助中医学生备考的在线练习系统。

## 功能特点

- 题目练习：按科目和章节练习
- 错题本：自动记录错题，支持标记和复习
- 模拟考试：模拟真实考试环境
- 数据统计：练习记录和成绩分析

## 技术栈

### 后端

- Node.js
- Express
- MongoDB
- TypeScript

### 前端

- React
- Material-UI
- TypeScript
- Axios

## 安装说明

1. 克隆仓库

```bash
git clone https://github.com/yourusername/TCMExamHelper.git
cd TCMExamHelper
```

2. 安装后端依赖

```bash
cd backend
npm install
```

3. 安装前端依赖

```bash
cd frontend
npm install
```

4. 配置环境变量

- 在 backend 目录创建 .env 文件
- 在 frontend 目录创建 .env 文件

5. 启动开发服务器

```bash
# 后端
cd backend
npm run dev

# 前端
cd frontend
npm start
```

## 使用说明

1. 注册/登录账号
2. 选择科目和章节开始练习
3. 查看错题本复习
4. 参加模拟考试

## 开发说明

- 后端 API 文档：`/api-docs`
- 数据库设计文档：见 `docs/database.md`

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件
