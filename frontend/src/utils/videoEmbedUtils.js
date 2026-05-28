/**
 * @typedef {'iframe' | 'video'} VideoPreviewType
 * @typedef {{ embedUrl: string | null, previewType: VideoPreviewType | null }} VideoEmbedResult
 */

function isHttpUrl(value) {
  const url = String(value ?? '').trim();
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Convert a mentor-pasted video URL into an embeddable preview URL when possible.
 * @param {string} rawUrl
 * @returns {VideoEmbedResult}
 */
export function resolveVideoEmbed(rawUrl) {
  const url = String(rawUrl ?? '').trim();
  if (!url || !isHttpUrl(url)) {
    return { embedUrl: null, previewType: null };
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const pathname = parsed.pathname;

    if (/\.mp4(\?.*)?$/i.test(pathname) || /\.mp4(\?.*)?$/i.test(url)) {
      return { embedUrl: url, previewType: 'video' };
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const fromQuery = parsed.searchParams.get('v');
      if (fromQuery) {
        return {
          embedUrl: `https://www.youtube.com/embed/${fromQuery}`,
          previewType: 'iframe',
        };
      }

      const embedMatch = pathname.match(/^\/embed\/([^/?#]+)/);
      if (embedMatch?.[1]) {
        return {
          embedUrl: `https://www.youtube.com/embed/${embedMatch[1]}`,
          previewType: 'iframe',
        };
      }

      const shortsMatch = pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shortsMatch?.[1]) {
        return {
          embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}`,
          previewType: 'iframe',
        };
      }
    }

    if (host === 'youtu.be') {
      const videoId = pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (videoId) {
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          previewType: 'iframe',
        };
      }
    }

    if (host === 'vimeo.com') {
      const videoId = pathname.replace(/^\//, '').split('/')[0];
      if (videoId && /^\d+$/.test(videoId)) {
        return {
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
          previewType: 'iframe',
        };
      }
    }

    if (host === 'player.vimeo.com') {
      const vimeoMatch = pathname.match(/^\/video\/(\d+)/);
      if (vimeoMatch?.[1]) {
        return {
          embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
          previewType: 'iframe',
        };
      }
    }

    if (host === 'drive.google.com') {
      let fileId = pathname.match(/\/file\/d\/([^/]+)/)?.[1] ?? parsed.searchParams.get('id');
      if (fileId) {
        return {
          embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
          previewType: 'iframe',
        };
      }
    }

    return { embedUrl: null, previewType: null };
  } catch {
    return { embedUrl: null, previewType: null };
  }
}
