'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Question, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_PAPERS, MOCK_QUESTIONS, useQuiz } from '@/context/QuizContext';
import { BookOpen, Calendar, Clock, Award, ShieldAlert, Settings, ArrowRight } from 'lucide-react';

export default function ListingPage() {
  const router = useRouter();
  const { startQuiz } = useQuiz();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPapers() {
      setLoading(true);
      setError(null);
      
      if (isSupabaseConfigured) {
        try {
          const { data, error: fetchErr } = await supabase
            .from('papers')
            .select('*')
            .eq('is_published', true)
            .order('year', { ascending: false });
          
          if (fetchErr) throw fetchErr;

          // If db is connected but empty, fall back to mock data
          if (data && data.length > 0) {
            setPapers(data);
          } else {
            setPapers(MOCK_PAPERS);
          }
        } catch (err: any) {
          console.error('Error fetching papers, showing local mock data', err);
          setPapers(MOCK_PAPERS);
        }
      } else {
        // Fallback directly to local mock dataset
        setPapers(MOCK_PAPERS);
      }
      setLoading(false);
    }
    
    loadPapers();
  }, []);

  const handleStartExam = async (selectedPaper: Paper) => {
    setLoading(true);
    let paperQuestions: Question[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .eq('paper_id', selectedPaper.id)
          .order('order_index', { ascending: true });

        if (qErr) throw qErr;

        if (data && data.length > 0) {
          paperQuestions = data as Question[];
        } else {
          // If no questions in DB, try mock questions matching paper id
          paperQuestions = MOCK_QUESTIONS[selectedPaper.id] || MOCK_QUESTIONS['mock-neet-2025'];
        }
      } catch (err) {
        console.error('Failed to fetch questions, using mock questions instead', err);
        paperQuestions = MOCK_QUESTIONS[selectedPaper.id] || MOCK_QUESTIONS['mock-neet-2025'];
      }
    } else {
      paperQuestions = MOCK_QUESTIONS[selectedPaper.id] || MOCK_QUESTIONS['mock-neet-2025'];
    }

    if (paperQuestions.length === 0) {
      alert('This paper has no questions configured yet.');
      setLoading(false);
      return;
    }

    // Set context state and generate attempt ID
    await startQuiz(selectedPaper, paperQuestions);
    router.push(`/quiz/${selectedPaper.id}`);
  };

  return (
    <div className="flex-1 w-full min-h-screen py-8 sm:py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NEET Previous Year Papers
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              Select a paper to launch the premium interactive practice exam engine.
            </p>
          </div>

          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Database Status Alert Banner */}
        {!isSupabaseConfigured && (
          <div className="mb-8 border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-400">
                Local Practice Mode Active
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5 leading-relaxed">
                Supabase keys are not set in `.env.local`. You are running in offline preview mode! All features, timers, explanations, and result scoring will function beautifully using local mock datasets and localStorage.
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-slate-500">Preparing test papers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div 
                key={paper.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-400/20 hover:scale-[1.01] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{paper.year} Paper</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      NEET UG
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    {paper.title}
                  </h3>

                  {/* Metadata Specs Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 my-6 text-xs text-slate-600 dark:text-slate-400 font-semibold border-t border-slate-50 dark:border-slate-800/50 pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{paper.duration_mins} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span>{paper.total_questions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>Total Marks: {paper.total_marks} Marks</span>
                    </div>
                  </div>
                </div>

                {/* Actions Button */}
                <button
                  onClick={() => handleStartExam(paper)}
                  className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <span>Start Practice Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
