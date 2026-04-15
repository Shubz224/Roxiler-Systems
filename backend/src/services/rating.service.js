const prisma = require('../config/db');

// Submit a rating — user can only rate each store once
const submitRating = async (storeId, userId, rating) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error('Store not found');

  const existing = await prisma.rating.findUnique({
    where: { userId_storeId: { userId, storeId } },
  });
  if (existing) throw new Error('You have already rated this store. Use update instead.');

  return prisma.rating.create({
    data: { rating, userId, storeId },
    select: { id: true, rating: true, userId: true, storeId: true },
  });
};

// Update an existing rating
const updateRating = async (storeId, userId, rating) => {
  const existing = await prisma.rating.findUnique({
    where: { userId_storeId: { userId, storeId } },
  });
  if (!existing) throw new Error('No rating found to update. Submit a rating first.');

  return prisma.rating.update({
    where: { userId_storeId: { userId, storeId } },
    data: { rating },
    select: { id: true, rating: true, userId: true, storeId: true },
  });
};

module.exports = { submitRating, updateRating };
