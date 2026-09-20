import express from 'express';
import IrrigationLog from '../models/IrrigationLog.js';

const router = express.Router();

router.get('/:farmerId', async (req, res) => {
  try {
    const logs = await IrrigationLog.find({ farmerId: req.params.farmerId });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const log = new IrrigationLog(req.body);
  try {
    const newLog = await log.save();
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
