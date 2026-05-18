'use client';

import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuestionCard: React.FC = () => {
  const { 
    questions, 
    currentIndex, 
    answers, 
    selectOption, 
    toggleMarkReview,
    nextQuestion,
    prevQuestion
  } = useQuiz();

  const question = questions[currentIndex];
  if (!question) return null;

  const currentAnswer = answers[question.id];
  const hasAnswered = currentAnswer?.selectedOption !== null;
  const isMarked = currentAnswer?.isMarkedReview || false;

  const options: { key: 'a' | 'b' | 'c' | 'd'; label: string; text: string }[] = [
    { key: 'a', label: 'A', text: question.option_a },
    { key: 'b', label: 'B', text: question.option_b },
    { key: 'c', label: 'C', text: question.option_c },
    { key: 'd', label: 'D', text: question.option_d }
  ];

  // Dynamic style builder for options
  const getOptionStyle = (key: 'a' | 'b' | 'c' | 'd') => {
    const isSelected = currentAnswer?.selectedOption === key;
    const isCorrectOption = question.correct_option === key;

    if (!hasAnswered) {
      return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 text-slate-700 dark:text-slate-200 active:scale-[0.99]';
    }

    if (isSelected) {
      return isCorrectOption
        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/25'
        : 'border-rose-500 dark:border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/25';
    }

    if (isCorrectOption) {
      return 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300';
    }

    return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 text-slate-500 dark:text-slate-400';
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'hard': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
      default: return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    }
  };

  const getSubjectColor = (sub: string) => {
    switch (sub.toLowerCase()) {
      case 'physics': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
      case 'chemistry': return 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30';
      default: return 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Question Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">
            QUESTION {currentIndex + 1} OF {questions.length}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSubjectColor(question.subject)}`}>
            {question.subject}
          </span>
          {question.difficulty && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Bookmark/Mark Review */}
        <button
          onClick={() => toggleMarkReview(question.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 border active:scale-95 ${
            isMarked
              ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-purple-500'
          }`}
        >
          {isMarked ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
              <span>Marked for Review</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" />
              <span>Mark for Review</span>
            </>
          )}
        </button>
      </div>

      {/* Chapter & Topic Subtitle */}
      {(question.chapter || question.topic) && (
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 gap-y-1">
          {question.chapter && <span>Chapter: <strong className="text-slate-600 dark:text-slate-300">{question.chapter}</strong></span>}
          {question.chapter && question.topic && <span>•</span>}
          {question.topic && <span>Topic: <strong className="text-slate-600 dark:text-slate-300">{question.topic}</strong></span>}
        </div>
      )}

      {/* Question Text */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50">
        <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-line">
          {question.question_text}
        </p>
      </div>

      {/* Options Stack */}
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = currentAnswer?.selectedOption === opt.key;
          const isCorrectOption = question.correct_option === opt.key;
          
          return (
            <button
              key={opt.key}
              onClick={() => selectOption(question.id, opt.key)}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all duration-200 ${getOptionStyle(opt.key)}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border transition-all ${
                  hasAnswered
                    ? isCorrectOption
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isSelected
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {opt.label}
                </div>
                <span className="text-sm font-medium">{opt.text}</span>
              </div>

              {hasAnswered && (
                <div>
                  {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose-500" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Animated Explanation Panel */}
      <AnimatePresence>
        {hasAnswered && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            className="mt-4 border border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-2.5">
              <Lightbulb className="w-4 h-4 fill-current" />
              <span>Explanation & Answer Key</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4 mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-6">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
        >
          Previous Question
        </button>

        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
          className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs sm:text-sm font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-all"
        >
          <span>Next Question</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
