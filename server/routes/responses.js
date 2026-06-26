import express from 'express';
import nodemailer from 'nodemailer';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import { clerkAuth } from '../middleware/clerkAuth.js';

const router = express.Router();

// Helper to send email notification to the form owner
const sendEmailNotification = async (form, response) => {
  const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || !form.ownerEmail) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(EMAIL_PORT || '587'),
      secure: EMAIL_SECURE === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const answersObj = response.answers instanceof Map 
      ? Object.fromEntries(response.answers) 
      : response.answers;

    const answersFormatted = Object.entries(answersObj)
      .map(([fieldId, val]) => {
        const field = form.fields.find(f => f.id === fieldId);
        const label = field ? field.label : fieldId;
        const displayVal = Array.isArray(val) ? val.join(', ') : val;
        return `${label}: ${displayVal}`;
      })
      .join('\n');

    const htmlAnswersFormatted = Object.entries(answersObj)
      .map(([fieldId, val]) => {
        const field = form.fields.find(f => f.id === fieldId);
        const label = field ? field.label : fieldId;
        const displayVal = Array.isArray(val) ? val.join(', ') : val;
        return `<li><strong>${label}:</strong> ${displayVal}</li>`;
      })
      .join('');

    const mailOptions = {
      from: `"FormCraft Notifications" <${EMAIL_USER}>`,
      to: form.ownerEmail,
      subject: `New Response: ${form.title}`,
      text: `You have received a new response for "${form.title}".\n\nSubmitted At: ${response.submittedAt}\n\nAnswers:\n${answersFormatted}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 5px;">FormCraft Submission</h2>
          <p style="font-size: 16px; color: #374151;">A new response was submitted for your form <strong>"${form.title}"</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <h3 style="color: #1f2937;">Submission Details</h3>
          <p style="font-size: 14px; color: #6b7280;"><strong>Submitted At:</strong> ${response.submittedAt.toLocaleString()}</p>
          <h3 style="color: #1f2937;">Answers</h3>
          <ul style="list-style-type: none; padding-left: 0; font-size: 15px; line-height: 1.6; color: #374151;">
            ${htmlAnswersFormatted}
          </ul>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification email successfully sent to ${form.ownerEmail}`);
  } catch (error) {
    console.error('Failed to send nodemailer notification:', error.message);
  }
};

// 1. POST /api/responses/:slug (Public submission)
router.post('/:slug', async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Find form by slug
    const form = await Form.findOne({ slug: req.params.slug });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const { isOpen, expiryDate, maxResponses, thankYouMessage } = form.settings || {};

    // Validate if open
    if (isOpen === false) {
      return res.status(403).json({ error: 'This form has been closed by the owner.' });
    }

    // Validate if expired
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return res.status(403).json({ error: 'This form has expired.' });
    }

    // Validate response limit
    if (maxResponses !== null && maxResponses !== undefined && maxResponses > 0) {
      const responseCount = await Response.countDocuments({ formId: form._id });
      if (responseCount >= maxResponses) {
        return res.status(403).json({ error: 'This form has reached its response limit.' });
      }
    }

    // Validate all required fields are answered
    if (form.fields && form.fields.length > 0) {
      for (const field of form.fields) {
        if (field.required) {
          const val = answers ? answers[field.id] : undefined;
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
            return res.status(400).json({ error: `Field "${field.label}" is required.` });
          }
        }
      }
    }

    // Capture metadata
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

    // Create and save response
    const response = new Response({
      formId: form._id,
      answers,
      metadata: { userAgent, ip }
    });

    await response.save();

    // Trigger async email notification if ownerEmail exists
    if (form.ownerEmail) {
      sendEmailNotification(form, response);
    }

    return res.status(201).json({
      success: true,
      message: thankYouMessage || 'Thank you for your submission!'
    });
  } catch (error) {
    console.error('Error handling public form response submission:', error);
    return res.status(500).json({ error: 'Failed to submit response' });
  }
});

// 2. GET /api/responses/:formId (Auth required)
router.get('/:formId', clerkAuth, async (req, res) => {
  try {
    const { formId } = req.params;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check ownership
    if (form.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this form' });
    }

    // Parse pagination query params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Retrieve responses sorted by submittedAt descending
    const responses = await Response.find({ formId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Response.countDocuments({ formId });

    return res.json({
      responses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching form responses:', error);
    return res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

export default router;
