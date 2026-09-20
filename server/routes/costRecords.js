import express from 'express';
import CostRecord from '../models/CostRecord.js';

const router = express.Router();

router.get('/:farmerId', async (req, res) => {
  try {
    const costs = await CostRecord.find({ farmerId: req.params.farmerId });
    res.json(costs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const cost = new CostRecord(req.body);
  try {
    const newCost = await cost.save();
    res.status(201).json(newCost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
