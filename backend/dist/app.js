"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const practice_routes_1 = require("./routes/practice.routes");
const subject_routes_1 = require("./routes/subject.routes");
const wrong_question_routes_1 = require("./routes/wrong-question.routes");
const stats_routes_1 = require("./routes/stats.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
const auth_middleware_1 = require("./middleware/auth.middleware");
const app = (0, express_1.default)();
// 连接数据库
mongoose_1.default.connect(config_1.config.mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// 基础中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_middleware_1.loggerMiddleware);
// API路由
const apiPrefix = config_1.config.apiPrefix || '/api';
app.use(`${apiPrefix}/auth`, auth_routes_1.authRoutes);
app.use(`${apiPrefix}/users`, user_routes_1.userRoutes);
app.use(`${apiPrefix}/practice`, auth_middleware_1.authMiddleware, practice_routes_1.practiceRoutes);
app.use(`${apiPrefix}/subjects`, auth_middleware_1.authMiddleware, subject_routes_1.subjectRoutes);
app.use(`${apiPrefix}/wrong-questions`, auth_middleware_1.authMiddleware, wrong_question_routes_1.wrongQuestionRoutes);
app.use(`${apiPrefix}/stats`, auth_middleware_1.authMiddleware, stats_routes_1.statsRoutes);
// 根路径处理
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '中医考试助手API服务',
        version: '1.0.0',
        endpoints: {
            auth: `${apiPrefix}/auth`,
            users: `${apiPrefix}/users`,
            practice: `${apiPrefix}/practice`,
            subjects: `${apiPrefix}/subjects`,
            wrongQuestions: `${apiPrefix}/wrong-questions`,
            stats: `${apiPrefix}/stats`
        }
    });
});
// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
});
// 错误处理中间件
app.use(error_middleware_1.errorHandler);
exports.default = app;
