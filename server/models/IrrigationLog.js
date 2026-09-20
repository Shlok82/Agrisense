import mongoose from 'mongoose';

const irrigationLogSchema = mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Farmer',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    waterUsed: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const IrrigationLog = mongoose.model('IrrigationLog', irrigationLogSchema);
export default IrrigationLog;
