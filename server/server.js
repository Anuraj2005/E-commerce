const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const { connectDB, isDbConnected } = require('./config/db');
const { isCloudinaryConfigured } = require('./config/cloudinary');
const devStore = require('./services/devMemoryStore');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const instagramRoutes = require('./routes/instagramRoutes');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (
      allowedOrigins.some((o) => o.replace(/\/$/, '') === normalized) ||
      (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && normalized.endsWith('.vercel.app'))
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.set('io', io);
app.set('trust proxy', 1);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

// Core Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiters (Max 30 req/min per IP on Auth & Cloudinary Upload Signature)
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in a minute.',
  },
});

// Cold-start & uptime health check
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'artistic-fusion-api',
    database: isDbConnected() ? 'mongodb-atlas' : 'dev-memory-store',
    cloudinary: isCloudinaryConfigured() ? 'configured' : 'dev-preview',
    timestamp: new Date().toISOString(),
  });
});

// Mount v1 REST API Routes
app.use('/api/v1/auth', sensitiveLimiter, authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/media', sensitiveLimiter, mediaRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/instagram', instagramRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const connected = await connectDB();
  if (!connected) {
    devStore.init();
  }

  server.listen(PORT, () => {
    console.log(
      `✨ Artistic Fusion API + Socket.io listening on http://localhost:${PORT}/api/v1`
    );
  });
}

bootstrap();
