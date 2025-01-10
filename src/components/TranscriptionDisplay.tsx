import React from 'react';
import { ClipboardCheck } from 'lucide-react';

interface TranscriptionDisplayProps {
  transcription: string | null;
  isLoading: boolean;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcription,
  isLoading,
}) => {
  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!transcription) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">النص المستخرج</h3>
        <button
          onClick={copyToClipboard}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="نسخ النص"
        >
          <ClipboardCheck className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="prose prose-lg max-w-none">
        <p className="text-right text-gray-700 leading-relaxed">{transcription}</p>
      </div>
    </div>
  );
};