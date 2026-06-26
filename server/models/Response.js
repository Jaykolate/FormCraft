import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true,
    index: true 
  },
  answers: { 
    type: Map, 
    of: mongoose.Schema.Types.Mixed,
    default: {} 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  metadata: {
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' }
  }
});

const Response = mongoose.model('Response', ResponseSchema);
export default Response;
