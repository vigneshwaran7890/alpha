
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const contextSnippetSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  entity_type: {
    type: String,
    enum: ['company', 'person'],
    required: true,
  },
  entity_id: {
    type: String,
    required: true,
  },
  snippet_type: {
    type: String,
    default: 'research',
  },
  payload: {
    type: mongoose.Schema.Types.Mixed, // or type: Object
    required: true,
  },
  source_urls: {
    type: [String],
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const ContextSnippet = mongoose.models.ContextSnippet
  || mongoose.model('ContextSnippet', contextSnippetSchema);

export default ContextSnippet;
