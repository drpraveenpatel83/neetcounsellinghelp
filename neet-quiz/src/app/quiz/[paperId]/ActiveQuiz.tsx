'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/context/QuizContext';
import { QuizHeader } from '@/components/QuizHeader';
import { QuestionCard } from '@/components/QuestionCard';
import { QuestionPalette } from '@/components/QuestionPalette';
import { Menu, X } from 'lucide-react';

export default function ActiveQuiz() {
  const router = useRouter();
  const { paper, status, attemptId } = useQuiz();
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // If status is idle or not active, redirect back to Listing
  useEffect(() => {
    if (status === 'idle') {
      router.push('/quiz');
    }
  }, [status, router]);

  // If completed, redirect immediately to the scorecard page
  useEffect(() => {
    if (status === 'completed' && paper && attemptId) {
      router.push(`/quiz/${paper.id}/result/${attemptId}`);
    }
  }, [status, paper, attemptId, router]);

  if (status === 'loading' || status === 'idle' || !paper) {
    return (
      <div className="flex-1 w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs sm:text-sm font-semibold text-slate-500">Launching your exam dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      
      {/* Sticky Timer Header */}
      <QuizHeader />

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left panel: QuestionCard */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <QuestionCard />
          </div>

          {/* Right panel: QuestionPalette (Desktop view only) */}
          <div className="hidden lg:block lg:col-span-1">
            <QuestionPalette />
          </div>
        </div>
      </main>

      {/* Sticky Mobile Bar for toggling Palette */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setMobilePaletteOpen(!mobilePaletteOpen)}
          className="p-4 rounded-full bg-slate-900 dark:bg-slate-800 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          {mobilePaletteOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer/Modal for Palette */}
      {mobilePaletteOpen && (
        <div className="lg:hidden fixed inset-0 z-45 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Exam Navigation
              </h3>
              <button 
                onClick={() => setMobilePaletteOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Display Palette grid inside mobile modal */}
            <div onClick={() => setMobilePaletteOpen(false)}>
              <QuestionPalette />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
