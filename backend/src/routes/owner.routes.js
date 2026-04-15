const express = require('express');
const router = express.Router();

const ownerController = require('../controllers/owner.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All owner routes require authentication + STORE_OWNER role
router.use(verifyToken, requireRole('STORE_OWNER'));

router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
