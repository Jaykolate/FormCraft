import express from 'express';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import { clerkAuth } from '../middleware/clerkAuth.js';

const router = express.Router();

// 1. POST /api/forms (Auth required)
router.post('/', clerkAuth, async (req, res) => {
  try {
    const { title, description, fields, settings, theme } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newForm = new Form({
      userId: req.userId,
      title,
      description,
      fields,
      settings,
      theme
    });

    await newForm.save();
    return res.status(201).json(newForm);
  } catch (error) {
    console.error('Error creating form:', error);
    return res.status(500).json({ error: 'Failed to create form' });
  }
});

// 2. GET /api/forms (Auth required)
router.get('/', clerkAuth, async (req, res) => {
  try {
    const forms = await Form.aggregate([
      { $match: { userId: req.userId } },
      {
        $lookup: {
          from: 'responses',
          localField: '_id',
          foreignField: 'formId',
          as: 'responses'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          fields: 1,
          settings: 1,
          theme: 1,
          slug: 1,
          createdAt: 1,
          responseCount: { $size: '$responses' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    return res.json(forms);
  } catch (error) {
    console.error('Error fetching user forms:', error);
    return res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// 3. GET /api/forms/:id (Auth required) - matches 24-char ObjectId hex
router.get('/:id([0-9a-fA-F]{24})', clerkAuth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    if (form.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this form' });
    }
    return res.json(form);
  } catch (error) {
    console.error('Error fetching form by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// 4. GET /api/forms/:slug (Public - No auth required)
router.get('/:slug', async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const { isOpen, expiryDate, maxResponses } = form.settings || {};

    if (isOpen === false) {
      return res.status(403).json({ error: 'This form has been closed by the owner.' });
    }

    if (expiryDate && new Date(expiryDate) < new Date()) {
      return res.status(403).json({ error: 'This form has expired.' });
    }

    if (maxResponses !== null && maxResponses !== undefined && maxResponses > 0) {
      const responseCount = await Response.countDocuments({ formId: form._id });
      if (responseCount >= maxResponses) {
        return res.status(403).json({ error: 'This form has reached its response limit.' });
      }
    }

    // Return sanitized form data (only fields, settings, and theme)
    return res.json({
      _id: form._id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      settings: form.settings,
      theme: form.theme,
      slug: form.slug,
      createdAt: form.createdAt
    });
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    return res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// 4. PUT /api/forms/:id (Auth required)
router.put('/:id', clerkAuth, async (req, res) => {
  try {
    const { title, description, fields, settings, theme } = req.body;

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Only allow owner to update
    if (form.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this form' });
    }

    if (title !== undefined) form.title = title;
    if (description !== undefined) form.description = description;
    if (fields !== undefined) form.fields = fields;
    if (settings !== undefined) form.settings = { ...form.settings, ...settings };
    if (theme !== undefined) form.theme = { ...form.theme, ...theme };

    await form.save();
    return res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    return res.status(500).json({ error: 'Failed to update form' });
  }
});

// 5. DELETE /api/forms/:id (Auth required)
router.delete('/:id', clerkAuth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Only allow owner to delete
    if (form.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this form' });
    }

    // Delete all associated responses
    await Response.deleteMany({ formId: form._id });
    
    // Delete the form
    await form.deleteOne();

    return res.json({ message: 'Form and all associated responses deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return res.status(500).json({ error: 'Failed to delete form' });
  }
});

export default router;
