import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env, validateEnv } from './config/env.js';

async function bootstrap() {
  validateEnv();
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
