import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { initSocketServer } from './socket/socketServer';
import { connectRedis } from './lib/redis';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Connect Redis
    await connectRedis();
    console.log('✅ Redis connected');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    initSocketServer(server);
    console.log('✅ Socket.IO initialized');

    server.listen(PORT, () => {
      console.log(`🚀 LightIt API running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();
