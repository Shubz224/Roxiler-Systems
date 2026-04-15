const ownerService = require('../services/owner.service');

// GET /owner/dashboard
const getDashboard = async (req, res) => {
  try {
    const data = await ownerService.getOwnerDashboard(req.user.id);
    return res.success(data, 'Owner dashboard');
  } catch (err) {
    return res.error(err.message, 404);
  }
};

module.exports = { getDashboard };
