'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Paper, Question, supabase, isSupabaseConfigured } from '@/lib/supabase';

// Standardized Answer state structure
export interface AnswerState {
  selectedOption: 'a' | 'b' | 'c' | 'd' | null;
  isCorrect: boolean | null;
  isMarkedReview: boolean;
  timeSpentSeconds: number;
  isVisited: boolean;
}

export interface QuizContextType {
  paper: Paper | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, AnswerState>;
  timeLeft: number;
  status: 'idle' | 'loading' | 'active' | 'completed';
  attemptId: string | null;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracy: number;
  timeSpent: number;
  
  // Actions
  startQuiz: (selectedPaper: Paper, paperQuestions: Question[]) => Promise<string>;
  selectOption: (questionId: string, option: 'a' | 'b' | 'c' | 'd') => void;
  toggleMarkReview: (questionId: string) => void;
  setCurrentIndex: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitQuiz: () => Promise<string>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// MOCK DATA FALLBACKS (Premium NEET 2025 Practice Questions)
export const MOCK_PAPERS: Paper[] = [
  {
    id: 'mock-neet-2025',
    title: 'NEET UG 2025 Previous Year Paper',
    year: 2025,
    duration_mins: 180,
    total_questions: 10,
    total_marks: 40,
    is_published: true
  },
  {
    id: 'mock-neet-2024',
    title: 'NEET UG 2024 Previous Year Paper',
    year: 2024,
    duration_mins: 180,
    total_questions: 5,
    total_marks: 20,
    is_published: true
  }
];

export const MOCK_QUESTIONS: Record<string, Question[]> = {
  'mock-neet-2025': [
    {
      id: 'q1',
      paper_id: 'mock-neet-2025',
      question_text: 'A wire of resistance R is cut into five equal pieces. These pieces are then connected in parallel. If the equivalent resistance of this combination is R\', then the ratio R/R\' is:',
      option_a: '1/25',
      option_b: '1/5',
      option_c: '5',
      option_d: '25',
      correct_option: 'd',
      explanation: 'Resistance of each piece = R/5. When 5 such resistance pieces are connected in parallel, 1/R\' = 5/(R/5) + 5/(R/5) + ... (5 times) = 25/R. Therefore, R\' = R/25, which gives the ratio R/R\' = 25.',
      subject: 'Physics',
      chapter: 'Current Electricity',
      topic: 'Combination of Resistors',
      difficulty: 'Medium',
      order_index: 0
    },
    {
      id: 'q2',
      paper_id: 'mock-neet-2025',
      question_text: 'Which of the following organic compounds will give a positive Carbylamine test?',
      option_a: 'Primary Aliphatic/Aromatic Amines',
      option_b: 'Secondary Aliphatic Amines',
      option_c: 'Tertiary Aromatic Amines',
      option_d: 'Amides',
      correct_option: 'a',
      explanation: 'Carbylamine test is specifically given by primary aliphatic and aromatic amines when heated with chloroform and alcoholic KOH, forming foul-smelling isocyanides (carbylamines).',
      subject: 'Chemistry',
      chapter: 'Amines',
      topic: 'Chemical Tests of Amines',
      difficulty: 'Easy',
      order_index: 1
    },
    {
      id: 'q3',
      paper_id: 'mock-neet-2025',
      question_text: 'During double fertilization in angiosperms, one male gamete fuses with the egg cell and another male gamete fuses with:',
      option_a: 'Synergid cell',
      option_b: 'Antipodal cells',
      option_c: 'Secondary nucleus (polar nuclei)',
      option_d: 'Nucellus',
      correct_option: 'c',
      explanation: 'In double fertilization, syngamy is the fusion of one male gamete with the egg to form a zygote (2n). Triple fusion involves the fusion of the second male gamete with the diploid secondary nucleus (fused polar nuclei) to form the triploid Primary Endosperm Nucleus (PEN, 3n).',
      subject: 'Biology',
      chapter: 'Sexual Reproduction in Flowering Plants',
      topic: 'Double Fertilization',
      difficulty: 'Easy',
      order_index: 2
    },
    {
      id: 'q4',
      paper_id: 'mock-neet-2025',
      question_text: 'If the acceleration due to gravity g at the surface of the Earth is 9.8 m/s², the value of g at a height equal to the radius of the Earth R is:',
      option_a: '4.9 m/s²',
      option_b: '2.45 m/s²',
      option_c: '9.8 m/s²',
      option_d: '1.96 m/s²',
      correct_option: 'b',
      explanation: 'g\' = g / (1 + h/R)² . At h = R, g\' = g / (1 + 1)² = g/4 = 9.8/4 = 2.45 m/s².',
      subject: 'Physics',
      chapter: 'Gravitation',
      topic: 'Variation of g with Altitude',
      difficulty: 'Medium',
      order_index: 3
    },
    {
      id: 'q5',
      paper_id: 'mock-neet-2025',
      question_text: 'Which hormone is responsible for apical dominance in plants?',
      option_a: 'Gibberellins',
      option_b: 'Auxin',
      option_c: 'Cytokinin',
      option_d: 'Ethylene',
      correct_option: 'b',
      explanation: 'Auxins, particularly Indole-3-acetic acid (IAA) produced by the apical bud, are responsible for suppressing the growth of lateral buds, a phenomenon known as apical dominance.',
      subject: 'Biology',
      chapter: 'Plant Growth and Development',
      topic: 'Plant Growth Regulators',
      difficulty: 'Easy',
      order_index: 4
    },
    {
      id: 'q6',
      paper_id: 'mock-neet-2025',
      question_text: 'The primary carbon dioxide acceptor in C4 plants is:',
      option_a: 'Phosphoenolpyruvate (PEP)',
      option_b: 'Ribulose-1,5-bisphosphate (RuBP)',
      option_c: 'Oxaloacetic acid (OAA)',
      option_d: '3-Phosphoglyceric acid (PGA)',
      correct_option: 'a',
      explanation: 'In C4 plants, the primary CO2 acceptor is Phosphoenolpyruvate (PEP), which is a 3-carbon molecule present in the mesophyll cells. This reaction is catalyzed by PEP carboxylase (PEPcase) to form Oxaloacetic acid (OAA).',
      subject: 'Biology',
      chapter: 'Photosynthesis in Higher Plants',
      topic: 'C4 Pathway',
      difficulty: 'Medium',
      order_index: 5
    },
    {
      id: 'q7',
      paper_id: 'mock-neet-2025',
      question_text: 'Which of the following compounds is most reactive towards nucleophilic substitution reaction?',
      option_a: 'Chlorobenzene',
      option_b: 'p-Nitrochlorobenzene',
      option_c: '2,4-Dinitrochlorobenzene',
      option_d: '2,4,6-Trinitrochlorobenzene (Picryl Chloride)',
      correct_option: 'd',
      explanation: 'The presence of electron-withdrawing groups (-NO2) at ortho and para positions increases the reactivity of haloarenes towards nucleophilic substitution. 2,4,6-Trinitrochlorobenzene contains three strong electron-withdrawing nitro groups, making it highly reactive (easily hydrolyzed with warm water).',
      subject: 'Chemistry',
      chapter: 'Haloalkanes and Haloarenes',
      topic: 'Nucleophilic Substitution in Haloarenes',
      difficulty: 'Hard',
      order_index: 6
    },
    {
      id: 'q8',
      paper_id: 'mock-neet-2025',
      question_text: 'The process of conversion of nitrogen to ammonia in plants is catalyzed by:',
      option_a: 'Nitrate reductase',
      option_b: 'Nitrogenase',
      option_c: 'Glutamate dehydrogenase',
      option_d: 'Transaminase',
      correct_option: 'b',
      explanation: 'The conversion of atmospheric nitrogen (N2) to ammonia (NH3) is biological nitrogen fixation, which is catalyzed exclusively by the enzyme nitrogenase, found in certain prokaryotes.',
      subject: 'Biology',
      chapter: 'Mineral Nutrition',
      topic: 'Nitrogen Metabolism',
      difficulty: 'Easy',
      order_index: 7
    },
    {
      id: 'q9',
      paper_id: 'mock-neet-2025',
      question_text: 'A thermodynamic process in which the volume of the system remains constant is called:',
      option_a: 'Isothermal process',
      option_b: 'Isobaric process',
      option_c: 'Isochoric process',
      option_d: 'Adiabatic process',
      correct_option: 'c',
      explanation: 'An isochoric process is a thermodynamic process in which the volume remains constant (dV = 0). No work is done by the system in this process (W = 0).',
      subject: 'Physics',
      chapter: 'Thermodynamics',
      topic: 'Thermodynamic Processes',
      difficulty: 'Easy',
      order_index: 8
    },
    {
      id: 'q10',
      paper_id: 'mock-neet-2025',
      question_text: 'What is the correct order of acidic strength of the given halogen acids?',
      option_a: 'HF > HCl > HBr > HI',
      option_b: 'HI > HBr > HCl > HF',
      option_c: 'HCl > HBr > HI > HF',
      option_d: 'HBr > HI > HCl > HF',
      correct_option: 'b',
      explanation: 'Acidic strength increases down the group as the H-X bond dissociation enthalpy decreases with increasing size of the halogen atom. Thus, HI easily releases protons compared to HF, making HI the strongest acid.',
      subject: 'Chemistry',
      chapter: 'p-Block Elements',
      topic: 'Hydrides of Group 17',
      difficulty: 'Hard',
      order_index: 9
    }
  ],
  'mock-neet-2024': [
    {
      id: 'q24_1',
      paper_id: 'mock-neet-2024',
      question_text: 'The dimension of Planck\'s constant is same as that of:',
      option_a: 'Linear momentum',
      option_b: 'Angular momentum',
      option_c: 'Energy',
      option_d: 'Power',
      correct_option: 'b',
      explanation: 'Planck\'s constant h has dimensions [M L² T⁻¹], which is identical to the dimension of angular momentum (L = r x p = [L] [M L T⁻¹] = [M L² T⁻¹]).',
      subject: 'Physics',
      chapter: 'Units and Measurements',
      topic: 'Dimensions of Physical Quantities',
      difficulty: 'Easy',
      order_index: 0
    },
    {
      id: 'q24_2',
      paper_id: 'mock-neet-2024',
      question_text: 'In which of the following compounds, nitrogen exhibits its highest oxidation state?',
      option_a: 'N3H (Hydrazoic Acid)',
      option_b: 'NH3 (Ammonia)',
      option_c: 'N2H4 (Hydrazine)',
      option_d: 'HNO3 (Nitric Acid)',
      correct_option: 'd',
      explanation: 'In HNO3, the oxidation state of nitrogen is +5. In N3H it is -1/3. In NH3 it is -3. In N2H4 it is -2. Therefore, +5 (HNO3) is the highest oxidation state.',
      subject: 'Chemistry',
      chapter: 'Redox Reactions',
      topic: 'Oxidation Number calculation',
      difficulty: 'Medium',
      order_index: 1
    },
    {
      id: 'q24_3',
      paper_id: 'mock-neet-2024',
      question_text: 'The term \"biodiversity\" was popularized by which sociobiologist?',
      option_a: 'Edward Wilson',
      option_b: 'Robert May',
      option_c: 'Alexander von Humboldt',
      option_d: 'Paul Ehrlich',
      correct_option: 'a',
      explanation: 'Edward Wilson, a sociobiologist, popularized the term biodiversity to describe the combined diversity at all levels of biological organization.',
      subject: 'Biology',
      chapter: 'Biodiversity and Conservation',
      topic: 'Biodiversity definition',
      difficulty: 'Easy',
      order_index: 2
    },
    {
      id: 'q24_4',
      paper_id: 'mock-neet-2024',
      question_text: 'A block of mass 2 kg rests on a rough horizontal surface with coefficient of static friction 0.4. If a horizontal force of 2.5 N is applied, the frictional force acting on the block is (g = 10 m/s²):',
      option_a: '8 N',
      option_b: '2.5 N',
      option_c: '20 N',
      option_d: '0 N',
      correct_option: 'b',
      explanation: 'Maximum static friction f_s(max) = μ_s * N = 0.4 * (2 * 10) = 8 N. Since the applied force of 2.5 N is less than the maximum limiting static friction (8 N), the block does not move. Therefore, static friction matches the applied force exactly, i.e., 2.5 N.',
      subject: 'Physics',
      chapter: 'Laws of Motion',
      topic: 'Static and Kinetic Friction',
      difficulty: 'Hard',
      order_index: 3
    },
    {
      id: 'q24_5',
      paper_id: 'mock-neet-2024',
      question_text: 'The central metal atom in chlorophyll is:',
      option_a: 'Iron',
      option_b: 'Magnesium',
      option_c: 'Zinc',
      option_d: 'Cobalt',
      correct_option: 'b',
      explanation: 'Chlorophyll is a coordination complex containing a magnesium ion (Mg2+) bound inside a porphyrin ring.',
      subject: 'Biology',
      chapter: 'Photosynthesis in Higher Plants',
      topic: 'Photosynthetic Pigments',
      difficulty: 'Easy',
      order_index: 4
    }
  ]
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'completed'>('idle');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  
  // Scoring parameters
  const [totalScore, setTotalScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [unattemptedCount, setUnattemptedCount] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeSpentRef = useRef<NodeJS.Timeout | null>(null);

  // Load active attempt from localStorage on mount (Auto-Save resume feature)
  useEffect(() => {
    const savedAttempt = localStorage.getItem('neet_active_attempt');
    if (savedAttempt && status === 'idle') {
      try {
        const parsed = JSON.parse(savedAttempt);
        setPaper(parsed.paper);
        setQuestions(parsed.questions);
        setCurrentIndex(parsed.currentIndex);
        setAnswers(parsed.answers);
        setTimeLeft(parsed.timeLeft);
        setStatus('active');
        setAttemptId(parsed.attemptId);
        setTimeSpent(parsed.timeSpent || 0);
      } catch (e) {
        console.error('Error loading saved attempt', e);
      }
    }
  }, []);

  // Timer intervals
  useEffect(() => {
    if (status === 'active') {
      // Countdown Timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            clearInterval(timeSpentRef.current!);
            // Trigger automatic submission on timeout
            setTimeout(() => submitQuiz(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Increment Time Spent
      timeSpentRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
        
        // Track time spent per question specifically
        setAnswers((prevAnswers) => {
          const updated = { ...prevAnswers };
          if (questions[currentIndex]) {
            const qId = questions[currentIndex].id;
            if (!updated[qId]) {
              updated[qId] = {
                selectedOption: null,
                isCorrect: null,
                isMarkedReview: false,
                timeSpentSeconds: 1,
                isVisited: true
              };
            } else {
              updated[qId] = {
                ...updated[qId],
                timeSpentSeconds: updated[qId].timeSpentSeconds + 1,
                isVisited: true
              }
            }
          }
          return updated;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeSpentRef.current) clearInterval(timeSpentRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeSpentRef.current) clearInterval(timeSpentRef.current);
    };
  }, [status, currentIndex, questions]);

  // Auto-Save current attempt state to localStorage on state change
  useEffect(() => {
    if (status === 'active' && paper && attemptId) {
      const stateToSave = {
        paper,
        questions,
        currentIndex,
        answers,
        timeLeft,
        attemptId,
        timeSpent
      };
      localStorage.setItem('neet_active_attempt', JSON.stringify(stateToSave));
    }
  }, [status, paper, questions, currentIndex, answers, timeLeft, attemptId, timeSpent]);

  // Start Quiz implementation
  const startQuiz = async (selectedPaper: Paper, paperQuestions: Question[]): Promise<string> => {
    setStatus('loading');
    const newAttemptId = crypto.randomUUID();
    
    setPaper(selectedPaper);
    setQuestions(paperQuestions);
    setCurrentIndex(0);
    setTimeLeft(selectedPaper.duration_mins * 60);
    setTimeSpent(0);
    setAttemptId(newAttemptId);
    
    // Initialize default states for all questions
    const initialAnswers: Record<string, AnswerState> = {};
    paperQuestions.forEach((q, idx) => {
      initialAnswers[q.id] = {
        selectedOption: null,
        isCorrect: null,
        isMarkedReview: false,
        timeSpentSeconds: 0,
        isVisited: idx === 0 // Visit first question automatically
      };
    });
    setAnswers(initialAnswers);

    // Save initial state to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('attempts').insert({
          id: newAttemptId,
          paper_id: selectedPaper.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Supabase save error, running in local fallback mode', err);
      }
    }

    setStatus('active');
    return newAttemptId;
  };

  // Select Option implementation with instant feedback
  const selectOption = async (questionId: string, option: 'a' | 'b' | 'c' | 'd') => {
    if (status !== 'active') return;
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = option === question.correct_option;

    setAnswers(prev => {
      const updated = { ...prev };
      updated[questionId] = {
        ...updated[questionId],
        selectedOption: option,
        isCorrect,
        isVisited: true
      };

      // Save to Supabase in the background if configured
      if (isSupabaseConfigured && attemptId) {
        supabase.from('attempt_answers').upsert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_option: option,
          is_correct: isCorrect,
          time_spent_seconds: updated[questionId].timeSpentSeconds
        }).then(({ error }) => {
          if (error) console.error('Error saving answer to database', error);
        });
      }

      return updated;
    });
  };

  // Toggle Mark for Review
  const toggleMarkReview = (questionId: string) => {
    if (status !== 'active') return;

    setAnswers(prev => {
      const updated = { ...prev };
      const currentVal = updated[questionId]?.isMarkedReview || false;
      updated[questionId] = {
        ...updated[questionId],
        isMarkedReview: !currentVal,
        isVisited: true
      };

      // Save to Supabase in the background if configured
      if (isSupabaseConfigured && attemptId) {
        supabase.from('attempt_answers').upsert({
          attempt_id: attemptId,
          question_id: questionId,
          is_marked_review: !currentVal,
          selected_option: updated[questionId].selectedOption,
          is_correct: updated[questionId].isCorrect,
          time_spent_seconds: updated[questionId].timeSpentSeconds
        }).then(({ error }) => {
          if (error) console.error('Error toggling review in database', error);
        });
      }

      return updated;
    });
  };

  // Palette pagination
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      
      // Tag next question as visited
      const nextQId = questions[nextIdx].id;
      setAnswers(prev => {
        const updated = { ...prev };
        if (updated[nextQId]) {
          updated[nextQId].isVisited = true;
        }
        return updated;
      });
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      
      // Tag previous question as visited
      const prevQId = questions[prevIdx].id;
      setAnswers(prev => {
        const updated = { ...prev };
        if (updated[prevQId]) {
          updated[prevQId].isVisited = true;
        }
        return updated;
      });
    }
  };

  // Submit Quiz implementation
  const submitQuiz = async (): Promise<string> => {
    if (status !== 'active' || !paper || !attemptId) return '';
    setStatus('loading');

    // Calculate score parameters (NEET: +4 correct, -1 wrong, 0 unattempted)
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans || ans.selectedOption === null) {
        unattempted++;
      } else if (ans.isCorrect) {
        correct++;
        score += 4;
      } else {
        wrong++;
        score -= 1;
      }
    });

    const acc = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

    setTotalScore(score);
    setCorrectCount(correct);
    setWrongCount(wrong);
    setUnattemptedCount(unattempted);
    setAccuracy(acc);

    // Save final scorecard details in attempts table
    const completedAt = new Date().toISOString();
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from('attempts').update({
          score,
          total_correct: correct,
          total_wrong: wrong,
          total_unattempted: unattempted,
          accuracy: acc,
          time_spent_seconds: timeSpent,
          completed_at: completedAt,
          status: 'completed'
        }).eq('id', attemptId);
      } catch (err) {
        console.error('Supabase final update failed', err);
      }
    }

    // Save this attempt to local history so results are viewable locally
    const attemptHistory = JSON.parse(localStorage.getItem('neet_attempt_history') || '{}');
    attemptHistory[attemptId] = {
      attemptId,
      paper,
      questions,
      answers,
      score,
      correct,
      wrong,
      unattempted,
      accuracy: acc,
      timeSpent,
      completedAt
    };
    localStorage.setItem('neet_attempt_history', JSON.stringify(attemptHistory));

    // Clear active saved state
    localStorage.removeItem('neet_active_attempt');

    setStatus('completed');
    return attemptId;
  };

  return (
    <QuizContext.Provider
      value={{
        paper,
        questions,
        currentIndex,
        answers,
        timeLeft,
        status,
        attemptId,
        totalScore,
        correctCount,
        wrongCount,
        unattemptedCount,
        accuracy,
        timeSpent,
        
        startQuiz,
        selectOption,
        toggleMarkReview,
        setCurrentIndex,
        nextQuestion,
        prevQuestion,
        submitQuiz
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
