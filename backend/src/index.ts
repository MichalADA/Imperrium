import { createApp } from "./app.js";
import { ensureUploadDirectory } from "./lib/media.js";
import { prisma } from "./prisma.js";

const port = Number(process.env.PORT || 3000);
await ensureUploadDirectory();
const app = createApp();
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Imperium Wiki API listening on port ${port}`);
});

async function shutdown(): Promise<void> {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
