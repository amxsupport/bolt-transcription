import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import youtubeDl from 'youtube-dl-exec';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Helper function for safe file cleanup
const cleanupFile = async (path: string) => {
  try {
    await unlink(path);
    console.log('Temporary file cleaned up:', path);
  } catch (err) {
    if (err && (err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error cleaning up file:', err);
    }
  }
};

app.get('/api/download-audio', async (req, res) => {
  try {
    const { videoId } = req.query;

    // Validate video ID format (11 characters, alphanumeric and dash/underscore)
    if (!videoId || typeof videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }

    // Extract video ID from full URL if provided
    const videoUrl = videoId.includes('youtube.com') 
      ? videoId 
      : `https://www.youtube.com/watch?v=${videoId}`;

    // Sanitize the video ID for file naming
    const sanitizedVideoId = videoId.replace(/[^a-zA-Z0-9]/g, '');
    // Use first 8 characters of video ID for shorter filenames
    const shortId = sanitizedVideoId.slice(0, 8);
    const tempOutputPath = join(tmpdir(), `${shortId}_raw.wav`);
    const convertedOutputPath = join(tmpdir(), `${shortId}_conv.wav`);

    try {
      console.log('Downloading audio...');
      
      // Download audio using youtube-dl
      await youtubeDl(videoUrl, {
        extractAudio: true,
        audioFormat: 'wav',
        output: tempOutputPath,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      console.log('Audio downloaded successfully');

      // Convert to mono WAV with specific settings
      const command = ffmpeg(tempOutputPath)
        .toFormat('wav')
        .audioBitrate(128)
        .audioFrequency(16000) // Wit.ai preferred sample rate
        .audioChannels(1) // mono audio
        .audioCodec('pcm_s16le'); // 16-bit PCM format

      let isCleanedUp = false;

      const cleanup = async () => {
        if (!isCleanedUp) {
          isCleanedUp = true;
          await Promise.all([
            cleanupFile(tempOutputPath),
            cleanupFile(convertedOutputPath)
          ]);
        }
      };

      command.on('error', (error) => {
        console.error('FFmpeg error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Audio conversion failed' });
        }
        cleanup();
      });

      command.save(convertedOutputPath)
        .on('end', () => {
        console.log('Audio conversion finished');
        res.sendFile(convertedOutputPath, {
          headers: {
            'Content-Type': 'audio/wav'
          }
        }, (err) => {
          if (err) {
            console.error('Error sending file:', err);
          }
          cleanup();
        });
      });

      // Handle response finish or client disconnect
      res.on('finish', cleanup);
      res.on('close', () => {
        command.kill('SIGKILL');
        cleanup();
      });

    } catch (error) {
      console.error('YouTube download error:', error);
      // Clean up temp file if it exists
      await cleanupFile(tempOutputPath);
      res.status(500).json({ error: 'Failed to fetch video info' });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Check if ffmpeg is installed
ffmpeg.getAvailableCodecs((err, codecs) => {
  if (err || !codecs) {
    console.error('FFmpeg is not installed or not accessible. Please install FFmpeg to use this application.');
    process.exit(1);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Make sure you have set the VITE_WIT_AI_TOKEN environment variable');
});
