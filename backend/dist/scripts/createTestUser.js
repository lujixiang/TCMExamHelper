"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function createTestUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 连接数据库
            console.log('正在连接到数据库...');
            yield mongoose_1.default.connect(config_1.config.mongoUri);
            console.log('数据库连接成功');
            // 检查用户是否已存在
            const existingUser = yield user_model_1.User.findOne({
                $or: [
                    { email: '123@123.com' },
                    { username: '123@123.com' }
                ]
            });
            if (existingUser) {
                console.log('测试用户已存在，无需创建');
                yield mongoose_1.default.disconnect();
                return;
            }
            // 创建密码哈希
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash('123456', salt);
            // 创建测试用户
            const testUser = new user_model_1.User({
                username: '123@123.com',
                email: '123@123.com',
                password: hashedPassword,
                name: '测试用户',
                role: 'user',
                isActive: true,
                profile: {
                    nickname: '测试用户',
                    avatar: ''
                },
                stats: {
                    totalQuestions: 0,
                    correctCount: 0,
                    wrongCount: 0,
                    streak: 0,
                    lastLoginAt: new Date(),
                    lastAnswerAt: new Date()
                }
            });
            yield testUser.save();
            console.log('测试用户创建成功');
            // 断开数据库连接
            yield mongoose_1.default.disconnect();
            console.log('数据库连接已关闭');
        }
        catch (error) {
            console.error('创建测试用户失败:', error);
            process.exit(1);
        }
    });
}
// 执行函数
createTestUser();
