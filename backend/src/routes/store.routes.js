const express = require('express');
const router = express.Router();

const storeController = require('../controllers/store.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate, ratingSchema } = require('../validations/schemas');

// All store routes require authentication + USER role
router.use(verifyToken, requireRole('USER'));

router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.post('/:id/ratings', validate(ratingSchema), storeController.submitRating);
router.patch('/:id/ratings', validate(ratingSchema), storeController.updateRating);

module.exports = router;
