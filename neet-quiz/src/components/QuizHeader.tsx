'use client';

import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Timer, Award, CheckCircle, AlertTriangle } from 'lucide-react';

export const QuizHeader: React.FC = () => {
  const { paper, questions, answers, timeLeft, submitQuiz } = useQuiz();
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!paper) return null;

  // Format timeLeft (seconds) into hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Calculate stats
  const total = questions.length;
  const answered = Object.values(answers).filter(a => a.selectedOption !== null).length;
  const progressPercent = total > 0 ? (answered / total) * 100 : 0;
  
  // High-visibility alarm when time is less than 5 minutes
  const isTimeCritical = timeLeft < 300; 

  const handleSubmitClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    await submitQuiz();
    setSubmitting(false);
    setShowConfirm(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Title & Metadata */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
              🎯
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                {paper.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Year: {paper.year}</span>
                <span>•</span>
                <span>{total} Questions</span>
              </div>
            </div>
          </div>

          {/* Center Stats (Progress Bar) */}
          <div className="hidden md:flex flex-col items-center gap-1.5 w-72">
            <div className="flex justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Exam Progress</span>
              <span>{answered}/{total} Answered</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timer & Submit Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Timer Block */}
            <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-mono text-sm sm:text-base font-bold transition-all duration-300 ${
              isTimeCritical 
                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 animate-pulse' 
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/80'
            }`}>
              <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${isTimeCritical ? 'text-red-500' : 'text-slate-400'}`} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmitClick}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-150"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Small Progress Bar for Mobile */}
        <div className="md:hidden w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl transition-all duration-200 transform scale-100">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Submit Quiz</h3>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to submit your exam? You have answered <strong>{answered} out of {total}</strong> questions. You will not be able to change your answers after submission.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                disabled={submitting}
              >
                Go Back
              </button>
              <button 
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
