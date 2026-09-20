import mongoose from 'mongoose';

const costRecordSchema = mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Farmer',
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
    },
    seedCost: {
      type: Number,
      required: true,
      default: 0,
    },
    fertilizerCost: {
      type: Number,
      required: true,
      default: 0,
    },
    pesticideCost: {
      type: Number,
      required: true,
      default: 0,
    },
    labourCost: {
      type: Number,
      required: true,
      default: 0,
    },
    expectedYield: {
      type: Number,
      required: true,
    },
    marketPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CostRecord = mongoose.model('CostRecord', costRecordSchema);
export default CostRecord;
