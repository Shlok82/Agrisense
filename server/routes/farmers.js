import express from 'express';
import Farmer from '../models/Farmer.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const farmer = new Farmer(req.body);
  try {
    const newFarmer = await farmer.save();
    res.status(201).json(newFarmer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedFarmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFarmer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
