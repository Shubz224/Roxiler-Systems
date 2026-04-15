const prisma = require('../config/db');
const cache = require('../cache/cache');
const bcrypt = require('bcryptjs');

// admin dashboard service
// cached to limit db load
const getDashboardStats = async () => {
  const cached = cache.get('dashboard_stats');
  if (cached) return cached;

  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);

  const stats = { totalUsers, totalStores, totalRatings };
  cache.set('dashboard_stats', stats);
  return stats;
};

// users service

// fetch users with active filters
const getAllUsers = async ({ name, email, role, sortBy = 'name', sortOrder = 'asc' }) => {
  const validSortFields = ['name', 'email', 'createdAt'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';

  return prisma.user.findMany({
    where: {
      name: name ? { contains: name, mode: 'insensitive' } : undefined,
      email: email ? { contains: email, mode: 'insensitive' } : undefined,
      role: role || undefined,
    },
    select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    orderBy: { [orderField]: sortOrder === 'desc' ? 'desc' : 'asc' },
  });
};

// return specific user and their specific rating data if owner
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
  });

  if (!user) throw new Error('User not found');

  if (user.role === 'STORE_OWNER') {
    const store = await prisma.store.findUnique({
      where: { ownerId: id },
      include: { ratings: true },
    });

    const avg =
      store && store.ratings.length
        ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
        : null;

    return { ...user, storeAverageRating: avg ? parseFloat(avg.toFixed(2)) : null };
  }

  return user;
};

// Create a user (any role — admin only)
const createUser = async ({ name, email, address, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address, password: hashedPassword, role },
    select: { id: true, name: true, email: true, address: true, role: true },
  });

  return user;
};

// stores service

// list paginated stores
const getAllStores = async ({ name, email, address, sortBy = 'name', sortOrder = 'asc' }) => {
  const validSortFields = ['name', 'email', 'createdAt'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';

  const stores = await prisma.store.findMany({
    where: {
      name: name ? { contains: name, mode: 'insensitive' } : undefined,
      email: email ? { contains: email, mode: 'insensitive' } : undefined,
      address: address ? { contains: address, mode: 'insensitive' } : undefined,
    },
    include: { ratings: { select: { rating: true } } },
    orderBy: { [orderField]: sortOrder === 'desc' ? 'desc' : 'asc' },
  });

  return stores.map((store) => {
    const avg =
      store.ratings.length
        ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
        : null;
    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating: avg ? parseFloat(avg.toFixed(2)) : null,
    };
  });
};

// generate new store and link to owner user
const createStore = async ({ name, email, address, ownerId }) => {
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) throw new Error('Owner not found');
  if (owner.role !== 'STORE_OWNER') throw new Error('User is not a Store Owner');

  const existingStore = await prisma.store.findUnique({ where: { ownerId } });
  if (existingStore) throw new Error('This owner already has a store');

  const emailTaken = await prisma.store.findUnique({ where: { email } });
  if (emailTaken) throw new Error('Store email already in use');

  return prisma.store.create({
    data: { name, email, address, ownerId },
    select: { id: true, name: true, email: true, address: true, ownerId: true },
  });
};

module.exports = { getDashboardStats, getAllUsers, getUserById, createUser, getAllStores, createStore };
