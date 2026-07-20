require('dotenv').config();

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('\n❌ CRITICAL: JWT_SECRET environment variable is missing.');
  console.error('Please ensure your .env file has a secure JWT_SECRET defined.');
  console.error('If deploying to Vercel/Render, add JWT_SECRET to your Environment Variables.\n');
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Performance Middleware
app.use(helmet());
// Update helmet CSP to allow Cloudinary images if necessary, or just use defaults which usually allow external images
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(compression());
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.CLIENT_URL,
  'https://uniswap-uni-swap.vercel.app',
  'https://uniswap-oy5i-bice.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const authRoutes = require('./routes/authRoutes');

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// dotenv config moved to top of file
// MongoDB connection
const dbUri = process.env.MONGODB_URI;
if (dbUri) {
  const maskedUri = dbUri.replace(/:([^:@]+)@/, ':****@');
  console.log(`[BOOT] Attempting MongoDB Connection to: ${maskedUri}`);
} else {
  console.log(`[BOOT] Attempting MongoDB Connection but MONGODB_URI is undefined!`);
}
mongoose.connect(dbUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed Admin Account
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    try {
      const adminEmail = 'admin@example.com';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);
        await User.create({
          name: 'Ayush Garg',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
          status: 'ACTIVE'
        });
        console.log('✅ Default ADMIN account created.');
      } else if (adminExists.role !== 'ADMIN') {
        adminExists.role = 'ADMIN';
        await adminExists.save();
        console.log('✅ Existing account updated to ADMIN role.');
      }
    } catch (err) {
      console.error('Error seeding admin account:', err);
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB. Shutting down server.', err);
    process.exit(1);
  });

// Socket.IO configuration
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  const queryUserId = socket.handshake.query.userId;
  if (queryUserId) {
    connectedUsers.set(queryUserId, socket.id);
    console.log(`User ${queryUserId} registered via query with socket ${socket.id}`);
  }

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered via emit with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

module.exports = { app, io, connectedUsers };

const chatRoutes = require('./routes/chatRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cartRoutes = require('./routes/cartRoutes');
const noteRoutes = require('./routes/noteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/chat', chatRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Production Static Serving
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// server.listen has been moved to run only after MongoDB connects successfully
