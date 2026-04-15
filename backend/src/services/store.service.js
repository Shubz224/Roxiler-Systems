const prisma = require('../config/db');

// fetch stores with filters
const getAllStores = async ({ name, address, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' }) => {
  const skip = (page - 1) * limit;
  const validSortFields = ['name', 'email', 'address', 'createdAt'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
        address: address ? { contains: address, mode: 'insensitive' } : undefined,
      },
      include: { ratings: { select: { rating: true } } },
      orderBy: { [orderField]: sortOrder === 'desc' ? 'desc' : 'asc' },
      skip,
      take: Number(limit),
    }),
    prisma.store.count({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
        address: address ? { contains: address, mode: 'insensitive' } : undefined,
      },
    }),
  ]);

  const result = stores.map((store) => {
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

  return { stores: result, total, page: Number(page), limit: Number(limit) };
};

// fetch store details
const getStoreById = async (storeId, userId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { ratings: true },
  });

  if (!store) throw new Error('Store not found');

  const avg =
    store.ratings.length
      ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
      : null;

  const userRating = store.ratings.find((r) => r.userId === userId)?.rating || null;

  return {
    id: store.id,
    name: store.name,
    email: store.email,
    address: store.address,
    averageRating: avg ? parseFloat(avg.toFixed(2)) : null,
    userRating,
  };
};

module.exports = { getAllStores, getStoreById };
