import express from 'express';
import PestDetection from '../models/PestDetection.js';

const router = express.Router();

router.get('/:farmerId', async (req, res) => {
  try {
    const pestDetections = await PestDetection.find({ farmerId: req.params.farmerId });
    res.json(pestDetections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const pestDetection = new PestDetection(req.body);
  try {
    const newDetection = await pestDetection.save();
    res.status(201).json(newDetection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
