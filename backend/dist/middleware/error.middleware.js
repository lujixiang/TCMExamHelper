"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
// 自定义错误类
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
// 错误响应格式化
const formatError = (err) => {
    if (err instanceof AppError) {
        return {
            success: false,
            message: err.message,
            statusCode: err.statusCode,
            isOperational: err.isOperational
        };
    }
    // 未知错误
    return {
        success: false,
        message: '服务器内部错误',
        statusCode: 500,
        isOperational: false,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    };
};
// 错误处理中间件
const errorHandler = (err, req, res, next) => {
    const error = formatError(err);
    // 记录错误日志
    if (!error.isOperational) {
        console.error('非业务错误:', {
            error: err,
            path: req.path,
            method: req.method,
            body: req.body,
            query: req.query,
            params: req.params,
            timestamp: new Date().toISOString()
        });
    }
    res.status(error.statusCode).json(error);
};
exports.errorHandler = errorHandler;
