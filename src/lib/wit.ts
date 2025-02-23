interface WitResponse {
  text?: string;
  error?: string;
}

const WIT_API_KEY = import.meta.env.VITE_WIT_AI_TOKEN;
const WIT_API_URL = 'https://api.wit.ai/speech';

export async function transcribeAudio(audioBlob: Blob): Promise<WitResponse> {
  try {
    const response = await fetch(WIT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WIT_API_KEY}`,
        'Content-Type': 'audio/wav'
      },
      body: audioBlob
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return { error: 'Failed to transcribe audio' };
  }
}

export async function downloadAndTranscribeYoutubeAudio(videoId: string): Promise<WitResponse> {
  try {
    // First, we need to get the audio from the YouTube video
    const response = await fetch(`/api/download-audio?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error('Failed to download audio');
    }

    const audioBlob = await response.blob();
    return await transcribeAudio(audioBlob);
  } catch (error) {
    console.error('Error processing YouTube audio:', error);
    return { error: 'Failed to process YouTube audio' };
  }
}
