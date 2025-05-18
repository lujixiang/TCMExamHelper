"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    server: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'production',
    },
    database: {
        url: process.env.DATABASE_URL || 'postgres://localhost:5432/tcm_exam_helper',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default_jwt_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    cors: {
        allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    },
};
