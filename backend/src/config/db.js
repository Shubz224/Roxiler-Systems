const { PrismaClient } = require('@prisma/client');

// Single Prisma instance reused across the whole app
const prisma = new PrismaClient();

module.exports = prisma;
