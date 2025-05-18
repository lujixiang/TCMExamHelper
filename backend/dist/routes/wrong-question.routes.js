"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrongQuestionRoutes = void 0;
const express_1 = require("express");
const wrong_question_controller_1 = require("../controllers/wrong-question.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 需要认证的路由
router.use(auth_middleware_1.authMiddleware);
// 获取错题列表
router.get('/', wrong_question_controller_1.wrongQuestionController.getWrongQuestions);
// 获取错题详情
router.get('/:id', wrong_question_controller_1.wrongQuestionController.getWrongQuestionById);
// 更新错题状态
router.put('/:id', wrong_question_controller_1.wrongQuestionController.updateWrongQuestion);
// 删除错题
router.delete('/:id', wrong_question_controller_1.wrongQuestionController.deleteWrongQuestion);
// 批量删除错题
router.post('/batch-delete', wrong_question_controller_1.wrongQuestionController.batchDeleteWrongQuestions);
// 批量更新错题状态
router.put('/batch-update', wrong_question_controller_1.wrongQuestionController.batchUpdateStatus);
// 清空错题记录
router.delete('/clear', wrong_question_controller_1.wrongQuestionController.clearWrongQuestions);
// 获取高频错题
router.get('/frequent', wrong_question_controller_1.wrongQuestionController.getFrequentWrongQuestions);
// 获取最近错题
router.get('/recent', wrong_question_controller_1.wrongQuestionController.getRecentWrongQuestions);
exports.wrongQuestionRoutes = router;
