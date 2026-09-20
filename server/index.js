import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import farmerRoutes from './routes/farmers.js';
import cropRoutes from './routes/crops.js';
import advisoryRoutes from './routes/advisories.js';
import pestDetectionRoutes from './routes/pestDetections.js';
import irrigationLogRoutes from './routes/irrigationLogs.js';
import costRecordRoutes from './routes/costRecords.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database connection
connectDB();

// Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/advisories', advisoryRoutes);
app.use('/api/pest-detections', pestDetectionRoutes);
app.use('/api/irrigation-logs', irrigationLogRoutes);
app.use('/api/cost-records', costRecordRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
