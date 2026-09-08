const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 
prisma.user.findUnique({ where: { email: "agus.erwanto@sat.co.id" } })
.then(console.log)
.catch(console.error)
.finally(() => prisma.$disconnect());
