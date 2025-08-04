import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const searchLogSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  context_snippet_id: {
    type: String,
    required: true,
  },
  iteration: Number,
  query: String,
  top_results: {
    type: Array, // array of { url, snippet }
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const SearchLog = mongoose.model('SearchLog', searchLogSchema);
export default SearchLog;
