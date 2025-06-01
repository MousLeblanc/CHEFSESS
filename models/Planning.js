// models/Planning.js
import mongoose from 'mongoose';

const daySchema = new mongoose.Schema({
  day: String,
  menu: String
});

const planningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  days: [daySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Planning = mongoose.model('Planning', planningSchema);
export default Planning;
