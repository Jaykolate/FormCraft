import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Share2,
  Download,
  Check,
  AlertCircle,
  Users,
  Clock,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  ListCollapse,
  Star,
  Menu
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CHART_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { showToast } = useToast();

  // Page States
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [allResponses, setAllResponses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Table Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Mobile nav toggle for optional side drawer (if needed in future)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Relative Time Formatter
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'No submissions';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  // Fetch all form data concurrently on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [formRes, analyticsRes, responsesRes] = await Promise.all([
          axios.get(`${API_URL}/api/forms/${id}`, { headers }),
          axios.get(`${API_URL}/api/analytics/${id}`, { headers }),
          axios.get(`${API_URL}/api/responses/${id}?limit=1000`, { headers })
        ]);
        setForm(formRes.data);
        setAnalytics(analyticsRes.data);
        setAllResponses(responsesRes.data.responses || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics details:', err);
        setError('Failed to fetch analytics metrics. Please ensure you are authorized.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  // Copy Link Trigger
  const handleCopyLink = () => {
    if (!form) return;
    const publicUrl = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      showToast('success', 'Form public URL link copied!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy public URL link:', err);
      showToast('error', 'Failed to copy link to clipboard.');
    });
  };

  // Export Responses as CSV
  const handleExportCSV = () => {
    if (!form || !allResponses || allResponses.length === 0) {
      showToast('error', 'No response data available to export.');
      return;
    }
    const headers = [...form.fields.map(f => f.label), 'Submitted At'];
    const csvRows = [headers.join(',')];
    allResponses.forEach(resp => {
      const answersObj = resp.answers instanceof Map ? Object.fromEntries(resp.answers) : resp.answers || {};
      const row = form.fields.map(field => {
        const val = answersObj[field.id];
        if (val === undefined || val === null) return '""';
        const formatted = Array.isArray(val) ? val.join(', ') : String(val);
        return `"${formatted.replace(/"/g, '""')}"`;
      });
      const submittedDate = new Date(resp.submittedAt).toLocaleString();
      row.push(`"${submittedDate.replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV exported successfully!');
  };

  // Recent text answers helper
  const getRecentTextAnswers = (fieldId) => {
    const list = [];
    allResponses.forEach(resp => {
      const answersObj = resp.answers instanceof Map ? Object.fromEntries(resp.answers) : resp.answers || {};
      const val = answersObj[fieldId];
      if (val !== undefined && val !== null && val !== '') {
        list.push(val);
      }
    });
    return list.slice(0, 3);
  };

  // Pagination calculations
  const totalPages = Math.ceil(allResponses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResponses = allResponses.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-base flex items-center justify-center text-cream-muted font-sans">
        <div className="text-center space-y-2">
          <Activity className="w-8 h-8 animate-spin mx-auto text-cream-accent" />
          <p className="text-sm font-semibold">Aggregating Statistics…</p>
        </div>
      </div>
    );
  }

  if (error || !form || !analytics) {
    return (
      <div className="min-h-screen bg-cream-base flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-cream-surface border border-cream-border p-8 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="inline-flex p-4 bg-cream-danger/10 border border-cream-danger/20 text-cream-danger rounded-full mb-1">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-cream-text">Retrieval Failed</h2>
            <p className="text-sm text-cream-muted mt-2 leading-relaxed">{error || 'An unexpected error occurred.'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-cream-accent hover:bg-cream-accent-hover border border-cream-accent text-xs font-semibold rounded-lg transition-colors text-cream-base hover:text-cream-base"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const maxResponses = form.settings?.maxResponses;
  const completionRate = maxResponses && maxResponses > 0 ? `${Math.round((analytics.totalResponses / maxResponses) * 100)}%` : '100%';

  return (
    <div className="min-h-screen bg-cream-base text-cream-text font-sans pb-16 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cream-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cream-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-cream-border bg-cream-surface px-4 py-3 flex items-center justify-between sticky top-0 z-10 gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-cream-surface border border-cream-border hover:border-cream-accent rounded-lg transition-colors text-cream-muted hover:text-cream-text shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-serif font-bold text-cream-text truncate">{form.title}</h1>
            <p className="hidden sm:block text-[10px] text-cream-muted mt-0.5">Performance analytics for campaigns</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 border rounded-lg text-xs font-semibold transition-all ${copied ? 'bg-emerald-50 border-emerald-600 text-white' : 'bg-cream-base hover:bg-cream-surface border-cream-border text-cream-text'}`}
            title={copied ? 'Link Copied' : 'Share Form'}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden md:inline ml-1.5">{copied ? 'Copied' : 'Share Link'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 bg-cream-accent hover:bg-cream-accent-hover border border-cream-accent text-cream-base rounded-lg text-xs font-bold transition-all"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline ml-1.5">Export CSV</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8 relative z-10">
        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[{
            label: 'Total Responses',
            value: analytics.totalResponses,
            icon: Users,
            color: 'text-cream-accent'
          }, {
            label: 'Completion Rate',
            value: completionRate,
            icon: Activity,
            color: 'text-cream-accent'
          }, {
            label: 'Last Submission',
            value: getRelativeTime(analytics.lastSubmittedAt),
            icon: Clock,
            color: 'text-cream-muted'
          }, {
            label: 'Campaign Status',
            value: form.settings?.isOpen ?? true ? 'Active' : 'Closed',
            icon: Calendar,
            color: 'text-cream-accent'
          }].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="bg-cream-surface border border-cream-border p-4 md:p-6 rounded-2xl flex items-center justify-between backdrop-blur-sm hover:border-cream-accent transition-colors">
                <div className="min-w-0">
                  <p className="text-[9px] md:text-[10px] text-cream-muted font-bold uppercase tracking-wider truncate">{kpi.label}</p>
                  <p className="text-base md:text-xl font-bold mt-1 md:mt-2 text-cream-text truncate">{kpi.value}</p>
                </div>
                <div className={`p-2.5 bg-cream-base/60 rounded-xl shrink-0 ${kpi.color} ml-2`}>
                  <Icon className="w-4.5 h-4.5 md:w-5 md:h-5" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Field Analytics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {form.fields.map(field => {
            const fieldId = field.id;
            const data = analytics.fieldAnalytics[fieldId];
            if (data === undefined) return null;
            return (
              <div key={fieldId} className="bg-cream-surface border border-cream-border p-5 md:p-6 rounded-2xl flex flex-col justify-between backdrop-blur-sm hover:border-cream-accent transition-colors min-h-[280px]">
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-cream-text line-clamp-2">{field.label}</h3>
                  <span className="text-[9px] md:text-[10px] text-cream-muted font-medium capitalize mt-1 block">
                    {field.type === 'textarea' ? 'long text' : field.type} metric
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center mt-4">
                  {field.type === 'rating' ? (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className="text-center sm:border-r border-cream-border/60 py-2">
                        <span className="text-[9px] md:text-[10px] text-cream-muted font-semibold uppercase tracking-wider block">Average</span>
                        <span className="text-3xl md:text-4xl font-extrabold text-cream-accent mt-1 md:mt-2 block">{data.average || '0.0'}</span>
                        <div className="flex justify-center mt-1.5 text-cream-accent">
                          <Star className="w-4 h-4 fill-cream-accent" />
                        </div>
                      </div>
                      <div className="sm:col-span-2 h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(data.distribution || {}).map(([score, count]) => ({ score: `${score}★`, count }))}>
                            <XAxis dataKey="score" stroke="#9C8F82" fontSize={10} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#F7F4EF', borderColor: '#E8E2D9', borderRadius: '8px', color: '#3D3530', fontSize: '11px' }} />
                            <Bar dataKey="count" fill="#C4A882" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : ['dropdown', 'radio', 'select'].includes(field.type) ? (
                    <div className="w-full h-36 flex items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(data || {}).map(([label, value]) => ({ name: label, value }))}
                            cx="55%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={45}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {Object.entries(data || {}).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#F7F4EF', borderColor: '#E8E2D9', borderRadius: '8px', color: '#3D3530', fontSize: '11px' }} />
                          <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '9px', color: '#9C8F82' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="w-full h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(data || []).map(([label, count]) => ({ name: label, count }))}>
                          <XAxis dataKey="name" stroke="#9C8F82" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#F7F4EF', borderColor: '#E8E2D9', borderRadius: '8px', color: '#3D3530', fontSize: '11px' }} />
                          <Bar dataKey="count" fill="#C4A882" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="w-full space-y-3.5">
                      <div className="flex justify-between items-center bg-cream-base/40 p-2.5 border border-cream-border rounded-xl">
                        <span className="text-xs text-cream-muted font-semibold">Total Answered</span>
                        <span className="text-xs font-bold text-cream-text">{data || 0}</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-cream-muted font-bold uppercase tracking-wider block">Recent Responses</span>
                        {getRecentTextAnswers(fieldId).length === 0 ? (
                          <span className="text-xs text-cream-muted italic block">No entries recorded</span>
                        ) : (
                          getRecentTextAnswers(fieldId).map((ans, i) => (
                            <div key={i} className="text-xs bg-cream-base border border-cream-border p-2 rounded-lg text-cream-text truncate">
                              {String(ans)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Raw Responses Table */}
        <section className="bg-cream-surface border border-cream-border rounded-2xl p-4 md:p-6 space-y-4 backdrop-blur-sm shrink-0">
          <div className="flex items-center justify-between border-b border-cream-border pb-3.5">
            <div>
              <h2 className="text-xs md:text-sm font-bold text-cream-text flex items-center gap-2">
                <ListCollapse className="w-4 h-4 text-cream-accent" />
                Raw Response Submissions
              </h2>
              <p className="text-[9px] md:text-[10px] text-cream-muted mt-0.5">Chronological record grid</p>
            </div>
            <span className="text-[10px] font-semibold text-cream-muted bg-cream-base/60 px-2.5 py-1 rounded-full border border-cream-border">
              Total: {allResponses.length}
            </span>
          </div>

          {allResponses.length === 0 ? (
            <div className="py-12 text-center text-cream-muted text-xs italic">
              No submission records registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-cream-border rounded-xl bg-cream-base/20">
                <table className="w-full text-left border-collapse text-[11px] md:text-xs">
                  <thead>
                    <tr className="bg-cream-base border-b border-cream-border text-cream-muted font-bold">
                      {form.fields.map(f => (
                        <th key={f.id} className="p-3 whitespace-nowrap min-w-[140px]">{f.label}</th>
                      ))}
                      <th className="p-3 whitespace-nowrap min-w-[140px]">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-border/40 text-cream-text">
                    {paginatedResponses.map(resp => {
                      const answersObj = resp.answers instanceof Map ? Object.fromEntries(resp.answers) : resp.answers || {};
                      return (
                        <tr key={resp._id} className="hover:bg-cream-base/30 transition-colors">
                          {form.fields.map(field => {
                            const val = answersObj[field.id];
                            const displayVal = Array.isArray(val) ? val.join(', ') : val;
                            return (
                              <td key={field.id} className="p-3 truncate max-w-xs" title={displayVal}>
                                {displayVal !== undefined && displayVal !== null && displayVal !== '' ? String(displayVal) : '-'}
                              </td>
                            );
                          })}
                          <td className="p-3 whitespace-nowrap text-cream-muted">
                            {new Date(resp.submittedAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[9px] text-cream-muted font-semibold uppercase tracking-wider">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 bg-cream-base hover:bg-cream-surface border border-cream-border hover:border-cream-accent disabled:opacity-30 rounded-lg text-cream-muted transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 bg-cream-base hover:bg-cream-surface border border-cream-border hover:border-cream-accent disabled:opacity-30 rounded-lg text-cream-muted transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
