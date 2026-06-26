import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { 
  Plus, 
  Layers, 
  ExternalLink, 
  Trash2, 
  Copy, 
  BarChart3, 
  Edit3, 
  Check, 
  AlertCircle, 
  Sparkles,
  ClipboardList
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Feedback states
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all forms on component mount
  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/api/forms`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setForms(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError('Failed to fetch forms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Handle Form Deletion
  const handleDeleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form and all its responses? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const token = await getToken();
      await axios.delete(`${API_URL}/api/forms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setForms(prev => prev.filter(form => form._id !== id));
      showToast('success', 'Form and responses deleted successfully.');
    } catch (err) {
      console.error('Error deleting form:', err);
      showToast('error', 'Failed to delete form. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Copy Public Link to Clipboard
  const handleCopyLink = (slug) => {
    const publicUrl = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopiedSlug(slug);
      showToast('success', 'Form link copied to clipboard!');
      setTimeout(() => setCopiedSlug(null), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      showToast('error', 'Failed to copy link to clipboard.');
    });
  };

  // Handle Create Form Trigger
  const handleCreateNewForm = () => {
    navigate('/builder/new');
  };

  return (
    <div className="min-h-screen bg-cream-base text-cream-text font-sans relative">
      {/* Main Header Nav */}
      <header className="border-b border-cream-border bg-cream-surface sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2 bg-cream-accent rounded-lg text-cream-base shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-serif font-semibold text-cream-text tracking-tight block leading-none">
              FormCraft
            </span>
            <span className="text-[9px] block text-cream-muted font-mono tracking-wider uppercase leading-none mt-1">
              Form Builder
            </span>
          </div>
        </div>

        {/* User profile controls and new form CTA */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCreateNewForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-lg text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>New Form</span>
          </button>
          <div className="h-8 w-px bg-cream-border" />
          <UserButton afterSignOutUrl="/sign-in" appearance={{
            elements: {
              avatarBox: "h-9 w-9 border border-cream-border rounded-lg hover:border-cream-accent transition-colors"
            }
          }} />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10 font-sans">
        
        {/* Banner header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-cream-text flex items-center gap-2">
              My Workspace <Sparkles className="w-5 h-5 text-cream-accent" />
            </h1>
            <p className="text-sm text-cream-muted mt-1">
              Create, edit and view analytical performance of your active campaigns.
            </p>
          </div>
        </div>

        {/* Error reporting Banner */}
        {error && (
          <div className="p-4 bg-cream-danger/10 border border-cream-danger/20 text-cream-danger rounded-xl mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-56 bg-cream-surface border border-cream-border rounded-2xl animate-pulse flex flex-col justify-between p-6">
                <div className="space-y-3">
                  <div className="h-6 w-3/4 bg-cream-border/50 rounded-md" />
                  <div className="h-4 w-1/2 bg-cream-border/30 rounded-md" />
                </div>
                <div className="h-10 w-full bg-cream-border/20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : forms.length === 0 ? (
          
          /* Empty State Dashboard */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-cream-surface border border-cream-border rounded-3xl">
            <div className="p-6 bg-cream-base border border-cream-border text-cream-accent rounded-2xl mb-5 shadow-sm">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-cream-text">No forms found</h3>
            <p className="text-sm text-cream-muted text-center max-w-sm mt-1.5 leading-relaxed">
              Create your first interactive form layout and share the public link to record metrics immediately.
            </p>
            <button 
              onClick={handleCreateNewForm}
              className="mt-6 flex items-center gap-1.5 px-6 py-3 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-xl text-sm font-medium transition-all active:scale-[0.98] shadow-sm"
            >
              <Plus className="w-4.5 h-4.5" />
              Create your first form
            </button>
          </div>
        ) : (
          
          /* Grid list of Form Cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forms.map(form => {
              const createdDate = new Date(form.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const isOpen = form.settings?.isOpen ?? true;

              return (
                <div 
                  key={form._id}
                  className="group relative bg-cream-surface border border-cream-border hover:border-cream-accent/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header (Title & Status Badge) */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-serif font-semibold text-cream-text text-lg group-hover:text-cream-accent transition-colors line-clamp-1">
                          {form.title}
                        </h3>
                        {/* Postage stamp slug pill */}
                        <span className="inline-block font-mono text-[10px] tracking-wider px-2 py-0.5 bg-cream-surface border border-dashed border-cream-accent text-cream-muted rounded mt-1">
                          f/{form.slug}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                        isOpen 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-cream-base text-cream-muted border border-cream-border'
                      }`}>
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-cream-muted line-clamp-2 mb-4 leading-relaxed min-h-[2rem]">
                      {form.description || 'No description provided.'}
                    </p>

                    {/* Metadata Footer */}
                    <div className="grid grid-cols-2 gap-4 border-t border-cream-border py-3 text-[11px] text-cream-muted">
                      <div>
                        <span className="block text-[10px] text-cream-muted/70 font-semibold uppercase tracking-wider">Responses</span>
                        <span className="font-semibold text-cream-text text-xs mt-0.5 block">{form.responseCount || 0}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-cream-muted/70 font-semibold uppercase tracking-wider">Created</span>
                        <span className="text-cream-text text-xs mt-0.5 block">{createdDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="border-t border-cream-border pt-4 mt-2 flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/builder/${form._id}`)}
                      title="Edit Form"
                      className="p-2 bg-cream-base hover:bg-cream-surface border border-cream-border hover:border-cream-accent text-cream-text rounded-lg transition-all flex-1 flex items-center justify-center gap-1.5 text-xs font-medium"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cream-accent" />
                      <span>Edit</span>
                    </button>
                    
                    <button 
                      onClick={() => navigate(`/analytics/${form._id}`)}
                      title="Analytics"
                      className="p-2 bg-cream-base hover:bg-cream-surface border border-cream-border hover:border-cream-accent text-cream-text rounded-lg transition-all flex-1 flex items-center justify-center gap-1.5 text-xs font-medium"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-cream-accent" />
                      <span>Analytics</span>
                    </button>

                    <button 
                      onClick={() => handleCopyLink(form.slug)}
                      title="Copy Public Link"
                      className={`p-2 border rounded-lg transition-all flex items-center justify-center ${
                        copiedSlug === form.slug 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-cream-base hover:bg-cream-surface border-cream-border hover:border-cream-accent text-cream-text'
                      }`}
                    >
                      {copiedSlug === form.slug ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button 
                      onClick={() => handleDeleteForm(form._id)}
                      title="Delete Form"
                      disabled={deletingId === form._id}
                      className="p-2 bg-cream-base hover:bg-cream-danger/10 border border-cream-border hover:border-cream-danger/30 text-cream-muted hover:text-cream-danger rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
