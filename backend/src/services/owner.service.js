const prisma = require('../config/db');

// Get the store that belongs to this owner + average rating + list of raters
const getOwnerDashboard = async (ownerId) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    include: {
      ratings: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!store) throw new Error('No store found for this owner');

  const avg =
    store.ratings.length
      ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
      : null;

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
    },
    averageRating: avg ? parseFloat(avg.toFixed(2)) : null,
    totalRatings: store.ratings.length,
    raters: store.ratings.map((r) => ({
      user: r.user,
      rating: r.rating,
      ratedAt: r.createdAt,
    })),
  };
};

module.exports = { getOwnerDashboard };
