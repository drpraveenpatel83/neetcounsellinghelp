'use client';

import dynamic from 'next/dynamic';

const ActiveQuiz = dynamic(() => import('./ActiveQuiz'), { ssr: false });

export default function ActiveQuizPage() {
  return <ActiveQuiz />;
}
