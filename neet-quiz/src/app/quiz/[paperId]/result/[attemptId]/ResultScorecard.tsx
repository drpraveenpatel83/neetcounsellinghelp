'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Paper, Question } from '@/lib/supabase';
import { Award, CheckCircle, XCircle, AlertCircle, Clock, Percent, ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface AttemptData {
  attemptId: string;
  paper: Paper;
  questions: Question[];
  answers: Record<string, {
    selectedOption: 'a' | 'b' | 'c' | 'd' | null;
    isCorrect: boolean | null;
    isMarkedReview: boolean;
    timeSpentSeconds: number;
    isVisited: boolean;
  }>;
  score: number;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string;
}

export default function ResultScorecard() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  
  const [data, setData] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Read attempt details from localStorage history list
    const attemptHistory = JSON.parse(localStorage.getItem('neet_attempt_history') || '{}');
    const attempt = attemptHistory[attemptId];

    if (attempt) {
      setData(attempt);
    }
    setLoading(false);
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex-grow w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs sm:text-sm font-semibold text-slate-500">Formulating scorecard analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-grow w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h3 className="text-lg font-bold">Attempt Record Not Found</h3>
        <p className="text-slate-500 text-xs sm:text-sm">We could not load the detailed result analysis for this attempt ID.</p>
        <button
          onClick={() => router.push('/quiz')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
        >
          Return to Exams
        </button>
      </div>
    );
  }

  const { paper, questions, answers, score, correct, wrong, unattempted, accuracy, timeSpent } = data;

  // Format total spent seconds (e.g. 2m 14s)
  const formatSpentTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Group stats by subject
  const subjectStats: Record<string, { total: number; correct: number; wrong: number; score: number }> = {};
  questions.forEach((q) => {
    const sub = q.subject;
    const ans = answers[q.id];
    
    if (!subjectStats[sub]) {
      subjectStats[sub] = { total: 0, correct: 0, wrong: 0, score: 0 };
    }
    
    subjectStats[sub].total++;
    if (ans && ans.selectedOption !== null) {
      if (ans.isCorrect) {
        subjectStats[sub].correct++;
        subjectStats[sub].score += 4;
      } else {
        subjectStats[sub].wrong++;
        subjectStats[sub].score -= 1;
      }
    }
  });

  const toggleExpandQuestion = (id: string) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 w-full min-h-screen py-8 sm:py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push('/quiz')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Papers</span>
        </button>

        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-3xl">
              🏆
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                Exam Performance Analysis
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                {paper.title} • Completed on {new Date(data.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/quiz')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Another Paper</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          {/* Total Score */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Score</span>
              <Award className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{score}</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">/ {paper.total_marks}</span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
              <Percent className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{accuracy}%</span>
            </div>
          </div>

          {/* Time Spent */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Time Spent</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{formatSpentTime(timeSpent)}</span>
            </div>
          </div>

          {/* Question breakdown stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              Answers Count
            </div>
            <div className="flex gap-3 text-xs font-bold mt-2">
              <div className="flex flex-col text-emerald-500">
                <span>{correct}</span>
                <span className="text-[10px] text-slate-400 uppercase mt-0.5">Corr</span>
              </div>
              <div className="flex flex-col text-rose-500 border-l border-slate-100 dark:border-slate-800 pl-3">
                <span>{wrong}</span>
                <span className="text-[10px] text-slate-400 uppercase mt-0.5">Wrng</span>
              </div>
              <div className="flex flex-col text-amber-500 border-l border-slate-100 dark:border-slate-800 pl-3">
                <span>{unattempted}</span>
                <span className="text-[10px] text-slate-400 uppercase mt-0.5">Unat</span>
              </div>
            </div>
          </div>

        </div>

        {/* Subject-Wise breakdown cards */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
            Subject Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(subjectStats).map(([subj, stats]) => {
              const maxScore = stats.total * 4;
              const scorePercent = maxScore > 0 ? Math.max(0, Math.round((stats.score / maxScore) * 100)) : 0;
              
              return (
                <div key={subj} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {subj}
                  </span>
                  
                  <div className="mt-3 flex justify-between items-end">
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.score}</span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ {maxScore} Marks</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        scorePercent > 70 
                          ? 'bg-emerald-500' 
                          : scorePercent > 40 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase">
                    <span>{stats.correct} Correct</span>
                    <span>{stats.wrong} Wrong</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Answers Checklist section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
            Detailed Answers Key
          </h2>

          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isExpanded = expandedQuestions[q.id] || false;
              
              // Answer tag styles
              let tagLabel = 'Unattempted';
              let tagStyle = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50';
              let tagIcon = <AlertCircle className="w-4 h-4 shrink-0" />;

              if (ans && ans.selectedOption !== null) {
                if (ans.isCorrect) {
                  tagLabel = 'Correct Answer';
                  tagStyle = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50';
                  tagIcon = <CheckCircle className="w-4 h-4 shrink-0" />;
                } else {
                  tagLabel = 'Wrong Answer';
                  tagStyle = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50';
                  tagIcon = <XCircle className="w-4 h-4 shrink-0" />;
                }
              }

              return (
                <div 
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  {/* Collapsible Card Header */}
                  <div 
                    onClick={() => toggleExpandQuestion(q.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                        {idx + 1}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-1.5 ${tagStyle}`}>
                        {tagIcon}
                        <span>{tagLabel}</span>
                      </span>
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400">
                        {q.subject}
                      </span>
                    </div>

                    <div className="text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Collapsible Card Body */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/40">
                      {/* Question Text */}
                      <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base font-bold leading-relaxed whitespace-pre-line mb-5">
                        {q.question_text}
                      </p>

                      {/* Options listing */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs sm:text-sm font-semibold">
                        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          q.correct_option === 'a' 
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300' 
                            : ans?.selectedOption === 'a' 
                              ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300' 
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span>A. {q.option_a}</span>
                          {q.correct_option === 'a' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {ans?.selectedOption === 'a' && q.correct_option !== 'a' && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>

                        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          q.correct_option === 'b' 
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300' 
                            : ans?.selectedOption === 'b' 
                              ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300' 
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span>B. {q.option_b}</span>
                          {q.correct_option === 'b' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {ans?.selectedOption === 'b' && q.correct_option !== 'b' && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>

                        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          q.correct_option === 'c' 
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300' 
                            : ans?.selectedOption === 'c' 
                              ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300' 
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span>C. {q.option_c}</span>
                          {q.correct_option === 'c' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {ans?.selectedOption === 'c' && q.correct_option !== 'c' && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>

                        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          q.correct_option === 'd' 
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300' 
                            : ans?.selectedOption === 'd' 
                              ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300' 
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span>D. {q.option_d}</span>
                          {q.correct_option === 'd' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {ans?.selectedOption === 'd' && q.correct_option !== 'd' && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                      </div>

                      {/* Explanation box */}
                      {q.explanation && (
                        <div className="border border-blue-100 dark:border-blue-900/30 bg-blue-50/25 dark:bg-blue-950/10 rounded-xl p-4 mt-4">
                          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5 uppercase">
                            💡 Explanation
                          </h4>
                          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
