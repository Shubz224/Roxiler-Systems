const storeService = require('../services/store.service');
const ratingService = require('../services/rating.service');

// GET /stores
const getAllStores = async (req, res) => {
  try {
    const { name, address, page, limit, sortBy, sortOrder } = req.query;
    const data = await storeService.getAllStores({ name, address, page, limit, sortBy, sortOrder });
    return res.success(data, 'Stores fetched');
  } catch (err) {
    return res.error(err.message);
  }
};

// GET /stores/:id
const getStoreById = async (req, res) => {
  try {
    const store = await storeService.getStoreById(Number(req.params.id), req.user.id);
    return res.success(store, 'Store fetched');
  } catch (err) {
    return res.error(err.message, 404);
  }
};

// POST /stores/:id/ratings
const submitRating = async (req, res) => {
  try {
    const rating = await ratingService.submitRating(
      Number(req.params.id),
      req.user.id,
      req.body.rating
    );
    return res.success(rating, 'Rating submitted', 201);
  } catch (err) {
    return res.error(err.message, 400);
  }
};

// PATCH /stores/:id/ratings
const updateRating = async (req, res) => {
  try {
    const rating = await ratingService.updateRating(
      Number(req.params.id),
      req.user.id,
      req.body.rating
    );
    return res.success(rating, 'Rating updated');
  } catch (err) {
    return res.error(err.message, 400);
  }
};

module.exports = { getAllStores, getStoreById, submitRating, updateRating };
