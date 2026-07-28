const LOCAL_STREAM_HOSTS = ['localhost', '127.0.0.1'];

function getBrowserLocation() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.location;
}

export function normalizeVideoStreamUrl(url?: string | null) {
  const streamUrl = String(url || '').trim();

  if (!streamUrl) {
    return '';
  }

  try {
    const parsedUrl = new URL(streamUrl);
    const location = getBrowserLocation();

    if (location && LOCAL_STREAM_HOSTS.includes(parsedUrl.hostname)) {
      parsedUrl.hostname = location.hostname;
    }

    if (location?.protocol === 'https:' && parsedUrl.protocol === 'ws:') {
      parsedUrl.protocol = 'wss:';
    }

    return parsedUrl.toString();
  } catch {
    return streamUrl;
  }
}
