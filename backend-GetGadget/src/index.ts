import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import { logger } from "./utils/logger";

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
