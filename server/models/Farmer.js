import mongoose from 'mongoose';

const farmerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    landSize: {
      type: Number,
      required: true,
    },
    soilType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Farmer = mongoose.model('Farmer', farmerSchema);
export default Farmer;
