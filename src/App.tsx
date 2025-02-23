import React, { useState } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { extractYouTubeId } from './utils/youtube';
import { downloadAndTranscribeYoutubeAudio } from './lib/wit';
import { Languages, Mic } from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const id = extractYouTubeId(url);
    
    if (!id) {
      setError('يرجى إدخال رابط يوتيوب صحيح');
      return;
    }

    setVideoId(id);
    setIsLoading(true);
    
    try {
      const { text, error } = await downloadAndTranscribeYoutubeAudio(id);
      
      if (error) {
        setError(error);
        setTranscription(null);
      } else if (text) {
        setTranscription(text);
      }
    } catch (err) {
      setError('حدث خطأ أثناء معالجة الفيديو');
      setTranscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Languages className="w-12 h-12 text-indigo-600" />
            <Mic className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            استخراج النص من فيديوهات يوتيوب العربية
          </h1>
          <p className="text-lg text-gray-600">
            قم بلصق رابط الفيديو للحصول على النص المستخرج بشكل تلقائي
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              استخراج النص
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-600 text-right">{error}</p>
          )}
        </form>

        {videoId && <VideoPlayer videoId={videoId} />}
        <TranscriptionDisplay
          transcription={transcription}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
