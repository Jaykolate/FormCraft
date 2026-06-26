import express from 'express';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import { clerkAuth } from '../middleware/clerkAuth.js';

const router = express.Router();

// GET /api/analytics/:formId (Auth required, owner only)
router.get('/:formId', clerkAuth, async (req, res) => {
  try {
    const { formId } = req.params;

    // Verify form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Verify owner only
    if (form.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this form' });
    }

    // Fetch all responses sorted by submittedAt descending
    const responses = await Response.find({ formId }).sort({ submittedAt: -1 });

    const totalResponses = responses.length;
    const lastSubmittedAt = totalResponses > 0 ? responses[0].submittedAt : null;

    const fieldAnalytics = {};

    // Analyze each field based on its type
    form.fields.forEach(field => {
      const fieldId = field.id;
      const type = field.type;

      if (['text', 'email', 'number', 'textarea', 'date', 'url'].includes(type)) {
        // Count non-empty answers
        let count = 0;
        responses.forEach(r => {
          const val = (r.answers instanceof Map) 
            ? r.answers.get(fieldId) 
            : r.answers[fieldId];
          if (val !== undefined && val !== null && val !== '') {
            count++;
          }
        });
        fieldAnalytics[fieldId] = count;

      } else if (['dropdown', 'radio', 'checkbox', 'select'].includes(type)) {
        // Option count distribution
        const optionCounts = {};
        if (field.options && Array.isArray(field.options)) {
          field.options.forEach(opt => {
            optionCounts[opt] = 0;
          });
        }

        responses.forEach(r => {
          const val = (r.answers instanceof Map) 
            ? r.answers.get(fieldId) 
            : r.answers[fieldId];
          if (val !== undefined && val !== null) {
            if (Array.isArray(val)) {
              val.forEach(item => {
                const itemStr = String(item);
                optionCounts[itemStr] = (optionCounts[itemStr] || 0) + 1;
              });
            } else {
              const valStr = String(val);
              optionCounts[valStr] = (optionCounts[valStr] || 0) + 1;
            }
          }
        });
        fieldAnalytics[fieldId] = optionCounts;

      } else if (type === 'rating') {
        // Average and 1-5 rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalScore = 0;
        let ratingCount = 0;

        responses.forEach(r => {
          const val = (r.answers instanceof Map) 
            ? r.answers.get(fieldId) 
            : r.answers[fieldId];
          if (val !== undefined && val !== null && val !== '') {
            const score = parseInt(val);
            if (score >= 1 && score <= 5) {
              distribution[score] = (distribution[score] || 0) + 1;
              totalScore += score;
              ratingCount++;
            }
          }
        });

        const average = ratingCount > 0 ? parseFloat((totalScore / ratingCount).toFixed(2)) : 0;
        fieldAnalytics[fieldId] = {
          average,
          distribution
        };
      }
    });

    return res.json({
      totalResponses,
      lastSubmittedAt,
      fieldAnalytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
