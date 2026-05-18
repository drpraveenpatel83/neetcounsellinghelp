'use client';

import React from 'react';
import { useQuiz } from '@/context/QuizContext';

export const QuestionPalette: React.FC = () => {
  const { questions, currentIndex, answers, setCurrentIndex } = useQuiz();

  // Determine grid colors for each bubble
  const getBubbleStyle = (questionId: string, index: number) => {
    const ans = answers[questionId];
    const isActive = currentIndex === index;

    let baseStyle = '';
    
    if (ans) {
      if (ans.isMarkedReview) {
        // Purple for marked review
        baseStyle = 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600 shadow-sm shadow-purple-500/10';
      } else if (ans.selectedOption !== null) {
        // Green for correct, Red for wrong (since we do instant feedback)
        if (ans.isCorrect) {
          baseStyle = 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/10';
        } else {
          baseStyle = 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-500/10';
        }
      } else if (ans.isVisited) {
        // Blue for visited but unattempted
        baseStyle = 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 shadow-sm shadow-blue-500/10';
      } else {
        // Gray for not visited
        baseStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700';
      }
    } else {
      baseStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700';
    }

    // Add extra border highlight if active
    if (isActive) {
      return `${baseStyle} ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 scale-105 font-extrabold z-10`;
    }

    return `${baseStyle} font-semibold`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full flex flex-col gap-5">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
        Question Palette
      </h3>

      {/* Grid of numbers */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[280px] overflow-y-auto pr-1">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`aspect-square w-full rounded-xl flex items-center justify-center text-xs border transition-all duration-150 active:scale-95 ${getBubbleStyle(q.id, idx)}`}
          >
            {(idx + 1).toString().padStart(2, '0')}
          </button>
        ))}
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* Status Legend */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Legend
        </h4>
        
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" />
            <span>Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span>Wrong</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span>Marked Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};
