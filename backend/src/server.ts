import app from './app';
import { config } from './config/config';

// 获取端口号，优先使用环境变量PORT或配置文件中的端口，默认为3000
const PORT = process.env.PORT || config.port || 3000;

// 启动服务器
const server = app.listen(PORT, () => {
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

export default server; 