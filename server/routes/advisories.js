import express from 'express';
import Advisory from '../models/Advisory.js';

const router = express.Router();

router.get('/:farmerId', async (req, res) => {
  try {
    const advisories = await Advisory.find({ farmerId: req.params.farmerId });
    res.json(advisories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const advisory = new Advisory(req.body);
  try {
    const newAdvisory = await advisory.save();
    res.status(201).json(newAdvisory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
