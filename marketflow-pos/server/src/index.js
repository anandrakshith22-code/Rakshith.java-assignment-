require("dotenv").config();

const app = require("./app");
const prisma = require("./lib/prisma");

const port = Number(process.env.PORT || 4000);
const server = app.listen(port, () => console.log(`Supermarket API listening on port ${port}`));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
