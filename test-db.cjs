const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.session.findMany({ orderBy: { createdAt: 'desc' }, take: 1, include: { user: true } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
