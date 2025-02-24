export const extractYouTubeId = (url: string): string | null => {
  try {
    if (!url) return null;
    
    // Handle youtu.be URLs
    if (url.includes('youtu.be')) {
      const id = url.split('youtu.be/')[1]?.split(/[#?&]/)[0];
      return id?.length === 11 ? id : null;
    }
    
    // Handle youtube.com URLs
    const urlParams = new URL(url).searchParams;
    const videoId = urlParams.get('v');
    return videoId?.length === 11 ? videoId : null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
};
