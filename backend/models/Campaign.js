import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const campaignSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'draft',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
