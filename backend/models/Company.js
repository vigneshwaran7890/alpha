import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const companySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  campaign_id: {
    type: String,
    ref: 'Campaign',
    required: true,
  },
  name: String,
  domain: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

export default Company;
