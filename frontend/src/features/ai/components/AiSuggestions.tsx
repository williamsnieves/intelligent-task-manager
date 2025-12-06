import { Check } from 'lucide-react';
import type { TitleSuggestion, DescriptionSuggestion } from '../types/ai.types';

interface AiSuggestionsProps {
  titleSuggestions: TitleSuggestion[];
  descriptionSuggestions: DescriptionSuggestion[];
  selectedTitle: string | null;
  selectedDescription: string | null;
  onSelectTitle: (title: string) => void;
  onSelectDescription: (description: string) => void;
}

export const AiSuggestions = ({
  titleSuggestions,
  descriptionSuggestions,
  selectedTitle,
  selectedDescription,
  onSelectTitle,
  onSelectDescription,
}: AiSuggestionsProps) => {
  if (titleSuggestions.length === 0 && descriptionSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
        <span className="text-lg">✨</span>
        AI Suggestions
      </h3>

      {/* Title Suggestions */}
      {titleSuggestions.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Suggested Titles
          </label>
          <div className="space-y-2">
            {titleSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectTitle(suggestion.title)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedTitle === suggestion.title
                    ? 'border-purple-500 bg-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      selectedTitle === suggestion.title
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedTitle === suggestion.title && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description Suggestions */}
      {descriptionSuggestions.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Suggested Descriptions
          </label>
          <div className="space-y-2">
            {descriptionSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectDescription(suggestion.description)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedDescription === suggestion.description
                    ? 'border-pink-500 bg-pink-100'
                    : 'border-gray-200 bg-white hover:border-pink-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      selectedDescription === suggestion.description
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedDescription === suggestion.description && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {suggestion.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

