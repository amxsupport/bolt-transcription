import React from 'react';
import YouTube from 'react-youtube';

interface VideoPlayerProps {
  videoId: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  if (!videoId) {
    return null;
  }

  return (
    <div className="aspect-video w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
      <YouTube
        videoId={videoId}
        className="w-full h-full"
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0,
            hl: 'ar',
            cc_load_policy: 1,
            cc_lang_pref: 'ar',
          },
        }}
      />
    </div>
  );
};