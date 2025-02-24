interface WitResponse {
  text?: string;
  error?: string;
}

const WIT_API_KEY = import.meta.env.VITE_WIT_AI_TOKEN;
const WIT_API_URL = 'https://api.wit.ai/speech';

function extractYouTubeId(input: string): string | null {
  // Handle full YouTube URLs
  const urlPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const urlMatch = input.match(urlPattern);
  if (urlMatch) return urlMatch[1];

  // Handle direct video IDs
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  return null;
}

export async function downloadAndTranscribeYoutubeAudio(input: string): Promise<WitResponse> {
  try {
    const videoId = extractYouTubeId(input);
    if (!videoId) {
      throw new Error('Invalid YouTube video ID or URL');
    }

    // Download audio from our server
    const audioResponse = await fetch(`/api/download-audio?videoId=${videoId}`);
    if (!audioResponse.ok) {
      const errorData = await audioResponse.json();
      throw new Error(errorData.error || 'Failed to download audio');
    }

    // Get the audio data as an ArrayBuffer
    const arrayBuffer = await audioResponse.arrayBuffer();
    
    // Create a new Blob with explicit WAV type
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });

    // Verify the blob size and type
    console.log('Audio blob size:', audioBlob.size, 'Audio blob type:', audioBlob.type);

    // Send to Wit.ai
    const witResponse = await fetch(WIT_API_URL + '?v=20240224', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WIT_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'audio/wav'
      },
      body: audioBlob
    });

    if (!witResponse.ok) {
      const errorData = await witResponse.json();
      console.error('Wit.ai API error:', errorData);
      throw new Error(`Failed to transcribe audio: ${JSON.stringify(errorData)}`);
    }

    const data = await witResponse.json();
    console.log('Wit.ai response:', data);
    if (!data.text) {
      throw new Error('No transcription returned');
    }

    return { text: data.text };
  } catch (error) {
    console.error('Error in transcription process:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to process YouTube audio' 
    };
  }
}
