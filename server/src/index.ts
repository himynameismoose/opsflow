import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth'
import workflowRoutes from './routes/workflow'
import analyticsRoutes from './routes/analytics'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite's default port
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes)
app.use('/workflows', workflowRoutes)
app.use('/analytics', analyticsRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OpsFlow server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;