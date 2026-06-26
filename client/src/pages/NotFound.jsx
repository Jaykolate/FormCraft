import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full mb-2">
          <HelpCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-100">404</h1>
          <h2 className="text-xl font-bold text-slate-350">Page Not Found</h2>
          <p className="text-sm text-slate-550">
            The page you are looking for does not exist or has been moved to another URL.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
