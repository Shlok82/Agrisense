import mongoose from 'mongoose';

const pestDetectionSchema = mongoose.Schema(
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
    diseaseName: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },
    affectedAreaPercent: {
      type: Number,
      required: true,
    },
    treatment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PestDetection = mongoose.model('PestDetection', pestDetectionSchema);
export default PestDetection;
