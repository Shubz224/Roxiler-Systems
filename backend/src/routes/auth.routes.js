const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate, signupSchema, loginSchema, changePasswordSchema } = require('../validations/schemas');

// Public routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh); // uses httpOnly cookie
router.post('/logout', authController.logout);

// Protected routes — need valid access token
router.patch('/change-password', verifyToken, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
