import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Layers, ArrowRight, X, Sparkles, Layout, Zap, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="min-h-screen bg-cream-base text-cream-text font-sans flex flex-col justify-between relative selection:bg-cream-accent/25 selection:text-cream-text">
      {/* Header Navigation matching Dashboard header */}
      <header className="border-b border-cream-border bg-cream-surface sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-cream-accent rounded-lg text-cream-base shadow-sm transition-transform group-hover:scale-105">
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
        </Link>

        {/* Right Nav Controls */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-cream-muted hover:text-cream-text transition-colors cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => setShowAboutModal(true)}
            className="text-cream-muted hover:text-cream-text transition-colors cursor-pointer"
          >
            About
          </button>

          {/* Authentication Buttons matching Dashboard styling */}
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-lg text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="h-8 w-px bg-cream-border" />
              <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border border-cream-border rounded-lg hover:border-cream-accent transition-colors"
                }
              }} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/sign-in" 
                className="px-4 py-2 bg-cream-base hover:bg-cream-surface border border-cream-border hover:border-cream-accent text-cream-text rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                Log In
              </Link>
              <Link 
                to="/sign-up" 
                className="px-4 py-2 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-lg text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section styled with reference layout and Dashboard colors */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center text-center flex-1 justify-center">
        {/* Main Headline with Serif styling */}
        <h1 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-cream-text max-w-2xl leading-[1.25]">
          Your ideas, Documents, & plans. Unified. Welcome to{' '}
          <span className="underline underline-offset-8 decoration-cream-accent decoration-2 inline-block">
            FormCraft
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm md:text-base text-cream-muted max-w-md font-sans leading-relaxed">
          FormCraft is connected workspace where better, faster work happens.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-7">
          {isSignedIn ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
            >
              <span>Explore Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link 
              to="/sign-up"
              className="flex items-center gap-2 px-6 py-3 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] inline-flex"
            >
              <span>Get FormCraft Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Hero Line-Art Illustration with warm theme colors */}
        <div className="mt-12 w-full max-w-xl relative">
          <svg 
            viewBox="0 0 800 380" 
            className="w-full h-auto drop-shadow-sm"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="#3D3530" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Flying papers / documents in background */}
              <path d="M 120 120 L 150 100 L 170 130 L 140 150 Z" fill="#F7F4EF" />
              <line x1="135" y1="120" x2="155" y2="110" stroke="#9C8F82" />
              <line x1="140" y1="130" x2="160" y2="120" stroke="#9C8F82" />

              <path d="M 180 60 L 210 50 L 225 75 L 195 85 Z" fill="#F7F4EF" />
              <path d="M 230 140 L 255 125 L 270 150 L 245 165 Z" fill="#F7F4EF" />

              <path d="M 590 80 L 620 70 L 635 95 L 605 105 Z" fill="#F7F4EF" />
              <path d="M 640 150 L 665 135 L 680 160 L 655 175 Z" fill="#F7F4EF" />

              {/* Action sparkles / dashes */}
              <path d="M 110 160 Q 90 170 100 190" strokeDasharray="3 3" stroke="#C4A882" />
              <path d="M 260 80 Q 280 60 270 40" strokeDasharray="3 3" stroke="#C4A882" />
              <path d="M 680 110 Q 710 120 700 140" strokeDasharray="3 3" stroke="#C4A882" />

              {/* Left Character */}
              <circle cx="340" cy="180" r="18" fill="#FDFCF9" />
              <path d="M 325 175 Q 340 160 355 175" fill="none" strokeWidth="2.5" />
              <circle cx="346" cy="178" r="1.5" fill="#3D3530" />
              <path d="M 330 200 L 320 250 L 355 245 L 350 200 Z" fill="#F7F4EF" />
              <line x1="330" y1="215" x2="352" y2="212" stroke="#9C8F82" />
              <line x1="327" y1="230" x2="354" y2="226" stroke="#9C8F82" />
              <path d="M 330 205 Q 290 220 270 180" fill="none" strokeWidth="3" />
              <path d="M 350 205 Q 390 180 430 150" fill="none" strokeWidth="3" />
              <path d="M 425 140 L 450 125 L 465 150 L 440 165 Z" fill="#FDFCF9" strokeWidth="2" />
              <line x1="435" y1="142" x2="452" y2="132" stroke="#9C8F82" />
              <path d="M 325 248 Q 280 260 260 250 L 275 240" fill="none" strokeWidth="3.5" />
              <path d="M 350 246 Q 370 280 395 310 L 380 315" fill="none" strokeWidth="3.5" />

              {/* Right Character */}
              <path d="M 520 290 L 580 280 L 590 340 M 530 290 L 525 345 M 575 282 L 570 345" strokeWidth="2.5" stroke="#9C8F82" />
              <circle cx="580" cy="160" r="18" fill="#FDFCF9" />
              <path d="M 592 155 Q 610 160 615 175 Q 600 175 595 168" fill="#3D3530" />
              <path d="M 570 180 L 540 250 L 575 250 Z" fill="#F7F4EF" />
              <path d="M 545 250 Q 480 270 460 290 L 490 310 Q 520 280 560 255" fill="#FDFCF9" strokeWidth="2" />
              <path d="M 565 190 Q 530 210 510 220" strokeWidth="3" />
              <path d="M 575 190 Q 550 220 530 230" strokeWidth="3" />
              <path d="M 500 200 L 525 190 L 540 225 L 515 235 Z" fill="#FDFCF9" strokeWidth="2" />
              <line x1="510" y1="205" x2="528" y2="198" stroke="#9C8F82" />

              {/* Stack of books under chair */}
              <rect x="590" y="300" width="45" height="12" rx="2" fill="#C4A882" stroke="#3D3530" strokeWidth="2" />
              <rect x="585" y="312" width="55" height="14" rx="2" fill="#F7F4EF" stroke="#3D3530" strokeWidth="2" />
              <rect x="580" y="326" width="65" height="15" rx="2" fill="#C4A882" stroke="#3D3530" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* Feature Highlights Section matching Dashboard card styling */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 bg-cream-surface border border-cream-border rounded-2xl shadow-xs hover:border-cream-accent/50 transition-all">
            <div className="p-2.5 bg-cream-base border border-cream-border text-cream-accent rounded-xl w-fit mb-4">
              <Layout className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-cream-text mb-1.5">Drag & Drop Builder</h3>
            <p className="text-xs text-cream-muted leading-relaxed">
              Build custom form layouts with real-time live preview editing and intuitive field configuration.
            </p>
          </div>

          <div className="p-6 bg-cream-surface border border-cream-border rounded-2xl shadow-xs hover:border-cream-accent/50 transition-all">
            <div className="p-2.5 bg-cream-base border border-cream-border text-cream-accent rounded-xl w-fit mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-cream-text mb-1.5">Instant Share Links</h3>
            <p className="text-xs text-cream-muted leading-relaxed">
              Publish campaigns immediately and share unique public URLs to collect responses instantly.
            </p>
          </div>

          <div className="p-6 bg-cream-surface border border-cream-border rounded-2xl shadow-xs hover:border-cream-accent/50 transition-all">
            <div className="p-2.5 bg-cream-base border border-cream-border text-cream-accent rounded-xl w-fit mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-cream-text mb-1.5">Real-Time Analytics</h3>
            <p className="text-xs text-cream-muted leading-relaxed">
              Track conversion rates, charts, and raw response data inside your personal workspace.
            </p>
          </div>
        </div>
      </main>

      {/* Footer matching Dashboard styling */}
      <footer className="border-t border-cream-border bg-cream-surface px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-muted font-medium">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cream-accent rounded-md text-cream-base shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-semibold text-cream-text text-sm">FormCraft</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => alert("FormCraft Privacy Policy")} className="hover:text-cream-text transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => alert("FormCraft Terms & Conditions")} className="hover:text-cream-text transition-colors">
            Terms & Conditions
          </button>
        </div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="max-w-md w-full bg-cream-base border border-cream-border rounded-2xl p-6 shadow-xl relative text-xs">
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-1 text-cream-muted hover:text-cream-text rounded-lg hover:bg-cream-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-cream-accent rounded-lg text-cream-base shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-semibold text-base text-cream-text">About FormCraft</h3>
            </div>
            <p className="text-cream-muted leading-relaxed mb-4 text-xs">
              FormCraft is a unified workspace where better, faster form building happens. Designed for creators to build, deploy, and analyze custom interactive forms effortlessly.
            </p>
            <div className="space-y-2 mb-5 text-cream-text font-medium text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cream-accent" />
                <span>Drag & Drop Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cream-accent" />
                <span>Instant Sharing & Embeds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cream-accent" />
                <span>Built-in Real-time Analytics</span>
              </div>
            </div>
            <button 
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-cream-accent hover:bg-cream-accent-hover text-cream-base rounded-xl text-xs font-medium transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
