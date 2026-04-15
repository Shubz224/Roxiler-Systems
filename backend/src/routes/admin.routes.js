const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate, createUserSchema, createStoreSchema } = require('../validations/schemas');

// All admin routes require a valid token + ADMIN role
router.use(verifyToken, requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', validate(createUserSchema), adminController.createUser);

router.get('/stores', adminController.getAllStores);
router.post('/stores', validate(createStoreSchema), adminController.createStore);

module.exports = router;
