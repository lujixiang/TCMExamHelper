"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config/config");
// 获取端口号，优先使用环境变量PORT或配置文件中的端口，默认为3000
const PORT = process.env.PORT || config_1.config.port || 3000;
// 启动服务器
const server = app_1.default.listen(PORT, () => {
    console.log(`服务器已启动，监听端口 ${PORT}`);
});
// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});
// 处理未捕获的Promise异常
process.on('unhandledRejection', (error) => {
    console.error('未处理的Promise拒绝:', error);
});
exports.default = server;
