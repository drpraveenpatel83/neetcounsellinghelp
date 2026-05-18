'use client';

import dynamic from 'next/dynamic';

const ResultScorecard = dynamic(() => import('./ResultScorecard'), { ssr: false });

export default function ResultPage() {
  return <ResultScorecard />;
}
