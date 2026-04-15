const adminService = require('../services/admin.service');

// GET /admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    return res.success(stats, 'Dashboard stats');
  } catch (err) {
    return res.error(err.message);
  }
};

// GET /admin/users
const getAllUsers = async (req, res) => {
  try {
    const { name, email, role, sortBy, sortOrder } = req.query;
    const users = await adminService.getAllUsers({ name, email, role, sortBy, sortOrder });
    return res.success(users, 'Users fetched');
  } catch (err) {
    return res.error(err.message);
  }
};

// GET /admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await adminService.getUserById(Number(req.params.id));
    return res.success(user, 'User fetched');
  } catch (err) {
    return res.error(err.message, 404);
  }
};

// POST /admin/users
const createUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);
    return res.success(user, 'User created', 201);
  } catch (err) {
    return res.error(err.message, 400);
  }
};

// GET /admin/stores
const getAllStores = async (req, res) => {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;
    const stores = await adminService.getAllStores({ name, email, address, sortBy, sortOrder });
    return res.success(stores, 'Stores fetched');
  } catch (err) {
    return res.error(err.message);
  }
};

// POST /admin/stores
const createStore = async (req, res) => {
  try {
    const store = await adminService.createStore(req.body);
    return res.success(store, 'Store created', 201);
  } catch (err) {
    return res.error(err.message, 400);
  }
};

module.exports = { getDashboard, getAllUsers, getUserById, createUser, getAllStores, createStore };
