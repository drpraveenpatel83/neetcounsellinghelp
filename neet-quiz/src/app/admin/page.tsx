'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Question, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_PAPERS, MOCK_QUESTIONS } from '@/context/QuizContext';
import { Upload, CheckCircle2, AlertTriangle, Table, BookOpen, Trash2, Eye, LayoutGrid, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ParsedQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  chapter: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function AdminPage() {
  const router = useRouter();
  
  // Existing papers list
  const [existingPapers, setExistingPapers] = useState<Paper[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [durationMins, setDurationMins] = useState(180);
  const [totalMarks, setTotalMarks] = useState(720);

  // Upload/Parsing states
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Load existing papers
  useEffect(() => {
    loadPapers();
  }, []);

  async function loadPapers() {
    setLoadingList(true);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('papers')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data && data.length > 0) {
          setExistingPapers(data);
        } else {
          setExistingPapers(MOCK_PAPERS);
        }
      } catch (err) {
        console.error('Failed fetching papers', err);
        setExistingPapers(MOCK_PAPERS);
      }
    } else {
      // Local preview mode: merge mock papers and any added custom papers
      const customPapers = JSON.parse(localStorage.getItem('neet_custom_papers') || '[]');
      setExistingPapers([...customPapers, ...MOCK_PAPERS]);
    }
    setLoadingList(false);
  }

  // Robust custom CSV parser split logic
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;

    // Correctly handle line breaks inside quotes
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Double quote inside quotes = escaped single quote
          currentLine += '"';
          i++; // skip next char
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === '\n' || char === '\r') {
        if (inQuotes) {
          currentLine += char;
        } else {
          if (char === '\r' && nextChar === '\n') {
            i++; // skip next char
          }
          lines.push(currentLine);
          currentLine = '';
        }
      } else {
        currentLine += char;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length < 2) return [];

    // Extract headers
    const rawHeaders = splitCSVLine(lines[0]);
    const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/[\s_]+/g, ''));

    const result: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = splitCSVLine(lines[i]);
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] !== undefined ? values[index].trim() : '';
      });
      result.push(row);
    }

    return result;
  };

  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    result.push(currentVal);
    return result;
  };

  // CSV Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setValidationErrors([]);
    setParsedQuestions([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setValidationErrors(['The CSV file appears to be empty or misformatted.']);
          return;
        }

        // Validate headers map
        const firstRow = rows[0];
        const requiredFields = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctoption', 'subject'];
        const missingHeaders = requiredFields.filter(f => !Object.keys(firstRow).some(k => k === f));

        if (missingHeaders.length > 0) {
          setValidationErrors([`Missing required headers: ${missingHeaders.join(', ')}. Please check your Google Sheet column names.`]);
          return;
        }

        // Validate each row
        const questionsList: ParsedQuestion[] = [];
        const errors: string[] = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2; // index starts at 0, row 1 is headers
          const questionText = row['question'] || row['questiontext'] || '';
          const optA = row['optiona'] || '';
          const optB = row['optionb'] || '';
          const optC = row['optionc'] || '';
          const optD = row['optiond'] || '';
          let correctOpt = (row['correctoption'] || '').trim().toLowerCase();
          const explanationText = row['explanation'] || '';
          
          let rawSubject = (row['subject'] || '').trim();
          let subject: 'Physics' | 'Chemistry' | 'Biology' = 'Biology';
          
          if (/phys/i.test(rawSubject)) subject = 'Physics';
          else if (/chem/i.test(rawSubject)) subject = 'Chemistry';

          let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
          const rawDiff = (row['difficulty'] || '').trim().toLowerCase();
          if (rawDiff === 'easy' || rawDiff === 'hard') {
            difficulty = rawDiff as 'Easy' | 'Hard';
          }

          // Basic validation checks
          if (!questionText) {
            errors.push(`Row ${rowNum}: Question text is missing.`);
          }
          if (!optA || !optB || !optC || !optD) {
            errors.push(`Row ${rowNum}: One or more multiple-choice options are empty.`);
          }
          if (!correctOpt || !['a', 'b', 'c', 'd'].includes(correctOpt)) {
            errors.push(`Row ${rowNum}: Correct option must be exactly A, B, C, or D (got: "${correctOpt}").`);
          }

          questionsList.push({
            question_text: questionText,
            option_a: optA,
            option_b: optB,
            option_c: optC,
            option_d: optD,
            correct_option: correctOpt as 'a' | 'b' | 'c' | 'd',
            explanation: explanationText,
            subject,
            chapter: row['chapter'] || '',
            topic: row['topic'] || '',
            difficulty
          });
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        } else {
          setParsedQuestions(questionsList);
        }
      } catch (err: any) {
        console.error(err);
        setValidationErrors([`File read error: ${err.message}`]);
      }
    };
    reader.readAsText(file);
  };

  // Publish Paper
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Please fill out the Paper Title.');
      return;
    }
    if (parsedQuestions.length === 0) {
      alert('Please upload a valid CSV file with no errors first.');
      return;
    }

    setPublishing(true);
    setSuccessMsg('');

    const newPaperId = crypto.randomUUID();
    const paperObj: Paper = {
      id: newPaperId,
      title,
      year: Number(year),
      duration_mins: Number(durationMins),
      total_questions: parsedQuestions.length,
      total_marks: Number(totalMarks),
      is_published: true
    };

    if (isSupabaseConfigured) {
      try {
        // 1. Insert Paper
        const { error: pErr } = await supabase.from('papers').insert(paperObj);
        if (pErr) throw pErr;

        // 2. Insert Questions in batch
        const questionsToInsert = parsedQuestions.map((q, idx) => ({
          paper_id: newPaperId,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          explanation: q.explanation,
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          difficulty: q.difficulty,
          order_index: idx
        }));

        const { error: qErr } = await supabase.from('questions').insert(questionsToInsert);
        if (qErr) throw qErr;

        setSuccessMsg(`Successfully published "${title}" with ${parsedQuestions.length} questions to database!`);
        resetForm();
      } catch (err: any) {
        console.error(err);
        alert(`Supabase insertion failed: ${err.message}`);
      }
    } else {
      // Local practice mode fallback: save custom paper and questions in localStorage
      const customPapers = JSON.parse(localStorage.getItem('neet_custom_papers') || '[]');
      customPapers.unshift(paperObj);
      localStorage.setItem('neet_custom_papers', JSON.stringify(customPapers));

      // Save matching questions
      const formattedQuestions = parsedQuestions.map((q, idx) => ({
        id: `custom-q-${newPaperId}-${idx}`,
        paper_id: newPaperId,
        ...q,
        order_index: idx
      }));

      // Read existings, push new custom questions
      const customQuestionsMap = JSON.parse(localStorage.getItem('neet_custom_questions') || '{}');
      customQuestionsMap[newPaperId] = formattedQuestions;
      localStorage.setItem('neet_custom_questions', JSON.stringify(customQuestionsMap));

      // Inject to MOCK questions mapping instantly in memory
      MOCK_QUESTIONS[newPaperId] = formattedQuestions as Question[];

      setSuccessMsg(`[Local Storage Preview Active] Successfully configured "${title}" in local browser memory! Launch it instantly from the papers dashboard.`);
      resetForm();
    }

    setPublishing(false);
    loadPapers();
  };

  // Delete Paper handler
  const handleDeletePaper = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this test paper? This will delete all its questions and attempt history.')) return;
    
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('papers').delete().eq('id', paperId);
        if (error) throw error;
        alert('Test paper deleted successfully from database.');
      } catch (err: any) {
        console.error(err);
        alert(`Delete failed: ${err.message}`);
      }
    } else {
      // Local preview mode
      const customPapers = JSON.parse(localStorage.getItem('neet_custom_papers') || '[]');
      const filteredPapers = customPapers.filter((p: Paper) => p.id !== paperId);
      localStorage.setItem('neet_custom_papers', JSON.stringify(filteredPapers));

      // Remove custom questions
      const customQuestionsMap = JSON.parse(localStorage.getItem('neet_custom_questions') || '{}');
      delete customQuestionsMap[paperId];
      localStorage.setItem('neet_custom_questions', JSON.stringify(customQuestionsMap));

      alert('Test paper deleted from local storage.');
    }
    loadPapers();
  };

  const resetForm = () => {
    setTitle('');
    setYear(new Date().getFullYear());
    setDurationMins(180);
    setTotalMarks(720);
    setParsedQuestions([]);
    setValidationErrors([]);
    setCsvFileName('');
  };

  return (
    <div className="flex-1 w-full min-h-screen py-8 sm:py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push('/quiz')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Listing</span>
        </button>

        {/* Dashboard Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Quiz Management Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Create new papers, upload question sheets via Google Sheets/Excel CSV, and manage tests.
          </p>
        </div>

        {/* Offline Preview Alert Banner */}
        {!isSupabaseConfigured && (
          <div className="mb-8 border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-400">
                Running in Local Preview Upload Mode
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5 leading-relaxed">
                Supabase credentials not configured in `.env.local`. Uploaded papers will save instantly to browser localStorage, populating the home listing dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Success / Status Message */}
        {successMsg && (
          <div className="mb-8 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-400">
              {successMsg}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Upload Form (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <form onSubmit={handlePublish} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b border-slate-50 dark:border-slate-800/80 pb-3 flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-500" />
                <span>Upload New Test Paper</span>
              </h2>

              {/* Form Specs Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Paper Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEET UG 2025 Previous Year Paper"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Paper Year
                  </label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Drag/Drop File Upload */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Google Sheet / Excel CSV File
                </label>
                
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {csvFileName ? (
                      <span className="text-blue-500 font-bold">{csvFileName}</span>
                    ) : (
                      'Click or Drag & Drop your exported CSV file here'
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase mt-1">
                    Columns: question, option_a, option_b, option_c, option_d, correct_option, explanation, subject
                  </p>
                </div>
              </div>

              {/* Validation errors panel */}
              {validationErrors.length > 0 && (
                <div className="border border-rose-200 dark:border-rose-950/50 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl p-4 flex flex-col gap-1.5 max-h-[180px] overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Sheet Verification Errors ({validationErrors.length})</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-rose-700 dark:text-rose-400/90 font-semibold space-y-0.5 leading-relaxed">
                    {validationErrors.slice(0, 10).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validationErrors.length > 10 && <li>...and {validationErrors.length - 10} more errors</li>}
                  </ul>
                </div>
              )}

              {/* Success validation count */}
              {parsedQuestions.length > 0 && (
                <div className="border border-emerald-200 dark:border-emerald-950/50 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold leading-none">
                    Sheet parsed successfully! {parsedQuestions.length} Questions verified. (Ready to publish)
                  </p>
                </div>
              )}

              {/* Action publish button */}
              <button
                type="submit"
                disabled={publishing || parsedQuestions.length === 0}
                className="w-full mt-3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10"
              >
                {publishing ? 'Publishing...' : 'Publish Test Paper'}
              </button>
            </form>

            {/* Questions Preview panel */}
            {parsedQuestions.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Eye className="w-4.5 h-4.5 text-slate-400" />
                  <span>Parsed Questions Preview ({parsedQuestions.length})</span>
                </h3>
                
                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Q {idx + 1}</span>
                        <span>•</span>
                        <span className="text-blue-500">{q.subject}</span>
                        {q.difficulty && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500">{q.difficulty}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                        {q.question_text}
                      </p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                        <span className={q.correct_option === 'a' ? 'text-emerald-500 font-extrabold' : ''}>A. {q.option_a}</span>
                        <span className={q.correct_option === 'b' ? 'text-emerald-500 font-extrabold' : ''}>B. {q.option_b}</span>
                        <span className={q.correct_option === 'c' ? 'text-emerald-500 font-extrabold' : ''}>C. {q.option_c}</span>
                        <span className={q.correct_option === 'd' ? 'text-emerald-500 font-extrabold' : ''}>D. {q.option_d}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Existing papers (1 col) */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col gap-5 h-fit">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-50 dark:border-slate-800/80 pb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Existing papers</span>
            </h2>

            {loadingList ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-semibold text-slate-400">Loading tests list...</p>
              </div>
            ) : existingPapers.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">
                No active exam papers registered yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {existingPapers.map((p) => (
                  <div 
                    key={p.id}
                    className="p-3 border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 bg-slate-50/20 dark:bg-slate-950/20"
                  >
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">
                        {p.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                        {p.year} Paper • {p.total_questions} Questions
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePaper(p.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shrink-0"
                      title="Delete Test Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
