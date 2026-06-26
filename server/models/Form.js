import mongoose from 'mongoose';
import crypto from 'crypto';

const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'textarea', 'number', 'select', 'dropdown', 'radio', 'checkbox', 'date', 'email', 'url', 'rating'] 
  },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: { type: [String], default: [] }
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  isOpen: { type: Boolean, default: true },
  expiryDate: { type: Date, default: null },
  maxResponses: { type: Number, default: null },
  thankYouMessage: { type: String, default: 'Thank you for your submission!' }
}, { _id: false });

const FormSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  ownerEmail: { type: String, default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fields: { type: [FieldSchema], default: [] },
  settings: { type: SettingsSchema, default: () => ({}) },
  slug: { 
    type: String, 
    unique: true, 
    index: true,
    default: () => crypto.randomBytes(4).toString('hex') 
  },
  createdAt: { type: Date, default: Date.now }
});

const Form = mongoose.model('Form', FormSchema);
export default Form;
