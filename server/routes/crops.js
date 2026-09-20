import express from 'express';
import Crop from '../models/Crop.js';

const router = express.Router();

router.get('/:farmerId', async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.params.farmerId });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const crop = new Crop(req.body);
  try {
    const newCrop = await crop.save();
    res.status(201).json(newCrop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
