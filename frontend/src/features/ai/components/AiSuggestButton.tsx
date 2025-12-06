import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';
import type { AiAnalysisResponse } from '../types/ai.types';

interface AiSuggestButtonProps {
  description: string;
  currentTitle?: string;
  onSuggestion: (suggestion: AiAnalysisResponse) => void;
  disabled?: boolean;
}

export const AiSuggestButton = ({
  description,
  currentTitle,
  onSuggestion,
  disabled = false,
}: AiSuggestButtonProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      setError('Please enter a task description first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await aiService.analyzeTask(description, currentTitle);
      onSuggestion(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'AI analysis failed. Please ensure Ollama is running.';
      setError(errorMessage);
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={disabled || isAnalyzing || !description.trim()}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        {isAnalyzing ? 'Analyzing with AI...' : 'AI Suggest Priority & Date'}
      </button>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

