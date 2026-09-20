import mongoose from 'mongoose';

const cropSchema = mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Farmer',
    },
    cropName: {
      type: String,
      required: true,
    },
    sowDate: {
      type: Date,
      required: true,
    },
    growthStage: {
      type: String,
      required: true,
    },
    irrigationType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Crop = mongoose.model('Crop', cropSchema);
export default Crop;
