import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import FieldCard from '../components/FieldCard';
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Type, 
  AlignLeft, 
  Hash, 
  Mail, 
  ChevronDown, 
  CheckSquare, 
  CircleDot, 
  Star, 
  Calendar,
  Sparkles,
  Smile,
  X,
  Menu
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const paletteFields = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio Buttons', icon: CircleDot },
  { type: 'rating', label: 'Rating', icon: Star },
  { type: 'date', label: 'Date', icon: Calendar }
];

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { showToast } = useToast();
  
  const isEditMode = !!id;

  // React 18+ DnD mounting workaround
  const [dndReady, setDndReady] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setDndReady(true));
    return () => cancelAnimationFrame(animation);
  }, []);

  // Form State
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('Provide a short description here...');
  const [fields, setFields] = useState([]);
  const [settings, setSettings] = useState({
    isOpen: true,
    expiryDate: '',
    maxResponses: '',
    thankYouMessage: 'Thank you for your submission!'
  });
  const [ownerEmail, setOwnerEmail] = useState('');

  // UI States
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  // Mobile navigation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch form details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchForm = async () => {
        try {
          const token = await getToken();
          const response = await axios.get(`${API_URL}/api/forms/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const form = response.data;
          setTitle(form.title);
          setDescription(form.description || '');
          setFields(form.fields || []);
          setOwnerEmail(form.ownerEmail || '');
          setSettings({
            isOpen: form.settings?.isOpen ?? true,
            expiryDate: form.settings?.expiryDate ? new Date(form.settings.expiryDate).toISOString().split('T')[0] : '',
            maxResponses: form.settings?.maxResponses || '',
            thankYouMessage: form.settings?.thankYouMessage || 'Thank you for your submission!'
          });
        } catch (err) {
          console.error('Error fetching form details:', err);
          showToast('error', 'Failed to load form details.');
          navigate('/');
        } finally {
          setFetching(false);
        }
      };
      fetchForm();
    }
  }, [id, isEditMode]);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  // Add field from Palette
  const handleAddField = (type) => {
    const defaultLabels = {
      text: 'Short Answer Question',
      textarea: 'Paragraph Question',
      email: 'Email Address',
      number: 'Numerical Input',
      dropdown: 'Select Option',
      checkbox: 'Choose Options',
      radio: 'Select One Option',
      rating: 'Rate this item',
      date: 'Date Picker'
    };

    const newField = {
      id: crypto.randomUUID(),
      type,
      label: defaultLabels[type] || 'New Question',
      placeholder: ['text', 'textarea', 'email', 'number'].includes(type) ? 'Type your answer here...' : '',
      required: false,
      options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : []
    };

    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  // Delete field from Canvas
  const handleDeleteField = (fieldId) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Update selected field attributes
  const handleUpdateField = (key, value) => {
    setFields(prev => prev.map(f => {
      if (f.id === selectedFieldId) {
        return { ...f, [key]: value };
      }
      return f;
    }));
  };

  // Reorder options in choice fields
  const handleUpdateOption = (index, value) => {
    if (!selectedField) return;
    const newOptions = [...selectedField.options];
    newOptions[index] = value;
    handleUpdateField('options', newOptions);
  };

  // Add Option to List
  const handleAddOption = () => {
    if (!selectedField) return;
    const currentOptions = selectedField.options || [];
    handleUpdateField('options', [...currentOptions, `Option ${currentOptions.length + 1}`]);
  };

  // Remove Option from List
  const handleRemoveOption = (index) => {
    if (!selectedField) return;
    const newOptions = selectedField.options.filter((_, idx) => idx !== index);
    handleUpdateField('options', newOptions);
  };

  // Handle Drag Reorder
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...fields];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFields(items);
  };

  // Save Form (POST / PUT)
  const handleSaveForm = async () => {
    if (!title.trim()) {
      showToast('error', 'Please provide a form title.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      const payload = {
        title,
        description,
        fields,
        ownerEmail: ownerEmail.trim() || null,
        settings: {
          isOpen: settings.isOpen,
          expiryDate: settings.expiryDate || null,
          maxResponses: settings.maxResponses ? parseInt(settings.maxResponses) : null,
          thankYouMessage: settings.thankYouMessage
        }
      };

      if (isEditMode) {
        await axios.put(`${API_URL}/api/forms/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/forms`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      showToast('success', 'Form saved successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error saving form:', err);
      showToast('error', 'Failed to save form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render mock preview form control elements
  const renderPreviewInput = (field) => {
    const inputClasses = "w-full bg-cream-base border border-cream-border rounded-lg p-3 text-sm text-cream-text placeholder:text-cream-muted/50 focus:border-cream-accent focus:outline-none transition-colors";
    
    switch (field.type) {
      case 'text':
        return <input type="text" placeholder={field.placeholder} className={inputClasses} disabled />;
      case 'textarea':
        return <textarea placeholder={field.placeholder} className={`${inputClasses} min-h-[80px]`} disabled />;
      case 'email':
        return <input type="email" placeholder={field.placeholder || 'example@domain.com'} className={inputClasses} disabled />;
      case 'number':
        return <input type="number" placeholder={field.placeholder || '0'} className={inputClasses} disabled />;
      case 'date':
        return <input type="date" className={inputClasses} disabled />;
      case 'rating':
        return (
          <div className="flex gap-2 text-cream-accent">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} className="w-6 h-6 hover:fill-cream-accent/20 cursor-pointer" />
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <select className={inputClasses} defaultValue="" disabled>
            <option value="" disabled>Select an option...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2.5 text-sm text-cream-text">
                <input type="checkbox" className="rounded bg-cream-base border-cream-border text-cream-accent focus:ring-0" disabled />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2.5 text-sm text-cream-text">
                <input type="radio" name={`preview-${field.id}`} className="bg-cream-base border-cream-border text-cream-accent focus:ring-0" disabled />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-cream-base flex items-center justify-center text-cream-muted">
        <div className="text-center space-y-2">
          <Settings className="w-8 h-8 animate-spin mx-auto text-cream-accent" />
          <p className="text-sm font-semibold">Loading Form Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-base text-cream-text font-sans flex flex-col h-screen overflow-hidden">
      {/* Top Header Controls */}
      <header className="border-b border-cream-border bg-cream-surface px-4 py-3 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-cream-surface border border-cream-border hover:border-cream-accent rounded-lg transition-colors text-cream-muted hover:text-cream-text shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-cream-surface border border-cream-border hover:border-cream-accent rounded-lg transition-colors text-cream-muted hover:text-cream-text shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full bg-transparent border-b border-transparent hover:border-cream-border focus:border-cream-accent focus:outline-none font-serif font-semibold text-base md:text-lg text-cream-text transition-all px-1"
              placeholder="Form Title"
            />
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="hidden sm:block w-full bg-transparent border-b border-transparent hover:border-cream-border focus:border-cream-accent focus:outline-none text-xs text-cream-muted px-1 truncate"
              placeholder="Add description..."
            />
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-3.5 md:py-2 bg-cream-base hover:bg-cream-surface border border-cream-border text-cream-text rounded-lg text-xs font-semibold transition-colors"
            title={previewMode ? "Exit Preview" : "Live Preview"}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden md:inline ml-1.5">{previewMode ? "Exit Preview" : "Live Preview"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-3.5 md:py-2 bg-cream-base hover:bg-cream-surface border border-cream-border text-cream-text rounded-lg text-xs font-semibold transition-colors"
            title="Form Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline ml-1.5">Form Settings</span>
          </button>

          <button
            type="button"
            onClick={handleSaveForm}
            disabled={loading}
            className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            title="Save Changes"
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline ml-1.5">{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: Palette (Hidden in Preview) */}
        {!previewMode && (
          <>
            {/* Mobile overlay */}
            <div
              className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className={`fixed top-0 left-0 h-full w-64 bg-cream-surface border-r border-cream-border p-4 md:p-5 overflow-y-auto transform transition-transform duration-200 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-60`}>
              <div>
                <h2 className="text-xs font-bold text-cream-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cream-accent" />
                  Toolbox Elements
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {paletteFields.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          handleAddField(item.type);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-cream-base hover:bg-cream-surface border border-cream-border hover:border-cream-accent text-cream-text rounded-xl transition-all text-xs font-medium text-left cursor-pointer group active:scale-[0.98] shadow-sm"
                      >
                        <span className="p-1.5 bg-cream-surface group-hover:bg-cream-border rounded-lg text-cream-accent">
                          <Icon className="w-4.5 h-4.5" />
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Center Column: Form Canvas / Drag-and-Drop Area */}
        <main className="flex-1 bg-cream-base p-4 md:p-10 overflow-y-auto flex justify-center">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            
            {/* Form Title Card */}
            <div className="bg-cream-surface border border-cream-border p-8 rounded-2xl relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cream-accent" />
              <h2 className="text-xl font-serif font-semibold text-cream-text">{title}</h2>
              {description && <p className="text-sm text-cream-muted mt-2 leading-relaxed">{description}</p>}
            </div>

            {/* Form Canvas Editor OR Interactive End-user Preview */}
            {previewMode ? (
              /* INTERACTIVE LIVE PREVIEW MODE */
              <div className="space-y-6">
                {fields.length === 0 ? (
                  <div className="p-12 border border-dashed border-cream-border rounded-2xl text-center text-cream-muted bg-cream-surface">
                    <Sparkles className="w-8 h-8 text-cream-accent mx-auto mb-2" />
                    <p className="text-sm font-semibold">Preview form canvas empty</p>
                  </div>
                ) : (
                  fields.map(field => (
                    <div key={field.id} className="bg-cream-surface border border-cream-border p-6 rounded-2xl">
                      <label className="block text-sm font-bold text-cream-text mb-2">
                        {field.label || 'Untitled Question'}
                        {field.required && <span className="text-cream-danger font-bold ml-1">*</span>}
                      </label>
                      {renderPreviewInput(field)}
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* DRAG-AND-DROP CANVAS WORKSPACE */
              dndReady ? (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 min-h-[300px]"
                      >
                        {fields.length === 0 ? (
                          <div className="p-16 border border-dashed border-cream-border rounded-2xl text-center text-cream-muted bg-cream-surface/50 flex flex-col items-center">
                            <Plus className="w-8 h-8 text-cream-accent mb-2" />
                            <p className="text-sm font-semibold">Canvas is empty</p>
                            <p className="text-xs text-cream-muted mt-1">Select field types from the toolbox on the left to design your layout.</p>
                          </div>
                        ) : (
                          fields.map((field, index) => (
                            <FieldCard
                              key={field.id}
                              field={field}
                              index={index}
                              isSelected={selectedFieldId === field.id}
                              onClick={() => setSelectedFieldId(field.id)}
                              onDelete={handleDeleteField}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="text-center text-cream-muted py-10 text-xs">DnD compiler compiling canvas...</div>
              )
            )}
          </div>
        </main>

        {/* Right Column: Properties Editor Panel (Hidden in Preview) */}
        {!previewMode && (
          <aside className="w-full md:w-80 border-l border-cream-border bg-cream-surface p-4 md:p-6 overflow-y-auto shrink-0 flex flex-col gap-6">
            <h2 className="text-xs font-bold text-cream-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-cream-border pb-3">
              <Settings className="w-4 h-4 text-cream-accent" />
              Field Configurator
            </h2>

            {selectedField ? (
              <div className="space-y-5">
                {/* 1. Field Label */}
                <div>
                  <label className="block text-[10px] text-cream-muted font-bold uppercase tracking-wider mb-2">Field Label</label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => handleUpdateField('label', e.target.value)}
                    className="w-full bg-cream-base border border-cream-border rounded-lg p-2.5 text-sm text-cream-text focus:border-cream-accent focus:outline-none"
                    placeholder="Enter question prompt..."
                  />
                </div>

                {/* 2. Field Placeholder (Only for text inputs) */}
                {['text', 'textarea', 'email', 'number'].includes(selectedField.type) && (
                  <div>
                    <label className="block text-[10px] text-cream-muted font-bold uppercase tracking-wider mb-2">Placeholder Helper</label>
                    <input
                      type="text"
                      value={selectedField.placeholder || ''}
                      onChange={(e) => handleUpdateField('placeholder', e.target.value)}
                      className="w-full bg-cream-base border border-cream-border rounded-lg p-2.5 text-sm text-cream-text focus:border-cream-accent focus:outline-none"
                      placeholder="Type preview placeholder..."
                    />
                  </div>
                )}

                {/* 3. Options List (For dropdown, radio, checkboxes) */}
                {['dropdown', 'radio', 'checkbox'].includes(selectedField.type) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] text-cream-muted font-bold uppercase tracking-wider">Choice Options</label>
                      <button 
                        onClick={handleAddOption}
                        className="text-[10px] font-bold text-cream-accent hover:text-cream-accent-hover flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Choice
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedField.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(i, e.target.value)}
                            className="flex-1 bg-cream-base border border-cream-border rounded-lg p-2 text-xs text-cream-text focus:border-cream-accent focus:outline-none"
                          />
                          <button
                            onClick={() => handleRemoveOption(i)}
                            disabled={selectedField.options.length <= 1}
                            className="p-2 text-cream-muted hover:text-cream-danger disabled:opacity-30 rounded hover:bg-cream-base"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Required Toggle */}
                <div className="flex items-center justify-between border-t border-cream-border pt-4">
                  <span className="text-xs font-semibold text-cream-muted">Enforce Answer Validation</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedField.required} 
                      onChange={(e) => handleUpdateField('required', e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4.5 bg-cream-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream-muted after:border-cream-border after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cream-accent peer-checked:after:bg-cream-base peer-checked:after:left-[0px]"></div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-cream-muted text-xs">
                Select a field card on the canvas to configure its options and validation properties.
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Floating Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-cream-base border border-cream-border rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 text-cream-muted hover:text-cream-text rounded-lg hover:bg-cream-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-serif font-semibold text-cream-text flex items-center gap-2 mb-5">
              <Settings className="w-5 h-5 text-cream-accent" />
              Configure Settings Campaign
            </h3>

            <div className="space-y-4 text-sm">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-cream-surface border border-cream-border rounded-xl">
                <div>
                  <p className="font-semibold text-cream-text text-xs">Accept Submissions</p>
                  <p className="text-[10px] text-cream-muted mt-0.5">Toggle form campaign availability</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.isOpen} 
                    onChange={(e) => setSettings(prev => ({ ...prev, isOpen: e.target.checked }))} 
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4.5 bg-cream-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream-muted after:border-cream-border after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cream-accent peer-checked:after:bg-cream-base peer-checked:after:left-[0px]"></div>
                </label>
              </div>

              {/* Owner Email Notification */}
              <div>
                <label className="block text-[10px] text-cream-muted font-bold uppercase tracking-wider mb-2">Notification Email</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-cream-surface border border-cream-border rounded-lg p-2.5 text-xs text-cream-text focus:border-cream-accent focus:outline-none"
                  placeholder="Enter email to receive notifications..."
                />
              </div>

              {/* Thank you Message */}
              <div>
                <label className="block text-[10px] text-cream-muted font-bold uppercase tracking-wider mb-2">Completion Message</label>
                <input
                  type="text"
                  value={settings.thankYouMessage}
                  onChange={(e) => setSettings(prev => ({ ...prev, thankYouMessage: e.target.value }))}
                  className="w-full bg-cream-surface border border-cream-border rounded-lg p-2.5 text-xs text-cream-text focus:border-cream-accent focus:outline-none"
                  placeholder="Enter thank you message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Max Responses */}
                <div>
                  <label className="block text-[10px] text-cream-muted font-bold uppercase tracking-wider mb-2">Max Responses</label>
                  <input
                    type="number"
                    value={settings.maxResponses}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxResponses: e.target.value }))}
                    className="w-full bg-cream-surface border border-cream-border rounded-lg p-2.5 text-xs text-cream-text focus:border-cream-accent focus:outline-none"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-[10px] text-cream-muted font-bold uppercase tracking-wider mb-2">Expiration Date</label>
                  <input
                    type="date"
                    value={settings.expiryDate}
                    onChange={(e) => setSettings(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full bg-cream-surface border border-cream-border rounded-lg p-2.5 text-xs text-cream-text focus:border-cream-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-6 py-2.5 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
