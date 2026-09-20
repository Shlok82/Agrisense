import mongoose from 'mongoose';

const advisorySchema = mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    title: {
      type: String,
      required: true,
    },
    advice: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['high', 'medium', 'low', 'info'],
      default: 'info',
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Advisory = mongoose.model('Advisory', advisorySchema);
export default Advisory;
