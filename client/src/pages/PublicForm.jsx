import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import {
  Star,
  Send,
  CheckCircle2,
  Layers,
  AlertCircle,
  Calendar,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PublicForm() {
  const { slug } = useParams();
  const { showToast } = useToast();

  // Form Details
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [formStatus, setFormStatus] = useState(null); // 'closed', 'expired', 'error'

  // Submission details
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Validation details
  const [validationErrors, setValidationErrors] = useState([]);

  // Rating field hover tracking
  const [hoverRating, setHoverRating] = useState({});

  // Fetch form configuration on load
  useEffect(() => {
    const fetchFormSchema = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/forms/${slug}`);
        setForm(res.data);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching public form:', err);
        const status = err.response?.status;
        const errMsg = err.response?.data?.error || 'Failed to fetch form.';
        if (status === 404) {
          setFormStatus('not_found');
          setFetchError('Form not found. Please verify the URL.');
        } else if (status === 403) {
          setFormStatus('closed');
          setFetchError(errMsg);
        } else {
          setFormStatus('error');
          setFetchError('An unexpected server error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFormSchema();
  }, [slug]);

  // Handle standard input updates
  const handleInputChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Remove error highlight on change
    if (validationErrors.includes(fieldId)) {
      setValidationErrors((prev) => prev.filter((id) => id !== fieldId));
    }
  };

  // Handle checkboxes
  const handleCheckboxChange = (fieldId, option, checked) => {
    const currentList = answers[fieldId] || [];
    let updatedList;
    if (checked) {
      updatedList = [...currentList, option];
    } else {
      updatedList = currentList.filter((opt) => opt !== option);
    }
    handleInputChange(fieldId, updatedList);
  };

  // Perform client-side validations
  const validateForm = () => {
    const errors = [];
    if (!form || !form.fields) return true;
    form.fields.forEach((field) => {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors.push(field.id);
        }
      }
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Submit response
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const errMsg = 'Please fill out all required fields.';
      setSubmitError(errMsg);
      showToast('error', errMsg);
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      await axios.post(`${API_URL}/api/responses/${slug}`, { answers });
      setSubmitted(true);
      showToast('success', 'Response submitted successfully!');
    } catch (err) {
      console.error('Error submitting form response:', err);
      const errMsg = err.response?.data?.error || 'Failed to submit your response. Please try again.';
      setSubmitError(errMsg);
      showToast('error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Render individual input types dynamically
  const renderFieldInput = (field) => {
    const baseInputStyle = `w-full bg-cream-base border rounded-xl p-3 text-sm text-cream-text placeholder:text-cream-muted/50 focus:outline-none focus:ring-1 focus:ring-cream-accent transition-colors ${
      validationErrors.includes(field.id)
        ? 'border-cream-danger/80 focus:border-cream-danger bg-cream-danger/5'
        : 'border-cream-border focus:border-cream-accent'
    }`;
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder || 'Type your answer...'}
            value={answers[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputStyle}
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || 'Type your answer here...'}
            value={answers[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${baseInputStyle} min-h-[100px]`}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            placeholder={field.placeholder || 'example@domain.com'}
            value={answers[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputStyle}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder || '0'}
            value={answers[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputStyle}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={answers[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputStyle}
          />
        );
      case 'dropdown':
      case 'select':
        return (
          <select
            value={answers[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${baseInputStyle} appearance-none cursor-pointer`}
          >
            <option value="" disabled>Select an option...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt} className="bg-cream-base">{opt}</option>
            ))}
          </select>
        );
      case 'rating':
        const currentRating = answers[field.id] || 0;
        const currentHover = hoverRating[field.id] || 0;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2.5 text-cream-muted">
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = star <= (currentHover || currentRating);
                return (
                  <Star
                    key={star}
                    onMouseEnter={() => setHoverRating((prev) => ({ ...prev, [field.id]: star }))}
                    onMouseLeave={() => setHoverRating((prev) => ({ ...prev, [field.id]: 0 }))}
                    onClick={() => handleInputChange(field.id, star)}
                    className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                      isSelected ? 'text-cream-accent fill-cream-accent drop-shadow-sm' : 'text-cream-border'
                    }`}
                  />
                );
              })}
            </div>
            {validationErrors.includes(field.id) && (
              <span className="text-[10px] text-cream-danger font-semibold uppercase tracking-wider mt-1">
                This question is required
              </span>
            )}
          </div>
        );
      case 'checkbox':
        const checkedList = answers[field.id] || [];
        return (
          <div className="space-y-2.5">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-3 text-sm text-cream-text cursor-pointer hover:text-cream-accent">
                <input
                  type="checkbox"
                  checked={checkedList.includes(opt)}
                  onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                  className={`rounded bg-cream-base border-cream-border text-cream-accent focus:ring-0 w-4 h-4 cursor-pointer transition-all ${
                    validationErrors.includes(field.id) ? 'border-cream-danger bg-cream-danger/5' : ''
                  }`}
                />
                <span>{opt}</span>
              </label>
            ))}
            {validationErrors.includes(field.id) && (
              <span className="text-[10px] text-cream-danger font-semibold uppercase tracking-wider mt-1 block">
                Choose at least one option
              </span>
            )}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2.5">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-3 text-sm text-cream-text cursor-pointer hover:text-cream-accent">
                <input
                  type="radio"
                  name={`radio-${field.id}`}
                  checked={answers[field.id] === opt}
                  onChange={() => handleInputChange(field.id, opt)}
                  className={`bg-cream-base border-cream-border text-cream-accent focus:ring-0 w-4 h-4 cursor-pointer transition-all ${
                    validationErrors.includes(field.id) ? 'border-cream-danger bg-cream-danger/5' : ''
                  }`}
                />
                <span>{opt}</span>
              </label>
            ))}
            {validationErrors.includes(field.id) && (
              <span className="text-[10px] text-cream-danger font-semibold uppercase tracking-wider mt-1 block">
                Choose an option
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-base flex items-center justify-center text-cream-muted font-sans">
        <div className="text-center space-y-2">
          <ClipboardList className="w-8 h-8 animate-pulse mx-auto text-cream-accent" />
          <p className="text-sm font-semibold">Loading Form Campaign...</p>
        </div>
      </div>
    );
  }

  // 2. Closed / Expired / Error loading states
  if (fetchError) {
    const titleText = formStatus === 'not_found' ? 'Form Not Found' : 'Form Inactive';
    return (
      <div className="min-h-screen bg-cream-base flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-cream-surface border border-cream-border p-8 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="inline-flex p-4 bg-cream-danger/10 border border-cream-danger/20 text-cream-danger rounded-full mb-1">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-cream-text">{titleText}</h2>
            <p className="text-sm text-cream-muted mt-2 leading-relaxed">{fetchError}</p>
          </div>
          <p className="text-[10px] text-cream-muted font-semibold uppercase tracking-wider pt-4 border-t border-cream-border">
            FormCraft Security Verification
          </p>
        </div>
      </div>
    );
  }

  // 3. Success submission thank you state
  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-base flex flex-col justify-between items-center p-6 font-sans">
        <div className="my-auto w-full max-w-xl bg-cream-surface border border-cream-border rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-cream-accent to-cream-accent" />
          <div className="inline-flex p-4 bg-cream-accent/10 border border-cream-accent/20 text-cream-accent rounded-full mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-cream-text">Response Submitted Successfully</h2>
          <p className="text-sm text-cream-muted mt-4 leading-relaxed bg-cream-surface/40 p-4 border border-cream-border rounded-2xl">
            {form.settings?.thankYouMessage || 'Thank you for your response!'}
          </p>
        </div>
        {/* Footer Brand */}
        <div className="flex items-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity pb-4 cursor-pointer shrink-0">
          <Layers className="w-4 h-4 text-cream-muted" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-cream-muted">
            Built with FormCraft
          </span>
        </div>
      </div>
    );
  }

  // 4. Render active Form
  const themeColor = form?.theme?.color || 'indigo';
  const themeFont = form?.theme?.font || 'sans';
  const themeLayout = form?.theme?.layout || 'classic';

  const colorMap = {
    indigo: { bg: 'bg-indigo-600 hover:bg-indigo-700', text: 'text-indigo-600', fill: 'fill-indigo-600', border: 'border-indigo-600', bar: 'bg-indigo-600' },
    emerald: { bg: 'bg-emerald-600 hover:bg-emerald-700', text: 'text-emerald-600', fill: 'fill-emerald-600', border: 'border-emerald-600', bar: 'bg-emerald-600' },
    rose: { bg: 'bg-rose-600 hover:bg-rose-700', text: 'text-rose-600', fill: 'fill-rose-600', border: 'border-rose-600', bar: 'bg-rose-600' },
    amber: { bg: 'bg-amber-600 hover:bg-amber-700', text: 'text-amber-600', fill: 'fill-amber-600', border: 'border-amber-600', bar: 'bg-amber-600' },
    violet: { bg: 'bg-violet-600 hover:bg-violet-700', text: 'text-violet-600', fill: 'fill-violet-600', border: 'border-violet-600', bar: 'bg-violet-600' },
    obsidian: { bg: 'bg-zinc-900 hover:bg-zinc-800', text: 'text-zinc-900', fill: 'fill-zinc-900', border: 'border-zinc-900', bar: 'bg-zinc-900' }
  };

  const fontMap = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  const activeColor = colorMap[themeColor] || colorMap.indigo;
  const activeFont = fontMap[themeFont] || 'font-sans';

  const layoutContainerStyle = themeLayout === 'glass'
    ? 'bg-white/80 border border-slate-200/80 shadow-2xl backdrop-blur-md'
    : themeLayout === 'modern'
    ? 'bg-white border border-slate-200/90 shadow-xl'
    : 'bg-white border border-slate-200 shadow-sm';

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 ${activeFont} relative overflow-hidden`}>
      {/* Decorative background ambient glow */}
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] ${activeColor.bar} opacity-5 rounded-full blur-[150px] pointer-events-none`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] ${activeColor.bar} opacity-5 rounded-full blur-[150px] pointer-events-none`} />

      {/* Main card container */}
      <div className={`my-auto w-full max-w-2xl mx-auto ${layoutContainerStyle} p-6 sm:p-10 rounded-3xl space-y-8 relative overflow-hidden transition-all`}>
        <div className={`absolute top-0 left-0 w-full h-[4px] ${activeColor.bar}`} />

        {/* Title area */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{form.title}</h1>
          {form.description && (
            <p className="text-sm text-slate-600 mt-3 leading-relaxed border-t border-slate-200/80 pt-3">
              {form.description}
            </p>
          )}
        </div>

        {/* Error warning bar */}
        {submitError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields?.map((field) => (
            <div
              key={field.id}
              className={`p-5 rounded-2xl border transition-all ${
                validationErrors.includes(field.id)
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <label className="block text-sm font-bold text-slate-900 mb-2.5">
                {field.label}
                {field.required && <span className="text-rose-500 font-bold ml-1">*</span>}
              </label>
              {renderFieldInput(field)}
            </div>
          ))}

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 ${activeColor.bg} text-white rounded-2xl text-sm font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Response</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Brand */}
      <div
        onClick={() => window.open('/', '_self')}
        className="flex items-center justify-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity pt-8 cursor-pointer shrink-0"
      >
        <Layers className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
          Built with FormCraft
        </span>
      </div>
    </div>
  );
}
