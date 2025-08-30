

import React, { useState, useEffect } from 'react';
import { getCodeFeedback } from '../services/geminiService';
import { marked } from 'marked';
import { useLocale } from '../store/LocaleContext';

interface CodeFeedbackProps {
  code: string;
}

export const CodeFeedback: React.FC<CodeFeedbackProps> = ({ code }) => {
  const { t, locale } = useLocale();
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!code) {
        setIsLoading(false);
        setFeedback(t('codeFeedback.noCode'));
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCodeFeedback(code, locale);
        const htmlFeedback = await marked.parse(result);
        setFeedback(htmlFeedback);
      } catch (err) {
        setError(t('codeFeedback.error'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [code, t, locale]);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-inner">
      <h3 className="text-xl font-semibold mb-4 text-sky-400">{t('codeFeedback.title')}</h3>
      {isLoading && (
        <div className="flex items-center space-x-2 text-slate-400">
          <svg className="animate-spin h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{t('codeFeedback.analyzing')}</span>
        </div>
      )}
      {error && <p className="text-red-400">{error}</p>}
      {!isLoading && !error && (
        <div 
            className="prose prose-invert prose-sm max-w-none" 
            dangerouslySetInnerHTML={{ __html: feedback }} 
        />
      )}
    </div>
  );
};