import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Layers, ArrowRight, X, Sparkles, Layout, Zap, CheckCircle2, BarChart3, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between relative selection:bg-zinc-900 selection:text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-zinc-900 text-white rounded-xl shadow-xs transition-transform group-hover:scale-105">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-serif font-bold text-zinc-900 tracking-tight block leading-none">
              FormCraft
            </span>
            <span className="text-[9px] block text-zinc-500 font-mono tracking-wider uppercase leading-none mt-1">
              Form Builder
            </span>
          </div>
        </Link>

        {/* Right Nav Controls */}
        <div className="flex items-center gap-6 text-xs font-medium">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => setShowAboutModal(true)}
            className="text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            About
          </button>

          {/* Authentication Buttons */}
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="h-7 w-px bg-zinc-200" />
              <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                  avatarBox: "h-8 w-8 border border-zinc-200 rounded-full hover:border-zinc-900 transition-colors"
                }
              }} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/sign-in" 
                className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 rounded-full text-xs font-semibold transition-all shadow-2xs"
              >
                Log In
              </Link>
              <Link 
                to="/sign-up" 
                className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-xs active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 flex flex-col items-center text-center flex-1 justify-center relative z-10">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 text-xs font-medium mb-6 shadow-2xs animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span>Next-Gen No-Code Form Builder</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-zinc-900 max-w-3xl leading-[1.2]">
          Your ideas, documents, & plans. Unified in{' '}
          <span className="underline underline-offset-8 decoration-2 inline-block">
            FormCraft
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm md:text-base text-zinc-600 max-w-lg font-sans leading-relaxed">
          FormCraft is connected workspace where better, faster work happens. Build, deploy, and analyze forms effortlessly.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          {isSignedIn ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-7 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Explore Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link 
              to="/sign-up"
              className="px-7 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-95 inline-flex"
            >
              <span>Get FormCraft Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <button 
            onClick={() => setShowAboutModal(true)}
            className="px-5 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Learn More</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Hero Line-Art Illustration */}
        <div className="mt-10 w-full max-w-2xl relative">
          <svg 
            viewBox="0 0 800 380" 
            className="w-full h-auto"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Floating sheets of paper */}
              <path d="M 120 120 L 150 100 L 170 130 L 140 150 Z" fill="#ffffff" stroke="#71717a" />
              <line x1="135" y1="120" x2="155" y2="110" stroke="#a1a1aa" />
              <line x1="140" y1="130" x2="160" y2="120" stroke="#a1a1aa" />

              <path d="M 180 60 L 210 50 L 225 75 L 195 85 Z" fill="#ffffff" stroke="#71717a" />
              <path d="M 230 140 L 255 125 L 270 150 L 245 165 Z" fill="#ffffff" stroke="#71717a" />

              <path d="M 590 80 L 620 70 L 635 95 L 605 105 Z" fill="#ffffff" stroke="#71717a" />
              <path d="M 640 150 L 665 135 L 680 160 L 655 175 Z" fill="#ffffff" stroke="#71717a" />

              {/* Action sparkles / dashes */}
              <path d="M 110 160 Q 90 170 100 190" strokeDasharray="3 3" stroke="#18181b" />
              <path d="M 260 80 Q 280 60 270 40" strokeDasharray="3 3" stroke="#18181b" />
              <path d="M 680 110 Q 710 120 700 140" strokeDasharray="3 3" stroke="#18181b" />

              {/* Left Character */}
              <circle cx="340" cy="180" r="18" fill="#ffffff" stroke="#18181b" />
              <path d="M 325 175 Q 340 160 355 175" fill="none" strokeWidth="2.5" />
              <circle cx="346" cy="178" r="1.5" fill="#18181b" />
              <path d="M 330 200 L 320 250 L 355 245 L 350 200 Z" fill="#ffffff" stroke="#18181b" />
              <line x1="330" y1="215" x2="352" y2="212" stroke="#71717a" />
              <line x1="327" y1="230" x2="354" y2="226" stroke="#71717a" />
              <path d="M 330 205 Q 290 220 270 180" fill="none" strokeWidth="3" />
              <path d="M 350 205 Q 390 180 430 150" fill="none" strokeWidth="3" />
              <path d="M 425 140 L 450 125 L 465 150 L 440 165 Z" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
              <line x1="435" y1="142" x2="452" y2="132" stroke="#71717a" />
              <path d="M 325 248 Q 280 260 260 250 L 275 240" fill="none" strokeWidth="3.5" />
              <path d="M 350 246 Q 370 280 395 310 L 380 315" fill="none" strokeWidth="3.5" />

              {/* Right Character */}
              <path d="M 520 290 L 580 280 L 590 340 M 530 290 L 525 345 M 575 282 L 570 345" strokeWidth="2.5" stroke="#71717a" />
              <circle cx="580" cy="160" r="18" fill="#ffffff" stroke="#18181b" />
              <path d="M 592 155 Q 610 160 615 175 Q 600 175 595 168" fill="#18181b" />
              <path d="M 570 180 L 540 250 L 575 250 Z" fill="#ffffff" stroke="#18181b" />
              <path d="M 545 250 Q 480 270 460 290 L 490 310 Q 520 280 560 255" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
              <path d="M 565 190 Q 530 210 510 220" strokeWidth="3" />
              <path d="M 575 190 Q 550 220 530 230" strokeWidth="3" />
              <path d="M 500 200 L 525 190 L 540 225 L 515 235 Z" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
              <line x1="510" y1="205" x2="528" y2="198" stroke="#71717a" />

              {/* Stack of books under chair */}
              <rect x="590" y="300" width="45" height="12" rx="2" fill="#18181b" stroke="#18181b" strokeWidth="2" />
              <rect x="585" y="312" width="55" height="14" rx="2" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
              <rect x="580" y="326" width="65" height="15" rx="2" fill="#18181b" stroke="#18181b" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-2xs hover:border-zinc-400 transition-all group">
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-xl w-fit mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <Layout className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-zinc-900 mb-2">Drag & Drop Builder</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Create form layouts with live preview editing, question ordering, and validation rules.
            </p>
          </div>

          <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-2xs hover:border-zinc-400 transition-all group">
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-xl w-fit mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-zinc-900 mb-2">Instant Share Links</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Deploy forms instantly and share unique public URLs to start collecting responses right away.
            </p>
          </div>

          <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-2xs hover:border-zinc-400 transition-all group">
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-xl w-fit mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-zinc-900 mb-2">Real-Time Analytics</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Track conversion metrics, interactive charts, and export submission records to CSV format.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-900 rounded-lg text-white shadow-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-semibold text-zinc-900 text-sm">FormCraft</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => alert("FormCraft Privacy Policy")} className="hover:text-zinc-900 transition-colors cursor-pointer">
            Privacy Policy
          </button>
          <button onClick={() => alert("FormCraft Terms & Conditions")} className="hover:text-zinc-900 transition-colors cursor-pointer">
            Terms & Conditions
          </button>
        </div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl relative text-xs">
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-zinc-900 rounded-xl text-white shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-semibold text-base text-zinc-900">About FormCraft</h3>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-4 text-xs">
              FormCraft is a unified workspace where better, faster form building happens. Built for creators and teams to design, publish, and analyze interactive forms effortlessly.
            </p>
            <div className="space-y-2.5 mb-6 text-zinc-700 font-medium text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                <span>Drag & Drop Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                <span>Instant Sharing & Public Form Hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                <span>Built-in Real-time Analytics</span>
              </div>
            </div>
            <button 
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
