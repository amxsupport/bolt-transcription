import express from 'express';
import ytdl from 'ytdl-core';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/download-audio', async (req, res) => {
  try {
    const { videoId } = req.query;

    if (!videoId || typeof videoId !== 'string') {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Get audio stream from YouTube
    const audioStream = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pipe the audio stream to response
    audioStream.pipe(res);

    // Handle errors
    audioStream.on('error', (error) => {
      console.error('Error streaming audio:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream audio' });
      }
    });
  } catch (error) {
    console.error('Error downloading audio:', error);
    res.status(500).json({ error: 'Failed to download audio' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
