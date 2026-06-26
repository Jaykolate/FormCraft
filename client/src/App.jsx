import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Analytics from './pages/Analytics';
import PublicForm from './pages/PublicForm';
import NotFound from './pages/NotFound';
import { ToastProvider } from './context/ToastContext';

// Protected Route Wrapper to auto-redirect unauthenticated users to Sign In
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Guarded routes for creators */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/builder/new" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
          <Route path="/builder/:id" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
          <Route path="/analytics/:id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

          {/* Public route to fill form */}
          <Route path="/f/:slug" element={<PublicForm />} />
          
          {/* Authentication routes */}
          <Route 
            path="/sign-in" 
            element={
              <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/" />
              </div>
            } 
          />
          <Route 
            path="/sign-up" 
            element={
              <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/" />
              </div>
            } 
          />

          {/* 404 Route handler */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
